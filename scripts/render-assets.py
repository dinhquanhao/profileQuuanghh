"""Rebuild the project thumbnail and downloadable CV with local Chromium."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread
import os

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *_args):
        pass


def main():
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
    thread = Thread(target=server.serve_forever, daemon=True)
    thread.start()
    base = f'http://127.0.0.1:{server.server_port}'
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH', '/usr/bin/chromium'))
            page = browser.new_page(viewport={'width': 1200, 'height': 800}, device_scale_factor=1, reduced_motion='reduce')
            # Analytics is unrelated to reproducible local asset rendering.
            page.route('https://www.googletagmanager.com/**', lambda route: route.fulfill(status=200, body=''))
            page.goto(f'{base}/index.html#home', wait_until='networkidle')
            page.locator('.avatar-img').wait_for()
            page.screenshot(path=str(ROOT / 'assets/images/portfolio-preview.png'))
            page.goto(f'{base}/cv.html', wait_until='networkidle')
            page.pdf(path=str(ROOT / 'assets/dinh-quang-hao-cv.pdf'), format='A4', print_background=True, prefer_css_page_size=True)
            browser.close()
    finally:
        server.shutdown()
        server.server_close()
        thread.join()
    print('Generated assets/images/portfolio-preview.png and assets/dinh-quang-hao-cv.pdf')


if __name__ == '__main__':
    main()
