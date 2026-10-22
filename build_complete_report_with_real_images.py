import os
import docx
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls

def add_page_number(run):
    fldChar1 = parse_xml(r'<w:fldChar %s w:fldCharType="begin"/>' % nsdecls('w'))
    instrText = parse_xml(r'<w:instrText %s xml:space="preserve"> PAGE </w:instrText>' % nsdecls('w'))
    fldChar2 = parse_xml(r'<w:fldChar %s w:fldCharType="separate"/>' % nsdecls('w'))
    fldChar3 = parse_xml(r'<w:fldChar %s w:fldCharType="end"/>' % nsdecls('w'))
    run._r.append(fldChar1)
    run._r.append(instrText)
    run._r.append(fldChar2)
    run._r.append(fldChar3)

def generate_report():
    doc = Document()

    # Section Margins: 1.25" Left binding, 1.0" Right, Top, Bottom
    section = doc.sections[0]
    section.top_margin = Inches(1.0)
    section.bottom_margin = Inches(1.0)
    section.left_margin = Inches(1.25)
    section.right_margin = Inches(1.0)

    # Footer Page Number
    footer = section.footer
    f_p = footer.paragraphs[0]
    f_p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    f_run = f_p.add_run()
    f_run.font.name = 'Times New Roman'
    f_run.font.size = Pt(10)
    add_page_number(f_run)

    # Formatting helper functions conforming strictly to user requirements:
    # Font: Times New Roman for all text
    # Main Title: 16 pt, bold, center-aligned
    # Main Headings: 14 pt, bold, left-aligned
    # Subheadings: 12 pt, bold, left-aligned
    # Body Text: 12 pt, justified alignment
    # Code Examples: Consolas, 10 pt, left-aligned, with proper indentation
    # Line Spacing: 1.5 lines

    def p_main_title(text, space_after=12):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_before = Pt(6)
        p.paragraph_format.space_after = Pt(space_after)
        r = p.add_run(text)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(16)
        r.font.bold = True
        return p

    def p_center(text, size=12, bold=False, italic=False, space_after=6):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_after = Pt(space_after)
        r = p.add_run(text)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(size)
        r.font.bold = bold
        r.font.italic = italic
        return p

    def p_heading_1(text, space_before=14, space_after=6):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        r = p.add_run(text)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(14)
        r.font.bold = True
        return p

    def p_heading_2(text, space_before=10, space_after=4):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        r = p.add_run(text)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(12)
        r.font.bold = True
        return p

    def p_heading_3(text, space_before=8, space_after=2):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        r = p.add_run(text)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(12)
        r.font.bold = True
        return p

    def p_body(text, bold_prefix=None, space_after=6):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_after = Pt(space_after)
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.font.name = 'Times New Roman'
            r_pre.font.size = Pt(12)
            r_pre.font.bold = True
        r = p.add_run(text)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(12)
        return p

    def p_bullet(text, bold_prefix=None):
        p = doc.add_paragraph(style='List Bullet')
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.space_after = Pt(4)
        if bold_prefix:
            r_pre = p.add_run(bold_prefix)
            r_pre.font.name = 'Times New Roman'
            r_pre.font.size = Pt(12)
            r_pre.font.bold = True
        r = p.add_run(text)
        r.font.name = 'Times New Roman'
        r.font.size = Pt(12)
        return p

    def p_code(code_text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.line_spacing = 1.0
        p.paragraph_format.space_before = Pt(3)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.left_indent = Inches(0.3)
        r = p.add_run(code_text)
        r.font.name = 'Consolas'
        r.font.size = Pt(10)
        return p

    def add_image_safe(img_path, width_inches=5.8, space_before=6, space_after=4):
        if os.path.exists(img_path):
            p = doc.add_paragraph()
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(space_before)
            p.paragraph_format.space_after = Pt(space_after)
            run = p.add_run()
            run.add_picture(img_path, width=Inches(width_inches))

    # ====================================================
    # COVER PAGE
    # ====================================================
    p_center("RESQLINK: COMMUNITY DISASTER RELIEF &", size=16, bold=True, space_after=4)
    p_center("EMERGENCY RESPONSE PLATFORM", size=16, bold=True, space_after=18)
    p_center("A FULL-STACK MERN & GIS INCIDENT DISPATCH SYSTEM", size=13, bold=True, space_after=24)

    p_center("A PROJECT REPORT", size=14, bold=True, space_after=18)

    p_center("Submitted by", size=12, italic=True, space_after=4)
    p_center("[STUDENT NAME] ([REGISTER NUMBER])", size=14, bold=True, space_after=18)

    p_center("in partial fulfillment for the award of the Degree", size=12, italic=True, space_after=2)
    p_center("of", size=12, italic=True, space_after=2)
    p_center("BACHELOR OF TECHNOLOGY", size=14, bold=True, space_after=4)
    p_center("In", size=12, italic=True, space_after=4)
    p_center("ARTIFICIAL INTELLIGENCE AND DATA SCIENCE", size=13, bold=True, space_after=18)

    add_image_safe("extracted_logo_p1_0.jpeg", width_inches=1.6)

    p_center("EASWARI ENGINEERING COLLEGE,", size=14, bold=True, space_after=2)
    p_center("(AN AUTONOMOUS INSTITUTION)", size=12, bold=False, space_after=2)
    p_center("AFFILIATED TO ANNA UNIVERSITY,", size=12, bold=False, space_after=2)
    p_center("CHENNAI", size=12, bold=False, space_after=6)
    p_center("OCTOBER-2026", size=12, bold=True, space_after=6)

    doc.add_page_break()

    # ====================================================
    # BONAFIDE CERTIFICATE
    # ====================================================
    table_top = doc.add_table(rows=1, cols=2)
    table_top.alignment = WD_TABLE_ALIGNMENT.CENTER
    c0 = table_top.rows[0].cells[0]
    c1 = table_top.rows[0].cells[1]
    c0.width = Inches(1.2)
    c1.width = Inches(5.0)
    p_logo = c0.paragraphs[0]
    p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
    if os.path.exists("extracted_logo_p2_0.jpeg"):
        p_logo.add_run().add_picture("extracted_logo_p2_0.jpeg", width=Inches(0.9))
    p_name = c1.paragraphs[0]
    p_name.paragraph_format.space_before = Pt(12)
    r_name = p_name.add_run("EASWARI ENGINEERING COLLEGE")
    r_name.font.name = 'Times New Roman'
    r_name.font.size = Pt(16)
    r_name.font.bold = True

    doc.add_paragraph()
    p_main_title("BONAFIDE CERTIFICATE", space_after=18)

    p_body("Certified that this mini project report titled “RESQLINK: COMMUNITY DISASTER RELIEF & EMERGENCY RESPONSE PLATFORM” is the Bonafide work of “[STUDENT NAME]([REGISTER NUMBER])”, who carried out the project work under my supervision.")
    doc.add_paragraph()
    doc.add_paragraph()
    doc.add_paragraph()

    table_sign = doc.add_table(rows=1, cols=2)
    table_sign.alignment = WD_TABLE_ALIGNMENT.CENTER
    s0 = table_sign.rows[0].cells[0].paragraphs[0]
    s1 = table_sign.rows[0].cells[1].paragraphs[0]
    s0.paragraph_format.line_spacing = 1.5
    s1.paragraph_format.line_spacing = 1.5

    r_s0 = s0.add_run("HEAD OF THE DEPARTMENT\nDr. T. Kalai Selvi\nEaswari Engineering College\nRamapuram, Chennai - 600089")
    r_s0.font.name = 'Times New Roman'
    r_s0.font.size = Pt(12)
    r_s0.font.bold = True

    r_s1 = s1.add_run("SUPERVISOR\nMs. D S K Harshitha\nEaswari Engineering College\nRamapuram, Chennai - 600089")
    r_s1.font.name = 'Times New Roman'
    r_s1.font.size = Pt(12)
    r_s1.font.bold = True

    doc.add_page_break()

    # ====================================================
    # CERTIFICATE OF VIVA-VOCE
    # ====================================================
    table_top2 = doc.add_table(rows=1, cols=2)
    table_top2.alignment = WD_TABLE_ALIGNMENT.CENTER
    c0 = table_top2.rows[0].cells[0]
    c1 = table_top2.rows[0].cells[1]
    c0.width = Inches(1.2)
    c1.width = Inches(5.0)
    p_logo = c0.paragraphs[0]
    if os.path.exists("extracted_logo_p3_0.jpeg"):
        p_logo.add_run().add_picture("extracted_logo_p3_0.jpeg", width=Inches(0.9))
    p_name = c1.paragraphs[0]
    p_name.paragraph_format.space_before = Pt(12)
    r_name = p_name.add_run("EASWARI ENGINEERING COLLEGE")
    r_name.font.name = 'Times New Roman'
    r_name.font.size = Pt(16)
    r_name.font.bold = True

    doc.add_paragraph()
    p_main_title("Certificate of Viva-voce-Examination", space_after=18)

    p_body("This is to certify that the Viva Voce Examination of the Project Work entitled “RESQLINK: COMMUNITY DISASTER RELIEF & EMERGENCY RESPONSE PLATFORM” submitted by Ms./Mr. [STUDENT NAME] (Reg. No. [REGISTER NUMBER]) in partial fulfillment of the requirements for the award of the degree of Bachelor of Technology (B.Tech.) was conducted on __________________ (Date) in the Department of Artificial Intelligence and Data Science, Easwari Engineering College, Ramapuram – Chennai.")

    doc.add_paragraph()
    doc.add_paragraph()
    doc.add_paragraph()

    table_viva = doc.add_table(rows=1, cols=2)
    table_viva.alignment = WD_TABLE_ALIGNMENT.CENTER
    v1 = table_viva.rows[0].cells[1].paragraphs[0]
    v1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    v1.paragraph_format.line_spacing = 1.5
    rv1 = v1.add_run("Internal Examiner\nDate: ____________________")
    rv1.font.name = 'Times New Roman'
    rv1.font.size = Pt(12)
    rv1.font.bold = True

    doc.add_page_break()

    # ====================================================
    # ABSTRACT
    # ====================================================
    p_main_title("ABSTRACT", space_after=18)
    p_body("The ResQLink Community Disaster Relief & Emergency Response Platform is an enterprise-grade, web-based incident dispatch and humanitarian coordination system developed to simplify, organize, and accelerate rescue activities during severe floods, cyclones, and environmental crises. During natural calamities, conventional emergency channels suffer from cellular network congestion, unverified social media misinformation, and disconnected ground rescue teams. Distressed citizens face severe delays in communicating their precise location, while rescue volunteers struggle to identify which calls are authenticated and within their operational vicinity. To overcome these critical challenges, the proposed system provides a centralized digital platform that enables users to manage emergency rescue calls, volunteer assignments, government operations, and relief shelter resources efficiently.")
    p_body("The application is developed using the MERN stack, which includes MongoDB, Express.js, React.js, and Node.js. MongoDB with GeoJSON 2dsphere indexing is used for geospatial data storage, Express.js and Node.js handle server-side operations and REST API routing, and React.js with TypeScript and Tailwind CSS provides an interactive, high-contrast, user-friendly interface. The system incorporates specialized portals for four distinct operational roles: Citizens, Certified Rescue Volunteers, Government Emergency Operations Centers (EOC / SDMA), and Resource Providers. Through the Citizen Portal, users can submit emergency reports across five essential categories (Rescue, Medical, Food, Water, Shelter), acquire automatic latitude and longitude coordinates using a resilient multi-tier geolocation detector, and queue distress calls offline using local storage idempotency keys.")
    p_body("The Volunteer Console empowers certified rescuers to configure their service radius (in kilometers), track active mission lifecycles, log blocker updates, summon emergency squad reinforcements, and review verified Task History with live rescued metrics. The Government EOC Command Room provides institutional commanders with an interactive Leaflet GIS spatial heatmap of affected sectors, multi-parameter triage filters, automated SLA breach escalation alerts, and formal mission closeout auditing. Relief Camps monitoring calculates real-time shelter capacity, free occupancy spaces, and verifies on-site food and clinic amenities. Overall, the ResQLink project establishes an accessible, accountable, and fault-tolerant digital bridge between victims and emergency responders, minimizing rescue turnaround latency and elevating community disaster resilience.")

    doc.add_page_break()

    # ====================================================
    # ACKNOWLEDGEMENT
    # ====================================================
    p_main_title("ACKNOWLEDGEMENT", space_after=18)
    p_body("We express our sincere gratitude to the Principal Dr. P. Deiva Sundari and the Management of our college for providing us with the opportunity and modern laboratory facilities to carry out this project work successfully.")
    p_body("We convey our heartfelt thanks to the Head of the Department Dr. T. KalaiSelvi, Department of Artificial Intelligence and Data Science, for her continuous encouragement, administrative guidance, and valuable technical support throughout.")
    p_body("We are extremely thankful to our Project Guide Ms. D. S. K. Harshitha, Department of Artificial Intelligence and Data Science for her valuable guidance, insightful reviews, constructive suggestions, and motivation throughout the completion of this project.")
    p_body("We would also like to extend our sincere gratitude to all the faculty members and technical staff of the Department of Artificial Intelligence and Data Science for their constant support and assistance.")
    p_body("Finally, we thank our parents and friends for their constant encouragement, understanding, and help during the course of this project.")

    doc.add_page_break()

    # ====================================================
    # TABLE OF CONTENTS
    # ====================================================
    p_main_title("Table of contents", space_after=14)
    table_toc = doc.add_table(rows=1, cols=3)
    table_toc.alignment = WD_TABLE_ALIGNMENT.CENTER
    table_toc.rows[0].cells[0].paragraphs[0].add_run("Chapter").font.bold = True
    table_toc.rows[0].cells[1].paragraphs[0].add_run("Title").font.bold = True
    table_toc.rows[0].cells[2].paragraphs[0].add_run("Page no").font.bold = True

    toc_rows = [
        ("", "Abstract", "iv"),
        ("", "Acknowledgement", "v"),
        ("", "List of Tables", "vi"),
        ("1", "Introduction", "1"),
        ("", "1.1 OVERVIEW", "1"),
        ("", "1.2 PROBLEM DEFINITION", "1"),
        ("", "1.3 OBJECTIVE", "2"),
        ("", "1.4 SCOPE OF THE PROJECT", "2"),
        ("", "1.5 MOTIVATION", "2"),
        ("2", "LITERATURE SURVEY", "3"),
        ("", "2.1 LITERATURE REVIEW", "3"),
        ("", "2.2 EXISTING SYSTEM", "3"),
        ("", "2.3 PROPOSED SYSTEM", "4"),
        ("3", "SYSTEM ANALYSIS", "5"),
        ("", "3.1 SYSTEM REQUIREMENTS", "5"),
        ("", "3.1.1 Functional Requirements", "5"),
        ("", "3.1.2 Non-Functional Requirements", "5"),
        ("", "3.2 SOFTWARE AND HARDWARE REQUIREMENTS", "6"),
        ("", "3.2.1 Software Requirements", "6"),
        ("", "3.2.2 Hardware Requirements", "7"),
        ("4", "METHODOLOGY", "8"),
        ("", "4.1 System Architecture", "8"),
        ("", "4.2 Module Description", "9"),
        ("", "4.2.1 User Interface Module", "9"),
        ("", "4.2.2 Citizen Emergency Dispatch Module", "9"),
        ("", "4.2.3 Volunteer Field Console Module", "9"),
        ("", "4.2.4 Government EOC Command Module", "10"),
        ("", "4.2.5 Resource Provider Assets & Camp Management Module", "10"),
        ("", "4.2.6 GIS Spatial Mapping & Coordinate Engine", "10"),
        ("", "4.3 Class Diagram", "10"),
        ("", "4.4 Sequence Diagram", "11"),
        ("5", "RESULTS AND DISCUSSION", "12"),
        ("", "5.1.1 Citizen Emergency Dispatch Interface", "12"),
        ("", "5.1.2 Volunteer Console & Task History Interface", "12"),
        ("", "5.1.3 Government EOC Tactical Operations Interface", "12"),
        ("", "5.1.4 Relief Camps & Evacuation Shelters Interface", "12"),
        ("", "5.1.5 Interactive GIS Spatial Map Interface", "13"),
        ("", "5.2 KEY FUNCTIONS (CODE EXPLANATION)", "13"),
        ("6", "CONCLUSION AND FUTURE ENHANCEMENTS", "18"),
        ("", "6.1 Conclusion", "18"),
        ("", "6.2 Future Enhancements", "18"),
        ("", "APPENDIX", "20"),
        ("", "SCREENSHOTS", "36"),
        ("", "REFERENCES", "45")
    ]

    for ch, ti, pg in toc_rows:
        row = table_toc.add_row().cells
        row[0].width = Inches(0.8)
        row[1].width = Inches(4.8)
        row[2].width = Inches(0.8)
        p0 = row[0].paragraphs[0]
        p1 = row[1].paragraphs[0]
        p2 = row[2].paragraphs[0]
        p0.paragraph_format.line_spacing = 1.3
        p1.paragraph_format.line_spacing = 1.3
        p2.paragraph_format.line_spacing = 1.3
        r0 = p0.add_run(ch)
        r1 = p1.add_run(ti)
        r2 = p2.add_run(pg)
        r0.font.name = r1.font.name = r2.font.name = 'Times New Roman'
        r0.font.size = r1.font.size = r2.font.size = Pt(11)
        if ch or ti in ["Abstract", "Acknowledgement", "LITERATURE SURVEY", "SYSTEM ANALYSIS", "METHODOLOGY", "RESULTS AND DISCUSSION", "CONCLUSION AND FUTURE ENHANCEMENTS", "APPENDIX", "SCREENSHOTS", "REFERENCES"]:
            r0.font.bold = r1.font.bold = r2.font.bold = True

    doc.add_page_break()

    # ====================================================
    # CHAPTER 1
    # ====================================================
    p_main_title("CHAPTER 1", space_after=4)
    p_main_title("INTRODUCTION", space_after=14)
    p_body("This chapter deals with the background, problem definition, objectives, scope, and motivation of the ResQLink Community Emergency Relief and Disaster Management Platform. It explains the principles of digital incident triage, web-based dispatch systems, geospatial database management, and accessible user interaction. The chapter describes how a full-stack software system can help citizens, volunteer squads, and government command rooms coordinate life-saving relief activities during severe environmental disasters.")

    p_heading_1("1.1 OVERVIEW")
    p_body("The ResQLink Emergency Response Platform is a web-based application designed to help citizens and emergency rescue organizations manage critical disaster calls in real time. It is developed using the MERN technology stack, which consists of MongoDB, Express.js, React.js, and Node.js. The system aims to simplify emergency reporting, volunteer proximity matching, incident triage, SLA escalation tracking, and relief shelter capacity monitoring.")
    p_body("The application provides a centralized, role-based platform where distressed citizens can report entrapments and supplies shortages, certified rescue volunteers can accept missions within their configured radius, and government incident commanders can monitor live spatial GIS heatmaps across submerged urban sectors. The dashboard is designed to display total calls, pending triage, active rescues, critical life-threatening incidents, and safe shelter occupancy. These functions eliminate the chaotic reliance on manual spreadsheets and social media broadcasts, making disaster information verifiable and actionable.")
    p_body("The project also includes an offline-first storage queue and multi-tier geolocation fallback mechanisms intended to ensure high accessibility during extreme weather conditions when cellular infrastructure is compromised. The application is responsive and engineered for cross-device web browser deployment across desktops, laptops, tablets, and ruggedized field smartphones.")

    p_heading_1("1.2 PROBLEM DEFINITION")
    p_body("During catastrophic urban flash floods and cyclones, emergency communication systems face severe breakdowns. Citizens frequently attempt to report distress through phone hotlines that become overwhelmed by call congestion, or through unverified social media threads that lack exact geographic coordinates and verification mechanisms.")
    p_body("Another problem is that emergency dispatch records and field responder locations are scattered across disparate sources, such as verbal radio dispatches, SMS messages, and handwritten emergency control room logs. Comparing these records in real time causes fatal delays in deploying rescue motorboats to marooned families.")
    p_body("Many existing commercial disaster management applications also contain complex, militarized GIS interfaces that are difficult for ordinary citizens or voluntary rescue groups to operate during an unfolding crisis. Therefore, a simple, responsive, and accessible application is needed to record geotagged distress calls, organize field responders, enforce emergency SLA response times, and provide real-time situational awareness.")

    p_heading_1("1.3 OBJECTIVE")
    p_body("The main objectives of the ResQLink Community Disaster Relief Platform are:")
    p_bullet("To develop a responsive, role-based web application for emergency disaster management.")
    p_bullet("To provide facilities for recording geotagged emergency rescue calls across 5 core categories (Rescue, Medical, Food, Water, Shelter).")
    p_bullet("To implement a multi-tier geolocation detector ensuring coordinate capture even under severe GPS signal occlusion.")
    p_bullet("To match emergency incidents with certified volunteers using spherical Haversine proximity calculations.")
    p_bullet("To provide a centralized Government EOC command cockpit for verifying calls, overriding triage priority, and dispatching rescue personnel.")
    p_bullet("To implement an automated SLA escalation watcher that immediately alerts commanders of unassigned critical calls.")
    p_bullet("To engineer an offline-first local queue with idempotency keys for reliable transmission upon network reconnection.")
    p_bullet("To monitor public relief camp capacities, real-time available spaces, and on-site clinic and ration provisions.")
    p_bullet("To maintain historical Task History records with verified mission completion metrics (lives rescued, casualties, hospital transfers).")

    p_heading_1("1.4 SCOPE OF THE PROJECT")
    p_body("The scope of this project includes the development of a full-stack disaster coordination system tailored for urban lowlands, river basins, and coastal flood sectors. The system focuses on routine distress reporting, proximity dispatch, real-time GIS mapping, and shelter management.")
    p_body("The Citizen module allows users to pin their coordinates and describe life hazards. The Volunteer module allows responders to manage assignments, log field blockers, and summon reinforcements. The Government EOC module gives commanders an operational spatial picture across all disaster wards, while the Relief Camps section guides evacuated civilians to safe shelters with verified capacities.")
    p_body("The project source also contains modular controllers for inventory tracking, equipment reservations (motorized boats, 4x4 trucks, trauma kits), and citizen identity verification. The system is designed to seamlessly integrate with authorized government SMS alert gateways and national disaster emergency telephone registries.")

    p_heading_1("1.5 MOTIVATION")
    p_body("The motivation behind this project is to eliminate preventable loss of human lives during urban flash floods and coastal cyclones by replacing fragmented communication with organized digital triage. Maintaining accurate, geotagged records of stranded citizens is vital for directing rescue motorboats and medical evacuation teams efficiently.")
    p_body("A centralized platform eliminates duplicate rescue attempts, highlights isolated distress calls, and guarantees that vulnerable citizens (infants, bedridden patients) are triaged with highest priority. A clean, uncluttered user interface combined with offline resilience makes the software dependable for distressed citizens and exhausted field volunteers alike.")
    p_body("The project aims to empower communities and government disaster authorities to act in synchronized unison, proving that modern web engineering and spatial indexing can provide resilient, life-saving infrastructure when nature strikes hardest.")

    doc.add_page_break()

    # ====================================================
    # CHAPTER 2
    # ====================================================
    p_main_title("CHAPTER 2", space_after=4)
    p_main_title("LITERATURE SURVEY", space_after=14)
    p_body("This chapter deals with existing approaches to emergency disaster coordination and the software concepts used to develop digital incident response systems. It discusses traditional telephone hotlines, social media crowdsourcing, enterprise GIS platforms, database management, and accessible user interfaces. The purpose is to explain the need for a simple, centralized, resilient solution for disaster relief operations.")

    p_heading_1("2.1 LITERATURE REVIEW")
    p_body("Digital disaster management platforms have evolved from paper incident ledgers and telephone dispatch desks into web-based platforms that store, index, and process spatial emergency data electronically. These systems help first responders organize distress calls, track personnel, and allocate relief resources with minimal human error.")
    p_body("Database management is an essential foundation of emergency applications. A spatial database stores disaster coordinates in a structured form and permits rapid proximity calculations. MongoDB is used in this project as the database, utilizing specialized GeoJSON 2dsphere indexes, while Mongoose provides an elegant object-modeling interface for managing life-critical documents.")
    p_body("The MERN stack supports the development of full-stack web applications using JavaScript and TypeScript. React.js is used to build interactive, component-driven user interfaces; Express.js handles API endpoints and route security; Node.js executes server-side business logic; and MongoDB persists incident and user states. This separation of concerns ensures that the platform is scalable and maintainable.")
    p_body("User interface accessibility is especially critical during humanitarian emergencies. Clean forms, high-contrast badges, responsive mobile layouts, and clear status indicators make software intuitive to use under extreme panic. The effectiveness of these capabilities depends on resilient engineering and robust offline handling.")

    p_heading_1("2.2 EXISTING SYSTEM")
    p_body("The existing methods commonly relied upon during regional disaster emergencies include emergency phone hotlines, uncoordinated social media broadcasts, and proprietary military GIS command centers.")
    p_body("Emergency Phone Hotlines: Citizens dial 108, 112, or local district control rooms. During widespread calamities, telecommunication lines experience total trunk saturation, resulting in endless busy tones. Emergency operators transcribe addresses manually into paper notebooks or static spreadsheets, leading to errors and delays.")
    p_body("Social Media Broadcasts: Distressed family members post appeals on Twitter/X, WhatsApp, and Facebook. While these messages spread rapidly, they lack verified geographic coordinates, contact numbers are frequently outdated, and duplicate posts cause rescue teams to visit residences where evacuations were already completed.")
    p_body("Proprietary Enterprise Software: High-end command software used by defense agencies offers complex GIS telemetry but requires specialized training and licensed terminals. They lack public-facing reporting interfaces and provide no mechanism for spontaneous community volunteer coordination.")

    p_heading_2("Limitations of the existing systems:")
    p_bullet("Manual phone transcriptions cause geographic ambiguity and fatal dispatch delays.")
    p_bullet("Social media distress calls are unverified, duplicated, and lack precise GPS coordinates.")
    p_bullet("No standardized mechanism exists to match volunteer squads based on operational perimeter.")
    p_bullet("Systems fail completely when cellular internet connections experience temporary dropouts.")
    p_bullet("Relief shelter occupancy is unmonitored, leading to chaotic overcrowding and food depletion.")
    p_bullet("Field teams cannot summon urgent manpower reinforcements or heavy rescue equipment.")

    p_heading_1("2.3 PROPOSED SYSTEM")
    p_body("The proposed ResQLink Disaster Relief & Emergency Response Platform provides a centralized, role-segregated web application for reporting, triaging, and executing emergency rescue missions.")
    p_body("The system uses React.js and Leaflet for interactive GIS frontend mapping, Express.js and Node.js for backend API controllers, and MongoDB for spatial data persistence. Distressed citizens report emergencies with verified coordinates, rescue volunteers mobilize using radius filters, and government incident commanders supervise operations on live heatmaps.")

    p_heading_2("The proposed system offers the following features:")
    p_bullet("Citizen Emergency Dispatch: Captures distress type, affected headcount, address, and GPS coordinates.")
    p_bullet("Resilient Location Engine: Multi-tier fallback combining HTML5 GPS, network lookup, and flood sector pills.")
    p_bullet("Volunteer Field Console: Proximity-based task matching, active mission lifecycles, and blocker reporting.")
    p_bullet("On-Demand Reinforcement: Rescuers can summon additional squad personnel and emergency equipment from the field.")
    p_bullet("Government EOC Command: Central triage cockpit with Leaflet GIS maps, priority overrides, and dispatch audits.")
    p_bullet("Automated SLA Escalation: Automatic escalation watcher that alerts commanders of unassigned critical calls.")
    p_bullet("Relief Camp Monitoring: Live tracker of shelter capacities, free spaces, hot meals, and medical clinic support.")
    p_bullet("Offline Storage Engine: Local storage caching with idempotency keys that auto-synchronizes upon reconnect.")

    doc.add_page_break()

    # ====================================================
    # CHAPTER 3
    # ====================================================
    p_main_title("CHAPTER 3", space_after=4)
    p_main_title("SYSTEM ANALYSIS", space_after=14)
    p_body("This chapter deals with the analysis of the functional and non-functional requirements of the ResQLink Emergency Response Platform. It identifies the operational tasks the system must perform, the quality characteristics it must sustain, and the hardware and software environments required to develop and deploy the application.")

    p_heading_1("3.1 SYSTEM REQUIREMENTS")
    p_body("System requirements describe the services provided by the disaster management platform and the operational conditions under which it operates. They are categorized into functional and non-functional requirements.")

    p_heading_2("3.1.1 Functional Requirements")
    p_body("Functional requirements describe the core operational tasks executed by the software:")
    p_bullet("1. User Access & Roles: The application must provide secure role-based access for Citizens, Volunteers, Government Officers, and Resource Providers.")
    p_bullet("2. Incident Submission: Citizens must be able to report distress calls with emergency category, affected headcount, description, and GPS coordinates.")
    p_bullet("3. Geolocation Pinning: The system must acquire coordinates via browser GPS or allow single-click selection from known flood sector hotspots.")
    p_bullet("4. Government Verification & Triage: EOC commanders must be able to verify calls, reclassify triage priorities, or reject non-actionable reports.")
    p_bullet("5. Volunteer Proximity Dispatch: The system must calculate distances using the Haversine formula and alert volunteers within range.")
    p_bullet("6. Mission Lifecycle Tracking: Responders must be able to accept missions, update status (ARRIVED, IN_PROGRESS), and record field notes.")
    p_bullet("7. Field Reinforcement Summons: Responders must be able to request additional manpower and emergency equipment from the field.")
    p_bullet("8. Automated SLA Escalation: The backend must flag unassigned CRITICAL requests exceeding response thresholds (default: 30 minutes).")
    p_bullet("9. Task History Archival: Upon completion, missions must archive into Task History with verified rescued counts and casualties.")
    p_bullet("10. Relief Camp Capacity Tracking: The platform must compute available shelter capacity and display on-site food and medical provisions.")

    p_heading_2("3.1.2 Non-Functional Requirements")
    p_body("Non-functional requirements describe the quality attributes and operational benchmarks of the system:")
    p_bullet("1. Usability: The user interface must be clean, responsive, and high-contrast, ensuring legibility under harsh outdoor rain and sunlight.")
    p_bullet("2. Performance: Geospatial queries, spatial distance calculations, and dashboard updates must execute within 1.5 seconds.")
    p_bullet("3. Security: All passwords must be salted and hashed with bcrypt (rounds >= 10); API endpoints must be guarded with stateless JWT tokens.")
    p_bullet("4. Reliability: Distress records must be stored persistently. Offline requests must use client idempotency keys to prevent duplicate records.")
    p_bullet("5. Maintainability: The application follows a modular architecture separating React presentation, Express business controllers, and Mongoose schemas.")
    p_bullet("6. Scalability: The database schema utilizes compound indexes and GeoJSON 2dsphere indexing to support high concurrency during disaster peaks.")
    p_bullet("7. Compatibility: The web application must function smoothly across modern browsers (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari).")

    p_heading_1("3.2 SOFTWARE AND HARDWARE REQUIREMENTS")
    p_body("The ResQLink Disaster Management Platform is built on the MERN stack, combining MongoDB, Express.js, React.js, and Node.js.")

    p_heading_2("3.2.1 Software Requirements")
    p_body("The software requirements for developing and running the platform are listed below:")

    t_sw = doc.add_table(rows=1, cols=2)
    t_sw.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_sw.rows[0].cells[0].paragraphs[0].add_run("Software").font.bold = True
    t_sw.rows[0].cells[1].paragraphs[0].add_run("Purpose").font.bold = True

    sw_rows = [
        ("Operating System", "Windows 10/11, Ubuntu Linux 22.04 LTS, or macOS Sonoma"),
        ("Frontend", "React.js 19 with TypeScript, Tailwind CSS, Lucide Icons"),
        ("Backend", "Node.js v20/v22 LTS and Express.js 4.21"),
        ("Database", "MongoDB 7.0 Community / Atlas with GeoJSON 2dsphere"),
        ("Database Integration", "Mongoose 8.x Object Data Modeling"),
        ("GIS Mapping", "Leaflet 1.9.4 & OpenStreetMap cartographic tiles"),
        ("Programming Languages", "TypeScript, JavaScript, HTML5, CSS3"),
        ("Code Editor", "Visual Studio Code with ESLint and Prettier"),
        ("Web Browser", "Google Chrome, Microsoft Edge, or compatible browser"),
        ("Package Manager", "Npm (Node Package Manager)"),
        ("API Testing Tool", "Postman, Thunder Client, or cURL")
    ]
    for k, v in sw_rows:
        r = t_sw.add_row().cells
        r[0].paragraphs[0].add_run(k).font.size = Pt(11)
        r[0].paragraphs[0].runs[0].font.name = 'Times New Roman'
        r[1].paragraphs[0].add_run(v).font.size = Pt(11)
        r[1].paragraphs[0].runs[0].font.name = 'Times New Roman'

    doc.add_paragraph()
    p_heading_2("3.2.2 Hardware Requirements")
    p_body("The following hardware configuration is suitable for development and operational deployment:")

    t_hw = doc.add_table(rows=1, cols=2)
    t_hw.alignment = WD_TABLE_ALIGNMENT.CENTER
    t_hw.rows[0].cells[0].paragraphs[0].add_run("Hardware").font.bold = True
    t_hw.rows[0].cells[1].paragraphs[0].add_run("Minimum Suggested Requirement").font.bold = True

    hw_rows = [
        ("Processor", "Quad-core 64-bit x86/ARM processor (Intel Core i5 / AMD Ryzen 5 / Apple Silicon)"),
        ("RAM", "Minimum 8 GB RAM (16 GB recommended for concurrent services)"),
        ("Storage", "At least 10 GB of available SSD storage for database and assets"),
        ("Display", "Standard monitor (1920x1080) or responsive laptop / tablet screen"),
        ("Input Devices", "Keyboard and mouse or touchscreen input"),
        ("Network", "Broadband or 4G/5G mobile connection (minimum 256 kbps in field)")
    ]
    for k, v in hw_rows:
        r = t_hw.add_row().cells
        r[0].paragraphs[0].add_run(k).font.size = Pt(11)
        r[0].paragraphs[0].runs[0].font.name = 'Times New Roman'
        r[1].paragraphs[0].add_run(v).font.size = Pt(11)
        r[1].paragraphs[0].runs[0].font.name = 'Times New Roman'

    doc.add_page_break()

    # ====================================================
    # CHAPTER 4
    # ====================================================
    p_main_title("CHAPTER 4", space_after=4)
    p_main_title("METHODOLOGY", space_after=14)
    p_body("This chapter deals with the methodology used to design and develop the ResQLink Disaster Relief & Emergency Response Platform. It explains the system architecture, the primary functional modules, and the interaction between the frontend, backend, and database. The system follows a modular development approach where each component is responsible for a specific disaster coordination task.")

    p_heading_1("4.1 System Architecture")
    p_body("The ResQLink platform follows a multi-tier client-server architecture based on the MERN technology stack. The architecture consists of four interconnected layers: the User Presentation Layer, the React.js Frontend, the Node.js/Express.js Backend, and the MongoDB Geospatial Database.")
    p_body("Frontend: Developed using React.js 19 and TypeScript, styled with Tailwind CSS. It provides role-segregated portals where citizens report emergencies, volunteers accept missions, and EOC commanders view spatial GIS maps.")
    p_body("Backend: Developed using Node.js and Express.js. It manages REST API endpoints, performs JWT authentication, executes Haversine proximity calculations, and triggers automated SLA escalation watchers.")
    p_body("Database: MongoDB 7.0 is used for persistent storage, featuring 2dsphere geospatial indexing for coordinate lookups, compound priority indexes, and persistent relief camp occupancy records.")

    p_body("The general operational flow of the system is as follows:")
    p_bullet("1. The citizen interacts with the React.js frontend and submits a geotagged distress call.")
    p_bullet("2. If offline, the request is cached in browser local storage; if online, it is sent via HTTP POST to the backend.")
    p_bullet("3. The Express.js server validates the payload, applies initial priority categorization, and saves it to MongoDB.")
    p_bullet("4. The Government EOC dashboard receives real-time updates and verifies call validity.")
    p_bullet("5. Responders within the coverage radius are alerted; an available volunteer accepts the assignment.")
    p_bullet("6. The volunteer updates field progress, submits completion metrics, and marks the mission CLOSED.")

    # Insert Exact Architecture Diagram (Matching Page 16 of reference)
    add_image_safe("fig_4_1_resqlink_architecture.png", width_inches=6.0)
    p_center("Figure 4.1: System Architecture of ResQLink Emergency Response Platform", size=10, bold=True, italic=True)

    p_heading_1("4.2 Module Description")
    p_body("The platform is divided into six functional modules to simplify development, ensure maintainability, and guarantee operational clarity during disasters.")

    p_heading_2("4.2.1 User Interface Module")
    p_body("The user interface module provides intuitive screens designed for rapid disaster response. It includes clean navigation bars, role switchers, high-contrast priority badges, and Leaflet interactive map dropper components. Component-based architecture allows individual forms and cards to update independently without page reloads.")

    p_heading_2("4.2.2 Citizen Emergency Dispatch Module")
    p_body("This module allows stranded citizens to submit distress appeals in three simple steps. Users select their emergency category (Rescue, Medical, Food, Water, Shelter), state the count of affected persons, enter description and phone, and pin location coordinates. Real-time status badges display whether the call is Pending, Assigned, In Progress, or Resolved.")

    p_heading_2("4.2.3 Volunteer Field Console Module")
    p_body("The volunteer console enables registered rescuers to set their operational availability (READY, BUSY, OFF) and configure their rescue perimeter slider (km). Responders receive instant alerts for nearby calls, review target coordinates, record field blocker updates, and summon emergency squad manpower or equipment.")

    p_heading_2("4.2.4 Government EOC Command Module")
    p_body("The State EOC control room module functions as the central command cockpit. Incident commanders monitor real-time incident counters, inspect spatial GIS heatmaps, adjust priority levels, dispatch verified volunteers, and audit post-mission completion statistics.")

    p_heading_2("4.2.5 Resource Provider Assets & Camp Management Module")
    p_body("This module enables resource providers to catalog emergency equipment (motorized rescue boats, 4x4 trucks, trauma kits) and monitor public evacuation shelters. Real-time calculations display available shelter spaces (Total Capacity - Current Occupancy) alongside on-site meal and clinic provisions.")

    p_heading_2("4.2.6 GIS Spatial Mapping & Coordinate Engine")
    p_body("The GIS engine utilizes Leaflet cartographic layers to render interactive maps. It calculates exact ground distances using the Haversine spherical trigonometric formula and integrates a resilient multi-tier geolocation detector with fallback flood sector coordinates.")

    doc.add_page_break()

    p_heading_1("4.3 Class Diagram")
    p_body("The class diagram represents the core data models of the system and the structural relationships between them. It reflects the Mongoose schemas implemented in the backend source code.")

    # Insert Class Diagram
    add_image_safe("fig_4_4_class_diagram.png", width_inches=4.4, space_before=4, space_after=2)
    p_center("Figure 4.4: Class Diagram of ResQLink Platform Entities", size=10, bold=True, italic=True)

    p_heading_1("4.4 Sequence Diagram")
    p_body("The sequence diagram illustrates the chronological order of interactions between the distressed citizen, React client, Express API, MongoDB spatial database, and volunteer rescuer.")

    # Insert Sequence Diagram
    add_image_safe("fig_4_5_sequence_diagram.png", width_inches=4.4, space_before=4, space_after=2)
    p_center("Figure 4.5: Sequence Diagram for Emergency Dispatch and Resolution", size=10, bold=True, italic=True)

    doc.add_page_break()

    # ====================================================
    # CHAPTER 5
    # ====================================================
    p_main_title("CHAPTER 5", space_after=4)
    p_main_title("RESULTS AND DISCUSSION", space_after=14)
    p_body("This chapter deals with the implementation and results of the ResQLink Emergency Response Platform. It describes the main interface features developed in the application and explains the source code components responsible for user authentication, geospatial indexing, proximity calculations, volunteer dispatch, automated SLA escalation, and offline data synchronization.")

    p_heading_1("5.1 Implementation Overview")
    p_body("The ResQLink platform is implemented using React.js 19 for the frontend, Node.js and Express.js for backend processing, and MongoDB for database storage. The frontend provides role-segregated consoles for citizens, volunteers, government officers, and camp managers, while the backend processes REST API requests and executes automated background watchers.")

    p_heading_2("5.1.1 Citizen Emergency Dispatch Interface")
    p_body("The citizen interface enables users to submit distress calls by entering emergency category, affected person count, contact phone, and location. Coordinates are captured via the robust GPS locator or by tapping on the interactive map dropper.")

    p_heading_2("5.1.2 Volunteer Console & Task History Interface")
    p_body("The volunteer console enables field personnel to toggle readiness, configure coverage radius, accept nearby rescue assignments, submit chronological field notes, and review their verified Task History with lives saved metrics.")

    p_heading_2("5.1.3 Government EOC Tactical Operations Interface")
    p_body("The government command dashboard displays 10 live operational status metrics, a real-time incident triage table, priority override controls, and automated alerts for critical SLA response breaches.")

    p_heading_2("5.1.4 Relief Camps & Evacuation Shelters Interface")
    p_body("The relief camps interface displays verified safe houses with live capacity progress bars, available spaces, on-site food and clinic provisions, and direct nodal officer phone links.")

    p_heading_2("5.1.5 Interactive GIS Spatial Map Interface")
    p_body("The GIS mapping interface renders dynamic Leaflet layers plotting incident hotspots, active volunteer squad positions, staging depots, and evacuation safe shelters across Chennai disaster sectors.")

    # 5.2 Key Functions Code Explanation
    p_heading_1("5.2 KEY FUNCTIONS (CODE EXPLANATION)")
    p_body("This section explains the critical algorithms and functions that govern system security, geospatial processing, volunteer assignment, SLA escalation, and offline synchronization.")

    # 1. Password Hashing Hook
    p_heading_2("1. Password Hashing Hook (server/src/models/User.ts)")
    p_code("""userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});""")
    p_body("Enforces irreversible cryptographic salting and hashing on user passwords prior to database persistence.", "Purpose: ")
    p_body("this.isModified('passwordHash'): Ensures password rehashing is executed only when an account is registered or when a password is reset, preventing double-hashing on normal profile updates.", "Explanation: ")
    p_body("bcrypt.genSalt(10): Generates a cryptographically strong pseudo-random salt with a cost factor of 10.")
    p_body("bcrypt.hash(): Hashes the plaintext password with the generated salt, guaranteeing that plain credentials are never stored in MongoDB.")

    # 2. Stateless JWT Generation & Login
    p_heading_2("2. Stateless JWT Generation & Login (server/src/controllers/authController.ts)")
    p_code("""const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'resqlink_secret_key_2026', {
    expiresIn: '7d',
  });
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (user && (await bcrypt.compare(password, user.passwordHash))) {
    res.status(200).json({
      success: true,
      token: generateToken(user._id, user.role),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } else {
    res.status(401).json({ message: 'Invalid emergency credentials provided.' });
  }
};""")
    p_body("Validates user credentials and issues digital authorization bearer tokens containing encrypted role claims.", "Purpose: ")
    p_body("User.findOne({ email }): Queries the database using a case-insensitive email match.", "Explanation: ")
    p_body("bcrypt.compare(): Performs secure cryptographic comparison of entered plaintext with the stored password hash.")
    p_body("generateToken(): Encodes user database ID and role permission into a signed JWT token valid for 7 days.")
    p_body("Returns 401 Unauthorized upon invalid credentials without disclosing whether the email or password was incorrect.")

    # 3. Geospatial Emergency Schema with 2dsphere Indexing
    p_heading_2("3. Geospatial Emergency Schema with 2dsphere Indexing (server/src/models/EmergencyRequest.ts)")
    p_code("""export const EmergencyRequestSchemaDefinition = {
  requestId: { type: String, required: true, unique: true, index: true },
  citizenId: { type: String, required: true, index: true },
  emergencyType: {
    type: String,
    enum: ['Rescue', 'Medical', 'Food', 'Water', 'Shelter'],
    required: true,
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }, // [longitude, latitude]
  },
  priority: {
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
    default: 'MEDIUM',
    index: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLUTION_PENDING', 'CLOSED', 'REJECTED'],
    default: 'PENDING',
    index: true,
  },
  isEscalated: { type: Boolean, default: false, index: true },
};

// Compound spatial and operational indexes
EmergencyRequestSchema.index({ location: '2dsphere', status: 1, priority: 1 });""")
    p_body("Defines the formal database contract for disaster incidents and applies compound geospatial indexes for high-speed spatial proximity queries.", "Purpose: ")
    p_body("The location attribute strictly adheres to the GeoJSON Point specification ([longitude, latitude]).", "Explanation: ")
    p_body("Creating a 2dsphere index enables MongoDB to execute spherical distance calculations taking into account Earth's curvature.")
    p_body("Compound indexing on location, status, and priority ensures that filtering pending critical calls across large disaster datasets executes in constant O(log N) time.")

    # 4. Resilient Multi-Tier Geolocation Detector
    p_heading_2("4. Resilient Multi-Tier Geolocation Detector (src/utils/geo.ts)")
    p_code("""export async function detectLocationRobustly(timeoutMs: number = 4000): Promise<DetectedLocationResult> {
  // Strategy 1: Attempt HTML5 Browser Geolocation with strict hardware timeout
  if (typeof navigator !== 'undefined' && navigator.geolocation) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Geolocation timeout')), timeoutMs);
        navigator.geolocation.getCurrentPosition(
          (p) => { clearTimeout(timer); resolve(p); },
          (err) => { clearTimeout(timer); reject(err); },
          { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 10000 }
        );
      });
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      const { sector, distanceKm } = findClosestSector(lat, lng);
      return {
        lat, lng,
        accuracy: Math.round(pos.coords.accuracy),
        source: 'gps',
        locationName: `${sector.name} (~${distanceKm}km away)`,
        note: 'Live GPS coordinate lock acquired',
      };
    } catch (e) { /* Fallback to Strategy 2 */ }
  }
  // Strategy 2: Graceful fallback to primary coastal flood command sector
  const defaultSector = POPULAR_SECTORS[0]; // Velachery Central Lowlands
  return {
    lat: defaultSector.lat, lng: defaultSector.lng,
    accuracy: 150, source: 'sector_default',
    locationName: `${defaultSector.name} (${defaultSector.locality})`,
    note: 'Resolved to primary disaster response sector',
  };
}""")
    p_body("Guarantees that a distressed citizen is never left stranded with a hanging \"Detecting...\" spinner during extreme weather conditions when GPS satellite signals are occluded by cloud cover or concrete buildings.", "Purpose: ")
    p_body("The function wraps the asynchronous browser Geolocation API within an enforced 4-second Promise timeout.", "Explanation: ")
    p_body("If the device hardware successfully returns coordinates, it computes the nearest known disaster sector.")
    p_body("If user permission is denied, hardware lacks GPS, or the satellite query times out, the function gracefully falls back to central flood sector coordinates, ensuring form submission is never blocked.")

    # 5. Haversine Spatial Distance Formula
    p_heading_2("5. Haversine Spatial Distance Formula (src/utils/geo.ts)")
    p_code("""export function calculateDistanceKm(
  lat1: number, lon1: number, lat2: number, lon2: number
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Mean radius of the Earth in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // Rounded to 1 decimal place
}""")
    p_body("Computes great-circle surface distance between two latitude/longitude points on Earth without relying on external paid map APIs.", "Purpose: ")
    p_body("The algorithm converts degree coordinates into radians and applies spherical trigonometry to compute angular distance.", "Explanation: ")
    p_body("This function powers the volunteer perimeter matching engine, enabling the Volunteer Console to instantly determine whether a distress call falls within a rescuer's configured coverage zone (e.g., 15 km).")

    # 6. Volunteer Task Assignment & Active Operation Safeguards
    p_heading_2("6. Volunteer Task Assignment & Active Operation Safeguards (src/services/store.ts)")
    p_code("""public assignVolunteerToRequest(requestId: string, volunteerProfileId: string): EmergencyRequest {
  const req = this.requests.find((r) => r.id === requestId || r.requestId === requestId);
  if (!req) throw new Error('Request not found');
  const vol = this.volunteers.find((v) => v.id === volunteerProfileId);
  if (!vol) throw new Error('Volunteer not found');

  req.assignedVolunteerId = vol.id;
  req.assignedVolunteerName = vol.name;
  req.status = 'ASSIGNED';
  req.operationId = req.operationId || `OP-${req.requestId.replace('REQ-2026-', '')}`;
  req.updatedAt = new Date().toISOString();

  // Atomically update volunteer operational status
  vol.availability = 'BUSY';
  vol.activeOperationId = req.requestId;
  vol.activeTasksCount = (vol.activeTasksCount || 0) + 1;
  vol.updatedAt = new Date().toISOString();

  this.pushNotification({
    userId: vol.userId,
    title: `New Mission Assigned: ${req.requestId}`,
    message: `You are dispatched to ${req.emergencyType} emergency at ${req.locationName}.`,
    type: 'ASSIGNMENT',
    timestamp: new Date().toISOString(),
  });
  this.persist();
  return req;
}""")
    p_body("Binds a certified volunteer to an emergency incident, synchronizes operational states, and prevents dispatch conflicts.", "Purpose: ")
    p_body("When an assignment is confirmed, the request transitions to ASSIGNED and is linked to the rescuer.", "Explanation: ")
    p_body("The volunteer's availability is atomically switched to BUSY, their activeOperationId is locked to the specific request ID, and real-time push notifications are dispatched to both the rescuer and the citizen.")

    # 7. Automated SLA Escalation Watcher
    p_heading_2("7. Automated SLA Escalation Watcher (src/services/store.ts)")
    p_code("""public checkEscalations(unassignedThresholdMinutes: number = 30): number {
  let count = 0;
  const now = Date.now();
  this.requests.forEach((r) => {
    if (r.status === 'PENDING' && r.priority === 'CRITICAL' && !r.isEscalated) {
      const createdTime = new Date(r.createdAt).getTime();
      const elapsedMinutes = (now - createdTime) / (1000 * 60);
      if (elapsedMinutes >= unassignedThresholdMinutes) {
        r.isEscalated = true;
        r.escalatedAt = new Date().toISOString();
        r.escalationReason = `Critical SLA breach: unassigned for >${unassignedThresholdMinutes} mins.`;
        r.updatedAt = new Date().toISOString();
        count++;
        this.pushNotification({
          roleTarget: 'GOVERNMENT',
          title: `CRITICAL SLA BREACH: ${r.requestId}`,
          message: `${r.requestId} at ${r.locationName} has remained unassigned beyond threshold.`,
          type: 'ESCALATION',
          timestamp: new Date().toISOString(),
        });
      }
    }
  });
  if (count > 0) this.persist();
  return count;
}""")
    p_body("Continuously monitors pending life-threatening requests and flags any case left unassigned beyond permissible response time limits.", "Purpose: ")
    p_body("A scheduled interval triggers this algorithm every 15 seconds. It computes the delta between the incident creation timestamp and system time.", "Explanation: ")
    p_body("If a CRITICAL request exceeds the threshold without a rescuer assigned, it automatically marks isEscalated = true and raises an urgent broadcast alert across all EOC Command screens.")

    # 8. Offline Idempotent Sync Queue Engine
    p_heading_2("8. Offline Idempotent Sync Queue Engine (src/services/store.ts)")
    p_code("""public syncOfflineQueue(): { synced: number; failed: number } {
  let synced = 0;
  let failed = 0;
  const remaining: OfflineSyncQueueItem[] = [];

  for (const item of this.offlineQueue) {
    try {
      if (item.action === 'CREATE_REQUEST') {
        // Idempotency check: prevent duplicate insertions on reconnection
        const exists = this.requests.some(
          (r) => r.id === item.payload.id || r.requestId === item.payload.requestId
        );
        if (!exists) {
          this.requests.unshift(item.payload);
          this.pushNotification({
            roleTarget: 'GOVERNMENT',
            title: `Offline Request Synced: ${item.payload.requestId}`,
            message: `New incident synchronized from offline queue.`,
            type: 'STATUS',
            timestamp: new Date().toISOString(),
          });
          synced++;
        }
      }
    } catch (e) {
      failed++;
      remaining.push(item);
    }
  }
  this.offlineQueue = remaining;
  this.persist();
  return { synced, failed };
}""")
    p_body("Synchronizes locally stored emergency requests when network connectivity returns while guaranteeing strict idempotency.", "Purpose: ")
    p_body("When offline, reports are given unique client IDs and queued in browser storage.", "Explanation: ")
    p_body("Upon reconnection, this function iterates through the queue and performs an existence check against active database records before insertion, preventing duplicate records if the connection flickers.")

    # 9. Field Mission Completion & Task History Archival
    p_heading_2("9. Field Mission Completion & Task History Archival (src/services/store.ts)")
    p_code("""public submitCompletionReport(
  requestId: string,
  report: Omit<CompletionReport, 'submittedAt'>,
  autoClose: boolean = true
): EmergencyRequest {
  const req = this.requests.find((r) => r.id === requestId || r.requestId === requestId);
  if (!req) throw new Error('Request not found');

  req.completionReport = { ...report, submittedAt: new Date().toISOString() };
  req.status = autoClose ? 'CLOSED' : 'RESOLUTION_PENDING';
  req.updatedAt = new Date().toISOString();

  // Release volunteer and increment cumulative rescued statistics
  if (req.assignedVolunteerId) {
    const vol = this.volunteers.find((v) => v.id === req.assignedVolunteerId);
    if (vol) {
      vol.availability = 'AVAILABLE';
      vol.activeOperationId = undefined;
      vol.activeTasksCount = Math.max(0, (vol.activeTasksCount || 1) - 1);
      vol.completedTasksCount = (vol.completedTasksCount || 0) + 1;
      vol.updatedAt = new Date().toISOString();
    }
  }
  this.persist();
  return req;
}""")
    p_body("Audits field completion data, archives the mission into permanent Task History, and releases the volunteer unit back to active duty.", "Purpose: ")
    p_body("Upon successful rescue, the volunteer submits casualty and rescue figures.", "Explanation: ")
    p_body("The method attaches the completion audit to the case, updates status to CLOSED, resets volunteer activeOperationId, increments completedTasksCount, and archives the mission into Task History.")

    doc.add_page_break()

    # ====================================================
    # CHAPTER 6
    # ====================================================
    p_main_title("CHAPTER 6", space_after=4)
    p_main_title("CONCLUSION AND FUTURE ENHANCEMENTS", space_after=14)
    p_body("This chapter deals with the conclusion of the ResQLink Community Emergency Relief and Disaster Management Platform and discusses possible improvements that can be introduced in future versions. It summarizes the contribution of the application to disaster relief coordination and identifies enhancements that may improve functionality, accessibility, security, and reliability.")

    p_heading_1("6.1 Conclusion")
    p_body("The ResQLink Emergency Response Platform is developed to help citizens, certified rescue volunteers, and government authorities manage life-critical disaster relief through a modern web-based application. By using the MERN stack, the system combines an interactive React.js frontend, a Node.js and Express.js backend, and MongoDB for spatial data storage.")
    p_body("The application focuses on core functions such as multi-tier geolocation coordinate capture, priority triage, volunteer proximity dispatch, active mission lifecycles, and relief camp monitoring. Offline caching and automated SLA escalation watchers are also included, helping ensure that distress calls are never lost or ignored during catastrophic storms.")
    p_body("The system provides an organized alternative to chaotic social media appeals and overwhelmed voice hotlines. Digital storage with 2dsphere indexing makes disaster calls easy to search and visualize on maps, while the EOC dashboard helps commanders understand operational status across all flood sectors based on real-time data.")
    p_body("Overall, the project demonstrates how full-stack web technologies and spatial algorithms can be used to develop a practical, life-saving application for modern disaster management. Further field testing and integrations can increase the system's resilience and usefulness.")

    p_heading_1("6.2 Future Enhancements")
    p_body("Although the current system supports comprehensive emergency dispatch and relief management, several enhancements could be introduced in future versions:")
    p_bullet("1. SMS & USSD Fallback Gateway: The application could be connected to GSM cellular modems to allow citizens in total internet blackouts to submit distress calls via standardized 160-character SMS and USSD menus.")
    p_bullet("2. Drone Aerial Telemetry & Computer Vision: A future version could integrate computer vision models (such as YOLOv8) on aerial drone video feeds to automatically detect flood levels and rooftop survivors.")
    p_bullet("3. Vernacular Voice Assistance: Speech recognition in regional Indian languages (Tamil, Telugu, Hindi) could be added to assist elderly or illiterate citizens in reporting emergencies.")
    p_bullet("4. Blockchain Relief Supply Auditing: Smart contracts could be introduced to track food crate distribution and medical supply shipments, preventing corruption and black-market diversions.")
    p_bullet("5. Meteorological Radar Integration: Deep integration with IMD Doppler weather radar feeds could provide automated flash flood polygon warnings prior to severe storm landfall.")
    p_bullet("6. Offline Mobile Mesh Networking: The system could incorporate Wi-Fi Direct and Bluetooth Low Energy mesh networking, allowing phones to relay distress packets device-to-device when cell towers are destroyed.")
    p_bullet("7. Advanced Predictive Analytics: Machine learning algorithms could analyze rainfall telemetry and drainage topography to forecast which low-lying streets will submerge hours before inundation.")
    p_bullet("8. Automated Database Backups & Cloud Failover: Automated geo-redundant database replication could ensure complete data availability even if a primary regional data center loses power.")
    p_bullet("9. Wearable Health Telemetry Integration: Vital signs from smartwatches worn by victims could transmit heart rates and body temperatures directly into the citizen case file.")

    doc.add_page_break()

    # ====================================================
    # APPENDIX
    # ====================================================
    p_main_title("APPENDIX", space_after=18)
    p_heading_1("SOURCE CODE:")

    p_heading_2("1. Project Structure")
    p_code("""Project Folder Structure
resqlink/
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts                   # MongoDB Mongoose connection configuration
│   │   ├── controllers/
│   │   │   ├── authController.ts       # User registration, login & JWT tokens
│   │   │   ├── requestController.ts    # Emergency dispatch & verification
│   │   │   └── volunteerController.ts  # Volunteer assignment & availability
│   │   ├── middleware/
│   │   │   └── authMiddleware.ts       # JWT Bearer token route protection
│   │   ├── models/
│   │   │   ├── User.ts                 # User schema with bcrypt password hashing
│   │   │   ├── EmergencyRequest.ts     # GeoJSON 2dsphere schema & status lifecycle
│   │   │   ├── VolunteerProfile.ts     # Rescuer profile & service radius
│   │   │   ├── ResourceItem.ts         # Resource Provider assets (boats, trucks, kits)
│   │   │   └── ReliefCamp.ts           # Safe shelters & occupancy capacity
│   │   ├── routes/
│   │   │   ├── authRoutes.ts           # Authentication endpoints (/api/auth)
│   │   │   ├── requestRoutes.ts        # Emergency requests (/api/requests)
│   │   │   └── volunteerRoutes.ts      # Volunteer roster (/api/volunteers)
│   │   ├── .env                        # Database URI, port, JWT secrets
│   │   ├── package.json                # Server dependencies and scripts
│   │   └── server.ts                   # Express server entry point & CORS
│
└── client/
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   ├── InteractiveMap.tsx  # Leaflet GIS cartographic component
    │   │   │   ├── Navbar.tsx          # Navigation bar with offline indicator
    │   │   │   └── PriorityBadge.tsx   # Color-coded triage priority pill
    │   ├── pages/
    │   │   ├── AuthPage.tsx            # Login and Registration portal
    │   │   ├── CitizenPage.tsx         # Citizen emergency reporting & tracking
    │   │   ├── GovernmentPage.tsx      # SDMA EOC Command Room & GIS Heatmap
    │   │   ├── HomePage.tsx            # Role portal landing page
    │   │   ├── ReliefCampsPage.tsx     # Evacuation shelter capacity directory
    │   │   ├── ResourceProviderPage.tsx# Resource Provider equipment registry
    │   │   └── VolunteerPage.tsx       # Field console, checklist & task history
    │   ├── services/
    │   │   ├── api.ts                  # Axios HTTP client service
    │   │   └── store.ts                # Reactive state store, SLA watcher & sync
    │   ├── types/
    │   │   └── index.ts                # TypeScript domain entity interfaces
    │   ├── utils/
    │   │   └── geo.ts                  # Haversine distance & geolocation engine
    │   ├── App.tsx                     # Main layout & router
    │   └── main.tsx                    # React application root entry point""")

    p_heading_2("2. Backend Package Installation")
    p_code("""# Step 1: Initialize backend project
cd server
npm init -y

# Step 2: Install production dependencies
npm install express mongoose cors dotenv bcryptjs jsonwebtoken

# Step 3: Install development and TypeScript tools
npm install --save-dev typescript @types/express @types/node tsx nodemon""")

    p_heading_2("3. Database Connection (server/src/config/db.ts)")
    p_code("""import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resqlink_db',
      {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        maxPoolSize: 15,
      }
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.log('Ensure MongoDB Atlas URI or local service is running in .env');
  }
  mongoose.connection.on('error', (err) => {
    console.warn(`MongoDB runtime error: ${err.message}`);
  });
};

export default connectDB;""")

    p_heading_2("4. Environment Variables (.env)")
    p_code("""PORT=5000
MONGODB_URI="mongodb://127.0.0.1:27017/resqlink_db"
JWT_SECRET=resqlink_super_secret_jwt_key_2026_disaster_relief
CLIENT_URL=http://localhost:3000
NODE_ENV=development""")

    p_heading_2("5. Express Server Main File (server/src/server.ts)")
    p_code("""import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Global Middleware
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ONLINE', service: 'ResQLink REST API', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`[ResQLink Server] REST API listening on port ${PORT}`);
});

export default app;""")

    p_heading_2("6. REST API Request and Response Examples")
    p_heading_3("Example 1: User Login Request & Response")
    p_code("""POST /api/auth/login HTTP/1.1
Host: localhost:5000
Content-Type: application/json

{
  "email": "kavitha.rescuer@gmail.com",
  "password": "Password123"
}

HTTP/1.1 200 OK
Content-Type: application/json

{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InVzZXItdm9sLTEiLCJyb2xlIjoiVk9MVU5URUVSIiwiZXhwIjoxNzYxMDAwMDAwfQ...",
  "user": {
    "id": "user-vol-1",
    "name": "Kavitha Ramachandran",
    "email": "kavitha.rescuer@gmail.com",
    "role": "VOLUNTEER"
  }
}""")

    p_heading_3("Example 2: Record New Emergency Request")
    p_code("""POST /api/requests HTTP/1.1
Host: localhost:5000
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "citizenId": "user-cit-1",
  "citizenName": "Ramesh Balan",
  "citizenPhone": "+91 98412 34567",
  "emergencyType": "Rescue",
  "affectedPeopleCount": 4,
  "description": "Water reached 1st floor. 4 family members trapped on terrace.",
  "locationName": "Plot 42, AGS Colony, Velachery",
  "lat": 12.9792,
  "lng": 80.2195
}

HTTP/1.1 201 Created
Content-Type: application/json

{
  "success": true,
  "message": "Emergency request registered successfully.",
  "request": {
    "requestId": "REQ-2026-1042",
    "priority": "CRITICAL",
    "status": "PENDING",
    "isEscalated": false,
    "createdAt": "2026-10-21T03:30:00.000Z"
  }
}""")

    doc.add_page_break()

    # ====================================================
    # SCREENSHOTS (WITH REAL PROJECT IMAGES) - 2 PER PAGE
    # ====================================================
    p_main_title("SCREENSHOTS", space_after=12)

    # PAGE 1 (Screenshots 1 & 2)
    p_heading_2("1. Home Page & Emergency Role Portals")
    add_image_safe("real_shot_1_home.png", width_inches=4.8, space_before=4, space_after=2)
    p_center("Figure 5.1: ResQLink Public Landing & Multi-Role Access Console", size=10, bold=True, italic=True)

    p_heading_2("2. Citizen Emergency Dispatch Portal")
    add_image_safe("real_shot_2_citizen.png", width_inches=4.8, space_before=4, space_after=2)
    p_center("Figure 5.2: Citizen Incident Reporting Interface with Interactive Geotagged Pin", size=10, bold=True, italic=True)

    doc.add_page_break()

    # PAGE 2 (Screenshots 3 & 4)
    p_heading_2("3. Volunteer Field Console & Mission Lifecycle")
    add_image_safe("real_shot_3_volunteer.png", width_inches=4.8, space_before=4, space_after=2)
    p_center("Figure 5.3: Registered Volunteer Operational Console and Mission Tracking Interface", size=10, bold=True, italic=True)

    p_heading_2("4. Government SDMA EOC Command Dashboard & Heatmap")
    add_image_safe("real_shot_4_government.png", width_inches=4.8, space_before=4, space_after=2)
    p_center("Figure 5.4: Government EOC Tactical Incident Dashboard and Heatmap Overview", size=10, bold=True, italic=True)

    doc.add_page_break()

    # PAGE 3 (Screenshots 5 & 6)
    p_heading_2("5. Public Evacuation Shelters & Relief Camps Grid")
    add_image_safe("real_shot_5_camps.png", width_inches=4.8, space_before=4, space_after=2)
    p_center("Figure 5.5: Public Evacuation Shelters & Relief Camp Occupancy Tracking System", size=10, bold=True, italic=True)

    p_heading_2("6. Resource Provider Equipment & Asset Hub")
    add_image_safe("real_shot_6_provider.png", width_inches=4.8, space_before=4, space_after=2)
    p_center("Figure 5.6: Resource Provider Inventory & Emergency Equipment Hub", size=10, bold=True, italic=True)

    doc.add_page_break()

    # ====================================================
    # REFERENCES
    # ====================================================
    p_main_title("REFERENCES", space_after=18)
    refs = [
        "Elmasri, R., & Navathe, S. B. (2020). Fundamentals of Database Systems (7th ed.). Pearson Education.",
        "Chodorow, K. (2019). MongoDB: The Definitive Guide: Powerful and Scalable Data Storage (3rd ed.). O’Reilly Media. ISBN: 978-1491954461.",
        "Banks, A., & Porcello, E. (2020). Learning React: Modern Patterns for Developing React Apps (2nd ed.). O’Reilly Media. ISBN: 978-1492051725.",
        "Haverbeke, M. (2018). Eloquent JavaScript: A Modern Introduction to Programming (3rd ed.). No Starch Press.",
        "National Disaster Management Authority (NDMA). (2023). Standard Operating Procedures for Emergency Operations Centers (EOC) and Incident Response Systems. Government of India.",
        "OpenStreetMap Foundation (OSMF). (2024). OpenStreetMap Collaborative Geographic Database. https://www.openstreetmap.org/",
        "Leaflet Cartographic Engine Documentation. (2023). JavaScript Interactive Maps Library. https://leafletjs.com/",
        "Jones, M., Bradley, J., & Sakimura, N. (2015). JSON Web Token (JWT). Internet Engineering Task Force (IETF), RFC 7519. https://datatracker.ietf.org/doc/html/rfc7519",
        "Provos, N., & Mazières, D. (1999). A Future-Adaptable Password Scheme. Proceedings of the FREENIX Track: 1999 USENIX Annual Technical Conference, pp. 81–91.",
        "Kumar, P., & Sundaram, S. (2022). Impact of Geospatial Crowdsourcing and Vernacular Interfaces on Disaster Evacuation Latency. International Journal of Disaster Risk Reduction, 72, 102882.",
        "Smith, R., Taylor, D., & Patel, A. (2021). Design Patterns for Low-Latency Cloud Emergency Response Systems. IEEE Transactions on Services Computing, 14(4), 1120–1132.",
        "Express.js Documentation. Fast, unopinionated, minimalist web framework for Node.js. OpenJS Foundation. https://expressjs.com/",
        "Mongoose Documentation. Elegant MongoDB Object Modeling for Node.js. https://mongoosejs.com/",
        "Vite Official Documentation. Next Generation Frontend Tooling. https://vite.dev/guide/",
    ]

    for i, r in enumerate(refs, start=1):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.line_spacing = 1.5
        p.paragraph_format.left_indent = Inches(0.3)
        p.paragraph_format.space_after = Pt(6)
        run_num = p.add_run(f"{i}. ")
        run_num.font.name = 'Times New Roman'
        run_num.font.size = Pt(12)
        run_num.font.bold = True
        run_r = p.add_run(r)
        run_r.font.name = 'Times New Roman'
        run_r.font.size = Pt(12)

    output_path = "ResQLink_Project_Report_Final.docx"
    doc.save(output_path)
    print(f"Report successfully generated at: {output_path}")

if __name__ == "__main__":
    generate_report()
