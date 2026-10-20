@echo off
chcp 65001 > nul
title KIỂM THỬ SMART CONTRACT & XUẤT ẢNH BÁO CÁO (ĐỀ TÀI 4 - HUFLIT)
color 0A

cd /d "%~dp0"
echo Đang khởi chạy hệ thống kiểm thử Blockchain & Xuất ảnh minh chứng...
echo.

python scripts\chay_kiem_thu_va_xuat_anh.py

echo.
echo ===============================================================================
echo Bấm phím bất kỳ để đóng cửa sổ CMD này...
pause > nul
