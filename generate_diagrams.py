from PIL import Image, ImageDraw, ImageFont
import os

def create_resqlink_architecture():
    width, height = 1400, 520
    im = Image.new('RGB', (width, height), (255, 255, 255))
    draw = ImageDraw.Draw(im)

    try:
        font_title = ImageFont.truetype("arialbd.ttf", 22)
        font_header = ImageFont.truetype("arialbd.ttf", 18)
        font_body = ImageFont.truetype("arial.ttf", 15)
        font_note = ImageFont.truetype("arialbd.ttf", 13)
    except:
        font_title = font_header = font_body = font_note = ImageFont.load_default()

    # 4 Columns
    cols = [
        {"title": "Disaster Stakeholders", "sub": "Citizen / Volunteer / EOC", "color": (235, 245, 255), "border": (59, 130, 246),
         "items": ["• Citizen (Pins GPS & Need)", "• Rescue Volunteer Unit", "• Government EOC Commander", "• Logistics Asset Manager"]},
        {"title": "React.js Frontend", "sub": "Presentation & GIS Layer", "color": (236, 253, 245), "border": (16, 185, 129),
         "items": ["• Responsive UI (Tailwind)", "• Leaflet GIS Map Layers", "• Offline Local Cache", "• State Store & Web Subscriptions"]},
        {"title": "Express.js Backend", "sub": "Node.js REST Services", "color": (254, 243, 199), "border": (245, 158, 11),
         "items": ["• JWT & Role Route Guards", "• Spatial Haversine Distance", "• SLA Escalation Watcher", "• Conflict-Free Dispatcher"]},
        {"title": "MongoDB Database", "sub": "Document & Spatial Engine", "color": (245, 243, 255), "border": (139, 92, 246),
         "items": ["• Users (Bcrypt Hashed)", "• Requests (2dsphere Index)", "• Volunteer Profiles & Radius", "• Camps & Logistics Reserves"]}
    ]

    col_w = 280
    gap = 60
    start_x = 40
    y_top = 60
    y_bot = 460

    for i, col in enumerate(cols):
        x0 = start_x + i * (col_w + gap)
        x1 = x0 + col_w
        # Draw box
        draw.rounded_rectangle([x0, y_top, x1, y_bot], radius=16, fill=col["color"], outline=col["border"], width=3)
        # Header box
        draw.rounded_rectangle([x0, y_top, x1, y_top + 70], radius=16, fill=col["border"])
        draw.text((x0 + 15, y_top + 14), col["title"], fill=(255, 255, 255), font=font_header)
        draw.text((x0 + 15, y_top + 42), col["sub"], fill=(240, 240, 240), font=font_note)

        # Items
        curr_y = y_top + 95
        for item in col["items"]:
            draw.text((x0 + 18, curr_y), item, fill=(30, 41, 59), font=font_body)
            curr_y += 50

        # Draw arrows between boxes
        if i < 3:
            arrow_x0 = x1 + 10
            arrow_x1 = x1 + gap - 10
            mid_y = (y_top + y_bot) // 2
            draw.line([(arrow_x0, mid_y), (arrow_x1, mid_y)], fill=(100, 116, 139), width=3)
            # Arrow head
            draw.polygon([(arrow_x1, mid_y), (arrow_x1 - 10, mid_y - 6), (arrow_x1 - 10, mid_y + 6)], fill=(100, 116, 139))
            
            # Label
            labels = ["HTTP / Actions", "REST API / JSON", "Mongoose ODM / TCP"]
            draw.text((arrow_x0 - 2, mid_y - 24), labels[i], fill=(71, 85, 105), font=font_note)

    im.save("fig_4_1_architecture.png")
    print("Generated fig_4_1_architecture.png")

def create_resqlink_class_diagram():
    width, height = 1100, 600
    im = Image.new('RGB', (width, height), (255, 255, 255))
    draw = ImageDraw.Draw(im)

    try:
        font_h = ImageFont.truetype("arialbd.ttf", 16)
        font_b = ImageFont.truetype("arial.ttf", 13)
        font_sub = ImageFont.truetype("ariali.ttf", 12)
    except:
        font_h = font_b = font_sub = ImageFont.load_default()

    boxes = [
        {"x": 40, "y": 40, "w": 280, "h": 220, "title": "User", "color": (59, 130, 246),
         "attrs": ["+ id: ObjectId", "+ name: String", "+ email: String", "+ phone: String", "+ role: RoleEnum", "+ passwordHash: String"],
         "methods": ["+ matchPassword()", "+ generateToken()"]},
        {"x": 380, "y": 40, "w": 340, "h": 260, "title": "EmergencyRequest", "color": (239, 68, 68),
         "attrs": ["+ requestId: String [Indexed]", "+ citizenId: String", "+ emergencyType: Enum", "+ location: Point [2dsphere]", "+ priority: PriorityEnum", "+ status: StatusEnum", "+ isEscalated: Boolean", "+ assignedVolunteerId: String"],
         "methods": ["+ verifyRequest()", "+ overridePriority()", "+ submitCompletion()"]},
        {"x": 780, "y": 40, "w": 280, "h": 220, "title": "VolunteerProfile", "color": (16, 185, 129),
         "attrs": ["+ id: ObjectId", "+ userId: String", "+ serviceArea: String", "+ serviceRadiusKm: Number", "+ availability: Enum", "+ activeOperationId: String", "+ completedTasksCount: Number"],
         "methods": ["+ setAvailability()", "+ acceptAssignment()"]},
        {"x": 160, "y": 330, "w": 320, "h": 210, "title": "ReliefCamp", "color": (245, 158, 11),
         "attrs": ["+ id: ObjectId", "+ name: String", "+ address: String", "+ totalCapacity: Number", "+ currentOccupancy: Number", "+ availableSpaces: Number", "+ foodAvailability: Boolean"],
         "methods": ["+ updateOccupancy()", "+ calculateFreeSpaces()"]},
        {"x": 580, "y": 330, "w": 320, "h": 210, "title": "ResourceItem", "color": (139, 92, 246),
         "attrs": ["+ resourceId: String", "+ providerId: String", "+ category: Enum", "+ totalQuantity: Number", "+ availableQuantity: Number", "+ status: ResourceStatusEnum"],
         "methods": ["+ mobilize()", "+ release()"]}
    ]

    for b in boxes:
        draw.rounded_rectangle([b["x"], b["y"], b["x"] + b["w"], b["y"] + b["h"]], radius=10, fill=(250, 250, 252), outline=b["color"], width=2)
        draw.rounded_rectangle([b["x"], b["y"], b["x"] + b["w"], b["y"] + 36], radius=10, fill=b["color"])
        draw.text((b["x"] + 12, b["y"] + 8), b["title"], fill=(255, 255, 255), font=font_h)

        cy = b["y"] + 46
        for attr in b["attrs"]:
            draw.text((b["x"] + 12, cy), attr, fill=(30, 41, 59), font=font_b)
            cy += 20
        draw.line([(b["x"], cy + 4), (b["x"] + b["w"], cy + 4)], fill=b["color"], width=1)
        cy += 10
        for m in b["methods"]:
            draw.text((b["x"] + 12, cy), m, fill=(71, 85, 105), font=font_sub)
            cy += 20

    # Draw connection lines between models
    draw.line([(320, 110), (380, 110)], fill=(71, 85, 105), width=2)
    draw.text((330, 90), "1 : N", fill=(71, 85, 105), font=font_sub)

    draw.line([(720, 110), (780, 110)], fill=(71, 85, 105), width=2)
    draw.text((735, 90), "1 : 1", fill=(71, 85, 105), font=font_sub)

    im.save("fig_4_4_class_diagram.png")
    print("Generated fig_4_4_class_diagram.png")

def create_resqlink_sequence_diagram():
    width, height = 1200, 750
    im = Image.new('RGB', (width, height), (255, 255, 255))
    draw = ImageDraw.Draw(im)

    try:
        font_h = ImageFont.truetype("arialbd.ttf", 15)
        font_b = ImageFont.truetype("arial.ttf", 13)
        font_step = ImageFont.truetype("arialbd.ttf", 12)
    except:
        font_h = font_b = font_step = ImageFont.load_default()

    actors = [
        {"name": "Citizen (Caller)", "x": 100},
        {"name": "React Client", "x": 320},
        {"name": "Express Backend", "x": 560},
        {"name": "MongoDB (Geo)", "x": 800},
        {"name": "Volunteer Rescuer", "x": 1040}
    ]

    for act in actors:
        # Header box
        draw.rounded_rectangle([act["x"] - 75, 30, act["x"] + 75, 75], radius=8, fill=(241, 245, 249), outline=(71, 85, 105), width=2)
        draw.text((act["x"] - 65, 45), act["name"], fill=(15, 23, 42), font=font_h)
        # Lifeline
        draw.line([(act["x"], 75), (act["x"], 700)], fill=(203, 213, 225), width=2)

    steps = [
        (0, 1, "1. Pin GPS coordinates & submit distress call", 110),
        (1, 2, "2. POST /api/requests (payload + idempotency key)", 160),
        (2, 3, "3. Query spatial 2dsphere & save document", 210),
        (3, 2, "4. Return saved EmergencyRequest (REQ-2026-1042)", 260),
        (2, 1, "5. HTTP 201 Created + live tracking ref", 310),
        (2, 4, "6. Dispatch notification (in-radius volunteer)", 360),
        (4, 2, "7. Accept mission (PUT /api/requests/:id/assign)", 420),
        (2, 3, "8. Lock volunteer availability: BUSY", 470),
        (4, 2, "9. Submit periodic field notes & blocker report", 530),
        (4, 2, "10. Submit completion report (rescued=4, casualties=0)", 590),
        (2, 3, "11. Mark status: CLOSED; archive Task History", 640),
    ]

    for from_idx, to_idx, text, y in steps:
        x0 = actors[from_idx]["x"]
        x1 = actors[to_idx]["x"]
        is_reply = to_idx < from_idx
        color = (37, 99, 235) if not is_reply else (16, 185, 129)
        draw.line([(x0, y), (x1, y)], fill=color, width=2)
        # arrow head
        if x1 > x0:
            draw.polygon([(x1, y), (x1 - 8, y - 5), (x1 - 8, y + 5)], fill=color)
        else:
            draw.polygon([(x1, y), (x1 + 8, y - 5), (x1 + 8, y + 5)], fill=color)
        # text
        mid_x = (x0 + x1) // 2
        draw.text((mid_x - len(text)*3.2, y - 18), text, fill=(15, 23, 42), font=font_step)

    im.save("fig_4_5_sequence_diagram.png")
    print("Generated fig_4_5_sequence_diagram.png")

if __name__ == "__main__":
    create_resqlink_architecture()
    create_resqlink_class_diagram()
    create_resqlink_sequence_diagram()
