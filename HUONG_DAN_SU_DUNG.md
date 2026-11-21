# HƯỚNG DẪN SỬ DỤNG VÀ CHẠY THỬ

Hệ thống **Hóa đơn điện tử chống gian lận thuế** (Blockchain và Ứng dụng - Đề tài 4) gồm:

- **Smart Contract `HoaDonDienTu` (v2)** trên mạng thử nghiệm **Ethereum Sepolia**: phát hành hóa đơn với mã duy nhất, vòng đời `Pending → Confirmed / Rejected / Cancelled`, khiếu nại và Trọng tài (Arbiter) phân xử.
- **Giao diện web React** (`frontend/`) kết nối ví MetaMask để phát hành, tra cứu và thao tác hóa đơn.
- **Bộ kiểm thử Hardhat** và các **script deploy / verify** (thư mục gốc và `scripts/`).

Tài liệu này giúp bạn chạy thử thành công trên máy của mình, **không cần dùng khóa hay file `.env` của tác giả**.

---

## 1. Chọn cách chạy thử

| Cách | Cần gì | Thử được gì |
|---|---|---|
| **A. Kiểm thử tự động (không cần ví)** | Chỉ cần Node.js | 35 test chạy trên mạng giả lập: toàn bộ vòng đời, phân quyền, Arbiter |
| **B. Dùng web với contract có sẵn** | MetaMask + Sepolia ETH | Tra cứu hóa đơn, lập hóa đơn, xác nhận, từ chối, hủy, khiếu nại |
| **C. Tự deploy contract riêng (đầy đủ nhất)** | MetaMask + 3 ví + Sepolia ETH | Thử **cả phán quyết của Arbiter**, vì bạn nắm khóa của Arbiter |

> Contract có sẵn (cách B) có Arbiter là ví của tác giả, nên bạn **không phán quyết được tranh chấp** ở cách này. Muốn thử trọn vẹn, hãy làm cách C.

---

## 2. Chuẩn bị chung

### 2.1. Cài đặt

| Phần mềm | Phiên bản | Ghi chú |
|---|---|---|
| Node.js | **22 LTS** (tối thiểu 20.19) | Tải tại https://nodejs.org. Giao diện dùng Vite 8 nên Node thấp hơn 20.19 sẽ lỗi |
| Git | bất kỳ | Để clone mã nguồn |
| Python 3 | 3.9 trở lên | Chỉ cần nếu chạy `demo_hoadon.py` |
| MetaMask | bản mới | Tiện ích trình duyệt Chrome / Edge / Cốc Cốc, cần cho cách B và C |

Kiểm tra: `node -v` và `git --version`.

### 2.2. Lấy mã nguồn

```bash
git clone https://github.com/baoketban123/blockchain.git
cd blockchain
# Nếu thay đổi chưa được merge vào main, chuyển sang nhánh tính năng:
# git checkout feature/invoice-lifecycle-arbiter
```

### 2.3. Cài thư viện (hai lần, vì có hai dự án Node)

```bash
npm install                 # ở thư mục gốc: Hardhat, test, script deploy
cd frontend
npm install                 # giao diện web
cd ..
```

---

## 3. Cách A - Chạy kiểm thử tự động

```bash
npm test
```

Kết quả mong đợi: `35 passing`. Các test kiểm tra các điều sau:

- đường chuyển trạng thái hợp lệ: xác nhận, từ chối kèm lý do, hủy, khiếu nại, phán quyết;
- sai quyền (ví không phải người mua, người bán hay Arbiter);
- sai trạng thái (hủy hóa đơn đã xác nhận, khiếu nại lần 2...);
- mã hóa đơn bị hủy vẫn bị chiếm, không phát hành lại được;
- giải mã metadata bytecode để xác định compiler (`solc 0.8.20`).

**Nếu lỗi tải trình biên dịch** (mạng chặn, có chữ `HH502` hoặc `Couldn't download compiler`), dùng gói `solc` có sẵn trong `node_modules`:

```powershell
# PowerShell
$env:USE_SOLCJS=1; npm test
```
```cmd
:: CMD
set USE_SOLCJS=1 && npm test
```
```bash
# macOS / Linux
USE_SOLCJS=1 npm test
```

Mô phỏng nhanh bằng Python (không cần blockchain):

```bash
python scripts/demo_hoadon.py
```

---

## 4. Chuẩn bị ví MetaMask (cho cách B và C)

### 4.1. Chuyển sang mạng Sepolia

MetaMask → chọn mạng ở góc trên → bật **Show test networks** → chọn **Sepolia**.
(Web cũng tự đề nghị thêm hoặc chuyển sang Sepolia khi bạn kết nối ví.)

### 4.2. Tạo 3 tài khoản (ví) để đóng 3 vai

Trong MetaMask bấm vào tên tài khoản → **Add account or hardware wallet** → **Add a new account**. Đặt tên cho dễ nhớ:

| Tài khoản | Vai trò | Dùng để |
|---|---|---|
| **Ví Bán** | Người bán | Lập hóa đơn, hủy, khiếu nại |
| **Ví Mua** | Người mua | Xác nhận, từ chối hóa đơn |
| **Ví Trọng tài** | Arbiter | Phán quyết tranh chấp (chỉ ở cách C) |

Sao chép địa chỉ từng ví (dạng `0x...`) vào một file ghi chú tạm.

### 4.3. Lấy Sepolia ETH miễn phí (để trả phí gas)

Mỗi ví cần khoảng **0.01 ETH Sepolia** (ví dùng để deploy ở cách C cần khoảng **0.05**). Nhận tại các faucet:

- Google Cloud Web3 Faucet: https://cloud.google.com/application/web3/faucet/ethereum/sepolia
- Alchemy Sepolia Faucet: https://sepoliafaucet.com/
- Infura Sepolia Faucet: https://www.infura.io/faucet/sepolia

Hoặc chuyển ETH từ ví này sang ví kia sau khi một ví đã nhận được từ faucet.

> Chỉ dùng **ví thử nghiệm**. Không dùng ví chứa tài sản thật cho đồ án này.

---

## 5. Cách B - Dùng web với contract có sẵn

### 5.1. Chạy web

```bash
cd frontend
npm run dev
```

Mở địa chỉ hiện trên màn hình, thường là **http://localhost:5173**.

Web đọc dữ liệu qua RPC công khai nên **tra cứu được ngay mà không cần ví**. Muốn ghi dữ liệu (lập, xác nhận, từ chối...) thì bấm nút **Kết Nối MetaMask** ở góc trên.

### 5.2. Kịch bản thử

Contract có sẵn: `0x3aDc03271FeAb484c84598874aB08DeEec89dEF4` (xem tại https://sepolia.etherscan.io/address/0x3aDc03271FeAb484c84598874aB08DeEec89dEF4).

**Kịch bản 1: hóa đơn được xác nhận**
1. Trong MetaMask chọn **Ví Bán**, kết nối web.
2. Mở tab **Phát Hành Hóa Đơn** (thanh bên trái): nhập mã (ví dụ `DEMO-001`, **mã phải chưa từng dùng**), dán địa chỉ **Ví Mua** vào ô người mua, nhập giá trị, bấm **Ký Số & Phát Hành Lên Sepolia Blockchain**, xác nhận trong MetaMask.
3. Mở tab **Tra Cứu & Xác Thực**: nhập `DEMO-001` → trạng thái **Chờ xác nhận**. Người bán lúc này chỉ thấy nút **Hủy hóa đơn**.
4. Trong MetaMask chuyển sang **Ví Mua** (nếu web chưa tự cập nhật, bấm kết nối lại). Tra cứu `DEMO-001` → bấm **Xác nhận hóa đơn** → **Ký & Gửi giao dịch**.
5. Trạng thái chuyển thành **Đã xác nhận** và không thể thay đổi nữa.

**Kịch bản 2: hóa đơn bị từ chối và khiếu nại**
1. Lập hóa đơn `DEMO-002` bằng **Ví Bán** như trên.
2. Chuyển sang **Ví Mua** → **Từ chối**, nhập lý do (bắt buộc, tối đa 500 byte) → ký.
3. Chuyển lại **Ví Bán** → hóa đơn **Bị từ chối** kèm lý do → bấm **Khiếu nại (Tranh chấp)** → ký.
4. Hóa đơn chuyển sang **Đang tranh chấp**, chờ Trọng tài (xem cách C để phán quyết).

**Kịch bản 3: hủy hóa đơn**
1. Lập hóa đơn `DEMO-003` bằng **Ví Bán**, rồi bấm **Hủy hóa đơn** khi còn *Chờ xác nhận*.
2. Thử lập lại mã `DEMO-003`: contract **từ chối** vì mã đã bị chiếm vĩnh viễn (đây là cơ chế chống gian lận cốt lõi).

**Kịch bản 4: kiểm tra phân quyền**
Dùng ví không liên quan (hoặc sai vai) và để ý các nút: web chỉ hiện nút phù hợp với vai trò của ví, và Smart Contract vẫn kiểm tra lại quyền ở phía chuỗi khối.

---

## 6. Cách C - Tự deploy contract riêng (thử cả Trọng tài)

### 6.1. Tạo file `.env`

Ở thư mục gốc của repo:

```bash
copy .env.example .env        # Windows CMD
cp .env.example .env          # macOS / Linux / Git Bash
```

Mở `.env` và điền:

```ini
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
PRIVATE_KEY=<private key của ví dùng để deploy>
ARBITER_ADDRESS=<địa chỉ 0x... của Ví Trọng tài>
ETHERSCAN_API_KEY=<API key Etherscan, chỉ cần cho bước verify>
```

- **Lấy private key trong MetaMask**: ba chấm cạnh tài khoản → **Account details** → **Show private key**. Chỉ dùng ví thử nghiệm, và **không bao giờ chia sẻ hay commit `.env`** (file này đã nằm trong `.gitignore`).
- Ví deploy cần có Sepolia ETH. Nên dùng **một ví riêng** (hoặc chính Ví Bán), khác với Ví Trọng tài.
- `ETHERSCAN_API_KEY`: đăng ký miễn phí tại https://etherscan.io/myapikey (một key dùng cho mọi chain).

### 6.2. Deploy → kiểm tra → verify → đồng bộ web

```bash
npm run deploy:sepolia        # deploy, ghi địa chỉ/tx/block vào deployments/sepolia.json
npm run check:bytecode        # xác nhận bytecode on-chain khớp mã nguồn + đọc compiler thật
npm run verify:sepolia        # verify mã nguồn trên Etherscan
node scripts/sync_config.js   # cập nhật ABI + địa chỉ vào frontend/ và app/
```

Kết quả mong đợi:
- Sau `deploy`: in ra địa chỉ contract, số block và đường dẫn Etherscan.
- Sau `check:bytecode`: `Compiler ON-CHAIN (solc): 0.8.20` và `Toàn bộ bytecode khớp: CÓ`.
- Sau `verify`: liên kết Etherscan tab **Code** có tích xanh *Contract Source Code Verified*.

> Sau khi chạy `sync_config.js`, **dừng và chạy lại** `npm run dev` trong `frontend/` để web dùng contract mới.
> `sync_config.js` sửa file trong `frontend/`, `app/` và `scripts/*.py`. Nếu bạn dùng chung repo, hãy làm trên nhánh hoặc fork riêng để không ghi đè địa chỉ của người khác.

### 6.3. Thử phán quyết của Trọng tài

1. Làm lại **Kịch bản 2** ở mục 5.2 (lập → từ chối → khiếu nại) trên contract mới của bạn.
2. Trong MetaMask chuyển sang **Ví Trọng tài** (đúng địa chỉ bạn điền ở `ARBITER_ADDRESS`).
3. Tra cứu hóa đơn đang **Đang tranh chấp** → chọn một trong hai:
   - **Phán quyết: Xác nhận hợp lệ** → hóa đơn thành **Đã xác nhận**.
   - **Phán quyết: Bác bỏ** → hóa đơn về **Bị từ chối** và **không thể khiếu nại lại**.

Ví Trọng tài phải khác ví bán và ví mua của hóa đơn đó (contract chặn xung đột lợi ích).

---

## 7. Sơ đồ trạng thái và quyền

```text
Pending ──Xác nhận (người mua)────────────▶ Confirmed
Pending ──Từ chối + lý do (người mua)─────▶ Rejected
Pending ──Hủy (người bán)─────────────────▶ Cancelled
Rejected ─Khiếu nại (người bán, 1 lần)────▶ Disputed
Disputed ─Phán quyết: xác nhận (Arbiter)──▶ Confirmed
Disputed ─Phán quyết: bác bỏ (Arbiter)────▶ Rejected (chốt)
```

| Ví | Pending | Rejected | Disputed |
|---|---|---|---|
| Người bán | Hủy | Khiếu nại (1 lần) | - |
| Người mua | Xác nhận / Từ chối | - | - |
| Arbiter | - | - | Phán quyết |

---

## 8. Xử lý lỗi thường gặp

| Hiện tượng | Nguyên nhân / Cách xử lý |
|---|---|
| `npm install` hoặc `npm run dev` báo lỗi phiên bản | Cập nhật Node lên 22 LTS (tối thiểu 20.19) |
| `HH502` / không tải được solc | Chạy lại với `USE_SOLCJS=1` (mục 3) |
| Web hiện "Chưa Sẵn Sàng" / không tải được sổ cái | RPC công khai có thể bị giới hạn hoặc chậm; chờ vài giây rồi bấm đồng bộ lại |
| MetaMask báo `insufficient funds` | Ví chưa đủ Sepolia ETH, xin thêm ở faucet (mục 4.3) |
| MetaMask sai mạng | Chuyển sang **Sepolia**; web sẽ tự đề nghị chuyển mạng |
| Lập hóa đơn báo "Mã đã tồn tại" | Mã chỉ dùng được một lần, kể cả đã hủy hoặc từ chối. Đổi mã khác |
| Báo "Người mua không được trùng người bán" | Ô người mua đang là chính ví đang kết nối. Dùng địa chỉ ví khác |
| Không thấy nút thao tác | Đang kết nối sai ví (không phải người mua / người bán / Arbiter), hoặc hóa đơn đã ở trạng thái cuối. Web hiển thị vai trò của ví đang kết nối |
| Đổi tài khoản MetaMask nhưng web chưa nhận | Bấm kết nối lại, hoặc tải lại trang |
| `deploy` báo thiếu `ARBITER_ADDRESS` / `PRIVATE_KEY` | Điền đủ trong `.env` (mục 6.1). Private key gồm 64 ký tự hex (có hoặc không có `0x` đều được), không thừa khoảng trắng |
| `verify` báo lỗi API key | Kiểm tra `ETHERSCAN_API_KEY`; chờ khoảng 30 giây sau khi deploy rồi thử lại |
| `check:bytecode` báo không khớp | Dùng đúng `solc 0.8.20`, optimizer 200 runs, EVM `shanghai` (đã cấu hình sẵn trong `hardhat.config.js`) |

---

## 9. Tóm tắt lệnh

| Mục đích | Lệnh |
|---|---|
| Cài thư viện | `npm install` (gốc) và `cd frontend && npm install` |
| Chạy test | `npm test` (hoặc `USE_SOLCJS=1 npm test`) |
| Biên dịch | `npm run compile` |
| Chạy web | `cd frontend && npm run dev` |
| Deploy Sepolia | `npm run deploy:sepolia` |
| Kiểm tra bytecode | `npm run check:bytecode` |
| Verify Etherscan | `npm run verify:sepolia` |
| Đồng bộ ABI/địa chỉ vào web | `node scripts/sync_config.js` |
| Mô phỏng Python | `python scripts/demo_hoadon.py` |

Tài liệu liên quan: [README.md](README.md) (tổng quan đề tài) và [docs/HUONG_DAN_DEPLOY_SEPOLIA.md](docs/HUONG_DAN_DEPLOY_SEPOLIA.md) (deploy bằng Remix).

> **Lưu ý bảo mật:** `PRIVATE_KEY` trong `.env` chỉ nằm trên máy bạn. Không gửi file này cho ai, không đưa lên GitHub, và chỉ dùng ví thử nghiệm.
