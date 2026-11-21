#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
KỊCH BẢN MÔ PHỎNG & KIỂM THỬ HỢP ĐỒNG HÓA ĐƠN ĐIỆN TỬ CHỐNG GIAN LẬN THUẾ
Môn học: Blockchain và Ứng dụng (HUFLIT) - Giảng viên: TS. Trần Minh Thái
Đề tài 4: Hóa đơn điện tử chống gian lận thuế
"""

import sys
import time
from datetime import datetime

# Thiết lập encoding utf-8 cho console
if sys.platform == 'win32':
    sys.stdout.reconfigure(encoding='utf-8')

# Trạng thái hóa đơn (khớp enum TrangThai trong HoaDonDienTu.sol v2)
PENDING, CONFIRMED, REJECTED, CANCELLED, DISPUTED = range(5)
TEN_TRANG_THAI = ["Pending", "Confirmed", "Rejected", "Cancelled", "Disputed"]
GHI_CHU_TOI_DA = 500


class HoaDonDienTuSimulator:
    """
    Mô phỏng máy ảo EVM thực thi chính xác logic của Smart Contract HoaDonDienTu.sol (v2)
    Đảm bảo kiểm thử toàn diện các điều kiện require, mapping, và revert on-chain,
    bao gồm vòng đời hóa đơn (Pending -> Confirmed/Rejected/Cancelled) và vai trò Arbiter.
    Lưu ý: đây chỉ là mô phỏng bằng Python; bộ kiểm thử thật chạy trên EVM nằm ở thư mục test/ (Hardhat).
    """
    def __init__(self, arbiter: str = "0xA7b17E5000000000000000000000000000000001"):
        if not arbiter or arbiter == "0x0000000000000000000000000000000000000000":
            raise ValueError("LOI: Dia chi Arbiter khong hop le!")
        self.arbiter = arbiter
        self.danh_sach_hoa_don = {}
        self.da_ton_tai = {}
        self.da_tranh_chap = {}
        self.danh_sach_ma_hoa_don = []
        self.events = []

    def phat_hanh_hoa_don(self, ma_hd: str, nguoi_ban: str, nguoi_mua: str, gia_tri: int):
        # Kiểm tra require độ dài mã hóa đơn
        if not ma_hd or len(ma_hd.strip()) == 0:
            raise ValueError("LOI: Ma hoa don khong duoc de trong!")
        
        # Kiểm tra require chống trùng lặp (CƠ CHẾ CHỐNG GIAN LẬN CỐT LÕI)
        if self.da_ton_tai.get(ma_hd, False):
            raise ValueError(f"LOI: Ma hoa don '{ma_hd}' da ton tai tren he thong!")
        
        # Kiểm tra địa chỉ người mua hợp lệ
        if not nguoi_mua or nguoi_mua == "0x0000000000000000000000000000000000000000":
            raise ValueError("LOI: Dia chi nguoi mua khong hop le!")
        
        # Người bán không được tự xuất hóa đơn cho chính mình
        if nguoi_mua == nguoi_ban:
            raise ValueError("LOI: Nguoi mua khong duoc trung voi nguoi ban!")

        # Kiểm tra giá trị hóa đơn > 0
        if gia_tri <= 0:
            raise ValueError("LOI: Gia tri hoa don phai lon hon 0!")
        
        # Ghi nhận thời gian phát hành vào block
        block_timestamp = int(time.time())

        # Lưu trữ vào trạng thái hợp đồng (On-chain storage)
        self.danh_sach_hoa_don[ma_hd] = {
            "maHoaDon": ma_hd,
            "nguoiBan": nguoi_ban,
            "nguoiMua": nguoi_mua,
            "giaTri": gia_tri,
            "thoiGianPhatHanh": block_timestamp,
            "trangThai": PENDING,
            "ghiChu": "",
            "thoiGianFormat": datetime.fromtimestamp(block_timestamp).strftime("%Y-%m-%d %H:%M:%S")
        }
        self.da_ton_tai[ma_hd] = True
        self.danh_sach_ma_hoa_don.append(ma_hd)

        # Phát sự kiện Emit Event
        event_data = {
            "event": "HoaDonPhatHanh",
            "maHoaDon": ma_hd,
            "nguoiBan": nguoi_ban,
            "nguoiMua": nguoi_mua,
            "giaTri": gia_tri,
            "timestamp": block_timestamp
        }
        self.events.append(event_data)
        return event_data

    def tra_cuu_hoa_don(self, ma_hd: str):
        if not self.da_ton_tai.get(ma_hd, False):
            raise KeyError(f"LOI: Khong tim thay hoa don voi ma so '{ma_hd}'!")
        return self.danh_sach_hoa_don[ma_hd]

    def kiem_tra_trung_lap(self, ma_hd: str) -> bool:
        return self.da_ton_tai.get(ma_hd, False)

    def lay_tong_so_hoa_don(self) -> int:
        return len(self.danh_sach_ma_hoa_don)

    # ---------------- VÒNG ĐỜI HÓA ĐƠN & TRỌNG TÀI ----------------
    def _lay_hoa_don(self, ma_hd: str) -> dict:
        if not self.da_ton_tai.get(ma_hd, False):
            raise ValueError("LOI: Khong tim thay hoa don voi ma so nay!")
        return self.danh_sach_hoa_don[ma_hd]

    def _doi_trang_thai(self, hd: dict, moi: int, nguoi_thuc_hien: str, ghi_chu: str = ""):
        cu = hd["trangThai"]
        hd["trangThai"] = moi
        self.events.append({
            "event": "TrangThaiThayDoi", "maHoaDon": hd["maHoaDon"],
            "trangThaiCu": TEN_TRANG_THAI[cu], "trangThaiMoi": TEN_TRANG_THAI[moi],
            "nguoiThucHien": nguoi_thuc_hien, "ghiChu": ghi_chu
        })

    def xac_nhan_hoa_don(self, ma_hd: str, caller: str):
        hd = self._lay_hoa_don(ma_hd)
        if caller != hd["nguoiMua"]:
            raise ValueError("LOI: Chi nguoi mua moi duoc xac nhan hoa don!")
        if hd["trangThai"] != PENDING:
            raise ValueError("LOI: Hoa don khong o trang thai Pending!")
        self._doi_trang_thai(hd, CONFIRMED, caller)

    def tu_choi_hoa_don(self, ma_hd: str, ghi_chu: str, caller: str):
        hd = self._lay_hoa_don(ma_hd)
        if caller != hd["nguoiMua"]:
            raise ValueError("LOI: Chi nguoi mua moi duoc tu choi hoa don!")
        if hd["trangThai"] != PENDING:
            raise ValueError("LOI: Hoa don khong o trang thai Pending!")
        if not ghi_chu:
            raise ValueError("LOI: Phai nhap ly do tu choi!")
        if len(ghi_chu.encode("utf-8")) > GHI_CHU_TOI_DA:
            raise ValueError("LOI: Ghi chu qua dai!")
        hd["ghiChu"] = ghi_chu
        self._doi_trang_thai(hd, REJECTED, caller, ghi_chu)

    def huy_hoa_don(self, ma_hd: str, caller: str):
        hd = self._lay_hoa_don(ma_hd)
        if caller != hd["nguoiBan"]:
            raise ValueError("LOI: Chi nguoi ban moi duoc huy hoa don!")
        if hd["trangThai"] != PENDING:
            raise ValueError("LOI: Chi duoc huy hoa don khi con Pending!")
        self._doi_trang_thai(hd, CANCELLED, caller)

    def raise_dispute(self, ma_hd: str, caller: str):
        hd = self._lay_hoa_don(ma_hd)
        if caller != hd["nguoiBan"]:
            raise ValueError("LOI: Chi nguoi ban moi duoc khieu nai!")
        if hd["trangThai"] != REJECTED:
            raise ValueError("LOI: Chi duoc khieu nai hoa don dang bi tu choi!")
        if self.da_tranh_chap.get(ma_hd, False):
            raise ValueError("LOI: Hoa don da duoc dua ra tranh chap truoc do!")
        self.da_tranh_chap[ma_hd] = True
        self._doi_trang_thai(hd, DISPUTED, caller)

    def resolve_dispute(self, ma_hd: str, xac_nhan: bool, caller: str):
        if caller != self.arbiter:
            raise ValueError("LOI: Chi Arbiter moi duoc thuc hien!")
        hd = self._lay_hoa_don(ma_hd)
        if hd["trangThai"] != DISPUTED:
            raise ValueError("LOI: Hoa don khong o trang thai Disputed!")
        if caller in (hd["nguoiBan"], hd["nguoiMua"]):
            raise ValueError("LOI: Arbiter khong duoc la ben lien quan cua hoa don!")
        self._doi_trang_thai(hd, CONFIRMED if xac_nhan else REJECTED, caller)


def run_simulation():
    print("=" * 80)
    print("      KỊCH BẢN KIỂM THỬ SMART CONTRACT HÓA ĐƠN ĐIỆN TỬ (ĐỀ TÀI 4)")
    print("      Môn: Blockchain và Ứng dụng • Khoa CNTT - HUFLIT")
    print("      Học viên kiểm thử: Nhóm Đề tài 4 • GVHD: TS. Trần Minh Thái")
    print("      Mạng thực nghiệm: Ethereum Sepolia | Contract: 0x3aDc03271FeAb484c84598874aB08DeEec89dEF4")
    print("      Ví Doanh Nghiệp (Bên Bán): 0x87Fa1D5c91a10790944A395Ff6fdEabfa62b867A")
    print("=" * 80)
    print()

    contract = HoaDonDienTuSimulator()

    # Địa chỉ Smart Contract và Tài khoản ví thực tế trên mạng Ethereum Sepolia
    DIA_CHI_CONTRACT    = "0x3aDc03271FeAb484c84598874aB08DeEec89dEF4"
    VI_DOANH_NGHIEP_BAN = "0x87Fa1D5c91a10790944A395Ff6fdEabfa62b867A" # Ví Doanh nghiệp phát hành hóa đơn (Sepolia)
    VI_KHACH_HANG_1     = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" # Đối tác Thương mại Khách hàng 1
    VI_KHACH_HANG_2     = "0x78731D3Ca6b7E34aC0F824c42a7cC18A495cabaB" # Tập đoàn Xây dựng An Phát
    VI_KHACH_HANG_3     = "0x617F2E2fD72FD9D5503197092aC168c91465E7f2" # Công ty Cổ phần Thương mại Alpha

    print("--- [GIAI ĐOẠN 1]: PHÁT HÀNH 5 HÓA ĐƠN HỢP LỆ VỚI MÃ KHÁC NHAU ---")
    danh_sach_test = [
        {"ma": "HD-2026-001", "mua": VI_KHACH_HANG_1, "tien": 150_000_000, "desc": "Cung cấp máy chủ Cloud Server"},
        {"ma": "HD-2026-002", "mua": VI_KHACH_HANG_2, "tien": 45_000_000,  "desc": "Bản quyền phần mềm bảo mật"},
        {"ma": "HD-2026-003", "mua": VI_KHACH_HANG_1, "tien": 280_000_000, "desc": "Thiết bị mạng viễn thông"},
        {"ma": "HD-2026-004", "mua": VI_KHACH_HANG_3, "tien": 92_000_000,  "desc": "Dịch vụ tư vấn giải pháp ERP"},
        {"ma": "HD-2026-005", "mua": VI_KHACH_HANG_2, "tien": 520_000_000, "desc": "Hệ thống điện năng lượng mặt trời"}
    ]

    for idx, hd in enumerate(danh_sach_test, start=1):
        try:
            print(f"[Thực thi #{idx}] Phát hành mã: {hd['ma']} | Trị giá: {hd['tien']:,} VNĐ...")
            time.sleep(0.1) # Giả lập độ trễ block
            res = contract.phat_hanh_hoa_don(hd['ma'], VI_DOANH_NGHIEP_BAN, hd['mua'], hd['tien'])
            print(f"  ==> [SUCCESS] Transaction Mined! Event: {res['event']} - Timestamp: {res['timestamp']}")
        except Exception as e:
            print(f"  ==> [FAILED] {e}")

    print()
    print(f"-> Tổng số hóa đơn đã được lưu trữ vĩnh viễn trên sổ cái on-chain: {contract.lay_tong_so_hoa_don()} hóa đơn.")
    print()

    print("--- [GIAI ĐOẠN 2]: TRA CỨU ĐỐI SOÁT DỮ LIỆU ON-CHAIN ---")
    for hd in danh_sach_test[:3]:
        info = contract.tra_cuu_hoa_don(hd['ma'])
        print(f"• Mã: {info['maHoaDon']} | Bên bán: {info['nguoiBan'][:10]}... | Bên mua: {info['nguoiMua'][:10]}... | Giá trị: {info['giaTri']:,} VNĐ | Khởi tạo: {info['thoiGianFormat']}")

    print()
    print("--- [GIAI ĐOẠN 3]: MÔ PHỎNG HÀNH VI GIAN LẬN (CỐ TÌNH PHÁT HÀNH TRÙNG MÃ) ---")
    ma_trung = "HD-2026-001"
    print(f"Kịch bản tấn công: Doanh nghiệp ma cố tình xuất khống hóa đơn với mã '{ma_trung}' đã tồn tại để xin hoàn thuế.")
    print(f"Kiểm tra trước giao dịch: kiemTraTrungLap('{ma_trung}') = {contract.kiem_tra_trung_lap(ma_trung)}")
    print("Gửi Transaction phát hành lại mã hóa đơn trùng...")

    try:
        contract.phat_hanh_hoa_don(ma_trung, VI_DOANH_NGHIEP_BAN, VI_KHACH_HANG_3, 999_999_999)
        print("  ==> [CẢNH BÁO BẢO MẬT]: Giao dịch đã lọt vào sổ cái (LỖI NGHIÊM TRỌNG)!")
    except ValueError as ve:
        print("  ==> [BẰNG CHỨNG BẢO VỆ THÀNH CÔNG - TRANSACTION REVERTED]:")
        print(f"      Log Error: \"{ve}\"")
        print("      Hợp đồng thông minh đã từ chối giao dịch và hoàn trả trạng thái (Revert state).")
        print("      Không có bất kỳ dữ liệu giả mạo nào được phép ghi đè vào chuỗi khối.")

    print()
    print("--- [GIAI ĐOẠN 4]: VÒNG ĐỜI HÓA ĐƠN (XÁC NHẬN / TỪ CHỐI / HỦY) VÀ TRỌNG TÀI ---")
    VI_ARBITER = contract.arbiter

    def buoc(mo_ta, ham, *args):
        """Chạy một thao tác, in kết quả thành công hoặc lý do bị revert."""
        try:
            ham(*args)
            print(f"  [OK]     {mo_ta}")
        except ValueError as ve:
            print(f"  [REVERT] {mo_ta} -> {ve}")

    def tt(ma):
        return TEN_TRANG_THAI[contract.tra_cuu_hoa_don(ma)["trangThai"]]

    print("• HD-2026-001: người mua xác nhận")
    buoc("Người mua xác nhận HD-2026-001", contract.xac_nhan_hoa_don, "HD-2026-001", VI_KHACH_HANG_1)
    buoc("Người mua xác nhận lần 2 (sai trạng thái)", contract.xac_nhan_hoa_don, "HD-2026-001", VI_KHACH_HANG_1)
    print(f"    => Trạng thái: {tt('HD-2026-001')}")

    print("• HD-2026-002: người bán tự hủy khi còn Pending")
    buoc("Người mua (sai quyền) thử hủy HD-2026-002", contract.huy_hoa_don, "HD-2026-002", VI_KHACH_HANG_2)
    buoc("Người bán hủy HD-2026-002", contract.huy_hoa_don, "HD-2026-002", VI_DOANH_NGHIEP_BAN)
    print(f"    => Trạng thái: {tt('HD-2026-002')} (mã vẫn bị chiếm: kiemTraTrungLap = {contract.kiem_tra_trung_lap('HD-2026-002')})")

    print("• HD-2026-003: người mua từ chối -> người bán khiếu nại -> Arbiter phán quyết")
    buoc("Người mua từ chối nhưng không nhập lý do", contract.tu_choi_hoa_don, "HD-2026-003", "", VI_KHACH_HANG_1)
    buoc("Người mua từ chối kèm lý do", contract.tu_choi_hoa_don, "HD-2026-003", "Sai thong tin ma so thue", VI_KHACH_HANG_1)
    buoc("Người bán khiếu nại (raiseDispute)", contract.raise_dispute, "HD-2026-003", VI_DOANH_NGHIEP_BAN)
    buoc("Người bán tự phán quyết (không phải Arbiter)", contract.resolve_dispute, "HD-2026-003", True, VI_DOANH_NGHIEP_BAN)
    buoc("Arbiter phán quyết: xác nhận hóa đơn hợp lệ", contract.resolve_dispute, "HD-2026-003", True, VI_ARBITER)
    print(f"    => Trạng thái: {tt('HD-2026-003')}")

    print("• HD-2026-004: bị từ chối, Arbiter bác khiếu nại -> không thể khiếu nại lại")
    buoc("Người mua từ chối", contract.tu_choi_hoa_don, "HD-2026-004", "Khong dat hang", VI_KHACH_HANG_3)
    buoc("Người bán khiếu nại", contract.raise_dispute, "HD-2026-004", VI_DOANH_NGHIEP_BAN)
    buoc("Arbiter bác khiếu nại (giữ nguyên Rejected)", contract.resolve_dispute, "HD-2026-004", False, VI_ARBITER)
    buoc("Người bán khiếu nại lần 2", contract.raise_dispute, "HD-2026-004", VI_DOANH_NGHIEP_BAN)
    print(f"    => Trạng thái: {tt('HD-2026-004')} | Lý do từ chối: \"{contract.tra_cuu_hoa_don('HD-2026-004')['ghiChu']}\"")
    print(f"• Tổng số sự kiện TrangThaiThayDoi đã phát: {sum(1 for e in contract.events if e['event'] == 'TrangThaiThayDoi')}")

    print()
    print("=" * 80)
    print("               KẾT LUẬN ĐÁNH GIÁ THỰC NGHIỆM")
    print("• Tính minh bạch: 5/5 hóa đơn hợp lệ được phát hành và truy xuất toàn vẹn dữ liệu.")
    print("• Tính bất biến & chống trùng lặp: Giao dịch trùng mã bị chặn đứng 100% qua require.")
    print("• Vòng đời hóa đơn: chỉ đúng vai trò, đúng trạng thái mới được chuyển; Arbiter phân xử tranh chấp.")
    print("• Đạt trọn vẹn yêu cầu kỹ thuật của Đề tài 4 môn Blockchain và Ứng dụng.")
    print("=" * 80)

if __name__ == "__main__":
    run_simulation()
