import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether

def generate_pdf():
    pdf_filename = "8rain_Station_Setup_Guide.pdf"
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    c_primary = colors.HexColor('#0b0d13')
    c_card = colors.HexColor('#141720')
    c_accent_emerald = colors.HexColor('#10b981')
    c_accent_blue = colors.HexColor('#3b82f6')
    c_text_dark = colors.HexColor('#1e293b')
    c_text_muted = colors.HexColor('#64748b')

    # Typography Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.white,
        alignment=0
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=14,
        textColor=c_accent_emerald,
        alignment=0
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=14,
        leading=18,
        textColor=c_accent_blue,
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=c_text_dark,
        spaceBefore=3,
        spaceAfter=3
    )

    code_box_style = ParagraphStyle(
        'CodeText',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=9,
        leading=12,
        textColor=colors.HexColor('#10b981')
    )

    story = []

    # Title Banner Block
    header_data = [
        [
            Paragraph("8rain Station<sup>®</sup> EV Checker", title_style),
        ],
        [
            Paragraph("COMPLETE SETUP & EXECUTION GUIDE FOR DEVELOPERS & AI MODELS", subtitle_style)
        ]
    ]
    
    header_table = Table(header_data, colWidths=[532])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_primary),
        ('PADDING', (0, 0), (-1, -1), 16),
        ('BOTTOMPADDING', (0, 1), (-1, 1), 16),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('CORNER_PAD', (0, 0), (-1, -1), 8),
    ]))
    
    story.append(header_table)
    story.append(Spacer(1, 14))

    # Executive Overview
    story.append(Paragraph("1. Executive Overview", h2_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_accent_blue, spaceBefore=2, spaceAfter=8))
    
    overview_text = (
        "The <b>8rain Station® EV Checker</b> cross-references quantitative sports prediction CSVs "
        "against real-time live odds from <b>Kalshi</b> and <b>Polymarket</b> REST APIs. "
        "It automatically calculates <b>EV Edge %</b>, <b>½ Kelly bet sizing</b>, and handles complex <b>spread underdog side inversion math</b>."
    )
    story.append(Paragraph(overview_text, body_style))
    story.append(Spacer(1, 10))

    # Architecture Modes Table
    story.append(Paragraph("2. Available Execution Modes", h2_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_accent_blue, spaceBefore=2, spaceAfter=8))

    modes_data = [
        [Paragraph("<b>Execution Mode</b>", body_style), Paragraph("<b>Tech Stack</b>", body_style), Paragraph("<b>Launch Command</b>", body_style)],
        [Paragraph("<b>Mode 1: Python Flask</b><br/>(Recommended)", body_style), Paragraph("Python 3.9+, Flask", body_style), Paragraph("<font name='Courier'>python app.py</font><br/>(Open http://localhost:5001)", body_style)],
        [Paragraph("<b>Mode 2: Web App</b><br/>(GitHub Pages)", body_style), Paragraph("HTML5, JS, CSS", body_style), Paragraph("Open <font name='Courier'>index.html</font> in browser", body_style)],
        [Paragraph("<b>Mode 3: React Dashboard</b>", body_style), Paragraph("React 19, Vite, TS", body_style), Paragraph("<font name='Courier'>npm install & npm run dev</font>", body_style)]
    ]

    modes_table = Table(modes_data, colWidths=[150, 140, 242])
    modes_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
        ('TEXTCOLOR', (0, 0), (-1, 0), c_text_dark),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#cbd5e1')),
        ('PADDING', (0, 0), (-1, -1), 8),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(modes_table)
    story.append(Spacer(1, 14))

    # Automated Testing
    story.append(Paragraph("3. Verification & Automated Testing", h2_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_accent_blue, spaceBefore=2, spaceAfter=8))

    test_box_data = [[
        Paragraph("<font color='#cbd5e1'>Run the automated test suite to verify Kalshi and Polymarket line matching:<br/><br/></font>"
                  "<font color='#10b981' name='Courier'><b>pip install -r requirements.txt<br/>python test_pipeline.py</b></font>", body_style)
    ]]
    test_box = Table(test_box_data, colWidths=[532])
    test_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), c_primary),
        ('PADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(test_box)
    story.append(Spacer(1, 14))

    # CSV Spec
    story.append(Paragraph("4. 11-Column CSV Format Specification", h2_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_accent_blue, spaceBefore=2, spaceAfter=8))

    csv_code_data = [[
        Paragraph("<font color='#10b981' name='Courier'>LEAGUE,DATE,HOME,AWAY,DOUBLEHEADER,SECTION,MARKET,SELECTOR,POINT,SIDE,WIN %<br/>"
                  "MLB,20260922,BAL,TOR,0,spread,spread,BAL,1.5,BAL,0.687<br/>"
                  "MLB,20260922,LAD,SD,0,spread,spread,LAD,1.5,LAD,0.695<br/>"
                  "NFL,20260927,PIT,CIN,0,head_to_head,h2h,PIT,,PIT,0.626</font>", body_style)
    ]]
    csv_box = Table(csv_code_data, colWidths=[532])
    csv_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#0f172a')),
        ('PADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(csv_box)
    story.append(Spacer(1, 14))

    # AI Model Prompt Box
    story.append(Paragraph("5. AI Model Setup Prompt (Copy & Paste)", h2_style))
    story.append(HRFlowable(width="100%", thickness=1, color=c_accent_blue, spaceBefore=2, spaceAfter=8))

    ai_prompt_text = (
        "<i>\"I have extracted the 8rain Station EV Checker package.<br/>"
        "1. Install dependencies: <b>pip install -r requirements.txt</b><br/>"
        "2. Test line matching pipeline: <b>python test_pipeline.py</b><br/>"
        "3. Launch server: <b>python app.py</b> and open <b>http://localhost:5001</b> to view live Kalshi & Polymarket odds.\"</i>"
    )
    
    prompt_box_data = [[Paragraph(ai_prompt_text, body_style)]]
    prompt_box = Table(prompt_box_data, colWidths=[532])
    prompt_box.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 1, c_accent_blue),
        ('PADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(prompt_box)

    doc.build(story)
    print(f"PDF generated successfully: {pdf_filename}")

if __name__ == '__main__':
    generate_pdf()
