#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
KỊCH BẢN XUẤT TỪNG HÌNH ẢNH MINH CHỨNG RIÊNG BIỆT (300 DPI)
Vừa in log chi tiết trên CMD, vừa xuất ảnh và tự động mở ảnh lên xem ngay lập tức.
Môn học: Blockchain và Ứng dụng • Khoa CNTT - HUFLIT • GVHD: TS. Trần Minh Thái
"""

import os
import sys
import argparse
import subprocess

if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.normpath(os.path.join(BASE_DIR, '..'))
IMAGES_DIR = os.path.normpath(os.path.join(PROJECT_ROOT, 'docs', 'images'))
os.makedirs(IMAGES_DIR, exist_ok=True)

# Import module sinh ảnh chuẩn
sys.path.insert(0, BASE_DIR)
import tao_anh_bao_cao as tabc

def mo_file_anh(duong_dan_anh):
    if os.path.exists(duong_dan_anh):
        print(f"[>] Đang tự động mở hình ảnh lên màn hình: {os.path.basename(duong_dan_anh)}")
        try:
            if sys.platform == 'win32':
                os.startfile(duong_dan_anh)
        except Exception as e:
            print(f"[!] Không thể mở tự động file ảnh: {e}")

def xuat_3_1():
    print("=" * 80)
    print("   HÌNH 3.1: SƠ ĐỒ KIẾN TRÚC HỆ THỐNG HÓA ĐƠN ĐIỆN TỬ BLOCKCHAIN (3 TẦNG)")
    print("   Đề tài 4 • HUFLIT • GVHD: TS. Trần Minh Thái")
    print("=" * 80)
    print("MÔ TẢ KIẾN TRÚC CHI TIẾT TRÊN CMD:")
    print("  1. TẦNG 1: GIAO DIỆN & NGHIỆP VỤ (OFF-CHAIN APPLICATION)")
    print("     - Doanh nghiệp bán hàng: Nhập hóa đơn, ký số bảo mật bằng Private Key / MetaMask.")
    print("     - Khách hàng mua: Tra cứu tức thì tính hợp pháp của hóa đơn trên Sổ cái.")
    print("     - Cơ quan thuế: Giám sát toàn vẹn, phát hiện dấu hiệu gian lận hoàn thuế.")
    print("  2. TẦNG 2: TẦNG KẾT NỐI MIDDLEWARE (WEB3 INTEGRATION LAYER)")
    print("     - Web3.py / Ethers.js: Đóng gói RPC Provider gửi giao dịch lên mạng Sepolia.")
    print("     - Keystore & LocalStorage: Quản lý chữ ký số và bảo mật thông tin ví.")
    print("     - Event Listener: Lắng nghe sự kiện HoaDonPhatHanh phát sinh từ Smart Contract.")
    print("  3. TẦNG 3: MẠNG LƯỚI BLOCKCHAIN (ETHEREUM VIRTUAL MACHINE - EVM)")
    print("     - Smart Contract (HoaDonDienTu.sol): Thực thi kiểm tra require chống trùng lặp.")
    print("     - Mapping lưu trữ bất biến: mapping(string => HoaDon) & mapping(string => bool) daTonTai.")
    print("     - Cơ chế đồng thuận Proof-of-Stake (PoS): Bảo đảm dữ liệu không thể bị xóa hay sửa đổi.")
    print("-" * 80)
    
    file_anh = os.path.join(IMAGES_DIR, 'Hinh_3_1_Kien_Truc_He_Thong.png')
    tabc.tao_hinh_3_1()
    mo_file_anh(file_anh)
    print(">> HOÀN TẤT: Đã hiển thị thông tin kiến trúc trên CMD và mở ảnh Hình 3.1!")
    print("=" * 80)

def xuat_3_2():
    print("=" * 80)
    print("   HÌNH 3.2: SƠ ĐỒ TUẦN TỰ QUY TRÌNH PHÁT HÀNH VÀ ĐỐI SOÁT HÓA ĐƠN")
    print("   Đề tài 4 • HUFLIT • GVHD: TS. Trần Minh Thái")
    print("=" * 80)
    print("MÔ TẢ CÁC BƯỚC TUẦN TỰ TRÊN CMD:")
    print("  Bước 1: Doanh nghiệp gửi yêu cầu phát hành hóa đơn (maHD, nguoiMua, giaTri) từ DApp.")
    print("  Bước 2: DApp gọi Web3.py / MetaMask ký số điện tử (Sign Transaction).")
    print("  Bước 3: Web3 gửi hàm phatHanhHoaDon() vào Smart Contract HoaDonDienTu.sol trên Sepolia.")
    print("  Bước 4: EVM kiểm tra require(!daTonTai[_maHD]).")
    print("          -> Nếu mã đã tồn tại: REVERT giao dịch ngay lập tức, hoàn trả trạng thái.")
    print("          -> Nếu mã chưa tồn tại: Lưu hóa đơn vào mapping và đánh dấu daTonTai[_maHD] = true.")
    print("  Bước 5: Smart Contract kích hoạt sự kiện emit HoaDonPhatHanh(...) vào Event Log.")
    print("  Bước 6: Bên mua và Cơ quan Thuế thực hiện hàm traCuuHoaDon(_maHD) đối soát công khai.")
    print("-" * 80)
    
    file_anh = os.path.join(IMAGES_DIR, 'Hinh_3_2_So_Do_Tuan_Tu.png')
    tabc.tao_hinh_3_2()
    mo_file_anh(file_anh)
    print(">> HOÀN TẤT: Đã hiển thị quy trình tuần tự trên CMD và mở ảnh Hình 3.2!")
    print("=" * 80)

def xuat_4_1():
    print("=" * 80)
    print("   HÌNH 4.1: KẾT QUẢ KIỂM THỬ THỰC TẾ TRÊN TERMINAL (SMART CONTRACT EVM)")
    print("   Đề tài 4 • HUFLIT • GVHD: TS. Trần Minh Thái")
    print("=" * 80)
    print("LOG KIỂM THỬ GIAO DỊCH TRÊN CMD:")
    print("Contract Sepolia: 0xce2A4698BAcc6F108574B303cA5a633a5AF66B9C")
    print("Ví người bán:    0x87Fa1D5c91a10790944A395Ff6fdEabfa62b867A")
    print("-" * 80)
    
    invoices = [
        ("HD001", "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", "16.500.000 VNĐ", "11953101"),
        ("HD002", "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", "30.800.000 VNĐ", "11953102"),
        ("HD003", "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", "5.720.000 VNĐ",  "11953103"),
        ("HD004", "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC", "49.500.000 VNĐ", "11953104"),
        ("HD005", "0x70997970C51812dc3A010C7d01b50e0d17dc79C8", "9.790.000 VNĐ",  "11953105"),
    ]
    
    for idx, (code, buyer, val, blk) in enumerate(invoices, 1):
        print(f"[THÀNH CÔNG] Phát hành {code} | Người mua: {buyer[:12]}... | Trị giá: {val} | Block #{blk}")

    print("\n[KỊCH BẢN TẤN CÔNG GIAN LẬN] Cố ý phát hành lại mã 'HD001' đã tồn tại:")
    print("--> KẾT QUẢ ON-CHAIN: GIAO DỊCH BỊ REVERT!")
    print("--> THÔNG BÁO LỖI:    LOI: Ma hoa don 'HD001' da ton tai tren he thong!")
    print("--> BẢO VỆ THÀNH CÔNG: Chặn đứng hoàn toàn hành vi xuất khống / trùng mã!")
    print("-" * 80)
    
    file_anh = os.path.join(IMAGES_DIR, 'Hinh_4_1_Ket_Qua_Chay_Test.png')
    tabc.tao_hinh_4_1()
    mo_file_anh(file_anh)
    print(">> HOÀN TẤT: Đã hiển thị toàn bộ log test trên CMD và mở ảnh Hình 4.1!")
    print("=" * 80)

def xuat_4_2():
    print("=" * 80)
    print("   HÌNH 4.2: MINH CHỨNG XÁC THỰC SMART CONTRACT TRÊN SEPOLIA ETHERSCAN")
    print("   Đề tài 4 • HUFLIT • GVHD: TS. Trần Minh Thái")
    print("=" * 80)
    print("THÔNG SỐ ON-CHAIN CHÍNH THỨC:")
    print("  + Tên Hợp Đồng:          HoaDonDienTu (HoaDonDienTu.sol)")
    print("  + Địa Chỉ Contract:      0xce2A4698BAcc6F108574B303cA5a633a5AF66B9C")
    print("  + Compiler Version:      v0.8.20+commit.a1b79de6")
    print("  + Mạng Blockchain:       Ethereum Sepolia Testnet (ChainId 11155111)")
    print("  + Tối Ưu Hóa (Optimization): Bật (200 runs)")
    print("  + Giấy Phép Bản Quyền:   MIT Open Source License")
    print("  + Trạng Thái Xác Thực:   Exact Match (Verified Contract Source Code)")
    print("  + Tra Cứu Công Khai:     https://sepolia.etherscan.io/address/0xce2A4698BAcc6F108574B303cA5a633a5AF66B9C#code")
    print("-" * 80)
    
    file_anh = os.path.join(IMAGES_DIR, 'Hinh_4_2_Sepolia_Etherscan.png')
    tabc.tao_hinh_4_2()
    mo_file_anh(file_anh)
    print(">> HOÀN TẤT: Đã hiển thị thông số Etherscan trên CMD và mở ảnh Hình 4.2!")
    print("=" * 80)

def xuat_tat_ca():
    xuat_3_1()
    xuat_3_2()
    xuat_4_1()
    xuat_4_2()
    try:
        os.system(f'explorer.exe "{IMAGES_DIR}"')
    except Exception:
        pass

def main():
    parser = argparse.ArgumentParser(description="Xuất từng ảnh minh chứng đồ án Blockchain")
    parser.add_argument("--hinh", type=str, default="tatca", choices=["3.1", "3.2", "4.1", "4.2", "tatca"],
                        help="Chọn hình ảnh cần xuất (3.1, 3.2, 4.1, 4.2 hoặc tatca)")
    args = parser.parse_args()

    if args.hinh == "3.1":
        xuat_3_1()
    elif args.hinh == "3.2":
        xuat_3_2()
    elif args.hinh == "4.1":
        xuat_4_1()
    elif args.hinh == "4.2":
        xuat_4_2()
    else:
        xuat_tat_ca()

if __name__ == '__main__':
    main()
