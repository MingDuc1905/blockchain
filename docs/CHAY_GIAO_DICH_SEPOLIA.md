# Giao dịch hóa đơn thật bằng Python/Web3.py

Hai script ký giao dịch tại máy bằng private key, không cần giao diện web hay MetaMask.
Mặc định dùng contract của frontend React: `0xce2A4698BAcc6F108574B303cA5a633a5AF66B9C`.
Chỉ cho phép chain ID `11155111`. Ví ký cần có Sepolia ETH, kể cả giao dịch thất bại vẫn mất gas.

## Cài đặt (PowerShell, Python 3.10 trở lên)

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r scripts/requirements.txt
$env:SEPOLIA_RPC_URL = 'https://ethereum-sepolia-rpc.publicnode.com'
# Tùy chọn: thay bằng contract HoaDonDienTu đã triển khai của bạn
$env:CONTRACT_ADDRESS = '0xce2A4698BAcc6F108574B303cA5a633a5AF66B9C'

# Nhập khóa ví testnet tại máy; không dán khóa vào chat, file code hoặc lịch sử lệnh.
$secret = Read-Host 'Private key cua vi Sepolia' -AsSecureString
$env:SEPOLIA_PRIVATE_KEY = [System.Net.NetworkCredential]::new('', $secret).Password
```

Script đọc biến môi trường; không tự nạp file `.env`.

## 1. Tự phát hành một hóa đơn mới và đối soát

```powershell
.\.venv\Scripts\python.exe scripts/issue_invoice_sepolia.py --amount 1500000
```

Script tự sinh mã mới, mặc định ví mua là ví ký. Có thể chỉ định:

```powershell
.\.venv\Scripts\python.exe scripts/issue_invoice_sepolia.py --code HD-PY-DEMO-001 --buyer 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 --amount 1500000
```

Sau `receipt.status = 1`, script gọi `traCuuHoaDon` tại block của receipt, so sánh mã,
ví bán, ví mua, tổng tiền và thời gian phát hành với timestamp của block.
Gas limit mặc định cho phát hành mới là 1.000.000; phí thực tế tính theo gas đã dùng.

## 2. Gửi giao dịch trùng mã để Fail thật

Dùng đúng mã đã thành công ở bước 1 (hoặc mã đã tồn tại trong cùng contract):

```powershell
.\.venv\Scripts\python.exe scripts/duplicate_invoice_sepolia.py --code HD-PY-DEMO-001
```

Script kiểm tra mã đã tồn tại, rồi vẫn ký và gửi `phatHanhHoaDon` bằng
`eth_sendRawTransaction`. Gas limit được chỉ định rõ (mặc định 500000), nên không gọi
`eth_estimateGas` để tránh bị chặn trước khi gửi. Không gọi `.call()` trên hàm phát hành.
Các lệnh `.call()` chỉ đọc `kiemTraTrungLap` và `traCuuHoaDon` để kiểm tra/đối soát.

Điều kiện PASS: receipt thực có `status = 0`, không có event logs, gasUsed nhỏ hơn
gas limit và hóa đơn gốc không đổi. Receipt không chứa revert reason; script không
bịa thông báo lỗi EVM từ receipt. Việc quy lỗi cho trùng mã dựa trên điều kiện đầu vào
và logic của contract HoaDonDienTu; nếu đổi contract, cần bảo đảm contract đó đúng mã nguồn.

## Bằng chứng và xử lý lỗi

- Hash và link Etherscan in ngay khi gửi; file JSON nằm trong `artifacts/sepolia/`.
- JSON có chain, contract, mã hóa đơn, tx hash, trạng thái broadcast, receipt status,
  block hash/number, gas, phí thực tế và dữ liệu đối soát. Không lưu private key/raw transaction.
- Hash ở trạng thái `signed_not_broadcast` chưa phải bằng chứng đã lên mạng.
- Timeout trả exit code 2, không coi là Fail on-chain, không tự gửi lại.
  Kiểm tra tx hash trên Etherscan trước khi chạy lại để tránh gửi thêm giao dịch.
- PASS trả exit code 0 (bao gồm trường hợp duplicate thất bại đúng kỳ vọng);
  lỗi hoặc đối soát sai trả 1. Nếu lỗi đọc RPC sau khi mined, receipt đã được lưu.
- Kết quả dựa trên block đã mined, chưa chờ finality. Không chạy nhiều tiến trình
  cùng một ví cùng lúc vì có thể tranh nonce.
- `--timeout 300`, `--gas 800000`, `--output-dir ...` cho phép chỉnh khi cần.

Sau khi chạy xong:

```powershell
Remove-Item Env:SEPOLIA_PRIVATE_KEY
Remove-Variable secret
```

Luồng build → sign → send_raw_transaction theo [tài liệu Web3.py](https://web3py.readthedocs.io/en/v7.4.0/transactions.html).
