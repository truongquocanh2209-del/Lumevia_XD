# LUMEVIA StudyOS v3.7.0 — Experience & Reliability Edition

Website tĩnh cho GitHub Pages; dữ liệu học tập của từng tài khoản lưu trong trình duyệt. **Trước khi cập nhật, xuất bản sao lưu JSON trong Cài đặt** và giữ nguyên địa chỉ miền/repository nếu muốn tiếp tục truy cập dữ liệu đã lưu.

## Cập nhật

- **Hướng dẫn người mới** 5 bước: hiện một lần cho hồ sơ chưa hoàn tất; bỏ qua, xem lại trong Cài đặt, hoặc mở tính năng tương ứng. Trạng thái đã xem được lưu qua cơ chế lưu dữ liệu hiện có; không chèn dữ liệu giới thiệu vào bài thi.
- **Ghép cặp tri thức:** trò chơi hoàn chỉnh dùng chính nội dung flashcard của người dùng. Gồm ghép, kiểm tra cặp đúng/sai, đếm số lượt và tổng kết; yêu cầu ít nhất 3 cặp nội dung khác nhau, hỗ trợ cảm ứng và bàn phím. Không tự phát XP, không tự thay đổi lịch ôn SRS.
- **Chuyển động:** tinh chỉnh hiệu ứng game, các bước của hướng dẫn; tôn trọng `prefers-reduced-motion` và tùy chọn giảm chuyển động.
- **Giữ nguyên** Exam Mode, Focus Room, ngân hàng câu hỏi, Quiz Lab, quản lý flashcard, dữ liệu học tập và liên kết trò chơi ngoài Echo Collapse. Game ngoài không nằm trong mã nguồn ZIP nên không được chỉnh sửa.

## Triển khai

Giải nén và tải **tất cả tệp và thư mục bên trong** lên thư mục phát hành GitHub Pages. `index.html`, `app.js`, `experience37.js`, `site.css`, `sw.js`, `manifest.webmanifest`, `assets/`, các JS và PNG còn lại phải cùng cấu trúc. Giữ `.nojekyll` ở thư mục gốc. Chọn branch trong Settings → Pages. Không cần Node hay backend.

Nếu website đang dùng PWA/cache cũ, tải lại sau khi GitHub Pages hoàn tất cập nhật. Nếu vẫn thấy bản cũ, thử đóng tất cả tab của website rồi mở lại; đừng xóa dữ liệu trình duyệt trước khi sao lưu.

## An toàn và giới hạn

- Tài khoản cục bộ không thay thế xác thực máy chủ; không có đồng bộ thiết bị hay tự sao lưu trên cloud.
- Ghép cặp từ dữ liệu của người dùng; không bịa câu hỏi hay nội dung. Các bản ghi và điểm Exam Mode không bị can thiệp bởi trò chơi.
- Chế độ toàn màn hình không phải chống gian lận tuyệt đối.
- Báo cáo kiểm thử `QA-3.7.0.md` được cung cấp **riêng** với ZIP để gói đăng GitHub chỉ chứa các tệp triển khai và giấy phép.

## Bản quyền

Xem `LICENSE`, `ASSET-LICENSES.md`, `NEW-SCENE-LICENSES.md` và `assets/fonts/LICENSE.txt`.
