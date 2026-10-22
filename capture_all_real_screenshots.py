from playwright.sync_api import sync_playwright
import time

def capture():
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe', headless=True)
        context = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = context.new_page()

        targets = [
            ("http://localhost:3000", "real_1_home.png"),
            ("http://localhost:3000/citizen", "real_2_citizen.png"),
            ("http://localhost:3000/volunteer", "real_3_volunteer.png"),
            ("http://localhost:3000/government", "real_4_government.png"),
            ("http://localhost:3000/camps", "real_5_camps.png"),
            ("http://localhost:3000/provider", "real_6_provider.png"),
            ("http://localhost:3000/presentation", "real_7_presentation.png"),
            ("http://localhost:3000/login", "real_8_login.png"),
        ]

        for url, fname in targets:
            try:
                print(f"Navigating to {url}...")
                page.goto(url, wait_until='networkidle')
                page.wait_for_timeout(1500)
                page.screenshot(path=fname)
                print(f"Successfully saved {fname}")
            except Exception as e:
                print(f"Error capturing {url}: {e}")

        browser.close()
        print("All real project screenshots captured successfully!")

if __name__ == "__main__":
    capture()
