"""Browser checks for the static portfolio; run with python3 tests/smoke.py."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
from urllib.request import urlopen
import json
import os
import unittest

from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


class PortfolioSmoke(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
        cls.thread = Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base = f'http://127.0.0.1:{cls.server.server_port}'
        cls.playwright = sync_playwright().start()
        cls.browser = cls.playwright.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium'))

    @classmethod
    def tearDownClass(cls):
        cls.browser.close()
        cls.playwright.stop()
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()

    def setUp(self):
        self.context = self.browser.new_context(viewport={'width': 1280, 'height': 900}, reduced_motion='reduce')
        self.context.route('https://www.googletagmanager.com/**', lambda route: route.fulfill(status=200, body=''))
        self.page = self.context.new_page()
        self.errors = []
        self.bad_resources = []
        self.page.on('pageerror', lambda error: self.errors.append(str(error)))
        self.page.on('response', lambda r: self.bad_resources.append(r.url) if r.url.startswith(self.base) and r.status >= 400 else None)

    def tearDown(self):
        self.context.close()
        self.assertEqual(self.errors, [])
        self.assertEqual(self.bad_resources, [])

    def open(self, path='/index.html'):
        response = self.page.goto(self.base + path, wait_until='networkidle')
        if response is not None:  # Fragment-only navigation has no new HTTP response.
            self.assertEqual(response.status, 200)

    def test_navigation_and_history(self):
        self.open()
        for label, section in [('Dự án', 'projects'), ('Hành trình', 'journey'), ('Hồ sơ', 'home')]:
            self.page.get_by_role('navigation').get_by_role('link', name=label, exact=True).click()
            expect(self.page.locator(f'#{section}')).to_be_visible()
            expect(self.page.locator('nav a[aria-current="page"]')).to_have_attribute('href', '#' + section)
            self.assertEqual(self.page.locator('.page-section:visible').count(), 1)
        self.page.go_back()
        expect(self.page.locator('#journey')).to_be_visible()
        self.page.go_forward()
        expect(self.page.locator('#home')).to_be_visible()
        self.page.get_by_role('link', name='Xem dự án').click()
        expect(self.page.locator('#projects')).to_be_visible()
        self.page.reload(wait_until='networkidle')
        expect(self.page.locator('#projects')).to_be_visible()

    def test_direct_links_and_metadata(self):
        for fragment in ('projects', 'journey', 'home', 'contact'):
            self.open('/index.html#' + fragment)
            expect(self.page.locator('#' + fragment)).to_be_visible()
        self.open('/index.html#unknown')
        expect(self.page.locator('#home')).to_be_visible()
        expected = 'https://dinhquanhao.github.io/profileQuuanghh/'
        self.assertEqual(self.page.locator('link[rel="canonical"]').get_attribute('href'), expected)
        data = json.loads(self.page.locator('script[type="application/ld+json"]').text_content())
        self.assertEqual(data['url'], expected)
        self.assertNotIn('yourusername', self.page.content())
        self.assertNotIn('fshi0206-arch', self.page.content())

    def test_theme_clock_and_storage_failure(self):
        self.open()
        clock = self.page.locator('#clock').inner_text()
        self.assertRegex(clock, r'\d{2}:\d{2}:\d{2}')
        self.page.wait_for_function('(old) => document.querySelector("#clock").textContent !== old', arg=clock)
        self.page.get_by_role('button', name='Bật giao diện tối').click()
        self.page.reload(wait_until='networkidle')
        expect(self.page.locator('body')).to_have_attribute('data-theme', 'dark')
        self.page.get_by_role('button', name='Bật giao diện sáng').click()
        self.assertIsNone(self.page.locator('body').get_attribute('data-theme'))
        self.context.add_init_script("Object.defineProperty(window, 'localStorage', {get() {throw new Error('Storage disabled')}})")
        self.page.reload(wait_until='networkidle')
        self.page.get_by_role('button', name='Bật giao diện tối').click()
        expect(self.page.locator('body')).to_have_attribute('data-theme', 'dark')

    def test_keyboard_avatar_and_qr(self):
        self.open()
        avatar = self.page.locator('[data-avatar]')
        avatar.focus()
        self.page.keyboard.press('Enter')
        expect(avatar).to_have_attribute('aria-pressed', 'true')
        self.page.keyboard.press('Escape')
        expect(avatar).to_have_attribute('aria-pressed', 'false')
        self.page.get_by_role('button', name='Xem mã QR Zalo').click()
        expect(self.page.get_by_role('dialog')).to_be_visible()
        self.page.get_by_role('button', name='Đóng', exact=True).click()
        expect(self.page.locator('#zaloModal')).not_to_be_visible()
        self.page.get_by_role('button', name='Xem mã QR Zalo').click()
        self.page.keyboard.press('Escape')
        expect(self.page.locator('#zaloModal')).not_to_be_visible()

    def test_images_source_demo_and_pdf(self):
        self.open('/index.html#projects')
        self.assertTrue(self.page.locator('.project-preview img').evaluate('(img) => img.complete && img.naturalWidth > 0'))
        expect(self.page.get_by_role('link', name='Xem mã nguồn')).to_have_attribute('href', 'https://github.com/dinhquanhao/profileQuuanghh')
        self.page.get_by_role('link', name='Mở demo →', exact=True).click()
        expect(self.page.locator('#home')).to_be_visible()
        self.assertTrue(self.page.locator('.avatar-img').evaluate('(img) => img.complete && img.naturalWidth > 0'))
        with self.page.expect_download() as download_info:
            self.page.get_by_role('link', name='Tải CV (PDF)').click()
        download = download_info.value
        self.assertIsNone(download.failure())
        self.assertTrue(Path(download.path()).read_bytes().startswith(b'%PDF-'))
        self.open('/cv.html')
        expect(self.page.get_by_role('heading', name='Đinh Quang Hào')).to_be_visible()
        expect(self.page.get_by_role('button', name='In CV', exact=True)).to_be_visible()
        with urlopen(self.base + '/assets/dinh-quang-hao-cv.pdf') as response:
            self.assertEqual(response.headers.get_content_type(), 'application/pdf')

    def test_mobile_and_dark_layout(self):
        for width in (320, 390, 768):
            self.page.set_viewport_size({'width': width, 'height': 844})
            self.open()
            self.page.get_by_role('button', name='Bật giao diện tối').click()
            for label, fragment in [('Dự án', 'projects'), ('Hành trình', 'journey'), ('Hồ sơ', 'home')]:
                self.page.get_by_role('navigation').get_by_role('link', name=label, exact=True).click()
                expect(self.page.locator('#' + fragment)).to_be_visible()
                self.assertTrue(self.page.evaluate('document.documentElement.scrollWidth <= innerWidth'), f'Overflow at {width}px in {fragment}')
            # Reset persistent preference for the next viewport.
            self.page.evaluate('localStorage.clear()')

    def test_no_javascript_content_and_navigation(self):
        context = self.browser.new_context(java_script_enabled=False)
        context.route('https://www.googletagmanager.com/**', lambda route: route.fulfill(status=200, body=''))
        page = context.new_page()
        try:
            page.goto(self.base + '/index.html', wait_until='networkidle')
            for section in ('home', 'projects', 'journey'):
                expect(page.locator('#' + section)).to_be_visible()
            page.get_by_role('navigation').get_by_role('link', name='Dự án', exact=True).click()
            self.assertTrue(page.url.endswith('#projects'))
            expect(page.locator('#projects-title')).to_be_in_viewport()
            expect(page.locator('.theme-toggle')).not_to_be_visible()
        finally:
            context.close()

    def test_visitor_pages_without_firebase(self):
        remote_requests = []
        self.page.on('request', lambda request: remote_requests.append(request.url) if not request.url.startswith(self.base) else None)
        for path in ('/admin.html', '/visitors.html'):
            self.open(path)
            expect(self.page.locator('#visitorStatus')).to_contain_text('Chưa cấu hình Firebase')
            expect(self.page.locator('#visitorLogin')).not_to_be_visible()
        self.assertEqual(remote_requests, [])

    def test_print_includes_all_sections(self):
        self.open()
        self.page.emulate_media(media='print')
        for section in ('home', 'projects', 'journey'):
            expect(self.page.locator('#' + section)).to_be_visible()
        expect(self.page.locator('header')).not_to_be_visible()


if __name__ == '__main__':
    unittest.main(verbosity=2)
