// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

/**
 * @title HoaDonDienTu
 * @dev Hợp đồng thông minh quản lý Hóa Đơn Điện Tử chống gian lận thuế trên nền tảng Blockchain.
 * Đề tài 4: Hóa đơn điện tử chống gian lận thuế - Môn học: Blockchain và Ứng dụng (HUFLIT).
 *
 * PHIÊN BẢN 2 - Bổ sung vòng đời (state machine) cho hóa đơn và vai trò Trọng tài (Arbiter):
 *
 *   Pending ──xacNhanHoaDon (người mua)──────────────▶ Confirmed
 *   Pending ──tuChoiHoaDon + ghiChu (người mua)──────▶ Rejected
 *   Pending ──huyHoaDon (người bán)──────────────────▶ Cancelled
 *   Rejected ─raiseDispute (người bán, tối đa 1 lần)─▶ Disputed
 *   Disputed ─resolveDispute(true)  (Arbiter)────────▶ Confirmed
 *   Disputed ─resolveDispute(false) (Arbiter)────────▶ Rejected (chốt, không thể tranh chấp lại)
 *
 * Mã hóa đơn một khi đã phát hành sẽ bị chiếm vĩnh viễn, kể cả khi hóa đơn bị Cancelled/Rejected,
 * để không thể tái sử dụng mã (giữ nguyên cơ chế chống trùng lặp của phiên bản 1).
 */
contract HoaDonDienTu {
    // Các trạng thái trong vòng đời của một hóa đơn
    enum TrangThai {
        Pending,    // 0: Vừa phát hành, đang chờ người mua phản hồi
        Confirmed,  // 1: Người mua đã xác nhận (hoặc Arbiter phán quyết xác nhận)
        Rejected,   // 2: Người mua từ chối kèm lý do (hoặc Arbiter phán quyết từ chối)
        Cancelled,  // 3: Người bán chủ động hủy khi còn Pending
        Disputed    // 4: Người bán khiếu nại việc bị từ chối, chờ Arbiter phân xử
    }

    // Cấu trúc dữ liệu lưu trữ thông tin hóa đơn điện tử
    struct HoaDon {
        string maHoaDon;          // Mã định danh duy nhất của hóa đơn (duy nhất trên toàn hệ thống)
        address nguoiBan;         // Địa chỉ ví của đơn vị bán hàng / phát hành hóa đơn (msg.sender)
        address nguoiMua;         // Địa chỉ ví của khách hàng / bên mua hàng
        uint256 giaTri;           // Tổng giá trị thanh toán trên hóa đơn (VNĐ hoặc đơn vị tiền tệ quy ước)
        uint256 thoiGianPhatHanh; // Thời điểm hóa đơn được đóng gói vào khối blockchain (block.timestamp)
        TrangThai trangThai;      // Trạng thái hiện tại của hóa đơn
        string ghiChu;            // Ghi chú / lý do từ chối do người mua cung cấp khi tuChoiHoaDon
    }

    // Độ dài tối đa (byte) của ghi chú để tránh lạm dụng lưu trữ on-chain
    uint256 public constant GHI_CHU_TOI_DA = 500;

    // Chủ sở hữu hợp đồng (người triển khai) - chỉ có quyền thay đổi Arbiter
    address public owner;

    // Trọng tài: bên thứ ba độc lập (ví dụ đại diện cơ quan thuế) phân xử tranh chấp
    address public arbiter;

    // Bảng băm lưu trữ thông tin chi tiết hóa đơn theo mã hóa đơn
    mapping(string => HoaDon) private danhSachHoaDon;

    // Bảng băm kiểm tra sự tồn tại của mã hóa đơn (chống trùng lặp tuyệt đối)
    mapping(string => bool) private daTonTai;

    // Đánh dấu hóa đơn đã từng được đưa ra tranh chấp (mỗi hóa đơn chỉ được khiếu nại 1 lần)
    mapping(string => bool) private daTranhChap;

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

    // Sự kiện được kích hoạt mỗi khi trạng thái hóa đơn thay đổi (xác nhận, từ chối, hủy, tranh chấp, phán quyết)
    event TrangThaiThayDoi(
        string maHoaDon,
        TrangThai trangThaiCu,
        TrangThai trangThaiMoi,
        address indexed nguoiThucHien,
        string ghiChu
    );

    // Sự kiện khi Arbiter được thay đổi
    event ArbiterThayDoi(address indexed arbiterCu, address indexed arbiterMoi);

    // ------------------------------------------------------------------
    //  PHÂN QUYỀN
    // ------------------------------------------------------------------

    modifier chiOwner() {
        require(msg.sender == owner, "Loi: Chi chu so huu hop dong moi duoc thuc hien!");
        _;
    }

    modifier chiArbiter() {
        require(msg.sender == arbiter, "Loi: Chi Arbiter moi duoc thuc hien!");
        _;
    }

    /**
     * @param _arbiter Địa chỉ ví của Trọng tài phân xử tranh chấp
     */
    constructor(address _arbiter) {
        require(_arbiter != address(0), "Loi: Dia chi Arbiter khong hop le!");
        owner = msg.sender;
        arbiter = _arbiter;
        emit ArbiterThayDoi(address(0), _arbiter);
    }

    /**
     * @notice Thay đổi Arbiter (chỉ chủ sở hữu hợp đồng)
     * @param _arbiterMoi Địa chỉ ví Arbiter mới
     */
    function setArbiter(address _arbiterMoi) public chiOwner {
        require(_arbiterMoi != address(0), "Loi: Dia chi Arbiter khong hop le!");
        emit ArbiterThayDoi(arbiter, _arbiterMoi);
        arbiter = _arbiterMoi;
    }

    // ------------------------------------------------------------------
    //  PHÁT HÀNH
    // ------------------------------------------------------------------

    /**
     * @notice Phát hành một hóa đơn điện tử mới lên hệ thống Blockchain (trạng thái ban đầu: Pending)
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

        // Người bán không được tự xuất hóa đơn cho chính mình (tự xác nhận để hợp thức hóa giao dịch khống)
        require(_nguoiMua != msg.sender, "Loi: Nguoi mua khong duoc trung voi nguoi ban!");

        // Kiểm tra giá trị hóa đơn phải lớn hơn 0
        require(_giaTri > 0, "Loi: Gia tri hoa don phai lon hon 0!");

        // Lưu thông tin hóa đơn vào sổ cái với trạng thái ban đầu là Pending
        danhSachHoaDon[_maHoaDon] = HoaDon({
            maHoaDon: _maHoaDon,
            nguoiBan: msg.sender,
            nguoiMua: _nguoiMua,
            giaTri: _giaTri,
            thoiGianPhatHanh: block.timestamp,
            trangThai: TrangThai.Pending,
            ghiChu: ""
        });

        // Đánh dấu mã hóa đơn đã tồn tại
        daTonTai[_maHoaDon] = true;

        // Lưu mã hóa đơn vào danh sách để tiện truy vấn
        danhSachMaHoaDon.push(_maHoaDon);

        // Kích hoạt sự kiện để các bên liên quan (kế toán, cơ quan thuế) ghi nhận
        emit HoaDonPhatHanh(_maHoaDon, msg.sender, _nguoiMua, _giaTri, block.timestamp);
    }

    // ------------------------------------------------------------------
    //  PHẢN HỒI CỦA NGƯỜI MUA / HỦY CỦA NGƯỜI BÁN
    // ------------------------------------------------------------------

    /**
     * @notice Người mua xác nhận hóa đơn hợp lệ (Pending -> Confirmed)
     * @param _maHoaDon Mã hóa đơn cần xác nhận
     */
    function xacNhanHoaDon(string memory _maHoaDon) public {
        HoaDon storage hd = _layHoaDon(_maHoaDon);
        require(msg.sender == hd.nguoiMua, "Loi: Chi nguoi mua moi duoc xac nhan hoa don!");
        require(hd.trangThai == TrangThai.Pending, "Loi: Hoa don khong o trang thai Pending!");

        hd.trangThai = TrangThai.Confirmed;
        emit TrangThaiThayDoi(_maHoaDon, TrangThai.Pending, TrangThai.Confirmed, msg.sender, "");
    }

    /**
     * @notice Người mua từ chối hóa đơn kèm lý do (Pending -> Rejected)
     * @param _maHoaDon Mã hóa đơn cần từ chối
     * @param _ghiChu Lý do từ chối (bắt buộc, tối đa GHI_CHU_TOI_DA byte)
     */
    function tuChoiHoaDon(string memory _maHoaDon, string memory _ghiChu) public {
        HoaDon storage hd = _layHoaDon(_maHoaDon);
        require(msg.sender == hd.nguoiMua, "Loi: Chi nguoi mua moi duoc tu choi hoa don!");
        require(hd.trangThai == TrangThai.Pending, "Loi: Hoa don khong o trang thai Pending!");
        require(bytes(_ghiChu).length > 0, "Loi: Phai nhap ly do tu choi!");
        require(bytes(_ghiChu).length <= GHI_CHU_TOI_DA, "Loi: Ghi chu qua dai!");

        hd.trangThai = TrangThai.Rejected;
        hd.ghiChu = _ghiChu;
        emit TrangThaiThayDoi(_maHoaDon, TrangThai.Pending, TrangThai.Rejected, msg.sender, _ghiChu);
    }

    /**
     * @notice Người bán hủy hóa đơn khi còn Pending (Pending -> Cancelled)
     * @dev Mã hóa đơn vẫn bị chiếm vĩnh viễn, không thể phát hành lại với cùng mã.
     * @param _maHoaDon Mã hóa đơn cần hủy
     */
    function huyHoaDon(string memory _maHoaDon) public {
        HoaDon storage hd = _layHoaDon(_maHoaDon);
        require(msg.sender == hd.nguoiBan, "Loi: Chi nguoi ban moi duoc huy hoa don!");
        require(hd.trangThai == TrangThai.Pending, "Loi: Chi duoc huy hoa don khi con Pending!");

        hd.trangThai = TrangThai.Cancelled;
        emit TrangThaiThayDoi(_maHoaDon, TrangThai.Pending, TrangThai.Cancelled, msg.sender, "");
    }

    // ------------------------------------------------------------------
    //  TRANH CHẤP & TRỌNG TÀI
    // ------------------------------------------------------------------

    /**
     * @notice Người bán khiếu nại khi hóa đơn bị người mua từ chối (Rejected -> Disputed)
     * @dev Mỗi hóa đơn chỉ được đưa ra tranh chấp tối đa 1 lần.
     * @param _maHoaDon Mã hóa đơn cần khiếu nại
     */
    function raiseDispute(string memory _maHoaDon) public {
        HoaDon storage hd = _layHoaDon(_maHoaDon);
        require(msg.sender == hd.nguoiBan, "Loi: Chi nguoi ban moi duoc khieu nai!");
        require(hd.trangThai == TrangThai.Rejected, "Loi: Chi duoc khieu nai hoa don dang bi tu choi!");
        require(!daTranhChap[_maHoaDon], "Loi: Hoa don da duoc dua ra tranh chap truoc do!");

        daTranhChap[_maHoaDon] = true;
        hd.trangThai = TrangThai.Disputed;
        emit TrangThaiThayDoi(_maHoaDon, TrangThai.Rejected, TrangThai.Disputed, msg.sender, "");
    }

    /**
     * @notice Arbiter phân xử tranh chấp (Disputed -> Confirmed hoặc Rejected)
     * @dev Arbiter không được là bên bán hoặc bên mua của chính hóa đơn đó (tránh xung đột lợi ích).
     * @param _maHoaDon Mã hóa đơn đang tranh chấp
     * @param _xacNhan true: xác nhận hóa đơn hợp lệ; false: giữ nguyên quyết định từ chối
     */
    function resolveDispute(string memory _maHoaDon, bool _xacNhan) public chiArbiter {
        HoaDon storage hd = _layHoaDon(_maHoaDon);
        require(hd.trangThai == TrangThai.Disputed, "Loi: Hoa don khong o trang thai Disputed!");
        require(
            msg.sender != hd.nguoiBan && msg.sender != hd.nguoiMua,
            "Loi: Arbiter khong duoc la ben lien quan cua hoa don!"
        );

        TrangThai moi = _xacNhan ? TrangThai.Confirmed : TrangThai.Rejected;
        hd.trangThai = moi;
        emit TrangThaiThayDoi(_maHoaDon, TrangThai.Disputed, moi, msg.sender, "");
    }

    // ------------------------------------------------------------------
    //  TRUY VẤN
    // ------------------------------------------------------------------

    /**
     * @notice Tra cứu đầy đủ thông tin hóa đơn theo mã hóa đơn
     * @param _maHoaDon Mã hóa đơn cần tra cứu
     * @return maHoaDon Mã định danh
     * @return nguoiBan Địa chỉ ví người bán
     * @return nguoiMua Địa chỉ ví người mua
     * @return giaTri Giá trị thanh toán
     * @return thoiGianPhatHanh Thời gian phát hành (timestamp)
     * @return trangThai Trạng thái hiện tại (0 Pending, 1 Confirmed, 2 Rejected, 3 Cancelled, 4 Disputed)
     * @return ghiChu Lý do từ chối (rỗng nếu chưa bị từ chối)
     */
    function traCuuHoaDon(string memory _maHoaDon)
        public
        view
        returns (
            string memory maHoaDon,
            address nguoiBan,
            address nguoiMua,
            uint256 giaTri,
            uint256 thoiGianPhatHanh,
            TrangThai trangThai,
            string memory ghiChu
        )
    {
        HoaDon storage hd = _layHoaDon(_maHoaDon);
        return (
            hd.maHoaDon,
            hd.nguoiBan,
            hd.nguoiMua,
            hd.giaTri,
            hd.thoiGianPhatHanh,
            hd.trangThai,
            hd.ghiChu
        );
    }

    /**
     * @notice Lấy nhanh trạng thái hiện tại của hóa đơn
     * @param _maHoaDon Mã hóa đơn cần tra cứu
     */
    function layTrangThai(string memory _maHoaDon) public view returns (TrangThai) {
        return _layHoaDon(_maHoaDon).trangThai;
    }

    /**
     * @notice Kiểm tra xem hóa đơn đã từng được đưa ra tranh chấp hay chưa
     * @param _maHoaDon Mã hóa đơn cần kiểm tra
     */
    function daTungTranhChap(string memory _maHoaDon) public view returns (bool) {
        return daTranhChap[_maHoaDon];
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

    // ------------------------------------------------------------------
    //  HÀM NỘI BỘ
    // ------------------------------------------------------------------

    // Lấy tham chiếu storage của hóa đơn, báo lỗi nếu mã chưa tồn tại
    function _layHoaDon(string memory _maHoaDon) internal view returns (HoaDon storage) {
        require(daTonTai[_maHoaDon], "Loi: Khong tim thay hoa don voi ma so nay!");
        return danhSachHoaDon[_maHoaDon];
    }
}
