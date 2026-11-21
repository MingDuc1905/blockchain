// Trạng thái hóa đơn - khớp enum TrangThai trong HoaDonDienTu.sol (v2)
export const TRANG_THAI = {
  PENDING: 0,
  CONFIRMED: 1,
  REJECTED: 2,
  CANCELLED: 3,
  DISPUTED: 4,
};

export const TRANG_THAI_INFO = {
  [TRANG_THAI.PENDING]: {
    label: 'Chờ xác nhận',
    short: 'Pending',
    badge: 'bg-amber-50 text-amber-800 border-amber-300',
    hint: 'Đang chờ người mua xác nhận hoặc từ chối. Người bán có thể hủy khi hóa đơn còn ở trạng thái này.',
  },
  [TRANG_THAI.CONFIRMED]: {
    label: 'Đã xác nhận',
    short: 'Confirmed',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    hint: 'Hóa đơn đã được người mua xác nhận (hoặc Trọng tài phán quyết xác nhận). Không thể thay đổi nữa.',
  },
  [TRANG_THAI.REJECTED]: {
    label: 'Bị từ chối',
    short: 'Rejected',
    badge: 'bg-red-50 text-red-800 border-red-300',
    hint: 'Người mua đã từ chối hóa đơn. Người bán có thể khiếu nại một lần để Trọng tài phân xử.',
  },
  [TRANG_THAI.CANCELLED]: {
    label: 'Đã hủy',
    short: 'Cancelled',
    badge: 'bg-zinc-100 text-zinc-700 border-zinc-300',
    hint: 'Người bán đã hủy hóa đơn khi còn Pending. Mã hóa đơn vẫn bị chiếm vĩnh viễn, không thể phát hành lại.',
  },
  [TRANG_THAI.DISPUTED]: {
    label: 'Đang tranh chấp',
    short: 'Disputed',
    badge: 'bg-violet-50 text-violet-800 border-violet-300',
    hint: 'Người bán đã khiếu nại việc bị từ chối. Đang chờ Trọng tài (Arbiter) phán quyết.',
  },
};

export function getTrangThaiInfo(trangThai) {
  return TRANG_THAI_INFO[trangThai] || {
    label: 'Không xác định',
    short: '?',
    badge: 'bg-zinc-100 text-zinc-700 border-zinc-300',
    hint: '',
  };
}

// Giải mã kết quả traCuuHoaDon (v2: 7 giá trị) thành object dùng trong giao diện
export function parseInvoiceResult(res) {
  const [maHoaDon, nguoiBan, nguoiMua, giaTri, thoiGian, trangThai, ghiChu] = res;
  return {
    maHoaDon,
    nguoiBan,
    nguoiMua,
    giaTri: Number(giaTri),
    thoiGian: Number(thoiGian),
    trangThai: Number(trangThai),
    ghiChu: ghiChu || '',
  };
}

export const sameAddress = (a, b) =>
  !!a && !!b && a.toLowerCase() === b.toLowerCase();

// Chuyển lỗi ethers / MetaMask / revert của contract thành thông báo tiếng Việt dễ hiểu
export function friendlyError(err) {
  if (!err) return 'Giao dịch thất bại';
  if (err.code === 'ACTION_REJECTED' || err.code === 4001) {
    return 'Bạn đã từ chối ký giao dịch trên MetaMask.';
  }
  const raw = err.reason || err.revert?.args?.[0] || err.shortMessage || err.message || String(err);
  const map = [
    ['Chi nguoi mua moi duoc', 'Chỉ ví NGƯỜI MUA của hóa đơn này mới được thực hiện thao tác này.'],
    ['Chi nguoi ban moi duoc', 'Chỉ ví NGƯỜI BÁN của hóa đơn này mới được thực hiện thao tác này.'],
    ['Chi Arbiter moi duoc', 'Chỉ ví Trọng tài (Arbiter) mới được phán quyết tranh chấp.'],
    ['Arbiter khong duoc la ben lien quan', 'Trọng tài không được là bên bán hoặc bên mua của chính hóa đơn này.'],
    ['khong o trang thai Pending', 'Hóa đơn không còn ở trạng thái Chờ xác nhận.'],
    ['Chi duoc huy hoa don khi con Pending', 'Chỉ được hủy hóa đơn khi còn ở trạng thái Chờ xác nhận.'],
    ['Chi duoc khieu nai hoa don dang bi tu choi', 'Chỉ được khiếu nại hóa đơn đang ở trạng thái Bị từ chối.'],
    ['da duoc dua ra tranh chap truoc do', 'Hóa đơn này đã tranh chấp một lần, không thể khiếu nại lại.'],
    ['khong o trang thai Disputed', 'Hóa đơn không ở trạng thái Đang tranh chấp.'],
    ['Phai nhap ly do tu choi', 'Bạn phải nhập lý do từ chối.'],
    ['Ghi chu qua dai', 'Lý do từ chối quá dài (tối đa 500 byte).'],
    ['Khong tim thay hoa don', 'Không tìm thấy hóa đơn với mã này.'],
    ['Nguoi mua khong duoc trung voi nguoi ban', 'Ví người mua không được trùng ví người bán.'],
    ['Ma hoa don da ton tai', 'Mã hóa đơn này đã tồn tại trên sổ cái blockchain!'],
  ];
  for (const [needle, vi] of map) {
    if (raw.includes(needle)) return vi;
  }
  return raw.length > 200 ? raw.slice(0, 200) + '…' : raw;
}
