#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HƯỚNG DẪN & SCRIPT TRIỂN KHAI HỢP ĐỒNG LÊN ETHEREUM SEPOLIA TESTNET
Môn: Blockchain và Ứng dụng • Đề tài 4: Hóa đơn điện tử chống gian lận thuế
"""

import sys
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

DEPLOY_GUIDE = """
================================================================================
    HƯỚNG DẪN TRIỂN KHAI HỢP ĐỒNG HoaDonDienTu LÊN ETHEREUM SEPOLIA TESTNET
================================================================================

Cách 1: Triển khai nhanh chóng qua Remix IDE (Khuyên dùng cho sinh viên):
-----------------------------------------------------------------------
1. Truy cập https://remix.ethereum.org/
2. Tạo file mới: `contracts/HoaDonDienTu.sol` và dán toàn bộ code từ file contracts/HoaDonDienTu.sol
3. Vào tab 'Solidity Compiler':
   - Chọn Compiler version: 0.8.20 (đúng phiên bản trong pragma)
   - Advanced Configurations: bật Enable optimization = 200, EVM Version = shanghai
   - Bấm 'Compile HoaDonDienTu.sol' (Đảm bảo xuất hiện dấu tích xanh)
4. Vào tab 'Deploy & Run Transactions':
   - Environment: Chọn 'Injected Provider - MetaMask'
   - Đảm bảo MetaMask trên trình duyệt đang kết nối mạng 'Sepolia Testnet' (có sẵn một lượng nhỏ Sepolia ETH miễn phí từ faucet)
   - Chọn Contract: `HoaDonDienTu`
   - Dán địa chỉ ví Trọng tài (Arbiter) vào ô `_ARBITER` cạnh nút Deploy (constructor của phiên bản 2)
   - Bấm nút 'Deploy' màu cam
   - Xác nhận giao dịch trên ví MetaMask
5. Sau khi Deploy thành công:
   - Copy 'Contract Address' (Ví dụ: 0x8a23...F94b)
   - Mở Etherscan Sepolia: https://sepolia.etherscan.io/address/<CONTRACT_ADDRESS>
   - Chụp ảnh màn hình mục 'Contract Creation' và 'Transaction Details' để dán vào file Báo cáo Word và Slide PowerPoint.

Cách 2: Triển khai + verify tự động bằng Hardhat (khuyên dùng):
--------------------------------------------------------------
  npm install
  copy .env.example .env      # điền PRIVATE_KEY (ví testnet), ARBITER_ADDRESS, ETHERSCAN_API_KEY
  npm test                    # kiểm thử vòng đời hóa đơn + Arbiter
  npm run deploy:sepolia      # deploy, ghi deployments/sepolia.json
  npm run check:bytecode      # giải mã metadata để xác nhận compiler thật + so sánh bytecode
  npm run verify:sepolia      # verify source trên Etherscan (0.8.20, optimizer 200 runs, shanghai)
  node scripts/sync_config.js # cập nhật ABI + địa chỉ vào frontend/ và app/
Chi tiết: docs/HUONG_DAN_DEPLOY_SEPOLIA.md

Thông tin giao dịch ghi nhận tham chiếu:
- Network: Ethereum Sepolia Testnet
- Contract Name: HoaDonDienTu
- Standard: Custom Smart Contract for Tax Invoice Anti-Fraud
- Verification: Etherscan Sepolia Verified Contract
================================================================================
"""

def print_guide():
    print(DEPLOY_GUIDE)

if __name__ == "__main__":
    print_guide()
