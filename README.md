# Quuanghh — website cá nhân

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

Kiểm tra trang chủ và các tab Hồ Sơ, Happy birthday, Love; đổi giao diện sáng/tối,
phóng ảnh đại diện, mở liên kết bài hát. Các mục nội dung hiển thị ngay cả khi JavaScript bị tắt.
Các tab tương tác và đồng hồ cần JavaScript. Kiểm tra Network để phát hiện tài nguyên lỗi.

## Các file chính

- `index.html`: nội dung website.
- `css/style.css`: giao diện responsive và hiệu ứng.
- `js/script.js`: chuyển tab, đồng hồ, tính tuổi, giao diện sáng/tối.
- `assets/images/`: ảnh, bao gồm `zalo-qr.png.png` (giữ tên file gốc).
- `admin.html`, `visitors.html`: cùng một bảng quản lý lượt truy cập.
- `js/firebase-config.js`: cấu hình Firebase dùng chung, mặc định tắt.

Danh sách nhạc mở tìm kiếm YouTube vì repo chưa cung cấp ID video thật.
Ảnh trong tab Love dùng ảnh đại diện hiện có; thay bằng ảnh riêng khi có tài nguyên phù hợp.

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

Fonts/icons dùng Google Fonts và cdnjs; analytics Google hiện có trong `index.html`.
Tùy chọn tracking Firebase ở trên chỉ điều khiển tracker của repo, không điều khiển Google Analytics.
Các tính năng bên ngoài cần kết nối đến dịch vụ tương ứng.
