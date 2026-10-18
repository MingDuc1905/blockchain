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
2. Tại mục **Compiler**, chọn phiên bản: **`0.8.20`** (hoặc cao hơn như `0.8.24`).
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
4. Bấm nút **"Deploy"** (màu cam).
5. MetaMask sẽ bật lên cửa sổ xác nhận giao dịch:
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

## 🔗 CẬP NHẬT ĐỊA CHỈ HỢP ĐỒNG MỚI VÀO DỰ ÁN WEB
Sau khi có Contract Address mới, mở file [`frontend/src/utils/contract.js`](file:///d:/block%20chain/frontend/src/utils/contract.js) và thay thế dòng số 2:
```javascript
export const CONTRACT_CONFIG = {
  address: "ĐỊA_CHỈ_CONTRACT_MỚI_CỦA_BẠN", // Dán địa chỉ 0x... vừa deploy ở Bước 4 vào đây
  chainId: "0xaa36a7",
  chainIdDecimal: 11155111,
  chainName: "Sepolia Testnet",
  ...
```
Sau đó lưu file, giao diện web sẽ tự động kết nối và tương tác trực tiếp với hợp đồng mới do chính ví bạn triển khai!

