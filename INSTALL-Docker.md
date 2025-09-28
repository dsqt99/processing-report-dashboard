# Hướng dẫn cài đặt Docker trên Windows

## 📋 Yêu cầu hệ thống
- Windows 10 64-bit: Pro, Enterprise, hoặc Education (Build 16299 trở lên)
- Windows 11 64-bit
- Hyper-V và Containers Windows features phải được bật
- BIOS-level hardware virtualization support phải được bật

## 🚀 Cách cài đặt

### Phương pháp 1: Docker Desktop (Khuyến nghị)

1. **Tải Docker Desktop:**
   - Truy cập: https://www.docker.com/products/docker-desktop/
   - Tải phiên bản cho Windows
   - Hoặc tải trực tiếp: https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe

2. **Cài đặt:**
   - Chạy file `Docker Desktop Installer.exe`
   - Làm theo hướng dẫn cài đặt
   - Khởi động lại máy tính khi được yêu cầu

3. **Khởi động Docker Desktop:**
   - Mở Docker Desktop từ Start Menu
   - Đợi Docker khởi động hoàn tất (icon Docker trong system tray sẽ không còn animation)

4. **Kiểm tra cài đặt:**
   ```powershell
   docker --version
   docker-compose --version
   ```

### Phương pháp 2: Sử dụng Chocolatey

1. **Cài đặt Chocolatey** (nếu chưa có):
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```

2. **Cài đặt Docker:**
   ```powershell
   choco install docker-desktop
   ```

### Phương pháp 3: Sử dụng winget

```powershell
winget install Docker.DockerDesktop
```

## ⚙️ Cấu hình sau khi cài đặt

### 1. Bật WSL 2 (Windows Subsystem for Linux)
```powershell
# Chạy PowerShell với quyền Administrator
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Khởi động lại máy tính
# Sau đó cài đặt WSL 2 kernel update
```

### 2. Cấu hình Docker Desktop
- Mở Docker Desktop
- Vào Settings > General
- Chọn "Use WSL 2 based engine" (khuyến nghị)
- Apply & Restart

## 🧪 Kiểm tra cài đặt

Sau khi cài đặt xong, mở PowerShell hoặc Command Prompt và chạy:

```powershell
# Kiểm tra phiên bản Docker
docker --version

# Kiểm tra phiên bản Docker Compose
docker-compose --version

# Test chạy container đầu tiên
docker run hello-world
```

## 🔧 Troubleshooting

### Lỗi "Docker Desktop requires a newer WSL kernel version"
```powershell
# Tải và cài đặt WSL2 Linux kernel update package
# https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi
```

### Lỗi "Hardware assisted virtualization and data execution protection must be enabled in the BIOS"
- Khởi động lại máy tính
- Vào BIOS/UEFI settings
- Bật Virtualization Technology (VT-x/AMD-V)
- Bật Hyper-V

### Docker Desktop không khởi động
1. Kiểm tra Windows features:
   - Hyper-V
   - Containers
   - Windows Subsystem for Linux

2. Restart Docker Desktop service:
   ```powershell
   # Chạy với quyền Administrator
   net stop com.docker.service
   net start com.docker.service
   ```

## 📚 Tài liệu tham khảo
- [Docker Desktop for Windows](https://docs.docker.com/desktop/windows/)
- [WSL 2 Installation Guide](https://docs.microsoft.com/en-us/windows/wsl/install)
- [Docker Compose Documentation](https://docs.docker.com/compose/)

---

**Sau khi cài đặt Docker thành công, bạn có thể quay lại file `README-Docker.md` để chạy ứng dụng với Docker!**