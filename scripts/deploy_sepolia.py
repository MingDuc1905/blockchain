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
   - Chọn Compiler version: 0.8.20 trở lên
   - Bấm 'Compile HoaDonDienTu.sol' (Đảm bảo xuất hiện dấu tích xanh)
4. Vào tab 'Deploy & Run Transactions':
   - Environment: Chọn 'Injected Provider - MetaMask'
   - Đảm bảo MetaMask trên trình duyệt đang kết nối mạng 'Sepolia Testnet' (có sẵn một lượng nhỏ Sepolia ETH miễn phí từ faucet)
   - Chọn Contract: `HoaDonDienTu`
   - Bấm nút 'Deploy' màu cam
   - Xác nhận giao dịch trên ví MetaMask
5. Sau khi Deploy thành công:
   - Copy 'Contract Address' (Ví dụ: 0x8a23...F94b)
   - Mở Etherscan Sepolia: https://sepolia.etherscan.io/address/<CONTRACT_ADDRESS>
   - Chụp ảnh màn hình mục 'Contract Creation' và 'Transaction Details' để dán vào file Báo cáo Word và Slide PowerPoint.

Cách 2: Triển khai tự động bằng Python Web3 (dành cho môi trường Terminal):
--------------------------------------------------------------------------
Yêu cầu:
- Cài đặt: pip install web3 py-solc-x
- Cấu hình file .env hoặc biến môi trường:
  + SEPOLIA_RPC_URL="https://rpc.sepolia.org" (hoặc từ Infura / Alchemy)
  + PRIVATE_KEY="0x..." (Private key của ví testnet, tuyệt đối không dùng ví chứa tài sản thật)

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
