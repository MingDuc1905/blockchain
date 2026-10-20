@echo off
chcp 65001 > nul
title Hinh 4.2 - Minh Chung Sepolia Etherscan
color 0A
cd /d "%~dp0"

if exist xuat_hinh_don_le.py (
    python xuat_hinh_don_le.py --hinh 4.2
) else (
    python scripts\xuat_hinh_don_le.py --hinh 4.2
)

echo.
pause
