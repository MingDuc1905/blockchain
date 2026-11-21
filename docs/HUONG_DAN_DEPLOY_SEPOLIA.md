# HƯỚNG DẪN CHI TIẾT TRIỂN KHAI SMART CONTRACT LÊN ETHEREUM SEPOLIA TESTNET
**Môn học:** Blockchain và Ứng dụng • **Đề tài 4:** Hóa đơn điện tử chống gian lận thuế

---

## 📌 CHUẨN BỊ TRƯỚC KHI DEPLOY
1. **Trình duyệt:** Cốc Cốc hoặc Chrome đã cài tiện ích mở rộng **MetaMask**.
2. **Mạng trên MetaMask:** Chuyển sang mạng **Sepolia Testnet**.
   - Nếu chưa thấy mạng Sepolia: Mở MetaMask → Bấm vào chọn mạng ở góc trái trên → Bật *"Show test networks"* (Hiển thị mạng thử nghiệm) → Chọn **Sepolia**.
3. **Phí Gas (Sepolia ETH miễn phí):**
   - Ví cần có tối thiểu ~0.02 Sepolia ETH để trả phí gas đào block.
   - Các trang nhận Sepolia ETH miễn phí (Faucet):
     + **Google Cloud Web3 Faucet:** https://cloud.google.com/application/web3/faucet/ethereum/sepolia (Không cần tài khoản, nhận 0.05 ETH/ngày)
     + **Alchemy Sepolia Faucet:** https://sepoliafaucet.com/
     + **Infura Sepolia Faucet:** https://www.infura.io/faucet/sepolia

---

## 🚀 CÁC BƯỚC TRIỂN KHAI QUA REMIX ETHEREUM IDE

### Bước 1: Mở Remix IDE & Nạp Mã Nguồn
1. Truy cập vào trang web: **https://remix.ethereum.org/**
2. Ở cột bên trái (File Explorer), bấm vào thư mục `contracts` (hoặc bấm biểu tượng **New File** 📄).
3. Đặt tên file là: `HoaDonDienTu.sol`.
4. Mở file `contracts/HoaDonDienTu.sol` trong dự án của bạn, copy toàn bộ mã nguồn và dán vào Remix IDE.

### Bước 2: Biên Dịch (Compile) Hợp Đồng
1. Nhìn sang thanh công cụ bên trái của Remix, bấm vào biểu tượng **Solidity Compiler** (biểu tượng chữ 'S').
2. Tại mục **Compiler**, chọn phiên bản: **`0.8.20`** (đúng phiên bản trong `pragma solidity 0.8.20;`, không chọn bản khác). Mở **Advanced Configurations** → bật **Enable optimization = 200**, **EVM Version = shanghai**.
3. Bấm nút màu xanh **"Compile HoaDonDienTu.sol"**.
4. Khi biên dịch thành công, sẽ xuất hiện **dấu tích xanh (Green Checkmark)** ở biểu tượng compiler.

### Bước 3: Kết Nối Ví MetaMask & Deploy
1. Bấm vào biểu tượng **Deploy & Run Transactions** (biểu tượng mũi tên nhọn và hình thang) ở thanh bên trái Remix.
2. Tại mục **ENVIRONMENT**: Bấm vào menu thả xuống và chọn **`Injected Provider - MetaMask`**.
   - Cửa sổ MetaMask sẽ bật lên hỏi cho phép kết nối. Bấm **Next** rồi bấm **Connect**.
   - Khi kết nối thành công, bạn sẽ thấy:
     + Chữ: `Injected Provider - MetaMask`
     + Số tài khoản ví của bạn (VD: `0x...`) kèm số dư Sepolia ETH.
3. Tại mục **CONTRACT**: Chọn đúng tên hợp đồng là **`HoaDonDienTu - contracts/HoaDonDienTu.sol`**.
4. **(Phiên bản 2)** Constructor có 1 tham số: ô bên cạnh nút Deploy ghi `_ARBITER` → dán **địa chỉ ví Trọng tài** (ví độc lập, khác ví người bán/người mua). Ghi lại địa chỉ này, bước verify cần dùng.
5. Bấm nút **"Deploy"** (màu cam).
6. MetaMask sẽ bật lên cửa sổ xác nhận giao dịch:
   - Kiểm tra mạng: `Sepolia`
   - Bấm nút **"Confirm"** (Xác nhận).

### Bước 4: Lấy Địa Chỉ Hợp Đồng & Kiểm Tra On-Chain
1. Sau khoảng 10–15 giây, khi thợ đào Sepolia đóng khối, ở góc dưới bảng điều khiển Remix sẽ hiện thông báo giao dịch thành công (Dấu tích xanh).
2. Tại mục **Deployed Contracts** (góc dưới bên trái Remix):
   - Bạn sẽ thấy tên: `HOADONDIENTU AT 0x...`
   - Bấm vào biểu tượng **Copy** (hai hình chữ nhật chồng nhau) bên cạnh để sao chép địa chỉ hợp đồng (Contract Address).
3. Mở trang Etherscan Sepolia để kiểm tra:
   - Đường dẫn: **`https://sepolia.etherscan.io/address/<ĐỊA_CHỈ_VÍ_CONTRACT_VỪA_COPY>`**
   - Bạn sẽ thấy trạng thái `Contract Creation` với thông tin block thật trên Ethereum.

---

## ⚙️ CÁCH 2: DEPLOY + VERIFY TỰ ĐỘNG BẰNG HARDHAT (khuyên dùng cho phiên bản 2)

### Chuẩn bị
```bash
npm install                 # cài Hardhat, ethers, solc 0.8.20
copy .env.example .env      # (Windows)  hoặc: cp .env.example .env
```
Điền `.env`: `PRIVATE_KEY` (ví **testnet**), `ARBITER_ADDRESS`, `ETHERSCAN_API_KEY` (tạo tại https://etherscan.io/myapikey, một key dùng cho mọi chain). `.env` đã nằm trong `.gitignore`, **không commit**.

### Biên dịch & kiểm thử trước khi deploy
```bash
npm run compile
npm test                    # 35 test: vòng đời hóa đơn, phân quyền, Arbiter, giải mã metadata
```
Nếu mạng chặn việc tải trình biên dịch (lỗi `HH502`/không tải được solc), chạy kèm biến `USE_SOLCJS=1` (dùng gói npm `solc@0.8.20`, cùng phiên bản):
`set USE_SOLCJS=1 && npm test` (CMD) hoặc `$env:USE_SOLCJS=1; npm test` (PowerShell).

### Deploy lên Sepolia
```bash
npm run deploy:sepolia      # ghi địa chỉ, tx hash, block vào deployments/sepolia.json
```

### Kiểm tra bytecode & compiler thật (làm TRƯỚC khi verify nếu không chắc)
```bash
npm run check:bytecode
```
Script lấy bytecode đang chạy on-chain, giải mã phần metadata CBOR ở cuối để đọc **phiên bản solc thật**, rồi so sánh với bytecode biên dịch cục bộ. Kết quả mong đợi: `Compiler ON-CHAIN (solc): 0.8.20` và `Toàn bộ bytecode khớp: CÓ`.
Nếu báo `KHÔNG khớp`: dùng đúng phiên bản solc ở dòng "Compiler ON-CHAIN", đúng optimizer runs và EVM version rồi biên dịch lại.

### Verify source trên Etherscan
```bash
npm run verify:sepolia
```
Thông số verify (khớp `hardhat.config.js`): **Compiler `v0.8.20+commit.a1b79de6`**, **Optimization: Yes, 200 runs**, **EVM Version: shanghai**, **License: MIT**, **Constructor Arguments**: địa chỉ Arbiter (ABI-encode, đã lưu ở trường `constructorArgumentsAbiEncoded` trong `deployments/sepolia.json`).

Nếu verify thủ công trên giao diện Etherscan (Contract → Verify & Publish → *Solidity (Single file)*): dán nguyên nội dung `contracts/HoaDonDienTu.sol`, chọn đúng các thông số trên và dán chuỗi `constructorArgumentsAbiEncoded` vào ô *Constructor Arguments (ABI-encoded)*.

---

## 🔗 CẬP NHẬT ĐỊA CHỈ + ABI MỚI VÀO DỰ ÁN WEB
Phiên bản 2 đổi hàm `traCuuHoaDon` (thêm `trangThai`, `ghiChu`) và thêm hàm/sự kiện mới, nên **ABI cũ không còn khớp**. Sau khi deploy xong, chạy:
```bash
node scripts/sync_config.js
```
Script sẽ tự cập nhật ABI + địa chỉ + block triển khai trong `frontend/src/utils/contract.js` và `app/contract_info.js`, địa chỉ hiển thị trong `app/index.html`, và địa chỉ trong các script minh họa `scripts/*.py`. Nếu chỉ muốn cập nhật ABI: `node scripts/sync_config.js --abi-only`.

Sau đó chụp lại **ảnh thật** trang contract đã verify trên Sepolia Etherscan và các giao dịch đổi trạng thái để dùng làm Hình 4.2 trong báo cáo.

> Lưu ý: hợp đồng v1 cũ (`0xce2A…66B9C`, `0x358A…5eE3`) vẫn tồn tại trên Sepolia nhưng **không có** trạng thái/Arbiter; dữ liệu cũ không tự chuyển sang hợp đồng mới.
