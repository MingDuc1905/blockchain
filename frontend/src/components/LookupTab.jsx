import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_CONFIG } from '../utils/contract';
import { formatVND, readVietnameseCurrency } from '../utils/taxHelper';
import { Search, ShieldCheck, AlertTriangle, Copy, Printer } from './Icons';
import InvoicePrintModal from './InvoicePrintModal';

export default function LookupTab({ initialCode }) {
  const { readContract, showToast } = useWeb3();

  const [maHD, setMaHD] = useState(initialCode || '');
  const [invoiceData, setInvoiceData] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const lastLookedUpCode = useRef('');

  const executeLookup = useCallback(async (codeToSearch) => {
    const code = (codeToSearch !== undefined ? codeToSearch : maHD).trim();
    if (!code) {
      showToast('Thông Báo', 'Vui lòng nhập Mã Số Hóa Đơn cần tra cứu!', 'warning');
      return;
    }

    setLoading(true);
    setNotFound(false);
    setInvoiceData(null);

    try {
      if (!readContract) {
        showToast('Chưa Sẵn Sàng', 'Đang kết nối RPC Sepolia, vui lòng thử lại sau giây lát!', 'warning');
        return;
      }

      const daTonTai = await readContract.kiemTraTrungLap(code);
      if (!daTonTai) {
        setNotFound(true);
        showToast('Không Tồn Tại', `Hóa đơn "${code}" không có bản ghi nào trên blockchain!`, 'danger');
        return;
      }

      const res = await readContract.traCuuHoaDon(code);
      const [maHoaDon, nguoiBan, nguoiMua, giaTri, thoiGian] = res;

      setInvoiceData({
        maHoaDon,
        nguoiBan,
        nguoiMua,
        giaTri: Number(giaTri),
        thoiGian: Number(thoiGian)
      });

      showToast('Xác Thực Hợp Lệ', `Đã tìm thấy hóa đơn [${code}] trên chuỗi khối!`, 'success');

    } catch (err) {
      console.error('Lỗi tra cứu:', err);
      showToast('Lỗi Tra Cứu', err.message, 'danger');
    } finally {
      setLoading(false);
    }
  }, [maHD, readContract, showToast]);

  useEffect(() => {
    if (initialCode && initialCode !== lastLookedUpCode.current && readContract) {
      lastLookedUpCode.current = initialCode;
      setMaHD(initialCode);
      executeLookup(initialCode);
    }
  }, [initialCode, readContract, executeLookup]);

  const handleLookup = (e) => {
    if (e) e.preventDefault();
    executeLookup(maHD);
  };

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast('Đã Sao Chép', `${label} đã được lưu vào clipboard!`, 'info');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Header Container - Clean flat border, no heavy shadow */}
      <div className="bg-white border border-zinc-200 rounded-lg shadow-sm overflow-hidden">
        {/* Header - Seamless white */}
        <div className="p-5 sm:px-7 border-b border-zinc-100 flex justify-between items-center flex-wrap gap-4">
          <div>
            <h3 className="font-semibold text-base text-zinc-950">
              Tra Cứu & Xác Thực Tính Toàn Vẹn Hóa Đơn
            </h3>
            <p className="text-xs text-zinc-600 mt-0.5">
              Dành cho Cơ quan Thuế và Khách hàng đối soát hóa đơn trực tiếp từ Smart Contract
            </p>
          </div>
          <span className="text-xs font-mono font-medium bg-zinc-100 text-zinc-800 border border-zinc-300 px-2.5 py-1 rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-zinc-700" />
            <span>Tax Authority Audit</span>
          </span>
        </div>

        <div className="p-6 sm:p-7">
          <form onSubmit={handleLookup} className="flex gap-2">
            <div className="relative flex-1">
              <input 
                type="text" 
                value={maHD}
                onChange={(e) => setMaHD(e.target.value)}
                placeholder="Nhập mã định danh hóa đơn (VD: HD-2026-001 hoặc HD-2026-002)..." 
                className="w-full h-10 px-3.5 text-xs font-mono border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-950 bg-white text-zinc-900"
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="h-10 px-5 inline-flex items-center gap-2 text-xs font-semibold rounded-md bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors cursor-pointer btn-tactile shadow-2xs"
            >
              <Search className="w-3.5 h-3.5 text-white" />
              <span>{loading ? 'Đang đọc...' : 'Tra Cứu'}</span>
            </button>
          </form>

          {/* Chưa tìm kiếm (Flat layout, no nested card) */}
          {!loading && !invoiceData && !notFound && (
            <div className="mt-6 pt-5 border-t border-zinc-100 text-center text-xs text-zinc-600 space-y-2.5">
              <p className="max-w-md mx-auto leading-relaxed">
                Nhập mã số hóa đơn để tra cứu dữ liệu gốc đã được mã hóa bất biến trên mạng Ethereum Sepolia.
              </p>
              <div className="flex gap-2 justify-center items-center flex-wrap pt-1">
                <span className="text-zinc-700 font-medium">Gợi ý mã mẫu:</span>
                {['HD-2026-001', 'HD-2026-002', 'HD-2026-003'].map(sample => (
                  <button
                    key={sample}
                    type="button"
                    onClick={() => {
                      setMaHD(sample);
                      executeLookup(sample);
                    }}
                    className="font-mono text-xs text-zinc-800 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 px-2 py-0.5 rounded cursor-pointer transition-colors"
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Skeleton loading khi đang truy vấn */}
          {loading && (
            <div className="mt-6 pt-6 border-t border-zinc-100 animate-pulse space-y-4">
              <div className="h-6 w-64 bg-zinc-200 rounded mx-auto" />
              <div className="h-4 w-80 bg-zinc-100 rounded mx-auto" />
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="h-16 bg-zinc-100 rounded" />
                <div className="h-16 bg-zinc-100 rounded" />
              </div>
            </div>
          )}

          {/* Cảnh báo không tìm thấy / Gian lận */}
          {notFound && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md text-xs text-red-950 flex gap-3 items-start">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="block font-bold text-red-900">
                  CẢNH BÁO: HÓA ĐƠN KHÔNG TỒN TẠI TRÊN SỔ CÁI BLOCKCHAIN!
                </strong>
                <p className="text-zinc-700 leading-relaxed">
                  Mã hóa đơn <code className="font-mono font-bold bg-red-100 px-1 py-0.5 rounded">"{maHD}"</code> chưa từng được phát hành hoặc không tồn tại trong hợp đồng thông minh.
                </p>
                <p className="text-zinc-600 italic pt-0.5">
                  Khuyến cáo Cơ quan Thuế & Doanh nghiệp: Hóa đơn này không đủ điều kiện khấu trừ thuế GTGT hoặc có dấu hiệu làm giả mạo ngoài chuỗi khối.
                </p>
              </div>
            </div>
          )}

          {/* Kết quả Tra cứu Hợp Lệ (100% Flat Layout, Zero Nested Cards) */}
          {invoiceData && (
            <div className="mt-6 pt-5 border-t border-zinc-200 space-y-5">
              {/* Header Box */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-zinc-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-950 font-mono">
                      HÓA ĐƠN HỢP LỆ: #{invoiceData.maHoaDon}
                    </h4>
                    <p className="text-xs text-zinc-600 mt-0.5">
                      Ghi nhận vào chuỗi khối: {new Date(invoiceData.thoiGian * 1000).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPrintModal(true)}
                  className="inline-flex items-center gap-2 h-8 px-3.5 text-xs font-semibold rounded-md bg-zinc-900 hover:bg-zinc-800 text-white transition-colors cursor-pointer shadow-2xs btn-tactile"
                >
                  <Printer className="w-3.5 h-3.5 text-white" />
                  <span>Xem & In Bản Thể Hiện A4</span>
                </button>
              </div>

              {/* Thông tin đối soát 2 bên - 100% Flat Rows, No Nested Card Boxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Bên Bán */}
                <div className="space-y-2">
                  <div className="font-semibold text-zinc-950 text-xs pb-1 border-b border-zinc-100">
                    Đơn vị bán (phát hành)
                  </div>
                  <div>
                    <span className="text-zinc-600 block text-xs">Địa chỉ ví msg.sender:</span>
                    <div className="font-mono text-zinc-900 flex items-center justify-between py-1 border-b border-zinc-200 mt-0.5">
                      <a href={`${CONTRACT_CONFIG.blockExplorerUrl}/address/${invoiceData.nguoiBan}`} target="_blank" rel="noreferrer" className="underline hover:text-zinc-950 truncate">
                        {invoiceData.nguoiBan}
                      </a>
                      <button onClick={() => handleCopy(invoiceData.nguoiBan, 'Ví người bán')} className="text-zinc-500 hover:text-zinc-900 ml-1 p-0.5 cursor-pointer">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-700 font-medium">
                    ✓ Khóa riêng ECDSA đã ký xác thực on-chain
                  </div>
                </div>

                {/* Bên Mua */}
                <div className="space-y-2">
                  <div className="font-semibold text-zinc-950 text-xs pb-1 border-b border-zinc-100">
                    Đơn vị mua (khách hàng)
                  </div>
                  <div>
                    <span className="text-zinc-600 block text-xs">Địa chỉ ví nhận:</span>
                    <div className="font-mono text-zinc-900 flex items-center justify-between py-1 border-b border-zinc-200 mt-0.5">
                      <a href={`${CONTRACT_CONFIG.blockExplorerUrl}/address/${invoiceData.nguoiMua}`} target="_blank" rel="noreferrer" className="underline hover:text-zinc-950 truncate">
                        {invoiceData.nguoiMua}
                      </a>
                      <button onClick={() => handleCopy(invoiceData.nguoiMua, 'Ví người mua')} className="text-zinc-500 hover:text-zinc-900 ml-1 p-0.5 cursor-pointer">
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-600">
                    Hình thức: Nhận hóa đơn điện tử bảo chứng
                  </div>
                </div>
              </div>

              {/* Khối tiền thanh toán (Flat layout) */}
              <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="text-xs font-semibold text-zinc-700 block">
                    Tổng giá trị thanh toán hóa đơn:
                  </span>
                  <span className="text-xs text-zinc-800 italic">
                    {readVietnameseCurrency(invoiceData.giaTri)}
                  </span>
                </div>
                <div className="font-mono font-bold text-xl text-zinc-950 tabular-nums">
                  {formatVND(invoiceData.giaTri)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Print Modal */}
      {showPrintModal && invoiceData && (
        <InvoicePrintModal
          invoice={invoiceData}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
}
