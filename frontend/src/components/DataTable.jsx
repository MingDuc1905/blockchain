import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_CONFIG, shortenAddress } from '../utils/contract';
import { Search, RefreshCw, Copy, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DataTable({ invoices, onRefresh, onSelectInvoice }) {
  const { showToast } = useWeb3();
  const [filterQuery, setFilterQuery] = useState('');

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
    <div className="bg-white border border-zinc-200 rounded-xl shadow-xs overflow-hidden">
      {/* Header bar */}
      <div className="p-4 sm:p-5 border-b border-zinc-200 flex justify-between items-center flex-wrap gap-4">
        <div>
          <h3 className="font-semibold text-base text-zinc-950">Sổ Cái Hóa Đơn Điện Tử On-Chain</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Danh sách các khối lưu trữ hóa đơn trên mạng Ethereum Sepolia</p>
        </div>
        <button 
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Đồng Bộ Sổ Cái</span>
        </button>
      </div>

      {/* Filter search bar */}
      <div className="p-3.5 border-b border-zinc-200 bg-zinc-50/50 flex justify-between items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Lọc theo mã hóa đơn hoặc địa chỉ ví..." 
            className="w-full h-8 pl-9 pr-3 text-xs font-mono border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-950 bg-white"
          />
        </div>
        <span className="text-xs text-zinc-500 font-mono">
          Hiển thị {filtered.length} / {invoices.length} hóa đơn
        </span>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50/75 text-zinc-500 border-b border-zinc-200 font-medium">
            <tr>
              <th className="py-3 px-4 w-12 text-center">STT</th>
              <th className="py-3 px-4">Mã Hóa Đơn</th>
              <th className="py-3 px-4">Đơn Vị Bán (msg.sender)</th>
              <th className="py-3 px-4">Đơn Vị Mua (Khách Hàng)</th>
              <th className="py-3 px-4">Tổng Tiền Thanh Toán</th>
              <th className="py-3 px-4">Thời Điểm Ghi Khối</th>
              <th className="py-3 px-4 text-center w-28">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-8 text-center text-zinc-400">
                  Không tìm thấy hóa đơn nào khớp với từ khóa tìm kiếm.
                </td>
              </tr>
            ) : (
              filtered.map((item, idx) => {
                const dateObj = new Date(item.thoiGian * 1000);
                return (
                  <tr key={idx} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3.5 px-4 text-center font-mono text-zinc-400 font-semibold">
                      #{item.index}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-950">
                      <span className="inline-flex items-center gap-1.5">
                        {item.maHoaDon}
                        <button 
                          onClick={() => handleCopy(item.maHoaDon, 'Mã HĐ')} 
                          className="text-zinc-400 hover:text-zinc-800 p-0.5 rounded cursor-pointer"
                          title="Sao chép"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <a 
                        href={`${CONTRACT_CONFIG.blockExplorerUrl}/address/${item.nguoiBan}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-zinc-900 underline hover:text-blue-600 inline-flex items-center gap-1"
                      >
                        {shortenAddress(item.nguoiBan)} ↗
                      </a>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <a 
                        href={`${CONTRACT_CONFIG.blockExplorerUrl}/address/${item.nguoiMua}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-zinc-900 underline hover:text-blue-600 inline-flex items-center gap-1"
                      >
                        {shortenAddress(item.nguoiMua)} ↗
                      </a>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-zinc-950 tabular-nums">
                      {item.giaTri.toLocaleString('vi-VN')} VNĐ
                    </td>
                    <td className="py-3.5 px-4 text-zinc-500">
                      {dateObj.toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button 
                        onClick={() => onSelectInvoice(item.maHoaDon)}
                        className="h-7 px-2.5 text-xs font-medium border border-zinc-200 rounded-md hover:bg-zinc-100 transition-colors cursor-pointer bg-white"
                      >
                        Đối Soát
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
