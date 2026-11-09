# Quuanghh — portfolio cá nhân

Website tĩnh HTML/CSS/JavaScript, không cần npm install hay bước build.

## Chạy tại máy phát triển

Từ thư mục repository, với Python 3:

```sh
python3 -m http.server 5501 --bind 0.0.0.0
```

Mở cổng 5501 bằng công cụ chuyển tiếp cổng của môi trường phát triển. Dừng bằng Ctrl+C.
Node.js dùng để kiểm tra cú pháp:

```sh
for f in js/*.js; do node --check "$f" || exit; done
```

Kiểm tra ba mục **Hồ sơ**, **Dự án**, **Hành trình**; đổi giao diện sáng/tối,
phóng ảnh đại diện, mở QR Zalo và tải CV. Liên kết `#home`, `#projects`, `#journey`
hỗ trợ mở trực tiếp, tải lại và nút quay lại/tiến của trình duyệt.
Khi JavaScript bị tắt, tất cả mục hiển thị trên cùng một trang và menu dùng liên kết neo.
Các nút chỉ dùng JavaScript được ẩn; nội dung và liên kết tải CV vẫn sử dụng được.

## Kiểm thử trình duyệt và tạo tài nguyên

Các công cụ phát triển tùy chọn cần Python Playwright và Chromium. Trong môi trường
đám mây đã thiết lập, cả hai đã có sẵn. Nếu máy khác chưa có Playwright, cài vào virtualenv:

```sh
python3 -m venv .venv
. .venv/bin/activate
python3 -m pip install playwright
```

Cài Chromium bằng trình quản lý gói của hệ điều hành. Mặc định script dùng
`/usr/bin/chromium`; đặt `CHROMIUM_PATH` nếu trình duyệt nằm ở vị trí khác.

```sh
python3 tests/smoke.py
python3 scripts/render-assets.py
```

Bộ smoke test tự mở máy chủ tại cổng trống, kiểm tra điều hướng/lịch sử, theme,
trường hợp storage bị chặn, bàn phím, QR, tải PDF, layout ở 320/390/768px,
nội dung không có JavaScript, chế độ in và hai trang quản lý khi Firebase tắt.
Chỉ Google Analytics được thay bằng phản hồi rỗng trong kiểm thử để không gửi sự kiện thử nghiệm.

`render-assets.py` tạo lại ảnh chụp dự án và CV PDF một trang từ `cv.html` bằng trình duyệt
thật. Chạy lại khi chỉnh phần đầu portfolio hoặc nội dung CV; commit cả các file sinh ra.

## Các file chính

- `index.html`: nội dung website.
- `css/style.css`: giao diện responsive và hiệu ứng.
- `js/script.js`: điều hướng, đồng hồ, giao diện sáng/tối và tương tác bàn phím.
- `cv.html`, `css/cv.css`, `js/cv.js`: CV dạng web, hỗ trợ in.
- `assets/dinh-quang-hao-cv.pdf`: CV tải xuống.
- `assets/images/portfolio-preview.png`: ảnh chụp thật của website.
- `assets/images/`: ảnh, bao gồm `zalo-qr.png.png` (giữ tên file gốc).
- `admin.html`, `visitors.html`: cùng một bảng quản lý lượt truy cập.
- `js/firebase-config.js`: cấu hình Firebase dùng chung, mặc định tắt.

## Nội dung và triển khai

- Dự án được giới thiệu là chính repository này; các số liệu hiệu năng và dự án chưa có
  mã nguồn minh chứng đã được bỏ. Kỹ năng phân biệt giữa định hướng học tập và phần đã thực hành.
- CV dùng thông tin liên hệ và hành trình có sẵn trong portfolio; không thêm bằng cấp,
  chứng chỉ hay kinh nghiệm làm việc chưa được cung cấp. Cập nhật `cv.html` khi có thông tin mới.
- GitHub trỏ tới `dinhquanhao`; canonical, Open Graph và JSON-LD dùng địa chỉ GitHub Pages
  dự kiến `https://dinhquanhao.github.io/profileQuuanghh/`. Nếu triển khai tên miền khác,
  cập nhật các URL này trong `index.html`. Địa chỉ metadata không tự bật GitHub Pages.
- Danh sách nhạc trong mục mở rộng của Hành trình mở tìm kiếm YouTube.
- Giao diện dùng font hệ thống và tài nguyên nội bộ, không cần CDN cho font hoặc icon.
- Footer cập nhật năm bằng JavaScript; giá trị HTML dự phòng là năm chỉnh sửa gần nhất.

## Firebase và quản lý lượt truy cập (tùy chọn)

Website chính hoạt động khi chưa cấu hình Firebase. Trang quản lý hiển thị thông báo
thay vì cố kết nối bằng giá trị mẫu. Không có truy vấn Firestore trước khi đăng nhập.

1. Tạo Firebase web app và Firestore. Điền **cấu hình web công khai** từ Firebase Console
   vào `firebaseConfig` trong `js/firebase-config.js`, thay `null` bằng object có
   `apiKey`, `authDomain`, `projectId`, `appId`. Không đưa private key hay service-account JSON vào repo.
2. Bật Firebase Authentication với Email/Password, tạo tài khoản quản trị và cấu hình
   Authorized domains cho tên miền triển khai.
3. Dùng Firebase Admin SDK ở môi trường máy chủ đáng tin cậy để cấp custom claim
   `admin: true` cho tài khoản quản trị. Đăng xuất và đăng nhập lại để nhận claim mới.
   Người dùng đăng nhập thông thường không có quyền đọc dữ liệu.
4. Triển khai `firestore.rules` vào đúng dự án qua Firebase Console hoặc công cụ Firebase.
   Quyền truy cập phải được bảo vệ bằng Rules, không dựa vào việc giấu URL trang quản lý.
5. Khi đã đáp ứng yêu cầu thông báo/quyền riêng tư của website, đổi `trackingEnabled`
   thành `true` để ghi đường dẫn trang và thời gian máy chủ. Không thu thập IP, vị trí,
   user-agent, query string hoặc referrer. Trình duyệt bật Do Not Track sẽ không được ghi nhận.
6. Truy cập trang chủ rồi đăng nhập tại `admin.html`; bảng hiển thị tối đa 100 lượt gần nhất.
   Kiểm tra tài khoản không có claim quản trị bị từ chối đọc trong Firestore Rules.

Rules cho phép tạo bản ghi ẩn danh với hai trường hợp lệ; đây không phải cơ chế chống spam.
Trước khi dùng tracking công khai ở quy mô lớn, cấu hình App Check và giám sát hạn mức.
Chưa xác minh Firebase trực tiếp khi chưa có dự án thật và tài khoản quản trị.

Google Analytics hiện có trong `index.html` và cần truy cập dịch vụ Google tương ứng.
Tùy chọn tracking Firebase ở trên chỉ điều khiển tracker của repo, không điều khiển Google Analytics.
Các tính năng bên ngoài cần kết nối đến dịch vụ tương ứng.
