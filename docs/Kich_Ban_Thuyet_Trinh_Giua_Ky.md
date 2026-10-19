# KỊCH BẢN THUYẾT TRÌNH BÁO CÁO TIẾN ĐỘ ĐỒ ÁN GIỮA KỲ
**Môn học:** Blockchain và Ứng dụng  
**Đề tài 4:** Hóa đơn điện tử chống gian lận thuế  
**GVHD:** TS. Trần Minh Thái — **Khoa:** Công nghệ Thông tin, Đại học Ngoại ngữ - Tin học TP.HCM (HUFLIT)  
**Thời lượng dự kiến:** 12 – 14 phút (Chuẩn khung quy định: 10 – 15 phút)  
**Link DApp Online (Vercel):** https://hoadondientu-blockchain.vercel.app  

---

## ⏱️ BẢNG PHÂN BỔ THỜI LƯỢNG 10 SLIDE

| Slide | Nội dung trình bày | Thời lượng | Người trình bày |
| :---: | :--- | :---: | :---: |
| **Slide 1** | Giới thiệu Đề tài, GVHD & Thành viên | 1.0 phút | Đại diện nhóm / Trưởng nhóm |
| **Slide 2** | Mục lục báo cáo (3 phần chính) | 0.5 phút | Trưởng nhóm |
| **Slide 3** | Đặt vấn đề & Mục tiêu đề tài | 2.0 phút | Thành viên 1 |
| **Slide 4** | Tiến độ Báo cáo Đồ án (Nội dung đã hoàn thành) | 1.5 phút | Thành viên 1 |
| **Slide 5** | Tự đánh giá Báo cáo Đồ án (Tiêu chí & Hạn chế) | 1.5 phút | Thành viên 2 |
| **Slide 6** | Tiến độ Xây dựng Demo & Kiến trúc 3 tầng | 2.0 phút | Thành viên 2 |
| **Slide 7** | Cài đặt Smart Contract Solidity (`HoaDonDienTu.sol`) | 2.0 phút | Thành viên 3 / Phụ trách Dev |
| **Slide 8** | Kết quả thử nghiệm (5 HĐ thành công + 1 HĐ bị Revert) | 2.0 phút | Thành viên 3 |
| **Slide 9** | Phân công công việc & Đánh giá chất lượng | 1.0 phút | Trưởng nhóm |
| **Slide 10**| Kế hoạch giai đoạn tiếp theo & Lời cảm ơn, Q&A | 1.0 phút | Trưởng nhóm |
| **TỔNG** | **Toàn bộ bài thuyết trình** | **~14.5 phút** | **Cả nhóm phối hợp** |

---

## 🎙️ NỘI DUNG CHI TIẾT TỪNG SLIDE (GẠCH ĐẦU DÒNG THUYẾT TRÌNH)

### SLIDE 1: BÌA BÁO CÁO (Thời lượng: ~1 phút)
* **Chào hỏi:** "Kính chào Thầy Trần Minh Thái và các bạn sinh viên. Hôm nay nhóm chúng em xin đại diện báo cáo tiến độ đồ án giữa kỳ môn Blockchain và Ứng dụng."
* **Tên đề tài:** "Đề tài số 4: *Ứng dụng Blockchain trong phát hành Hóa đơn điện tử nhằm chống gian lận thuế*."
* **Giới thiệu:** "Nhóm được hướng dẫn bởi TS. Trần Minh Thái, gồm các thành viên phụ trách các mảng: Smart contract, Lập trình ứng dụng DApp và Biên soạn hồ sơ báo cáo kỹ thuật."

---

### SLIDE 2: MỤC LỤC BÁO CÁO (Thời lượng: ~0.5 phút)
* **Nội dung:** Bài báo cáo hôm nay bám sát 3 yêu cầu trọng tâm của Khoa CNTT:
  1. *Phần 1:* Tiến độ thực hiện báo cáo đồ án (file Word).
  2. *Phần 2:* Tiến độ xây dựng ứng dụng thực nghiệm (Demo DApp & Smart Contract).
  3. *Phần 3:* Phân công công việc và đánh giá mức độ hoàn thành của các thành viên.

---

### SLIDE 3: ĐẶT VẤN ĐỀ & MỤC TIÊU ĐỀ TÀI (Thời lượng: ~2 phút)
* **Thực trạng nhức nhối:**
  * Hiện nay tình trạng thành lập doanh nghiệp "ma" để mua bán, xuất khống hóa đơn GTGT nhằm chiếm đoạt tiền hoàn thuế diễn ra rất phức tạp.
  * Hệ thống hóa đơn tập trung (CSDL truyền thống) có nguy cơ bị can thiệp nội bộ, sửa lén dữ liệu hoặc thiếu sự liên thông tức thời giữa các bên.
  * Tình trạng một hóa đơn bị dùng để kê khai khấu trừ thuế trùng lặp tại nhiều chi cục thuế khác nhau.
* **Mục tiêu giải pháp Blockchain:**
  * **Tính bất biến (Immutability):** Dữ liệu hóa đơn đóng vào khối không thể xóa hay sửa đổi.
  * **Tính duy nhất (Uniqueness):** Mã hóa đơn được bảo vệ bởi thuật toán máy ảo EVM, chặn đứng trùng lặp ngay từ cấp độ giao thức.
  * **Minh bạch & Đối soát 24/7:** Cơ quan thuế, người bán và người mua đều có quyền tra cứu độc lập.

---

### SLIDE 4: TIẾN ĐỘ THỰC HIỆN BÁO CÁO ĐỒ ÁN (Thời lượng: ~1.5 phút)
* **Khối lượng đã hoàn thành:** Đã hoàn thiện dự thảo 4 chương trong file báo cáo:
  * **Chương 1 (Giới thiệu):** Đặt vấn đề, mục tiêu, phạm vi và phương pháp nghiên cứu.
  * **Chương 2 (Cơ sở lý thuyết):** Khái niệm Blockchain, cơ chế đồng thuận PoS, máy ảo EVM, ngôn ngữ Solidity và các chuẩn bảo mật Smart Contract.
  * **Chương 3 (Phân tích & Thiết kế):** Thiết kế cấu trúc dữ liệu `struct HoaDon`, sơ đồ kiến trúc 3 tầng và sơ đồ tuần tự (Sequence Diagram) phát hành hóa đơn.
  * **Chương 4 (Cài đặt & Thực nghiệm):** Triển khai mã nguồn Solidity, test case mô phỏng Web3.py và tích hợp giao diện Web DApp.

---

### SLIDE 5: TỰ ĐÁNH GIÁ BÁO CÁO ĐỒ ÁN (Thời lượng: ~1.5 phút)
* **Hình thức trình bày:**
  * Đạt 100% quy chuẩn Khoa CNTT - HUFLIT: Font Times New Roman 13pt, giãn dòng 1.5 lines, lề Trái 2.0cm, Trên/Dưới 2.5cm, Phải 2.0cm, Gutter 0.5cm.
  * Trích dẫn tài liệu tham khảo theo chuẩn IEEE.
* **Chất lượng nội dung:**
  * Diễn đạt mạch lạc, thuật ngữ công nghệ chính xác, có minh chứng kiểm thử on-chain thật (không dùng log giả lập).
* **Hạn chế & Hướng khắc phục:**
  * *Hạn chế:* Chương 5 (Kết luận) cần bổ sung thêm bài toán tối ưu phí Gas khi mở rộng quy mô lớn.
  * *Khắc phục:* Nhóm sẽ hoàn thiện đầy đủ phần đánh giá hiệu năng và tổng kết kiến nghị trong giai đoạn cuối kỳ.

---

### SLIDE 6: TIẾN ĐỘ XÂY DỰNG ỨNG DỤNG DEMO (Thời lượng: ~2 phút)
* **Bản phác thảo kiến trúc 3 tầng:**
  1. **Tầng Giao diện (Presentation Layer):** Web DApp React 19 + Vite, kết nối ví điện tử MetaMask.
  2. **Tầng Tương tác & Nghiệp vụ (Application Layer):** Thư viện Ethers.js v6 kết nối node RPC mạng Ethereum.
  3. **Tầng Lưu trữ Phân tán (Blockchain Layer):** Mạng Sepolia Testnet chạy Smart Contract `HoaDonDienTu.sol`.
* **Trạng thái triển khai thực tế:**
  * DApp đã được đóng gói và **Deploy chính thức lên nền tảng Vercel** tại địa chỉ: `https://hoadondientu-blockchain.vercel.app`.
  * Hỗ trợ doanh nghiệp phát hành hóa đơn và cơ quan thuế tra cứu công khai trực tiếp trên trình duyệt.

---

### SLIDE 7: CÀI ĐẶT SMART CONTRACT SOLIDITY (Thời lượng: ~2 phút)
* **Hợp đồng thông minh `HoaDonDienTu.sol`:**
  * Viết trên phiên bản Solidity hiện đại `^0.8.20`.
  * **Cấu trúc dữ liệu:** `maHoaDon` (string), `nguoiBan` (address), `nguoiMua` (address), `giaTri` (uint256), `thoiGianPhatHanh` (timestamp).
* **Cơ chế chống gian lận cốt lõi:**
  * Bảng băm kiểm tra tức thời: `mapping(string => bool) private daTonTai;` với độ phức tạp $O(1)$.
  * Ràng buộc nghiệp vụ:  
    `require(!daTonTai[_maHD], "Loi: Ma hoa don da ton tai tren he thong!");`
  * Phát sự kiện `emit HoaDonPhatHanh(...)` để hệ thống ngoài chuỗi lắng nghe và đối soát.

---

### SLIDE 8: KẾT QUẢ THỬ NGHIỆM THỰC TẾ (Thời lượng: ~2 phút)
* **Kịch bản 1 — Phát hành hóa đơn hợp lệ:**
  * Phát hành thành công 5 hóa đơn độc lập (`HD-2026-001` đến `HD-2026-005`).
  * Tất cả giao dịch đều nhận trạng thái `Success`, sinh mã Transaction Hash và lưu vào khối blockchain.
* **Kịch bản 2 — Chống gian lận (Test Case Revert):**
  * Một bên cố tình phát hành lại hóa đơn có mã `HD-2026-001` đã tồn tại.
  * Máy ảo EVM ngay lập tức kích hoạt cơ chế `revert`, từ chối nhận giao dịch và không tốn thêm tài nguyên lưu trữ.
  * Bằng chứng bảo vệ hiển thị rõ lỗi: *"Loi: Ma hoa don da ton tai tren he thong!"*.

---

### SLIDE 9: PHÂN CÔNG CÔNG VIỆC GIỮA CÁC THÀNH VIÊN (Thời lượng: ~1 phút)
* **Nhiệm vụ cụ thể:**
  * *Sinh viên 1 (Trưởng nhóm):* Quản lý dự án, thiết kế kiến trúc hệ thống, viết Chương 1, 2 và tổng hợp báo cáo Word. Khối lượng: 35%.
  * *Sinh viên 2:* Nghiên cứu Smart Contract Solidity, viết script kiểm thử Web3.py, phụ trách Chương 3, 4. Khối lượng: 35%.
  * *Sinh viên 3:* Phát triển giao diện Web DApp (React/Ethers.js), thiết kế slide PPTX, deploy Vercel. Khối lượng: 30%.
* **Đánh giá chung:** Toàn bộ thành viên phối hợp chặt chẽ, hoàn thành 100% mục tiêu giai đoạn giữa kỳ đúng tiến độ.

---

### SLIDE 10: KẾ HOẠCH GIAI ĐOẠN TIẾP THEO & KẾT LUẬN (Thời lượng: ~1 phút)
* **Kế hoạch giai đoạn cuối kỳ:**
  1. Bổ sung cơ chế phân quyền (Role-based: Doanh nghiệp chỉ được phát hành, Cơ quan thuế có quyền xác thực/gắn nhãn).
  2. Tối ưu chi phí Gas cho các giao dịch batch (phát hành hóa đơn hàng loạt).
  3. Hoàn thiện toàn bộ Chương 5 (Kết luận & Hướng phát triển) và chuẩn bị video demo sản phẩm hoàn chỉnh.
* **Kết thúc & Cảm ơn:**
  * "Nhóm xin chân thành cảm ơn Thầy Trần Minh Thái và các bạn đã lắng nghe!"
  * "Sau đây nhóm xin mời Thầy và các bạn đặt câu hỏi đóng góp ý kiến (Q&A)."
