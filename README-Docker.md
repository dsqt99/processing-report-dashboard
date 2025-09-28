# Docker Setup cho Ứng dụng Quản lý Tiến độ Công việc

## 📋 Yêu cầu hệ thống
- Docker Desktop hoặc Docker Engine
- Docker Compose v3.8+

## 🚀 Cách sử dụng

### 1. Môi trường Development (Phát triển)
```bash
# Sử dụng Docker Compose
docker-compose --profile dev up --build

# Hoặc sử dụng Makefile (nếu có)
make dev
```
- Ứng dụng sẽ chạy tại: http://localhost:5173
- Hot reload được bật
- Source code được mount vào container

### 2. Môi trường Production (Sản xuất)
```bash
# Sử dụng Docker Compose
docker-compose --profile prod up --build -d

# Hoặc sử dụng Makefile
make prod
```
- Ứng dụng sẽ chạy tại: http://localhost:80
- Được tối ưu hóa cho production
- Sử dụng Nginx để serve static files

### 3. Chỉ chạy API Server
```bash
# Sử dụng Docker Compose
docker-compose --profile api up --build -d

# Hoặc sử dụng Makefile
make api
```
- API server chạy tại: http://localhost:3000

## 🛠️ Các lệnh hữu ích

### Build images
```bash
docker-compose build
# hoặc
make build
```

### Xem logs
```bash
docker-compose logs -f
# hoặc
make logs
```

### Dừng services
```bash
docker-compose down
# hoặc
make stop
```

### Restart services
```bash
docker-compose restart
# hoặc
make restart
```

### Dọn dẹp (xóa containers, images, volumes)
```bash
docker-compose down --rmi all --volumes --remove-orphans
docker system prune -f
# hoặc
make clean
```

## 📁 Cấu trúc Docker Files

- `Dockerfile` - Multi-stage build cho React app (dev + prod)
- `Dockerfile.api` - Dockerfile riêng cho API server
- `docker-compose.yml` - Cấu hình chính
- `docker-compose.override.yml` - Cấu hình mặc định cho development
- `nginx.conf` - Cấu hình Nginx cho production
- `.dockerignore` - Loại trừ files không cần thiết
- `Makefile` - Shortcuts cho các lệnh Docker

## 🔧 Tùy chỉnh

### Environment Variables
Bạn có thể tạo file `.env` để cấu hình:
```env
NODE_ENV=development
VITE_API_URL=http://localhost:3000
```

### Ports
- Development: 5173
- Production: 80
- API: 3000

### Volumes
- Development: Source code được mount để hot reload
- Production: Chỉ serve static files đã build

## 🐛 Troubleshooting

### Port đã được sử dụng
```bash
# Kiểm tra port đang sử dụng
netstat -tulpn | grep :5173

# Thay đổi port trong docker-compose.yml
ports:
  - "3000:5173"  # Thay 5173 thành port khác
```

### Build lỗi
```bash
# Xóa cache và build lại
docker-compose down
docker system prune -f
docker-compose build --no-cache
```

### Container không start
```bash
# Kiểm tra logs
docker-compose logs [service-name]

# Kiểm tra status
docker-compose ps
```