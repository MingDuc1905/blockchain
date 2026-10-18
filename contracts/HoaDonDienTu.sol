// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title HoaDonDienTu
 * @dev Hợp đồng thông minh quản lý Hóa Đơn Điện Tử chống gian lận thuế trên nền tảng Blockchain.
 * Đề tài 4: Hóa đơn điện tử chống gian lận thuế - Môn học: Blockchain và Ứng dụng (HUFLIT).
 */
contract HoaDonDienTu {
    // Cấu trúc dữ liệu lưu trữ thông tin hóa đơn điện tử
    struct HoaDon {
        string maHoaDon;         // Mã định danh duy nhất của hóa đơn (duy nhất trên toàn hệ thống)
        address nguoiBan;        // Địa chỉ ví của đơn vị bán hàng / phát hành hóa đơn (msg.sender)
        address nguoiMua;        // Địa chỉ ví của khách hàng / bên mua hàng
        uint256 giaTri;          // Tổng giá trị thanh toán trên hóa đơn (VNĐ hoặc đơn vị tiền tệ quy ước)
        uint256 thoiGianPhatHanh;// Thời điểm hóa đơn được đóng gói vào khối blockchain (block.timestamp)
    }

    // Bảng băm lưu trữ thông tin chi tiết hóa đơn theo mã hóa đơn
    mapping(string => HoaDon) private danhSachHoaDon;

    // Bảng băm kiểm tra sự tồn tại của mã hóa đơn (chống trùng lặp tuyệt đối)
    mapping(string => bool) private daTonTai;

    // Mảng lưu danh sách toàn bộ các mã hóa đơn đã phát hành
    string[] private danhSachMaHoaDon;

    // Sự kiện được kích hoạt khi một hóa đơn mới được phát hành thành công
    event HoaDonPhatHanh(
        string indexed maHoaDon,
        address indexed nguoiBan,
        address indexed nguoiMua,
        uint256 giaTri,
        uint256 thoiGianPhatHanh
    );

    /**
     * @notice Phát hành một hóa đơn điện tử mới lên hệ thống Blockchain
     * @param _maHoaDon Mã định danh duy nhất của hóa đơn
     * @param _nguoiMua Địa chỉ ví của bên mua
     * @param _giaTri Tổng giá trị hóa đơn (phải lớn hơn 0)
     */
    function phatHanhHoaDon(
        string memory _maHoaDon,
        address _nguoiMua,
        uint256 _giaTri
    ) public {
        // Kiểm tra độ dài mã hóa đơn không được rỗng
        require(bytes(_maHoaDon).length > 0, "Loi: Ma hoa don khong duoc de trong!");

        // Kiểm tra mã hóa đơn chưa từng tồn tại trên hệ thống (Cơ chế chống gian lận cốt lõi)
        require(!daTonTai[_maHoaDon], "Loi: Ma hoa don da ton tai tren he thong!");

        // Kiểm tra địa chỉ người mua hợp lệ
        require(_nguoiMua != address(0), "Loi: Dia chi nguoi mua khong hop le!");

        // Kiểm tra giá trị hóa đơn phải lớn hơn 0
        require(_giaTri > 0, "Loi: Gia tri hoa don phai lon hon 0!");

        // Lưu thông tin hóa đơn vào sổ cái
        danhSachHoaDon[_maHoaDon] = HoaDon({
            maHoaDon: _maHoaDon,
            nguoiBan: msg.sender,
            nguoiMua: _nguoiMua,
            giaTri: _giaTri,
            thoiGianPhatHanh: block.timestamp
        });

        // Đánh dấu mã hóa đơn đã tồn tại
        daTonTai[_maHoaDon] = true;

        // Lưu mã hóa đơn vào danh sách để tiện truy vấn
        danhSachMaHoaDon.push(_maHoaDon);

        // Kích hoạt sự kiện để các bên liên quan (kế toán, cơ quan thuế) ghi nhận
        emit HoaDonPhatHanh(_maHoaDon, msg.sender, _nguoiMua, _giaTri, block.timestamp);
    }

    /**
     * @notice Tra cứu đầy đủ thông tin hóa đơn theo mã hóa đơn
     * @param _maHoaDon Mã hóa đơn cần tra cứu
     * @return maHoaDon Mã định danh
     * @return nguoiBan Địa chỉ ví người bán
     * @return nguoiMua Địa chỉ ví người mua
     * @return giaTri Giá trị thanh toán
     * @return thoiGianPhatHanh Thời gian phát hành (timestamp)
     */
    function traCuuHoaDon(string memory _maHoaDon)
        public
        view
        returns (
            string memory maHoaDon,
            address nguoiBan,
            address nguoiMua,
            uint256 giaTri,
            uint256 thoiGianPhatHanh
        )
    {
        require(daTonTai[_maHoaDon], "Loi: Khong tim thay hoa don voi ma so nay!");
        HoaDon memory hd = danhSachHoaDon[_maHoaDon];
        return (hd.maHoaDon, hd.nguoiBan, hd.nguoiMua, hd.giaTri, hd.thoiGianPhatHanh);
    }

    /**
     * @notice Kiểm tra xem mã hóa đơn đã tồn tại trong hệ thống hay chưa
     * @param _maHoaDon Mã hóa đơn cần kiểm tra
     * @return bool True nếu đã tồn tại, False nếu chưa tồn tại
     */
    function kiemTraTrungLap(string memory _maHoaDon) public view returns (bool) {
        return daTonTai[_maHoaDon];
    }

    /**
     * @notice Lấy tổng số lượng hóa đơn đã phát hành thành công trên hệ thống
     * @return uint256 Tổng số hóa đơn
     */
    function layTongSoHoaDon() public view returns (uint256) {
        return danhSachMaHoaDon.length;
    }

    /**
     * @notice Lấy danh sách toàn bộ các mã hóa đơn đã phát hành
     * @return string[] Mảng chứa tất cả các mã hóa đơn
     */
    function layDanhSachMaHoaDon() public view returns (string[] memory) {
        return danhSachMaHoaDon;
    }
}
