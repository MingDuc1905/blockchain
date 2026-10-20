@echo off
chcp 65001 > nul
title Hinh 3.1 - Kien Truc He Thong 3 Tang
color 0A
cd /d "%~dp0"

if exist xuat_hinh_don_le.py (
    python xuat_hinh_don_le.py --hinh 3.1
) else (
    python scripts\xuat_hinh_don_le.py --hinh 3.1
)

echo.
pause
