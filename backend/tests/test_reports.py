from unittest.mock import MagicMock, patch
import pytest
from fastapi.testclient import TestClient
from main import app
from routers.reports import calculate_status

client = TestClient(app)

def test_calculate_status():
    """Test biomarker status calculation logic."""
    # Normal
    assert calculate_status(100, 80, 120) == "NORMAL"
    
    # Borderline (within 10% of range boundaries)
    # Range is 40. 10% of 40 is 4. So boundaries are 80-84 and 116-120 (and 76-80, 120-124 for out of range borderline).
    assert calculate_status(82, 80, 120) == "BORDERLINE"
    assert calculate_status(118, 80, 120) == "BORDERLINE"
    assert calculate_status(78, 80, 120) == "BORDERLINE"
    assert calculate_status(122, 80, 120) == "BORDERLINE"
    
    # Out of range (beyond borderline buffer)
    assert calculate_status(50, 80, 120) == "OUT_OF_RANGE"
    assert calculate_status(150, 80, 120) == "OUT_OF_RANGE"

def test_upload_invalid_category():
    """Uploading with invalid category should fail."""
    mock_supabase = MagicMock()
    mock_supabase.auth.get_user.return_value.user.id = "test-123"
    with patch("routers.reports.get_supabase_client", return_value=mock_supabase):
        response = client.post(
            "/api/reports/upload",
            data={"category": "INVALID", "report_date": "2026-09-06", "lab_name": "Test Lab"},
            files={"file": ("test.pdf", b"fake pdf content", "application/pdf")},
            headers={"Authorization": "Bearer valid_token"}
        )
        assert response.status_code == 400
        assert "Invalid category" in response.json()["detail"]

def test_upload_invalid_file_type():
    """Uploading executable file should fail."""
    mock_supabase = MagicMock()
    mock_supabase.auth.get_user.return_value.user.id = "test-123"
    with patch("routers.reports.get_supabase_client", return_value=mock_supabase):
        response = client.post(
            "/api/reports/upload",
            data={"category": "CBC", "report_date": "2026-09-06", "lab_name": "Test Lab"},
            files={"file": ("test.exe", b"executable", "application/x-msdownload")},
            headers={"Authorization": "Bearer valid_token"}
        )
        assert response.status_code == 400
        assert "Invalid file type" in response.json()["detail"]

@patch("routers.reports.process_file")
@patch("routers.reports.extract_biomarkers")
def test_extract_report(mock_extract, mock_process):
    """Test AI extraction mock."""
    mock_supabase = MagicMock()
    mock_supabase.auth.get_user.return_value.user.id = "test-123"
    
    # Mock finding report in DB
    mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.single.return_value.execute.return_value.data = {
        "category": "CBC",
        "file_url": "https://fake.com/file.pdf"
    }
    
    # Mock storage download
    mock_supabase.storage.from_.return_value.download.return_value = b"%PDF-1.4 fake data"
    
    # Mock AI response
    mock_process.return_value = "fake parsed text"
    mock_extract.return_value = {
        "ai_provider": "gemini-1.5-flash",
        "biomarkers": [{"name": "Hemoglobin", "value": 14.5, "unit": "g/dL", "ref_min": 13.0, "ref_max": 17.0}]
    }

    with patch("routers.reports.get_supabase_client", return_value=mock_supabase):
        response = client.post(
            "/api/reports/123/extract",
            headers={"Authorization": "Bearer valid_token"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["category"] == "CBC"
        assert len(data["biomarkers"]) == 1
