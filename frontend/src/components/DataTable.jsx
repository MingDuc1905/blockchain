import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_CONFIG, shortenAddress } from '../utils/contract';
import { formatVND } from '../utils/taxHelper';
import { Search, RefreshCw, Copy, Printer, ExternalLink } from 'lucide-react';

import InvoicePrintModal from './InvoicePrintModal';

export default function DataTable({ invoices, loading, onRefresh, onSelectInvoice }) {
  const { showToast } = useWeb3();
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedInvoiceForPrint, setSelectedInvoiceForPrint] = useState(null);

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast('Đã Sao Chép', `${label} đã được lưu vào clipboard!`, 'info');
  };

  const filtered = invoices.filter(item => 
    item.maHoaDon.toLowerCase().includes(filterQuery.toLowerCase()) ||
    item.nguoiBan.toLowerCase().includes(filterQuery.toLowerCase()) ||
    item.nguoiMua.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="bg-white border border-zinc-200/90 rounded-xl shadow-xs overflow-hidden">
      {/* Header bar (Seamless white, no nested card) */}
      <div className="p-4 sm:p-5 border-b border-zinc-100 flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-base text-zinc-950">Sổ Cái Hóa Đơn Điện Tử On-Chain</h3>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
              Sepolia Testnet
            </span>
          </div>
          <p className="text-xs text-zinc-600 mt-0.5">Sổ cái phân tán chống sửa đổi, chống xuất trùng lặp mã hóa đơn</p>
        </div>
        <button 
          onClick={onRefresh}
          disabled={loading}
          className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium border border-zinc-200 rounded-md bg-white hover:bg-zinc-50 disabled:opacity-50 transition-colors cursor-pointer shadow-2xs btn-tactile"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-zinc-500' : 'text-zinc-600'}`} />
          <span>{loading ? 'Đang Đọc Khối...' : 'Đồng Bộ Sổ Cái'}</span>
        </button>
      </div>

      {/* Filter search bar (Seamless white, no nested card) */}
      <div className="p-3.5 border-b border-zinc-100 flex justify-between items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Lọc nhanh theo Mã HĐ, Ví bán hoặc Ví mua..." 
            className="w-full h-8 pl-9 pr-3 text-xs font-mono border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-950 bg-white text-zinc-900"
          />
        </div>
        <span className="text-xs text-zinc-700 font-mono">
          {loading ? 'Đang đồng bộ...' : `Hiển thị ${filtered.length} / ${invoices.length} hóa đơn`}
        </span>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-zinc-700 border-b border-zinc-200 text-xs font-semibold">
            <tr>
              <th className="py-3 px-4 w-12 text-center">STT</th>
              <th className="py-3 px-4">Mã hóa đơn</th>
              <th className="py-3 px-4">Đơn vị bán (msg.sender)</th>
              <th className="py-3 px-4">Đơn vị mua (khách hàng)</th>
              <th className="py-3 px-4 text-right">Tổng tiền thanh toán</th>
              <th className="py-3 px-4">Thời điểm ghi khối</th>
              <th className="py-3 px-4 text-center w-36">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200/70">
            {loading ? (
              // Anti-AI Slop: Hiển thị Skeleton Shimmer Rows
              [1, 2, 3, 4, 5].map((n) => (
                <tr key={n} className="animate-pulse">
                  <td className="py-4 px-4 text-center"><div className="h-4 w-6 bg-zinc-200 rounded mx-auto" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-28 bg-zinc-200 rounded" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-32 bg-zinc-200 rounded" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-32 bg-zinc-200 rounded" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-24 bg-zinc-200 rounded ml-auto" /></td>
                  <td className="py-4 px-4"><div className="h-4 w-28 bg-zinc-200 rounded" /></td>
                  <td className="py-4 px-4 text-center"><div className="h-6 w-20 bg-zinc-200 rounded mx-auto" /></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-10 text-center text-zinc-500">
                  Không tìm thấy hóa đơn nào khớp với từ khóa tìm kiếm.
                </td>
              </tr>
            ) : (
              filtered.map((item, idx) => {
                const dateObj = new Date(item.thoiGian * 1000);
                return (
                  <tr key={idx} className="hover:bg-zinc-50/70 transition-colors">
                    <td className="py-3.5 px-4 text-center font-mono text-zinc-600 font-semibold">
                      #{item.index}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-950">
                      <span className="inline-flex items-center gap-1.5">
                        {item.maHoaDon}
                        <button 
                          onClick={() => handleCopy(item.maHoaDon, 'Mã HĐ')} 
                          className="text-zinc-500 hover:text-zinc-900 p-0.5 rounded cursor-pointer transition-colors"
                          title="Sao chép mã"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <a 
                        href={`${CONTRACT_CONFIG.blockExplorerUrl}/address/${item.nguoiBan}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-zinc-900 hover:text-emerald-700 underline inline-flex items-center gap-1"
                        title={item.nguoiBan}
                      >
                        {shortenAddress(item.nguoiBan)} <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <a 
                        href={`${CONTRACT_CONFIG.blockExplorerUrl}/address/${item.nguoiMua}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-zinc-900 hover:text-emerald-700 underline inline-flex items-center gap-1"
                        title={item.nguoiMua}
                      >
                        {shortenAddress(item.nguoiMua)} <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </a>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-zinc-950 tabular-nums">
                      {formatVND(item.giaTri)}
                    </td>
                    <td className="py-3.5 px-4 text-zinc-700 font-mono text-xs">
                      {dateObj.toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => onSelectInvoice(item.maHoaDon)}
                          className="h-7 px-2.5 text-xs font-medium border border-zinc-300 rounded hover:bg-zinc-100 transition-colors cursor-pointer bg-white text-zinc-800"
                          title="Xem đối soát chi tiết"
                        >
                          Đối Soát
                        </button>
                        <button 
                          onClick={() => setSelectedInvoiceForPrint(item)}
                          className="h-7 px-2.5 text-xs font-medium border border-zinc-300 bg-white hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 rounded transition-colors cursor-pointer inline-flex items-center gap-1 text-zinc-800"
                          title="Xem bản thể hiện A4 & In"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>In</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Invoice Print Modal */}
      {selectedInvoiceForPrint && (
        <InvoicePrintModal
          invoice={selectedInvoiceForPrint}
          onClose={() => setSelectedInvoiceForPrint(null)}
        />
      )}
    </div>
  );
}
