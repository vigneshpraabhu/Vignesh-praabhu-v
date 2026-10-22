from playwright.sync_api import sync_playwright
import time

def capture_real_pages():
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe', headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 850})
        page = context.new_page()

        print("1. Capturing Home Page...")
        page.goto('http://localhost:3000', wait_until='networkidle')
        page.wait_for_timeout(1000)
        page.screenshot(path='real_shot_1_home.png')

        print("2. Capturing Citizen Emergency Portal...")
        page.click("text=Report Emergency")
        page.wait_for_timeout(1500)
        page.screenshot(path='real_shot_2_citizen.png')

        print("3. Capturing Relief Camps Page...")
        page.click("text=Relief Camps")
        page.wait_for_timeout(1500)
        page.screenshot(path='real_shot_5_camps.png')

        print("4. Returning Home to switch to Volunteer...")
        page.click("text=Home")
        page.wait_for_timeout(800)
        page.click("text=Volunteer Console")
        page.wait_for_timeout(1500)
        page.screenshot(path='real_shot_3_volunteer.png')

        print("5. Returning Home to switch to Government EOC...")
        page.click("text=Home")
        page.wait_for_timeout(800)
        page.click("text=Open EOC Command →")
        page.wait_for_timeout(2000)
        page.screenshot(path='real_shot_4_government.png')

        print("6. Returning Home to switch to Logistics Provider...")
        page.click("text=Home")
        page.wait_for_timeout(800)
        page.click("text=Open Logistics Hub →")
        page.wait_for_timeout(1500)
        page.screenshot(path='real_shot_6_provider.png')

        browser.close()
        print("All real screenshots captured successfully!")

if __name__ == '__main__':
    capture_real_pages()
