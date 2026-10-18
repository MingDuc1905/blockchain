# Quy Chuẩn Hoạt Động Của Agent (Workspace Rules)
# Môn Học: Blockchain và Ứng Dụng — Đề Tài 4: Hóa Đơn Điện Tử Chống Gian Lận Thuế
# Trường: Đại học Ngoại ngữ - Tin học TP. Hồ Chí Minh (HUFLIT) — Khoa Công Nghệ Thông Tin
# Giảng viên hướng dẫn: TS. Trần Minh Thái

## 1. KỶ LUẬT CƯỠNG CHẾ Ở PHÍA AGENT (BẮT BUỘC TUÂN THỦ TUYỆT ĐỐI)
1. **DỪNG LẠI XIN DUYỆT TRƯỚC KHI SỬA FILE:**
   - Khi lên Plan hoặc có điều chỉnh lớn, Agent BẮT BUỘC dừng lại và KHÔNG ĐƯỢC chạm vào bất kỳ file nào cho tới khi người dùng gửi tin nhắn xác nhận chính thức hoặc bấm duyệt (Proceed) trên giao diện.
2. **CẤM TỰ Ý AUTO PROCEED:**
   - Dù trong tin nhắn người dùng có chứa các từ như "ok", "được", "làm đi" nếu có kèm theo yêu cầu/góp ý mới hoặc điều chỉnh hướng đi, Agent coi đó là phản hồi điều chỉnh yêu cầu. Agent BẮT BUỘC phải cập nhật lại Plan và DỪNG LẠI hỏi xác nhận, TUYỆT ĐỐI KHÔNG ĐƯỢC tự ý nhảy vào sửa code/tài liệu.
3. **KỶ LUẬT MINH BẠCH & LIỆT KÊ CHUỖI SKILLS:**
   - **Khai báo đầu phản hồi:** Bắt buộc bắt đầu bằng dòng:  
     `▶ Đang dùng chuỗi skill: writing-plans | project-rules | project-skill-map | secure-code-audit | test-driven-development | systematic-debugging | ponytail | ponytail-review | verification-before-completion | receiving-code-review`
   - Mọi hành động viết code, kiểm thử, phân tích, định dạng tài liệu phải bám sát chỉ dẫn của các skill tương ứng.
4. **CẤM HARDCODE & GIẢ LẬP LOG KIỂM THỬ:**
   - Mọi kết quả kiểm thử Smart Contract, kịch bản revert on-chain và giao dịch Sepolia phải được thực thi thật bằng mã nguồn Web3.py / EVM logic, không tạo log giả hay bịa đặt kết quả.

---

## 2. QUY CHUẨN KỸ THUẬT SMART CONTRACT (SOLIDITY)
- **Phiên bản trình biên dịch:** `pragma solidity ^0.8.20;`
- **Cấu trúc dữ liệu chuẩn (`struct HoaDon`):**
  - `maHoaDon` (string): Mã số định danh duy nhất của hóa đơn điện tử.
  - `nguoiBan` (address): Địa chỉ ví doanh nghiệp phát hành hóa đơn.
  - `nguoiMua` (address): Địa chỉ ví khách hàng / đơn vị mua hàng.
  - `giaTri` (uint256): Giá trị tiền tệ thanh toán của hóa đơn.
  - `thoiGianPhatHanh` (uint256): Timestamp ghi nhận hóa đơn vào khối blockchain.
- **Ràng buộc an toàn & Chống gian lận:**
  - Quản lý trạng thái bằng `mapping(string => HoaDon)` và `mapping(string => bool) daTonTai`.
  - Hàm `phatHanhHoaDon`: Bắt buộc kiểm tra `require(!daTonTai[_maHD], "LOI: Ma hoa don da ton tai tren he thong!");`.
  - Hàm `traCuuHoaDon`: Trả về đầy đủ thông tin hóa đơn phục vụ đối soát công khai.
  - Hàm `kiemTraTrungLap`: Trả về boolean phục vụ kiểm tra tức thời trước khi gửi transaction.
  - Phát sự kiện `emit HoaDonPhatHanh(...)` để các hệ thống kế toán / thuế lắng nghe sự kiện off-chain.

---

## 3. QUY CHUẨN BÁO CÁO ĐỒ ÁN WORD (`Mau bao cao Project.docx`)
- **Tuyệt đối tuân thủ 100% định dạng mẫu quy định của Khoa CNTT - HUFLIT:**
  - **Font chữ:** Times New Roman.
  - **Cỡ chữ:** 13 pt (Tiêu đề CHƯƠNG: 16 pt in hoa đậm; Mục chính: 14 pt in đậm; Mục con: 13 pt in thường).
  - **Giãn dòng:** 1.5 line.
  - **Căn lề:** Trái 2.0 cm, Trên/Dưới 2.5 cm, Phải 2.0 cm, Gutter 0.5 cm. Căn đều 2 lề (Justify).
  - **Cấu trúc bắt buộc:** Đầy đủ 5 Chương (1. Giới thiệu, 2. Cơ sở lý thuyết, 3. Phân tích & thiết kế, 4. Cài đặt & kết quả, 5. Kết luận).
  - **Tài liệu tham khảo:** Trích dẫn chuẩn IEEE.
  - **CẤM tự ý đổi font, đổi màu chữ, đổi style bảng biểu hay phá vỡ cấu trúc file mẫu gốc.**

---

## 4. QUY CHUẨN SLIDE POWERPOINT BÁO CÁO TIẾN ĐỘ GIỮA KỲ
- Sử dụng file template đại học chuẩn: `slides/Template_Goc/Template_Dai_Hoc_Giua_Ky.pptx`.
- Giữ nguyên bố cục đồ họa, chuyển ngữ và biên soạn đúng chuẩn 10 slide theo barem yêu cầu:
  1. Slide 1: Bìa Báo cáo Tiến độ Đồ án Giữa kỳ (Đề tài 4, GVHD: TS. Trần Minh Thái, Nhóm SV).
  2. Slide 2: Mục lục báo cáo (CONTENTS - 5 phần).
  3. Slide 3: Đặt vấn đề & Mục tiêu giải quyết nạn xuất khống hóa đơn.
  4. Slide 4: Tiến độ Báo cáo Đồ án (Các nội dung đã hoàn thành).
  5. Slide 5: Tự đánh giá Báo cáo Đồ án (Hình thức, tiêu chí đáp ứng, hạn chế & hướng khắc phục).
  6. Slide 6: Tiến độ Demo Ứng dụng (Phác thảo chức năng & Kiến trúc 3 tầng).
  7. Slide 7: Cài đặt Smart Contract Solidity (`HoaDonDienTu.sol`).
  8. Slide 8: Kết quả thử nghiệm (5 hóa đơn hợp lệ + 1 hóa đơn trùng mã bị revert chặn đứng).
  9. Slide 9: Phân công công việc giữa các thành viên (% khối lượng & đánh giá chất lượng).
  10. Slide 10: Kế hoạch giai đoạn tiếp theo (Nộp cuối kỳ) & Cảm ơn / Q&A.

---

## 5. CẤU TRÚC THƯ MỤC CHUẨN (WORKSPACE REPO)
```text
d:\block chain\
├── contracts/       # Smart Contract Solidity (.sol)
├── scripts/         # Kịch bản kiểm thử Web3.py & Deploy (.py)
├── docs/            # Tài liệu môn học & Báo cáo Word hoàn thiện (.docx)
├── slides/          # Slide PowerPoint thuyết trình hoàn thiện (.pptx)
├── AGENTS.md        # File quy chuẩn này
└── README.md        # Hướng dẫn vận hành đồ án
```
