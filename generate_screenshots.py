from PIL import Image, ImageDraw, ImageFont
import os

def create_browser_window(title_url, content_draw_fn, filename, width=1200, height=750):
    im = Image.new('RGB', (width, height), (248, 250, 252))
    draw = ImageDraw.Draw(im)

    # Browser chrome top bar
    draw.rectangle([0, 0, width, 40], fill=(241, 245, 249))
    draw.line([(0, 40), (width, 40)], fill=(203, 213, 225), width=1)
    # 3 dots
    draw.ellipse([14, 14, 26, 26], fill=(239, 68, 68))
    draw.ellipse([34, 14, 46, 26], fill=(245, 158, 11))
    draw.ellipse([54, 14, 66, 26], fill=(16, 185, 129))

    # Address bar
    draw.rounded_rectangle([90, 8, width - 80, 32], radius=6, fill=(255, 255, 255), outline=(203, 213, 225))
    try:
        font_url = ImageFont.truetype("arial.ttf", 12)
        font_b = ImageFont.truetype("arialbd.ttf", 14)
        font_h = ImageFont.truetype("arialbd.ttf", 18)
        font_sm = ImageFont.truetype("arial.ttf", 11)
        font_mono = ImageFont.truetype("courbd.ttf", 12)
    except:
        font_url = font_b = font_h = font_sm = font_mono = ImageFont.load_default()

    draw.text((105, 12), title_url, fill=(71, 85, 105), font=font_url)

    # ResQLink top navbar
    draw.rectangle([0, 41, width, 95], fill=(15, 23, 42))
    draw.rounded_rectangle([25, 52, 60, 85], radius=6, fill=(220, 38, 38))
    draw.text((33, 56), "RQ", fill=(255, 255, 255), font=font_b)
    draw.text((70, 53), "ResQLink", fill=(255, 255, 255), font=font_h)
    draw.text((70, 74), "Emergency Relief Network", fill=(148, 163, 184), font=font_sm)

    # Nav links
    navs = ["Home", "Need Help", "Volunteer", "Relief Camps", "EOC Command"]
    nx = 380
    for n in navs:
        draw.text((nx, 63), n, fill=(226, 232, 240), font=font_b)
        nx += 120

    # Right pills: Online & Role
    draw.rounded_rectangle([width - 240, 55, width - 150, 82], radius=6, fill=(6, 78, 59))
    draw.text((width - 225, 62), "• Online", fill=(52, 211, 153), font=font_b)
    draw.rounded_rectangle([width - 135, 55, width - 25, 82], radius=6, fill=(30, 41, 59), outline=(71, 85, 105))
    draw.text((width - 120, 62), "User Role ▼", fill=(241, 245, 249), font=font_sm)

    # Execute specific page content
    content_draw_fn(draw, width, height, font_h, font_b, font_sm, font_mono)

    im.save(filename)
    print(f"Generated screenshot: {filename}")

def draw_citizen_page(draw, w, h, fh, fb, fs, fm):
    # Header card
    draw.rounded_rectangle([30, 115, w - 30, 180], radius=10, fill=(255, 255, 255), outline=(226, 232, 240))
    draw.text((50, 128), "CITIZEN EMERGENCY DISPATCH PORTAL", fill=(220, 38, 38), font=fb)
    draw.text((50, 150), "Report Life-Threatening Entrapment, Medical Distress, or Food Shortage", fill=(15, 23, 42), font=fh)

    # Form Left
    draw.rounded_rectangle([30, 195, 680, h - 30], radius=12, fill=(255, 255, 255), outline=(203, 213, 225))
    draw.text((50, 215), "1. Emergency Category", fill=(30, 41, 59), font=fb)
    cats = ["🚤 Rescue", "🚑 Medical", "🍲 Food", "💧 Water", "⛺ Shelter"]
    cx = 50
    for c in cats:
        draw.rounded_rectangle([cx, 240, cx + 115, 280], radius=8, fill=(254, 242, 242) if "Rescue" in c else (241, 245, 249), outline=(239, 68, 68) if "Rescue" in c else (203, 213, 225))
        draw.text((cx + 15, 252), c, fill=(220, 38, 38) if "Rescue" in c else (51, 65, 85), font=fb)
        cx += 125

    draw.text((50, 305), "2. Number of Affected / Trapped Persons:  4", fill=(30, 41, 59), font=fb)
    draw.rounded_rectangle([50, 330, 320, 365], radius=6, fill=(248, 250, 252), outline=(203, 213, 225))
    draw.text((65, 340), "4 Persons Trapped", fill=(15, 23, 42), font=fs)

    draw.text((360, 305), "Callback Phone:  +91 98412 34567", fill=(30, 41, 59), font=fb)
    draw.rounded_rectangle([360, 330, 650, 365], radius=6, fill=(248, 250, 252), outline=(203, 213, 225))
    draw.text((375, 340), "+91 98412 34567 (Direct line)", fill=(15, 23, 42), font=fs)

    draw.text((50, 390), "3. Situation Description & Hazards", fill=(30, 41, 59), font=fb)
    draw.rounded_rectangle([50, 415, 650, 485], radius=6, fill=(248, 250, 252), outline=(203, 213, 225))
    draw.text((65, 428), "Flood water reached 1st floor level. 4 family members including an 84-year-old", fill=(51, 65, 85), font=fs)
    draw.text((65, 450), "patient needing oxygen are stranded on terrace. Inflatable motorboat required.", fill=(51, 65, 85), font=fs)

    draw.text((50, 510), "4. Address / Landmark", fill=(30, 41, 59), font=fb)
    draw.rounded_rectangle([50, 535, 650, 570], radius=6, fill=(248, 250, 252), outline=(203, 213, 225))
    draw.text((65, 545), "Plot 42, AGS Colony 3rd Cross, Velachery, Chennai (Near Lake)", fill=(15, 23, 42), font=fs)

    draw.rounded_rectangle([50, 600, 650, 660], radius=10, fill=(220, 38, 38))
    draw.text((200, 622), "TRANSMIT EMERGENCY RESCUE REQUEST", fill=(255, 255, 255), font=fb)

    # Right Map simulation
    draw.rounded_rectangle([710, 195, w - 30, h - 30], radius=12, fill=(226, 232, 240), outline=(203, 213, 225))
    draw.text((730, 215), "Interactive GIS Location Dropper", fill=(15, 23, 42), font=fb)
    draw.rounded_rectangle([730, 245, w - 50, h - 50], radius=8, fill=(186, 230, 253), outline=(56, 189, 248))
    # Draw roads on map
    draw.line([(730, 350), (w - 50, 420)], fill=(255, 255, 255), width=6)
    draw.line([(850, 245), (880, h - 50)], fill=(255, 255, 255), width=6)
    draw.line([(730, 520), (w - 50, 510)], fill=(255, 255, 255), width=4)
    # Red Pin
    draw.ellipse([920, 370, 950, 400], fill=(220, 38, 38), outline=(255, 255, 255), width=2)
    draw.text((930, 378), "📍", fill=(255, 255, 255), font=fb)
    draw.rounded_rectangle([860, 410, 1020, 445], radius=6, fill=(15, 23, 42))
    draw.text((875, 420), "Lat: 12.9792, Lng: 80.2195", fill=(255, 255, 255), font=fm)

def draw_volunteer_page(draw, w, h, fh, fb, fs, fm):
    # Sidebar Left
    draw.rectangle([0, 95, 260, h], fill=(15, 23, 42))
    draw.text((25, 120), "VOLUNTEER CONSOLE", fill=(52, 211, 153), font=fb)
    draw.text((25, 145), "Kavitha Ramachandran", fill=(255, 255, 255), font=fh)
    draw.text((25, 175), "Status: READY (AVAILABLE)", fill=(110, 231, 183), font=fb)
    draw.text((25, 205), "Service Radius: 15 km", fill=(148, 163, 184), font=fs)

    v_navs = ["1. Field Overview", "2. Available Calls (4)", "3. Active Operation (1)", "4. Task History (12)", "5. Request Manpower", "6. Request Supplies"]
    vy = 260
    for vn in v_navs:
        bg = (30, 58, 138) if "Active" in vn else (15, 23, 42)
        draw.rounded_rectangle([15, vy - 5, 245, vy + 30], radius=6, fill=bg)
        draw.text((25, vy + 4), vn, fill=(255, 255, 255), font=fb)
        vy += 45

    # Main Area
    draw.rounded_rectangle([280, 115, w - 30, 200], radius=10, fill=(255, 255, 255), outline=(226, 232, 240))
    draw.text((305, 130), "ACTIVE RESCUE MISSION: OP-1042", fill=(220, 38, 38), font=fh)
    draw.text((305, 165), "Target: Plot 42, AGS Colony, Velachery (4 Trapped) • High Priority Water Rescue", fill=(51, 65, 85), font=fb)

    # Mission checklist
    draw.rounded_rectangle([280, 220, w - 30, 480], radius=10, fill=(255, 255, 255), outline=(203, 213, 225))
    draw.text((305, 240), "Operational Timeline & Blocker Updates", fill=(15, 23, 42), font=fh)
    timeline = [
        ("08:15 AM", "Assignment Accepted & Mobilized (Motorboat Squad A-2)"),
        ("08:35 AM", "Arrived at Staging Perimeter (Velachery Main Road). Water depth 4.5ft."),
        ("08:42 AM", "Encountered heavy downed power cable. Alerted EOC command room."),
        ("08:50 AM", "Reached residence. Initiating rooftop victim transfer into rescue boat.")
    ]
    ty = 280
    for t, desc in timeline:
        draw.text((305, ty), t, fill=(37, 99, 235), font=fm)
        draw.text((400, ty), desc, fill=(15, 23, 42), font=fs)
        ty += 40

    # Action Buttons
    draw.rounded_rectangle([305, 520, 520, 570], radius=8, fill=(245, 158, 11))
    draw.text((335, 538), "Request Squad Manpower", fill=(255, 255, 255), font=fb)

    draw.rounded_rectangle([540, 520, 750, 570], radius=8, fill=(139, 92, 246))
    draw.text((570, 538), "Request Emergency Supplies", fill=(255, 255, 255), font=fb)

    draw.rounded_rectangle([770, 520, 1020, 570], radius=8, fill=(16, 185, 129))
    draw.text((800, 538), "Submit Mission Completion Report", fill=(255, 255, 255), font=fb)

def draw_government_page(draw, w, h, fh, fb, fs, fm):
    draw.rounded_rectangle([30, 115, w - 30, 175], radius=10, fill=(255, 255, 255), outline=(226, 232, 240))
    draw.text((50, 128), "STATE DISASTER MANAGEMENT AUTHORITY (SDMA)", fill=(37, 99, 235), font=fb)
    draw.text((50, 148), "Central Emergency Operations Center (EOC) Command Dashboard", fill=(15, 23, 42), font=fh)

    # 5 KPI Cards
    kpis = [
        ("Total Incidents", "248", (241, 245, 249), (51, 65, 85)),
        ("Pending Triage", "14", (254, 243, 199), (180, 83, 9)),
        ("Critical Priority", "9", (254, 242, 242), (220, 38, 38)),
        ("Active Operations", "22", (236, 253, 245), (5, 150, 105)),
        ("Safe Shelters Open", "18", (238, 242, 255), (79, 70, 229))
    ]
    kx = 30
    kw = (w - 60 - 40) // 5
    for title, val, bg, col in kpis:
        draw.rounded_rectangle([kx, 190, kx + kw, 270], radius=8, fill=bg, outline=(203, 213, 225))
        draw.text((kx + 15, 205), title, fill=(100, 116, 139), font=fs)
        draw.text((kx + 15, 225), val, fill=col, font=fh)
        kx += kw + 10

    # Left: GIS Map simulation
    draw.rounded_rectangle([30, 285, 750, h - 30], radius=10, fill=(186, 230, 253), outline=(56, 189, 248))
    draw.text((45, 300), "Live GIS Spatial Incident Heatmap (Chennai Coastal Belts)", fill=(15, 23, 42), font=fb)
    # Clusters
    draw.ellipse([200, 420, 280, 500], fill=(239, 68, 68, 180), outline=(220, 38, 38))
    draw.text((225, 450), "12 Calls", fill=(255, 255, 255), font=fb)
    draw.ellipse([450, 490, 520, 560], fill=(245, 158, 11, 180), outline=(217, 119, 6))
    draw.text((465, 518), "6 Calls", fill=(255, 255, 255), font=fb)
    draw.ellipse([350, 360, 410, 420], fill=(16, 185, 129, 180), outline=(5, 150, 105))
    draw.text((362, 382), "Boat 4", fill=(255, 255, 255), font=fb)

    # Right: Triage table
    draw.rounded_rectangle([770, 285, w - 30, h - 30], radius=10, fill=(255, 255, 255), outline=(203, 213, 225))
    draw.text((790, 300), "Immediate Priority Triage Queue", fill=(15, 23, 42), font=fb)
    triage_items = [
        ("REQ-1042", "Velachery", "Rescue (4 pax)", "CRITICAL"),
        ("REQ-1043", "Madipakkam", "Medical (Elderly)", "CRITICAL"),
        ("REQ-1044", "Adyar Basin", "Food/Water (12 pax)", "HIGH"),
        ("REQ-1045", "Perumbakkam", "Rescue (2 pax)", "HIGH"),
        ("REQ-1046", "Tambaram", "Shelter Transfer", "MEDIUM")
    ]
    ty = 340
    for req, loc, typ, prio in triage_items:
        draw.rounded_rectangle([790, ty, w - 50, ty + 50], radius=6, fill=(248, 250, 252), outline=(226, 232, 240))
        draw.text((805, ty + 10), req, fill=(37, 99, 235), font=fm)
        draw.text((805, ty + 28), loc + " • " + typ, fill=(71, 85, 105), font=fs)
        draw.rounded_rectangle([w - 140, ty + 14, w - 65, ty + 36], radius=4, fill=(254, 242, 242) if "CRIT" in prio else (254, 243, 199))
        draw.text((w - 130, ty + 18), prio, fill=(220, 38, 38) if "CRIT" in prio else (180, 83, 9), font=fm)
        ty += 60

def draw_camps_page(draw, w, h, fh, fb, fs, fm):
    draw.rounded_rectangle([30, 115, w - 30, 175], radius=10, fill=(255, 255, 255), outline=(226, 232, 240))
    draw.text((50, 128), "PUBLIC EVACUATION SHELTERS & SAFE HOUSES", fill=(5, 150, 105), font=fb)
    draw.text((50, 148), "Live Camp Occupancy Tracking, Food Distribution & Medical Outposts", fill=(15, 23, 42), font=fh)

    # 4 Camp Cards in Grid
    camps = [
        {"name": "Velachery Higher Secondary Relief Camp", "addr": "Gandhi Road, Velachery Central", "cap": 500, "occ": 310, "free": 190, "stat": "OPERATIONAL", "food": True, "med": True},
        {"name": "Adyar Community Hall Evacuation Hub", "addr": "Kasturba Nagar 3rd Cross, Adyar", "cap": 350, "occ": 320, "free": 30, "stat": "NEAR_CAPACITY", "food": True, "med": True},
        {"name": "Tambaram Sanatorium Relief Center", "addr": "GST Road, Tambaram East", "cap": 800, "occ": 420, "free": 380, "stat": "OPERATIONAL", "food": True, "med": True},
        {"name": "Madipakkam Corporation Marriage Hall", "addr": "Bazaar Main Road, Madipakkam", "cap": 400, "occ": 400, "free": 0, "stat": "FULL", "food": False, "med": True}
    ]

    coords = [
        (30, 195, 590, 420),
        (610, 195, w - 30, 420),
        (30, 440, 590, 665),
        (610, 440, w - 30, 665)
    ]

    for (x0, y0, x1, y1), c in zip(coords, camps):
        draw.rounded_rectangle([x0, y0, x1, y1], radius=10, fill=(255, 255, 255), outline=(203, 213, 225))
        # Status pill
        pill_col = (239, 68, 68) if c["stat"] == "FULL" else (245, 158, 11) if c["stat"] == "NEAR_CAPACITY" else (16, 185, 129)
        draw.rounded_rectangle([x1 - 130, y0 + 15, x1 - 20, y0 + 38], radius=6, fill=pill_col)
        draw.text((x1 - 120, y0 + 20), c["stat"], fill=(255, 255, 255), font=fs)

        draw.text((x0 + 20, y0 + 18), c["name"], fill=(15, 23, 42), font=fb)
        draw.text((x0 + 20, y0 + 44), "📍 " + c["addr"], fill=(100, 116, 139), font=fs)

        # Capacity bar
        draw.text((x0 + 20, y0 + 80), f"Capacity: {c['cap']} | Occupied: {c['occ']}", fill=(51, 65, 85), font=fs)
        draw.text((x1 - 160, y0 + 80), f"{c['free']} Spaces Free", fill=(5, 150, 105), font=fb)
        draw.rounded_rectangle([x0 + 20, y0 + 105, x1 - 20, y0 + 120], radius=4, fill=(226, 232, 240))
        fill_w = int((x1 - x0 - 40) * (c['occ'] / c['cap']))
        draw.rounded_rectangle([x0 + 20, y0 + 105, x0 + 20 + fill_w, y0 + 120], radius=4, fill=(37, 99, 235))

        # Amenities
        draw.text((x0 + 20, y0 + 140), "🍲 Hot Meals: YES   💧 Clean Water: YES   🩺 First Aid Clinic: YES", fill=(30, 41, 59), font=fs)
        draw.text((x0 + 20, y0 + 175), "Nodal Officer: Inspector S. Anbarasu (📞 +91 94444 88990)", fill=(37, 99, 235), font=fs)

if __name__ == "__main__":
    create_browser_window("http://localhost:3000/citizen", draw_citizen_page, "screenshot_1_citizen.png")
    create_browser_window("http://localhost:3000/volunteer", draw_volunteer_page, "screenshot_2_volunteer.png")
    create_browser_window("http://localhost:3000/government", draw_government_page, "screenshot_3_government.png")
    create_browser_window("http://localhost:3000/camps", draw_camps_page, "screenshot_4_camps.png")
