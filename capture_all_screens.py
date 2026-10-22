from playwright.sync_api import sync_playwright
import time

def capture_all():
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe', headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 850})
        page = context.new_page()

        # 1. Home
        print("1. Capturing Home...")
        page.goto('http://localhost:3000', wait_until='networkidle')
        page.wait_for_timeout(1000)
        page.screenshot(path='real_shot_1_home.png')

        # 2. Citizen
        print("2. Capturing Citizen...")
        page.evaluate("""() => {
            const users = JSON.parse(localStorage.getItem('resqlink_users') || '[]');
            const u = users.find(x => x.role === 'CITIZEN');
            if (u) localStorage.setItem('resqlink_current_user', JSON.stringify(u));
        }""")
        page.reload(wait_until='networkidle')
        page.wait_for_timeout(1500)
        page.screenshot(path='real_shot_2_citizen.png')

        # 3. Volunteer
        print("3. Capturing Volunteer...")
        page.evaluate("""() => {
            const users = JSON.parse(localStorage.getItem('resqlink_users') || '[]');
            const u = users.find(x => x.role === 'VOLUNTEER');
            if (u) localStorage.setItem('resqlink_current_user', JSON.stringify(u));
        }""")
        page.reload(wait_until='networkidle')
        page.wait_for_timeout(1500)
        page.screenshot(path='real_shot_3_volunteer.png')

        # 4. Government EOC
        print("4. Capturing Government EOC...")
        page.evaluate("""() => {
            const users = JSON.parse(localStorage.getItem('resqlink_users') || '[]');
            const u = users.find(x => x.role === 'GOVERNMENT');
            if (u) localStorage.setItem('resqlink_current_user', JSON.stringify(u));
        }""")
        page.reload(wait_until='networkidle')
        page.wait_for_timeout(2000)
        page.screenshot(path='real_shot_4_government.png')

        # 5. Relief Camps
        print("5. Capturing Relief Camps...")
        page.click("text=Relief Camps")
        page.wait_for_timeout(2000)
        page.screenshot(path='real_shot_5_camps.png')

        # 6. Logistics / Resource Provider
        print("6. Capturing Logistics Provider...")
        page.evaluate("""() => {
            const users = JSON.parse(localStorage.getItem('resqlink_users') || '[]');
            const u = users.find(x => x.role === 'RESOURCE_PROVIDER');
            if (u) localStorage.setItem('resqlink_current_user', JSON.stringify(u));
        }""")
        page.reload(wait_until='networkidle')
        page.wait_for_timeout(1500)
        page.screenshot(path='real_shot_6_provider.png')

        browser.close()
        print("All 6 real screens captured successfully!")

if __name__ == '__main__':
    capture_all()
