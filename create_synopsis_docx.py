import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import qn, nsdecls

def create_synopsis():
    doc = docx.Document()
    
    # Set page size to A4
    section = doc.sections[0]
    section.page_width = Inches(8.27)
    section.page_height = Inches(11.69)
    section.top_margin = Inches(1.0)
    section.bottom_margin = Inches(1.0)
    section.left_margin = Inches(1.0)
    section.right_margin = Inches(1.0)

    # Set normal style font to Times New Roman 12pt
    style = doc.styles['Normal']
    font = style.font
    font.name = 'Times New Roman'
    font.size = Pt(12)
    font.color.rgb = RGBColor(0, 0, 0)
    
    def add_p(text="", align=WD_ALIGN_PARAGRAPH.LEFT, bold=False, italic=False, size=12, space_before=0, space_after=6, line_spacing=1.0):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = line_spacing
        if text:
            run = p.add_run(text)
            run.font.name = 'Times New Roman'
            run.font.size = Pt(size)
            run.font.bold = bold
            run.font.italic = italic
            run.font.color.rgb = RGBColor(0, 0, 0)
        return p

    # ================= COVER PAGE =================
    add_p("SYNOPSIS", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=16, space_after=4)
    add_p("on", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, italic=True, size=14, space_after=12)
    
    add_p("MediPulse AI: Multimodal Health Report Analysis and Predictive Biomarker Risk Warning System", 
          align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=16, space_after=18)
    
    add_p("Co-Op project at Industry (Module-1)", align=WD_ALIGN_PARAGRAPH.CENTER, bold=False, size=12, space_after=24)
    
    add_p("Submitted by", align=WD_ALIGN_PARAGRAPH.CENTER, bold=False, size=12, space_after=8)
    add_p("Amandeep Singh (22AI026)", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_after=4)
    add_p("Batch : B2023", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_after=4)
    add_p("Semester : 7th", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_after=18)
    
    add_p("Bachelor of Engineering- Computer Science & Engineering", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_after=2)
    add_p("(Artificial Intelligence)", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_after=24)
    
    add_p("Guided by", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, italic=True, size=12, space_after=4)
    add_p("Dr. Manu Midha", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=14, space_after=28)
    
    add_p("CHITKARA UNIVERSITY INSTITUTE OF ENGINEERING & TECHNOLOGY", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=12, space_after=2)
    add_p("CHITKARA UNIVERSITY, RAJPURA", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=12, space_after=6)
    add_p("July 2026", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True, size=12, space_after=0)
    
    doc.add_page_break()

    # ================= TABLE OF CONTENTS =================
    add_p("Table of Contents", align=WD_ALIGN_PARAGRAPH.LEFT, bold=True, size=14, space_before=12, space_after=12)
    
    toc_items = [
        ("1. Introduction", "1"),
        ("2. Problem Formulation", "2"),
        ("3. Proposed Solution / Methodology", "3"),
        ("4. Flowchart", "5"),
        ("5. References", "6")
    ]
    
    table = doc.add_table(rows=len(toc_items), cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    
    # Remove table borders for clean TOC look
    tblPr = table._tbl.tblPr
    tblBorders = OxmlElement('w:tblBorders')
    for border_name in ['top', 'left', 'bottom', 'right', 'insideH', 'insideV']:
        border = OxmlElement(f'w:{border_name}')
        border.set(qn('w:val'), 'none')
        tblBorders.append(border)
    tblPr.append(tblBorders)

    for idx, (title, page) in enumerate(toc_items):
        row = table.rows[idx]
        cell_0, cell_1 = row.cells[0], row.cells[1]
        cell_0.width = Inches(5.5)
        cell_1.width = Inches(1.0)
        
        p0 = cell_0.paragraphs[0]
        p0.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p0.paragraph_format.space_before = Pt(2)
        p0.paragraph_format.space_after = Pt(4)
        p0.paragraph_format.line_spacing = 1.0
        r0 = p0.add_run(title)
        r0.font.name = 'Times New Roman'
        r0.font.size = Pt(12)
        
        p1 = cell_1.paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p1.paragraph_format.space_before = Pt(2)
        p1.paragraph_format.space_after = Pt(4)
        p1.paragraph_format.line_spacing = 1.0
        r1 = p1.add_run(page)
        r1.font.name = 'Times New Roman'
        r1.font.size = Pt(12)

    add_p("", space_after=18)
    doc.add_page_break()

    # ================= SECTION 1: INTRODUCTION =================
    add_p("1. Introduction", align=WD_ALIGN_PARAGRAPH.LEFT, bold=True, size=14, space_before=12, space_after=8)
    
    p = add_p("In modern preventive healthcare, laboratory diagnostic reports (such as Complete Blood Counts, Lipid Profiles, Comprehensive Metabolic Panels, and Thyroid Panels) serve as the primary indicator for diagnosing chronic and acute health conditions. However, patients regularly receive these diagnostic results as unstructured, static PDF files or printed physical papers containing dense medical terminology, technical abbreviations, and numeric ranges.", 
              align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=12, space_after=8)
    p.paragraph_format.first_line_indent = Inches(0.5)

    p = add_p("MediPulse AI is an intelligent personal health analytics and early warning platform designed to bridge the gap between complex diagnostic laboratory data and patient comprehension. By combining Multimodal Large Language Models (LLMs), Computer Vision OCR (Optical Character Recognition), and time-series biometric tracking, the platform automates the extraction of key health markers from uploaded lab documents.", 
              align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=12, space_after=8)
    p.paragraph_format.first_line_indent = Inches(0.5)

    p = add_p("The system standardizes extracted lab values across multiple historical reports to build a unified health trajectory dashboard. Beyond static interpretation, MediPulse AI integrates a predictive risk engine that monitors metric trajectories over time (e.g., progressive glucose elevation or declining hemoglobin levels), provides proactive early warning alerts for potential health risks, correlates user-reported physical symptoms with lab findings, and suggests appropriate medical specialists for timely consultation.", 
              align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=12, space_after=18)
    p.paragraph_format.first_line_indent = Inches(0.5)

    # ================= SECTION 2: PROBLEM FORMULATION =================
    add_p("2. Problem Formulation", align=WD_ALIGN_PARAGRAPH.LEFT, bold=True, size=14, space_before=12, space_after=8)
    
    p = add_p("Despite significant advances in digital health software, personal diagnostic record management faces several critical limitations:", 
              align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=12, space_after=8)
    p.paragraph_format.first_line_indent = Inches(0.5)

    problems = [
        ("Lack of Longitudinal Biomarker Tracking: ", "Traditional laboratory reports only provide a single point-in-time snapshot. Patients rarely track subtle upward or downward metric trends over 6 to 24 months (e.g., gradual HbA1c elevation into pre-diabetic ranges), missing crucial opportunities for early preventive intervention."),
        ("Medical Jargon & Comprehension Barrier: ", "Non-medical individuals frequently struggle to interpret laboratory jargon, reference intervals, and unit conversions (e.g., mg/dL vs. mmol/L), leading to either undue health anxiety or complete oversight of abnormal results."),
        ("Unstructured Data Silos: ", "Diagnostic reports exist as unstandardized PDFs or scanned images across different medical centers, making manual data aggregation tedious and prone to human error."),
        ("Disconnection Between Symptoms & Lab Findings: ", "Patients often experience physical symptoms (such as persistent fatigue, dizziness, or joint pain) without knowing whether their recent blood work aligns with these symptoms."),
        ("Absence of Proactive Early Warning Systems: ", "Existing patient portals act merely as document repositories rather than proactive decision-support engines that alert users to consult specialists before mild abnormalities progress to critical clinical states.")
    ]

    for title, desc in problems:
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.left_indent = Inches(0.4)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.0
        
        r_bullet = p.add_run("• ")
        r_bullet.font.name = 'Times New Roman'
        r_bullet.font.size = Pt(12)
        r_bullet.font.bold = True
        
        r_title = p.add_run(title)
        r_title.font.name = 'Times New Roman'
        r_title.font.size = Pt(12)
        r_title.font.bold = True
        
        r_desc = p.add_run(desc)
        r_desc.font.name = 'Times New Roman'
        r_desc.font.size = Pt(12)

    add_p("", space_after=12)
    doc.add_page_break()

    # ================= SECTION 3: PROPOSED SOLUTION / METHODOLOGY =================
    add_p("3. Proposed Solution / Methodology", align=WD_ALIGN_PARAGRAPH.LEFT, bold=True, size=14, space_before=12, space_after=8)
    
    p = add_p("The proposed MediPulse AI platform addresses these challenges through a comprehensive 5-stage intelligent data processing pipeline:", 
              align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=12, space_after=8)
    p.paragraph_format.first_line_indent = Inches(0.5)

    stages = [
        ("Stage 1: Category-Guided Ingestion & Multimodal OCR Extraction", 
         "Users select the specific diagnostic report category (e.g., Complete Blood Count, Lipid Profile, Thyroid Panel, Metabolic Panel, or Liver/Kidney Function Test) and upload lab reports in PDF or image format (JPEG/PNG). The ingestion pipeline applies category-guided Vision-LLM extraction schemas (e.g., Google Gemini Vision API / Tesseract OCR) to parse complex laboratory tables accurately. The system extracts biomarker names, observed numerical values, units of measurement, reference ranges (min/max bounds), report dates, and testing laboratory names into standardized structured JSON."),
        
        ("Stage 2: Time-Series Biomarker Storage & Standardization", 
         "Extracted data is ingested into a relational time-series database (e.g., PostgreSQL/Supabase). Biomarker metrics across disparate lab formats are normalized to standard medical units to enable seamless historical comparison across months or years."),
        
        ("Stage 3: Predictive Risk & Early Warning Engine", 
         "The system evaluates current lab metrics against clinical guidelines (e.g., American Diabetes Association, American Heart Association baselines) and calculates velocity changes across historical reports. Trend detection algorithms flag negative trajectories (e.g., 'LDL cholesterol increased by 18% over the past 3 reports'). Early warning indicators categorize risk severity into Low, Moderate, and High urgency tiers with clear next steps."),
        
        ("Stage 4: Symptom-Biomarker Correlation & AI Health Assistant", 
         "Users can log current physical symptoms into an interactive symptom tracker. The AI engine cross-references active symptoms with flagged out-of-range lab metrics (e.g., low Hemoglobin + logged fatigue -> Anemia indicator). Plain-language explanations clarify what out-of-range values signify without making definitive medical diagnoses."),
        
        ("Stage 5: Patient Dashboard & Doctor Summary Export", 
         "An interactive React-based dashboard visualizes color-coded biomarker cards (Normal, Borderline, Critical) and historical line charts. A 1-click export module generates a concise 1-page summary PDF designed for physician consultations.")
    ]

    for title, desc in stages:
        p = add_p(title, align=WD_ALIGN_PARAGRAPH.LEFT, bold=True, size=12, space_before=6, space_after=4)
        p.paragraph_format.left_indent = Inches(0.2)
        
        p_desc = add_p(desc, align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=12, space_after=8)
        p_desc.paragraph_format.left_indent = Inches(0.4)

    add_p("", space_after=12)
    doc.add_page_break()

    # ================= SECTION 4: FLOWCHART =================
    add_p("4. Flowchart", align=WD_ALIGN_PARAGRAPH.LEFT, bold=True, size=14, space_before=12, space_after=8)
    
    p = add_p("The end-to-end data processing workflow of the MediPulse AI system is illustrated in the architectural flowchart below:", 
              align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=12, space_after=12)
    p.paragraph_format.first_line_indent = Inches(0.5)

    # Insert structured visual box table for Flowchart representation
    fc_table = doc.add_table(rows=9, cols=1)
    fc_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    
    fc_nodes = [
        "1. User Selects Report Category & Uploads File (PDF / Image)",
        "↓",
        "2. Category-Guided Multimodal Vision AI / OCR Parsing Engine",
        "↓",
        "3. Extraction of Biomarkers, Observed Values, Units & Normal Ranges into JSON",
        "↓",
        "4. Time-Series Biometric Database Storage & Standardization",
        "↓",
        "5. Parallel Analytics Engine:\n   • Historical Trajectory Analytics Engine (Metric Trends & Velocity)\n   • Symptom-Biomarker Correlation AI Engine",
    ]

    for idx, text in enumerate(fc_nodes):
        row = fc_table.rows[idx]
        cell = row.cells[0]
        cell.width = Inches(6.2)
        
        p_node = cell.paragraphs[0]
        p_node.paragraph_format.space_before = Pt(4)
        p_node.paragraph_format.space_after = Pt(4)
        p_node.paragraph_format.line_spacing = 1.0
        
        if "↓" in text:
            p_node.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r = p_node.add_run(text)
            r.font.name = 'Times New Roman'
            r.font.size = Pt(14)
            r.font.bold = True
        else:
            p_node.alignment = WD_ALIGN_PARAGRAPH.CENTER
            r = p_node.add_run(text)
            r.font.name = 'Times New Roman'
            r.font.size = Pt(11)
            r.font.bold = True
            
            # Set background color and border for node cells
            tcPr = cell._tc.get_or_add_tcPr()
            shd = parse_xml(r'<w:shd {} w:fill="F4F6F9"/>'.format(nsdecls('w')))
            tcPr.append(shd)

    add_p("", space_after=18)
    
    p_fc_desc = add_p("Flowchart Description: As depicted above, the user initiates the workflow by selecting the lab report category and uploading diagnostic documents (PDF/images). The document parsing module processes the files using category-guided Multimodal Vision AI to extract structured biomarker entities. The data is stored in a time-series schema, triggering simultaneous trajectory trend evaluation and symptom correlation. Finally, the synthesized results are rendered onto the interactive web dashboard and exported into doctor-ready summary reports.", 
                      align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=12, space_after=18)
    p_fc_desc.paragraph_format.first_line_indent = Inches(0.5)

    doc.add_page_break()

    # ================= SECTION 5: REFERENCES =================
    add_p("5. References", align=WD_ALIGN_PARAGRAPH.LEFT, bold=True, size=14, space_before=12, space_after=12)
    
    references = [
        "1. Esteva, A., Kuprel, A., Novoa, R. A., Ko, J., Swetter, S. M., Blau, H. M., & Thrun, S. (2019). \"A guide to deep learning in healthcare.\" Nature Medicine, 25(1), 24-29.",
        "2. Rajpurkar, P., Chen, E., Banerjee, O., & Topol, E. J. (2022). \"AI in health and medicine.\" Nature Medicine, 28(1), 31-38.",
        "3. Singhal, K., Azizi, S., Tu, T., Mahdavi, S. S., Wei, J., Chung, H. W., ... & Natarajan, V. (2023). \"Large language models encode clinical knowledge.\" Nature, 620(7972), 172-180.",
        "4. World Health Organization (WHO) (2024). \"WHO Guidelines on Digital Health Interventions and Personal Health Records.\" World Health Organization Technical Report Series.",
        "5. American Diabetes Association (ADA) (2024). \"Standards of Care in Diabetes—2024.\" Diabetes Care, 47(Suppl. 1), S1-S343."
    ]

    for ref in references:
        p = add_p(ref, align=WD_ALIGN_PARAGRAPH.JUSTIFY, size=12, space_after=8)
        p.paragraph_format.left_indent = Inches(0.5)
        p.paragraph_format.first_line_indent = Inches(-0.5)

    # Save to file
    output_path = "/Users/amandeepsingh/Desktop/PBL-7/Amandeep_Singh_22AI026_CoOp_Synopsis.docx"
    doc.save(output_path)
    print(f"Synopsis docx successfully updated at: {output_path}")

if __name__ == "__main__":
    create_synopsis()
