@echo off
chcp 65001 > nul
title Hinh 3.2 - So Do Tuan Tu Phat Hanh Va Doi Soat
color 0A
cd /d "%~dp0"

if exist xuat_hinh_don_le.py (
    python xuat_hinh_don_le.py --hinh 3.2
) else (
    python scripts\xuat_hinh_don_le.py --hinh 3.2
)

echo.
pause
