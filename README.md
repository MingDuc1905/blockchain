# ĐỒ ÁN MÔN HỌC: BLOCKCHAIN VÀ ỨNG DỤNG
## ĐỀ TÀI 4: HÓA ĐƠN ĐIỆN TỬ CHỐNG GIAN LẬN THUẾ
**Trường:** Đại học Ngoại ngữ - Tin học TP. Hồ Chí Minh (HUFLIT)  
**Khoa:** Công nghệ Thông tin  
**Giảng viên hướng dẫn:** TS. Trần Minh Thái  
**Sinh viên thực hiện:**
- [Sinh viên 1 - Trưởng nhóm] — MSSV: `23DH00001`
- [Sinh viên 2 - Thành viên]   — MSSV: `23DH00002`
- [Sinh viên 3 - Thành viên]   — MSSV: `23DH00003`

---

## 🎯 Giới Thiệu Đề Tài
Đề tài nghiên cứu và ứng dụng công nghệ **Hợp đồng thông minh (Smart Contract)** trên nền tảng **Ethereum Virtual Machine (EVM)** nhằm giải quyết triệt để vấn nạn gian lận hóa đơn GTGT, mua bán hóa đơn khống của các doanh nghiệp "ma" và kê khai trùng lặp hóa đơn tại nhiều chi cục thuế.

### Các Tính Năng Nổi Bật:
1. **Tính Duy Nhất Tuyệt Đối:** Mã hóa đơn được kiểm tra độc nhất bằng bảng băm `mapping(string => bool)`. Mọi nỗ lực phát hành lại mã hóa đơn đã có lập tức bị máy ảo EVM kích hoạt `revert` từ chối giao dịch.
2. **Tính Bất Biến (Immutability):** Một khi hóa đơn đã được xác nhận vào block trên Sepolia Testnet, không bất kỳ cá nhân hay quản trị viên nào có thể sửa đổi hay tiêu hủy lén lút.
3. **Minh Bạch & Đối Soát Tức Thì:** Người bán, người mua và cơ quan thuế đều có thể tra cứu độc lập dữ liệu 24/7 trực tiếp từ sổ cái Blockchain.

---

## 📁 Cấu Trúc Thư Mục Đồ Án (Chuẩn Workspace)
```text
d:\block chain\
├── contracts/
│   └── HoaDonDienTu.sol                 # Smart Contract Solidity ^0.8.20
├── scripts/
│   ├── demo_hoadon.py                   # Script Python mô phỏng kiểm thử 5 HĐ hợp lệ + 1 HĐ bị revert
│   └── deploy_sepolia.py                # Hướng dẫn & script triển khai Sepolia Testnet
├── docs/
│   ├── Bao_Cao_Do_An_De_Tai_04.docx     # Báo cáo đồ án 5 chương hoàn thiện (chuẩn 100% mẫu của trường)
│   ├── Mau bao cao Project.docx         # File mẫu gốc của Khoa CNTT - HUFLIT
│   ├── Danh sach de tai 2026-2027.pdf   # Đề bài 30 đề tài môn học
│   ├── Huong dan trinh bay bao cao.pdf  # Quy chuẩn trình bày luận văn / đồ án
│   └── Yeu_Cau_Bao_Cao_Giua_Ky.txt      # Barem yêu cầu báo cáo tiến độ giữa kỳ
├── slides/
│   ├── 04_Bao_Cao_Tien_Do_Giua_Ky.pptx  # Slide PowerPoint 10 slide báo cáo giữa kỳ (chuẩn barem)
│   └── Template_Goc/                    # Thư mục lưu trữ các template gốc tham khảo
├── AGENTS.md                            # Quy chuẩn vận hành môn học Blockchain
└── README.md                            # Tài liệu này
```

---

## 🚀 Hướng Dẫn Chạy Kiểm Thử Mô Phỏng (Local Demo)
Mở Terminal tại thư mục `d:\block chain\` và chạy lệnh:
```bash
python scripts/demo_hoadon.py
```
**Kết quả kiểm thử đạt được:**
- **Kịch bản 1:** Phát hành thành công 5 hóa đơn độc lập (`HD-2026-001` đến `HD-2026-005`). Giao dịch được xác nhận (Success) và phát sự kiện `HoaDonPhatHanh`.
- **Kịch bản 2:** Thử phát hành lại mã `HD-2026-001` đã tồn tại ➔ Smart Contract kích hoạt điều kiện `require` và từ chối giao dịch với log:
  ```text
  [BẰNG CHỨNG BẢO VỆ THÀNH CÔNG - TRANSACTION REVERTED]:
  Log Error: "LOI: Ma hoa don 'HD-2026-001' da ton tai tren he thong!"
  ```

---

## 🌐 Hướng Dẫn Triển Khai Lên Mạng Ethereum Sepolia Testnet
Xem chi tiết trong file [scripts/deploy_sepolia.py](file:///d:/block%20chain/scripts/deploy_sepolia.py) hoặc thực hiện nhanh qua **Remix IDE**:
1. Mở trình duyệt truy cập: [Remix Ethereum IDE](https://remix.ethereum.org/).
2. Tạo file `HoaDonDienTu.sol` trong Remix và dán nội dung từ [contracts/HoaDonDienTu.sol](file:///d:/block%20chain/contracts/HoaDonDienTu.sol).
3. Biên dịch với Solidity Compiler `0.8.20`.
4. Kết nối ví MetaMask (mạng Sepolia) và bấm **Deploy**.
5. Nhận địa chỉ Contract Address và tra cứu trực tiếp trên [Sepolia Etherscan](https://sepolia.etherscan.io/).

---

## 📑 Báo Cáo & Slide Thuyết Trình
- **File Báo Cáo Word:** [docs/Bao_Cao_Do_An_De_Tai_04.docx](file:///d:/block%20chain/docs/Bao_Cao_Do_An_De_Tai_04.docx) được biên soạn nghiêm túc, đầy đủ 5 chương học thuật, giữ nguyên 100% định dạng Times New Roman 13 pt, giãn dòng 1.5 của mẫu trường.
- **File Slide PowerPoint:** [slides/04_Bao_Cao_Tien_Do_Giua_Ky.pptx](file:///d:/block%20chain/slides/04_Bao_Cao_Tien_Do_Giua_Ky.pptx) với đúng 10 slide theo barem yêu cầu (Tiến độ báo cáo đồ án, Tiến độ demo ứng dụng, Bảng phân công thành viên).
