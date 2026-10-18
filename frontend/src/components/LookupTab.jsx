import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_CONFIG, shortenAddress } from '../utils/contract';
import { Search, ShieldCheck, AlertTriangle, Copy, CheckCircle } from 'lucide-react';

export default function LookupTab({ initialCode }) {
  const { readContract, showToast } = useWeb3();

  const [maHD, setMaHD] = useState(initialCode || '');
  const [invoiceData, setInvoiceData] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLookup = async (e) => {
    if (e) e.preventDefault();
    if (!maHD.trim()) {
      showToast('Thông Báo', 'Vui lòng nhập Mã Số Hóa Đơn cần tra cứu!', 'warning');
      return;
    }

    setLoading(true);
    setNotFound(false);
    setInvoiceData(null);

    try {
      if (!readContract) {
        showToast('Chưa Sẵn Sàng', 'Đang kết nối RPC Sepolia, vui lòng thử lại sau 2 giây!', 'warning');
        return;
      }

      const daTonTai = await readContract.kiemTraTrungLap(maHD.trim());
      if (!daTonTai) {
        setNotFound(true);
        showToast('Không Tồn Tại', `Hóa đơn "${maHD}" không có bản ghi nào trên blockchain!`, 'danger');
        return;
      }

      const res = await readContract.traCuuHoaDon(maHD.trim());
      const [maHoaDon, nguoiBan, nguoiMua, giaTri, thoiGian] = res;

      setInvoiceData({
        maHoaDon,
        nguoiBan,
        nguoiMua,
        giaTri: Number(giaTri),
        thoiGian: Number(thoiGian)
      });

      showToast('Xác Thực Hợp Lệ', `Đã tìm thấy hóa đơn [${maHD}] trên khối Sepolia!`, 'success');

    } catch (err) {
      console.error('Lỗi tra cứu:', err);
      showToast('Lỗi Tra Cứu', err.message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast('Đã Sao Chép', `${label} đã được lưu vào clipboard!`, 'info');
  };

  return (
    <div className="max-w-3xl mx-auto bg-white border border-zinc-200 rounded-lg shadow-sm">
      <div className="p-5 border-b border-zinc-200 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-base text-zinc-950">Tra Cứu & Xác Thực Tính Toàn Vẹn Hóa Đơn</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Dành cho Cơ quan Thuế và Khách hàng đối soát hóa đơn trực tiếp từ Smart Contract</p>
        </div>
        <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-medium">
          Tax Authority Audit
        </span>
      </div>

      <div className="p-6">
        <form onSubmit={handleLookup} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <input 
              type="text" 
              value={maHD}
              onChange={(e) => setMaHD(e.target.value)}
              placeholder="Nhập mã định danh hóa đơn (VD: HD-HUFLIT-001)..." 
              className="w-full h-9 px-3 text-sm font-mono border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-950"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="h-9 px-4 inline-flex items-center gap-1.5 text-xs font-medium rounded-md bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Tra Cứu</span>
          </button>
        </form>

        {/* Skeleton loading khi đang truy vấn */}
        {loading && (
          <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm animate-pulse space-y-4">
            <div className="text-center space-y-2 border-b border-zinc-200 pb-4">
              <div className="h-6 w-64 bg-zinc-200 rounded mx-auto" />
              <div className="h-4 w-80 bg-zinc-100 rounded mx-auto" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-4 w-28 bg-zinc-200 rounded" />
                <div className="h-3 w-40 bg-zinc-100 rounded" />
                <div className="h-3 w-36 bg-zinc-100 rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-28 bg-zinc-200 rounded" />
                <div className="h-3 w-40 bg-zinc-100 rounded" />
                <div className="h-3 w-36 bg-zinc-100 rounded" />
              </div>
            </div>
            <div className="h-16 w-full bg-zinc-100 rounded" />
          </div>
        )}

        {/* Chưa tìm kiếm */}
        {!loading && !invoiceData && !notFound && (
          <div className="p-6 bg-zinc-50 border border-zinc-200 rounded-md text-center text-xs text-zinc-500">
            Vui lòng nhập mã hóa đơn và bấm <strong>Tra Cứu</strong> để xuất Phiếu Hóa Đơn Điện Tử Giá Trị Gia Tăng có Dấu Ký Số Blockchain.
          </div>
        )}

        {/* Cảnh báo không tìm thấy / Gian lận */}
        {notFound && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-900 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">CẢNH BÁO GIAN LẬN / KHÔNG TỒN TẠI TRÊN BLOCKCHAIN:</strong>
              <p className="text-xs text-red-800 mt-1 leading-relaxed">
                Hóa đơn có mã <strong>"{maHD}"</strong> không có bản ghi nào trên Ethereum Sepolia.<br />
                <em>Khuyến cáo: Hóa đơn này không có giá trị khấu trừ thuế hoặc có dấu hiệu làm giả ngoài sổ cái.</em>
              </p>
            </div>
          </div>
        )}

        {/* Phiếu Hóa Đơn GTGT Điện Tử */}
        {invoiceData && (
          <div className="bg-white border border-zinc-300 rounded-lg p-6 shadow-sm">
            {/* Header Phiếu */}
            <div className="text-center border-b-2 border-zinc-900 pb-4 mb-4">
              <h2 className="font-bold text-lg uppercase tracking-wide text-zinc-900">
                HÓA ĐƠN GIÁ TRỊ GIA TĂNG (ĐIỆN TỬ)
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Bản thể hiện điện tử đối soát trực tiếp từ Smart Contract Ethereum Sepolia
              </p>
              <div className="text-xs font-mono font-bold text-zinc-900 mt-1">
                Mã Số: #{invoiceData.maHoaDon} • Ký Hiệu: 1C26TMB
              </div>
            </div>

            {/* Thông tin Bên Bán & Bên Mua */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-xs">
              <div className="space-y-1.5">
                <div className="font-bold text-zinc-900 text-sm mb-1">ĐƠN VỊ BÁN HÀNG:</div>
                <div className="flex justify-between border-b border-dashed border-zinc-200 pb-1">
                  <span className="text-zinc-500">Địa chỉ ví:</span>
                  <span className="font-mono font-semibold text-zinc-900 flex items-center gap-1">
                    <a href={`${CONTRACT_CONFIG.blockExplorerUrl}/address/${invoiceData.nguoiBan}`} target="_blank" rel="noreferrer" className="underline hover:text-blue-600">
                      {shortenAddress(invoiceData.nguoiBan)} ↗
                    </a>
                    <button onClick={() => handleCopy(invoiceData.nguoiBan, 'Ví người bán')} className="text-zinc-400 hover:text-zinc-800">
                      <Copy className="w-3 h-3" />
                    </button>
                  </span>
                </div>
                <div className="flex justify-between border-b border-dashed border-zinc-200 pb-1">
                  <span className="text-zinc-500">Hình thức thanh toán:</span>
                  <span className="font-medium text-zinc-800">Chuyển khoản Web3</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="font-bold text-zinc-900 text-sm mb-1">ĐƠN VỊ MUA HÀNG:</div>
                <div className="flex justify-between border-b border-dashed border-zinc-200 pb-1">
                  <span className="text-zinc-500">Địa chỉ ví:</span>
                  <span className="font-mono font-semibold text-zinc-900 flex items-center gap-1">
                    <a href={`${CONTRACT_CONFIG.blockExplorerUrl}/address/${invoiceData.nguoiMua}`} target="_blank" rel="noreferrer" className="underline hover:text-blue-600">
                      {shortenAddress(invoiceData.nguoiMua)} ↗
                    </a>
                    <button onClick={() => handleCopy(invoiceData.nguoiMua, 'Ví người mua')} className="text-zinc-400 hover:text-zinc-800">
                      <Copy className="w-3 h-3" />
                    </button>
                  </span>
                </div>
                <div className="flex justify-between border-b border-dashed border-zinc-200 pb-1">
                  <span className="text-zinc-500">Thời điểm ghi khối:</span>
                  <span className="font-medium text-zinc-800">
                    {new Date(invoiceData.thoiGian * 1000).toLocaleString('vi-VN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Bảng kê hàng hóa */}
            <table className="w-full text-xs border border-zinc-200 mb-4">
              <thead className="bg-zinc-100 text-zinc-700">
                <tr>
                  <th className="p-2 border border-zinc-200 text-center w-10">STT</th>
                  <th className="p-2 border border-zinc-200 text-left">Tên Hàng Hóa, Dịch Vụ</th>
                  <th className="p-2 border border-zinc-200 text-center w-14">ĐVT</th>
                  <th className="p-2 border border-zinc-200 text-center w-16">Số Lượng</th>
                  <th className="p-2 border border-zinc-200 text-right">Thành Tiền (VNĐ)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border border-zinc-200 text-center">1</td>
                  <td className="p-2 border border-zinc-200 font-medium">Dịch vụ giải pháp số & phần mềm hóa đơn điện tử bảo chứng Blockchain</td>
                  <td className="p-2 border border-zinc-200 text-center">Gói</td>
                  <td className="p-2 border border-zinc-200 text-center font-mono">1</td>
                  <td className="p-2 border border-zinc-200 text-right font-mono font-bold text-zinc-900">
                    {invoiceData.giaTri.toLocaleString('vi-VN')}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Tổng tiền */}
            <div className="flex justify-between items-center p-3.5 bg-zinc-50 border border-zinc-200 rounded-md">
              <div>
                <span className="text-xs uppercase font-bold text-zinc-500 block">Tổng Tiền Thanh Toán:</span>
                <span className="text-[11px] text-zinc-400 italic">(Đã bao gồm thuế GTGT hợp lệ)</span>
              </div>
              <div className="text-lg font-mono font-bold text-emerald-600">
                {invoiceData.giaTri.toLocaleString('vi-VN')} VNĐ
              </div>
            </div>

            {/* Con dấu điện tử Blockchain */}
            <div className="mt-4 p-3 bg-emerald-50 border border-dashed border-emerald-300 rounded-md flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-600 flex items-center justify-center text-emerald-600 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-xs text-emerald-800 leading-snug">
                <strong className="block text-emerald-900 uppercase tracking-wider text-[11px]">
                  ĐÃ KÝ SỐ VÀ BẢO CHỨNG BLOCKCHAIN
                </strong>
                Xác thực tự động bởi Smart Contract Sepolia • Không thể sửa đổi • Chống xuất khống 100%.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
