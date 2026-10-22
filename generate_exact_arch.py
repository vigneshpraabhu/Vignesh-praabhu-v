from PIL import Image, ImageDraw, ImageFont

def generate_exact_architecture():
    w, h = 1380, 500
    im = Image.new('RGB', (w, h), (255, 255, 255))
    draw = ImageDraw.Draw(im)

    try:
        f_title = ImageFont.truetype("arialbd.ttf", 20)
        f_sub = ImageFont.truetype("arial.ttf", 13)
        f_body = ImageFont.truetype("arial.ttf", 13)
        f_arrow = ImageFont.truetype("arialbd.ttf", 12)
    except:
        f_title = f_sub = f_body = f_arrow = ImageFont.load_default()

    boxes = [
        {
            "title": "User",
            "sub": "Disaster Stakeholders",
            "color_border": (96, 165, 250),
            "color_header": (239, 246, 255),
            "items": [
                "• Register / Login",
                "• Report Emergency Needs",
                "• Pin GPS Coordinates",
                "• View Status & Rescuers",
                "• Locate Relief Shelters",
                "• Execute Field Operations"
            ]
        },
        {
            "title": "Frontend",
            "sub": "React.js",
            "color_border": (56, 189, 248),
            "color_header": (240, 249, 255),
            "items": [
                "• User Interface (Tailwind CSS)",
                "• Role Portals (Citizen, Vol, Gov)",
                "• Leaflet GIS Map Layer",
                "• Offline Local Queue Cache",
                "• Real-time State Store",
                "• Proximity Radius Sliders"
            ]
        },
        {
            "title": "Backend",
            "sub": "Node.js / Express.js",
            "color_border": (74, 222, 128),
            "color_header": (240, 253, 244),
            "items": [
                "• REST API Endpoints",
                "• JWT Bearer & RBAC Guards",
                "• Haversine Spatial Engine",
                "• SLA Escalation Watcher",
                "• Conflict-Free Dispatcher",
                "• Offline Sync Processor"
            ]
        },
        {
            "title": "Database",
            "sub": "MongoDB",
            "color_border": (192, 132, 252),
            "color_header": (250, 245, 255),
            "items": [
                "• User Credentials (Bcrypt)",
                "• Emergency Requests (2dsphere)",
                "• Volunteer Profiles & Radius",
                "• Relief Camp Capacities",
                "• Resource Provider Asset Reserves",
                "• Field Completion Reports"
            ]
        }
    ]

    box_w = 270
    box_h = 380
    gap = 90
    start_x = 30
    start_y = 50

    for i, b in enumerate(boxes):
        x0 = start_x + i * (box_w + gap)
        y0 = start_y
        x1 = x0 + box_w
        y1 = y0 + box_h

        # Main box
        draw.rounded_rectangle([x0, y0, x1, y1], radius=16, fill=(255, 255, 255), outline=b["color_border"], width=3)
        # Header background
        header_h = 80
        draw.rounded_rectangle([x0 + 3, y0 + 3, x1 - 3, y0 + header_h], radius=14, fill=b["color_header"])

        # Center Title
        t_box = f_title.getbbox(b["title"])
        t_w = t_box[2] - t_box[0]
        t_x = x0 + (box_w - t_w) // 2
        draw.text((t_x, y0 + 16), b["title"], fill=(15, 23, 42), font=f_title)

        # Center Subtitle
        s_box = f_sub.getbbox(b["sub"])
        s_w = s_box[2] - s_box[0]
        s_x = x0 + (box_w - s_w) // 2
        draw.text((s_x, y0 + 46), b["sub"], fill=(71, 85, 105), font=f_sub)

        # Divider line
        draw.line([(x0, y0 + header_h), (x1, y0 + header_h)], fill=b["color_border"], width=2)

        # Bullets
        cur_y = y0 + 105
        for item in b["items"]:
            draw.text((x0 + 18, cur_y), item, fill=(30, 41, 59), font=f_body)
            cur_y += 42

        # Draw Arrows between boxes
        if i < 3:
            mid_y = y0 + (box_h // 2)
            arrow_x0 = x1 + 10
            arrow_x1 = x1 + gap - 10

            if i == 0:
                # Single bidirectional arrow: Interacts with Application
                draw.line([(arrow_x0, mid_y), (arrow_x1, mid_y)], fill=(100, 116, 139), width=2)
                # left head
                draw.polygon([(arrow_x0, mid_y), (arrow_x0 + 8, mid_y - 5), (arrow_x0 + 8, mid_y + 5)], fill=(100, 116, 139))
                # right head
                draw.polygon([(arrow_x1, mid_y), (arrow_x1 - 8, mid_y - 5), (arrow_x1 - 8, mid_y + 5)], fill=(100, 116, 139))
                draw.text((arrow_x0 + 5, mid_y - 32), "Interacts with", fill=(51, 65, 85), font=f_arrow)
                draw.text((arrow_x0 + 10, mid_y - 18), "Application", fill=(51, 65, 85), font=f_arrow)

            elif i == 1:
                # Top arrow: HTTP Request ->
                # Bottom arrow: <- JSON Response
                y_top_arr = mid_y - 20
                y_bot_arr = mid_y + 20
                # Top
                draw.line([(arrow_x0, y_top_arr), (arrow_x1, y_top_arr)], fill=(100, 116, 139), width=2)
                draw.polygon([(arrow_x1, y_top_arr), (arrow_x1 - 8, y_top_arr - 5), (arrow_x1 - 8, y_top_arr + 5)], fill=(100, 116, 139))
                draw.text((arrow_x0 + 2, y_top_arr - 16), "HTTP Request", fill=(51, 65, 85), font=f_arrow)

                # Bottom
                draw.line([(arrow_x0, y_bot_arr), (arrow_x1, y_bot_arr)], fill=(100, 116, 139), width=2)
                draw.polygon([(arrow_x0, y_bot_arr), (arrow_x0 + 8, y_bot_arr - 5), (arrow_x0 + 8, y_bot_arr + 5)], fill=(100, 116, 139))
                draw.text((arrow_x0 + 1, y_bot_arr + 6), "JSON Response", fill=(51, 65, 85), font=f_arrow)

            elif i == 2:
                # Top arrow: Read / Write Data ->
                # Bottom arrow: <- Data Response
                y_top_arr = mid_y - 20
                y_bot_arr = mid_y + 20
                # Top
                draw.line([(arrow_x0, y_top_arr), (arrow_x1, y_top_arr)], fill=(100, 116, 139), width=2)
                draw.polygon([(arrow_x1, y_top_arr), (arrow_x1 - 8, y_top_arr - 5), (arrow_x1 - 8, y_top_arr + 5)], fill=(100, 116, 139))
                draw.text((arrow_x0 - 2, y_top_arr - 16), "Read / Write", fill=(51, 65, 85), font=f_arrow)

                # Bottom
                draw.line([(arrow_x0, y_bot_arr), (arrow_x1, y_bot_arr)], fill=(100, 116, 139), width=2)
                draw.polygon([(arrow_x0, y_bot_arr), (arrow_x0 + 8, y_bot_arr - 5), (arrow_x0 + 8, y_bot_arr + 5)], fill=(100, 116, 139))
                draw.text((arrow_x0 - 1, y_bot_arr + 6), "Data Response", fill=(51, 65, 85), font=f_arrow)

    im.save("fig_4_1_resqlink_architecture.png")
    print("Generated fig_4_1_resqlink_architecture.png successfully with perfectly centered titles!")

if __name__ == "__main__":
    generate_exact_architecture()
