import os
import uuid
from datetime import date
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Header
from pydantic import BaseModel
from config import get_supabase_client
from services.pdf_service import process_file
from services.ai_service import extract_biomarkers, generate_recommendations

router = APIRouter(prefix="/api/reports", tags=["reports"])

ALLOWED_CONTENT_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
VALID_CATEGORIES = ["CBC", "LIPID", "THYROID", "METABOLIC", "LFT_KFT"]


# ─── Auth Helper ─────────────────────────────────────────────────────────────

def get_user_id(authorization: str) -> str:
    """Validate JWT and return user_id from Supabase."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    token = authorization.split(" ")[1]
    supabase = get_supabase_client()
    try:
        user = supabase.auth.get_user(token)
        return user.user.id
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# ─── Status Calculator ───────────────────────────────────────────────────────

def calculate_status(value: float, ref_min: float, ref_max: float) -> str:
    """Determine biomarker status based on reference range."""
    if value < ref_min or value > ref_max:
        # Check if borderline (within 10% of the range boundary)
        buffer = (ref_max - ref_min) * 0.10
        if (ref_min - buffer) <= value <= (ref_min + buffer) or \
           (ref_max - buffer) <= value <= (ref_max + buffer):
            return "BORDERLINE"
        return "OUT_OF_RANGE"
    # Check borderline (within 10% inside range boundaries)
    buffer = (ref_max - ref_min) * 0.10
    if value <= (ref_min + buffer) or value >= (ref_max - buffer):
        return "BORDERLINE"
    return "NORMAL"


# ─── Pydantic Models ─────────────────────────────────────────────────────────

class BiomarkerInput(BaseModel):
    name: str
    value: float
    unit: str
    ref_min: float
    ref_max: float


class ConfirmReportRequest(BaseModel):
    biomarkers: List[BiomarkerInput]


# ─── Routes ──────────────────────────────────────────────────────────────────

@router.post("/upload")
async def upload_report(
    file: UploadFile = File(...),
    category: str = Form(...),
    report_date: str = Form(...),
    lab_name: str = Form("Unknown Lab"),
    authorization: Optional[str] = Header(None)
):
    """Upload a lab report file to Supabase Storage and create a report record."""
    user_id = get_user_id(authorization)

    if category not in VALID_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Invalid category. Must be one of: {VALID_CATEGORIES}")

    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF, JPEG, PNG allowed.")

    file_bytes = await file.read()
    supabase = get_supabase_client()

    # Upload file to Supabase Storage
    file_ext = file.filename.split(".")[-1]
    storage_path = f"{user_id}/{uuid.uuid4()}.{file_ext}"

    try:
        supabase.storage.from_("lab-reports").upload(
            path=storage_path,
            file=file_bytes,
            file_options={"content-type": file.content_type}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File upload failed: {str(e)}")

    file_url = supabase.storage.from_("lab-reports").get_public_url(storage_path)

    # Create report record in DB
    report_id = str(uuid.uuid4())
    try:
        supabase.table("reports").insert({
            "id": report_id,
            "user_id": user_id,
            "category": category,
            "report_date": report_date,
            "lab_name": lab_name,
            "file_url": file_url,
        }).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database insert failed: {str(e)}")

    return {"report_id": report_id, "file_url": file_url, "message": "Report uploaded successfully"}


@router.post("/{report_id}/extract")
async def extract_report(
    report_id: str,
    authorization: Optional[str] = Header(None)
):
    """Fetch uploaded file, run AI extraction, return biomarkers (not saved yet)."""
    user_id = get_user_id(authorization)
    supabase = get_supabase_client()

    # Fetch report metadata
    result = supabase.table("reports").select("*").eq("id", report_id).eq("user_id", user_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Report not found")

    report = result.data
    category = report["category"]
    file_url = report["file_url"]

    # Clean URL to remove any trailing '?' or query parameters
    clean_url = file_url.split("?")[0]
    storage_path = "/".join(clean_url.split("/")[-2:])

    # Download file from Supabase Storage
    try:
        file_bytes = supabase.storage.from_("lab-reports").download(storage_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File download failed: {str(e)}")

    # Robust detection: check magic bytes first, then extension
    is_pdf = file_bytes.startswith(b"%PDF") or clean_url.lower().endswith(".pdf")

    # Process file (instant text extraction if PDF has digital text, lightweight images otherwise)
    processed = process_file(file_bytes, is_pdf)

    # Run AI extraction
    try:
        extraction_result = extract_biomarkers(processed, category)
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))

    return {
        "report_id": report_id,
        "category": category,
        "ai_provider": extraction_result["ai_provider"],
        "biomarkers": extraction_result["biomarkers"]
    }


@router.post("/{report_id}/confirm")
async def confirm_report(
    report_id: str,
    body: ConfirmReportRequest,
    authorization: Optional[str] = Header(None)
):
    """Save verified biomarkers to DB with calculated status."""
    user_id = get_user_id(authorization)
    supabase = get_supabase_client()

    # Verify report belongs to user
    result = supabase.table("reports").select("id").eq("id", report_id).eq("user_id", user_id).single().execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Report not found")

    # Build biomarker rows
    rows = []
    for bm in body.biomarkers:
        status = calculate_status(bm.value, bm.ref_min, bm.ref_max)
        rows.append({
            "id": str(uuid.uuid4()),
            "report_id": report_id,
            "name": bm.name,
            "value": bm.value,
            "unit": bm.unit,
            "ref_min": bm.ref_min,
            "ref_max": bm.ref_max,
            "status": status,
        })

    try:
        supabase.table("biomarkers").insert(rows).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save biomarkers: {str(e)}")

    return {"message": "Biomarkers saved successfully", "count": len(rows)}


@router.get("/dashboard")
async def get_dashboard(authorization: Optional[str] = Header(None)):
    """Return latest biomarker status cards for the dashboard."""
    user_id = get_user_id(authorization)
    supabase = get_supabase_client()

    # Get all reports for this user
    reports = supabase.table("reports").select("id, category, report_date").eq("user_id", user_id).order("report_date", desc=True).execute()

    if not reports.data:
        return {"biomarkers": [], "stats": {"total_reports": 0, "out_of_range": 0, "borderline": 0}}

    report_ids = [r["id"] for r in reports.data]

    # Get all biomarkers for all user reports
    biomarkers = supabase.table("biomarkers").select("*, reports(category, report_date, lab_name)").in_("report_id", report_ids).execute()

    bm_data = biomarkers.data or []

    # Stats
    out_of_range = len([b for b in bm_data if b["status"] == "OUT_OF_RANGE"])
    borderline = len([b for b in bm_data if b["status"] == "BORDERLINE"])

    return {
        "biomarkers": bm_data,
        "stats": {
            "total_reports": len(reports.data),
            "out_of_range": out_of_range,
            "borderline": borderline,
            "normal": len([b for b in bm_data if b["status"] == "NORMAL"])
        }
    }


@router.get("/trends/{biomarker_name}")
async def get_trends(biomarker_name: str, authorization: Optional[str] = Header(None)):
    """Return historical values for a specific biomarker for trend charts."""
    user_id = get_user_id(authorization)
    supabase = get_supabase_client()

    reports = supabase.table("reports").select("id, report_date, lab_name").eq("user_id", user_id).execute()
    if not reports.data:
        return {"trend": []}

    report_map = {r["id"]: r for r in reports.data}
    report_ids = list(report_map.keys())

    biomarkers = supabase.table("biomarkers") \
        .select("report_id, value, unit, status, ref_min, ref_max") \
        .in_("report_id", report_ids) \
        .ilike("name", f"*{biomarker_name}*") \
        .execute()

    trend = []
    for bm in (biomarkers.data or []):
        r_info = report_map.get(bm["report_id"], {})
        trend.append({
            "date": r_info.get("report_date") or "",
            "value": bm["value"],
            "unit": bm["unit"],
            "status": bm["status"],
            "ref_min": bm["ref_min"],
            "ref_max": bm["ref_max"],
            "lab_name": r_info.get("lab_name") or "Unknown Lab"
        })

    # Sort by date ascending
    trend.sort(key=lambda x: x["date"] or "")
    return {"biomarker": biomarker_name, "trend": trend}


@router.get("/recommendations")
async def get_recommendations(authorization: Optional[str] = Header(None)):
    """Fetch all historical biomarkers and generate holistic AI recommendations."""
    user_id = get_user_id(authorization)
    supabase = get_supabase_client()

    reports = supabase.table("reports").select("id, category, report_date, lab_name").eq("user_id", user_id).execute()
    if not reports.data:
        return {"message": "No reports found. Upload at least one report to get recommendations."}

    report_ids = [r["id"] for r in reports.data]
    biomarkers = supabase.table("biomarkers").select("*").in_("report_id", report_ids).execute()

    # Enrich biomarkers with report metadata
    report_map = {r["id"]: r for r in reports.data}
    history = []
    for bm in (biomarkers.data or []):
        report_meta = report_map.get(bm["report_id"], {})
        history.append({
            "biomarker": bm["name"],
            "value": bm["value"],
            "unit": bm["unit"],
            "status": bm["status"],
            "ref_min": bm["ref_min"],
            "ref_max": bm["ref_max"],
            "report_date": report_meta.get("report_date"),
            "category": report_meta.get("category"),
        })

    try:
        recommendations = generate_recommendations(history)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"AI recommendations unavailable: {str(e)}")

    return recommendations
