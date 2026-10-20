@echo off
chcp 65001 > nul
title Xuat Toan Bo 4 Hinh Anh Minh Chung
color 0A
cd /d "%~dp0"

if exist xuat_hinh_don_le.py (
    python xuat_hinh_don_le.py --hinh tatca
) else (
    python scripts\xuat_hinh_don_le.py --hinh tatca
)

echo.
pause
