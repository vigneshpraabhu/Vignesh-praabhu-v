from playwright.sync_api import sync_playwright
import time

def capture_real_dashboards():
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe', headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 850})
        page = context.new_page()

        # 1. Home Page
        print("Capturing 1. Home Page...")
        page.goto('http://localhost:3000', wait_until='networkidle')
        page.wait_for_timeout(1000)
        page.screenshot(path='real_shot_1_home.png')

        # 2. Citizen Page
        print("Capturing 2. Citizen Dashboard...")
        demo_buttons = page.locator("text=1-Click Demo Access")
        demo_buttons.nth(0).click()
        page.wait_for_timeout(1500)
        page.screenshot(path='real_shot_2_citizen.png')

        # 3. Volunteer Page
        print("Capturing 3. Volunteer Console...")
        page.click("text=Home")
        page.wait_for_timeout(800)
        demo_buttons = page.locator("text=1-Click Demo Access")
        demo_buttons.nth(1).click()
        page.wait_for_timeout(1500)
        page.screenshot(path='real_shot_3_volunteer.png')

        # 4. Government EOC Page
        print("Capturing 4. Government EOC...")
        page.click("text=Home")
        page.wait_for_timeout(800)
        demo_buttons = page.locator("text=1-Click Demo Access")
        demo_buttons.nth(2).click()
        page.wait_for_timeout(2000)
        page.screenshot(path='real_shot_4_government.png')

        # 5. Relief Camps Page
        print("Capturing 5. Relief Camps...")
        page.click("text=Relief Camps")
        page.wait_for_timeout(1500)
        page.screenshot(path='real_shot_5_camps.png')

        # 6. Logistics Provider Page
        print("Capturing 6. Logistics Provider...")
        page.click("text=Home")
        page.wait_for_timeout(800)
        demo_buttons = page.locator("text=1-Click Demo Access")
        demo_buttons.nth(3).click()
        page.wait_for_timeout(1500)
        page.screenshot(path='real_shot_6_provider.png')

        browser.close()
        print("SUCCESS! Captured all 6 real project dashboards!")

if __name__ == '__main__':
    capture_real_dashboards()
