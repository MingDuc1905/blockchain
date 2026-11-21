# ĐỒ ÁN MÔN HỌC: BLOCKCHAIN VÀ ỨNG DỤNG
## ĐỀ TÀI 4: HÓA ĐƠN ĐIỆN TỬ CHỐNG GIAN LẬN THUẾ

---

##  Giới Thiệu Đề Tài
Đề tài nghiên cứu và ứng dụng công nghệ **Hợp đồng thông minh (Smart Contract)** trên nền tảng **Ethereum Virtual Machine (EVM)** nhằm giải quyết triệt để vấn nạn gian lận hóa đơn GTGT, mua bán hóa đơn khống của các doanh nghiệp "ma" và kê khai trùng lặp hóa đơn tại nhiều chi cục thuế.

### Các Tính Năng Nổi Bật:
1. **Tính Duy Nhất Tuyệt Đối:** Mã hóa đơn được kiểm tra độc nhất bằng bảng băm `mapping(string => bool)`. Mọi nỗ lực phát hành lại mã hóa đơn đã có lập tức bị máy ảo EVM kích hoạt `revert` từ chối giao dịch.
2. **Tính Bất Biến (Immutability):** Một khi hóa đơn đã được xác nhận vào block trên Sepolia Testnet, không bất kỳ cá nhân hay quản trị viên nào có thể sửa đổi hay tiêu hủy lén lút.
3. **Minh Bạch & Đối Soát Tức Thì:** Người bán, người mua và cơ quan thuế đều có thể tra cứu độc lập dữ liệu 24/7 trực tiếp từ sổ cái Blockchain.

4. **Vòng đời hóa đơn & Trọng tài (v2):** Hóa đơn đi qua các trạng thái `Pending → Confirmed / Rejected / Cancelled`. Người mua xác nhận hoặc từ chối (kèm lý do `ghiChu`), người bán chỉ được hủy khi còn `Pending`. Tranh chấp do **Arbiter** phân xử (`raiseDispute` / `resolveDispute`).

---

## 🔄 Vòng Đời Hóa Đơn (HoaDonDienTu v2)
```text
Pending ──xacNhanHoaDon (người mua)──────────────▶ Confirmed
Pending ──tuChoiHoaDon + ghiChu (người mua)──────▶ Rejected
Pending ──huyHoaDon (người bán)──────────────────▶ Cancelled
Rejected ─raiseDispute (người bán, tối đa 1 lần)─▶ Disputed
Disputed ─resolveDispute(true)  (Arbiter)────────▶ Confirmed
Disputed ─resolveDispute(false) (Arbiter)────────▶ Rejected (chốt)
```

| Hàm | Ai gọi | Điều kiện |
|---|---|---|
| `phatHanhHoaDon(ma, nguoiMua, giaTri)` | Người bán | Mã chưa tồn tại, người mua ≠ người bán, giá trị > 0 → `Pending` |
| `xacNhanHoaDon(ma)` | Người mua | Đang `Pending` |
| `tuChoiHoaDon(ma, ghiChu)` | Người mua | Đang `Pending`, `ghiChu` không rỗng (≤ 500 byte) |
| `huyHoaDon(ma)` | Người bán | Đang `Pending` |
| `raiseDispute(ma)` | Người bán | Đang `Rejected`, chưa từng tranh chấp |
| `resolveDispute(ma, xacNhan)` | Arbiter | Đang `Disputed`; Arbiter không được là bên bán/mua của hóa đơn đó |
| `setArbiter(addr)` | Owner | Đổi Arbiter |

Mã hóa đơn bị hủy hoặc từ chối **vẫn bị chiếm vĩnh viễn**, không thể phát hành lại với cùng mã. Mỗi lần đổi trạng thái đều phát sự kiện `TrangThaiThayDoi`.

---

## 🌐 Hợp Đồng v2 Đã Triển Khai (Sepolia)
| Thông tin | Giá trị |
|---|---|
| Địa chỉ contract | [`0x3aDc03271FeAb484c84598874aB08DeEec89dEF4`](https://sepolia.etherscan.io/address/0x3aDc03271FeAb484c84598874aB08DeEec89dEF4#code) |
| Giao dịch deploy | [`0x5bbec9ed…792545`](https://sepolia.etherscan.io/tx/0x5bbec9ed523ad88fce56a7feb0f52d3e4ec21f227079486178a6166639792545) |
| Block triển khai | 12179409 |
| Arbiter | `0x91cefCa1e311260fA8aBfC13257572b75b538387` |
| Compiler | solc 0.8.20 · optimizer 200 runs · EVM shanghai · MIT |

Bytecode on-chain khớp tuyệt đối với bytecode biên dịch từ `contracts/HoaDonDienTu.sol`; metadata trong bytecode xác nhận compiler thật là solc 0.8.20. Verify source trên Etherscan: `npm run verify:sepolia`.

---

## 🖥️ Giao Diện Web (frontend/ - React + Vite)
```bash
cd frontend
npm install
npm run dev
```
Tab **Tra Cứu** hiển thị trạng thái hóa đơn và các nút thao tác theo ví MetaMask đang kết nối:

| Ví đang kết nối | Trạng thái hóa đơn | Nút hiển thị |
|---|---|---|
| Người mua | Pending | Xác nhận hóa đơn · Từ chối (bắt buộc nhập lý do, ≤ 500 byte) |
| Người bán | Pending | Hủy hóa đơn |
| Người bán | Rejected (chưa tranh chấp) | Khiếu nại (Tranh chấp) |
| Arbiter | Disputed | Phán quyết: Xác nhận hợp lệ · Phán quyết: Bác bỏ |

Mỗi thao tác đều qua bước xác nhận, ký bằng MetaMask rồi tự đọc lại trạng thái từ blockchain. Quyền được Smart Contract kiểm tra lại, giao diện chỉ ẩn/hiện nút cho phù hợp. Tab **Sổ Cái** có thêm cột Trạng thái và bộ lọc theo trạng thái; "Doanh Thu On-Chain" chỉ tính hóa đơn đã xác nhận. Bản `app/` (HTML thuần) chưa được nâng cấp.

---

## 📁 Cấu Trúc Thư Mục Đồ Án
```text
d:\block chain\
├── contracts/
│   └── HoaDonDienTu.sol                 # Smart Contract Solidity 0.8.20 (v2: trạng thái + Arbiter)
├── test/
│   ├── HoaDonDienTu.test.js             # 34 test Hardhat: vòng đời, phân quyền, Arbiter
│   └── metadata.test.js                 # Test giải mã metadata bytecode (xác định compiler)
├── hardhat.config.js                    # solc 0.8.20, optimizer 200 runs, EVM shanghai
├── package.json / .env.example          # Phụ thuộc Hardhat và mẫu biến môi trường
├── scripts/
│   ├── deploy.js                        # Deploy lên Sepolia (truyền địa chỉ Arbiter)
│   ├── check_bytecode.js                # Giải mã metadata + so khớp bytecode on-chain
│   ├── verify.js                        # Verify source trên Etherscan
│   ├── sync_config.js                   # Đồng bộ ABI + địa chỉ vào frontend/ và app/
│   ├── demo_hoadon.py                   # Mô phỏng Python: 5 HĐ + trùng mã + vòng đời/Arbiter
│   ├── Demo_HoaDon_DienTu.ipynb         # Jupyter Notebook mô phỏng có sẵn kết quả (bản v1)
│   └── deploy_sepolia.py                # In hướng dẫn triển khai mạng Sepolia Testnet
├── docs/
│   ├── images/                          # Sơ đồ kiến trúc & tuần tự đen trắng 300 DPI
│   └── Yeu_Cau_Bao_Cao_Giua_Ky.txt      # Barem yêu cầu báo cáo tiến độ giữa kỳ
├── AGENTS.md                            # Quy chuẩn vận hành môn học Blockchain
└── README.md                            # Tài liệu này
```

---

## 🧪 Kiểm Thử Hợp Đồng Trên EVM (Hardhat)
```bash
npm install
npm test            # 35 test (nếu mạng chặn tải solc: đặt USE_SOLCJS=1 rồi chạy lại)
```
Triển khai, kiểm tra bytecode và verify trên Sepolia: xem [docs/HUONG_DAN_DEPLOY_SEPOLIA.md](docs/HUONG_DAN_DEPLOY_SEPOLIA.md).

---

##  Hướng Dẫn Chạy Kiểm Thử Mô Phỏng (Local Demo)
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
