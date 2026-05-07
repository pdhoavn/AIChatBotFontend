Quy trình Thực thi (Terminal Commands)
Thực hiện các lệnh sau tại thư mục gốc của dự án:

Bước 1: Dọn dẹp môi trường cũ
Bash
docker stop chatbot-v3-final || true && docker rm chatbot-v3-final || true
Bước 2: Build Image với IP Backend thật
Thay đổi BACKEND_URL thành địa chỉ Server Backend của bạn.

Bash
docker build --build-arg BACKEND_URL="http://14.161.1.28:8000" -t chatbot-v3 .
Bước 3: Khởi chạy Container
Bash
docker run -d -p 8888:80 --name chatbot-v3-final chatbot-v3

A. Nhúng CSS (Dán vào trong thẻ <head>)
Giúp định dạng giao diện, icon và hiệu ứng 3D của chatbot.

HTML
<link rel="stylesheet" crossorigin="anonymous" href="https://domain/chatbot-widget.css">
B. Nhúng JavaScript (Dán vào trước thẻ đóng </body>)
Xử lý logic kết nối AI, WebSocket và điều khiển bong bóng chat.

HTML
<script type="module" crossorigin="anonymous" src="https://domain/chatbot-widget.js">