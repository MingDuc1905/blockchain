import React from 'react';
import { shortenAddress, CONTRACT_CONFIG } from '../utils/contract';
import { formatVND } from '../utils/taxHelper';
import { ArrowRight, RefreshCw, ExternalLink } from './Icons';

export default function DashboardTab({ recentInvoices, loading, onSelectTab, onQuickLookup, onRefresh }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Cột 1: Kiến trúc chống gian lận thuế - Flat, No nested cards, No shadow */}
      <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm flex flex-col justify-between space-y-6">
        <div>
          <div className="flex justify-between items-center pb-4 border-b border-zinc-100">
            <div>
              <h3 className="font-bold text-base text-zinc-950">Kiến Trúc Chống Gian Lận Thuế On-Chain</h3>
              <p className="text-xs text-zinc-600 mt-0.5">Mô hình phân tán giữa Doanh nghiệp, Khách hàng và Cơ quan Thuế</p>
            </div>
            <span className="text-xs font-mono font-medium bg-zinc-100 text-zinc-800 border border-zinc-300 px-2.5 py-0.5 rounded-full">
              Hoạt động
            </span>
          </div>

          {/* Quy trình luân chuyển dữ liệu phẳng (Flat Flow, no nested card) */}
          <div className="mt-3.5 py-2.5 flex items-center justify-between text-xs text-zinc-700 border-b border-zinc-100">
            <span className="font-semibold text-zinc-950">1. DN Ký Số</span>
            <span className="text-zinc-400 font-mono">➔</span>
            <span className="font-semibold text-zinc-950 font-mono">2. Khối Sepolia</span>
            <span className="text-zinc-400 font-mono">➔</span>
            <span className="font-semibold text-zinc-950">3. Cục Thuế Đối Soát</span>
          </div>

          <div className="space-y-4 text-xs pt-5">
            <div className="flex gap-3.5 items-start">
              <div className="w-5 h-5 rounded bg-zinc-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div>
                <strong className="text-zinc-950 text-xs font-semibold">Chống Xuất Khống & Trùng Số Hóa Đơn:</strong>
                <p className="text-zinc-700 mt-0.5 leading-relaxed">
                  Hợp đồng thông minh kiểm tra <code className="bg-zinc-100 px-1.5 py-0.5 rounded font-mono text-zinc-900">require(!daTonTai[_maHD])</code>. Nếu mã đã tồn tại trên sổ cái, EVM lập tức kích hoạt REVERT, chặn đứng hành vi quay vòng hóa đơn để xin hoàn thuế.
                </p>
              </div>
            </div>

            <div className="flex gap-3.5 items-start">
              <div className="w-5 h-5 rounded bg-zinc-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div>
                <strong className="text-zinc-950 text-xs font-semibold">Bất Biến & Chống Sửa Đổi Dữ Liệu:</strong>
                <p className="text-zinc-700 mt-0.5 leading-relaxed">
                  Số tiền, thời gian ghi khối (timestamp), và địa chỉ ví doanh nghiệp được đóng khối vĩnh viễn trên blockchain, chống triệt để hành vi sửa ngày giờ hoặc tẩy xóa tiền thuế sau khi bị thanh tra.
                </p>
              </div>
            </div>

            <div className="flex gap-3.5 items-start">
              <div className="w-5 h-5 rounded bg-zinc-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div>
                <strong className="text-zinc-950 text-xs font-semibold">Cổng Đối Soát Công Khai Cho Cơ Quan Thuế:</strong>
                <p className="text-zinc-700 mt-0.5 leading-relaxed">
                  Cơ quan Thuế hoặc bên mua hàng chỉ cần nhập mã số hóa đơn là có thể đọc trực tiếp từ Smart Contract mà không bị phụ thuộc vào máy chủ cơ sở dữ liệu tập trung của doanh nghiệp.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-100 flex gap-3">
          <button 
            onClick={() => onSelectTab('issue')}
            className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-semibold rounded-md bg-zinc-900 text-white hover:bg-zinc-800 transition-colors btn-tactile cursor-pointer shadow-xs"
          >
            <span>Phát Hành Hóa Đơn Ngay</span>
            <ArrowRight className="w-3.5 h-3.5 text-white" />
          </button>
          <button 
            onClick={() => onSelectTab('ledger')}
            className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-medium rounded-md bg-white border border-zinc-300 text-zinc-800 hover:bg-zinc-50 transition-colors btn-tactile cursor-pointer"
          >
            Xem Toàn Bộ Sổ Cái
          </button>
        </div>
      </div>

      {/* Cột 2: Danh sách hóa đơn gần nhất (Recent Invoices) */}
      <div className="bg-white border border-zinc-200 rounded-lg p-6 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center pb-4 border-b border-zinc-100">
            <div>
              <h3 className="font-bold text-base text-zinc-950">Hóa Đơn Phát Hành Gần Đây</h3>
              <p className="text-xs text-zinc-600 mt-0.5">Giao dịch được đóng gói gần nhất trên Sepolia</p>
            </div>
            <button 
              onClick={onRefresh}
              disabled={loading}
              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 disabled:opacity-50 transition-colors cursor-pointer"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="divide-y divide-zinc-100 pt-2">
            {loading ? (
              [1, 2, 3, 4].map((n) => (
                <div key={n} className="py-3 flex justify-between items-center animate-pulse">
                  <div className="space-y-1.5">
                    <div className="h-4 w-32 bg-zinc-200 rounded" />
                    <div className="h-3 w-48 bg-zinc-100 rounded" />
                  </div>
                  <div className="space-y-1.5 flex flex-col items-end">
                    <div className="h-4 w-24 bg-zinc-200 rounded" />
                    <div className="h-3 w-12 bg-zinc-100 rounded" />
                  </div>
                </div>
              ))
            ) : recentInvoices.length === 0 ? (
              <div className="py-12 text-center text-xs font-medium text-zinc-600">
                Chưa có hóa đơn nào được ghi nhận trên sổ cái.
              </div>
            ) : (
              recentInvoices.slice(0, 5).map((item, idx) => {
                const dateObj = new Date(item.thoiGian * 1000);
                return (
                  <div key={idx} className="py-3 flex justify-between items-center hover:bg-zinc-50/80 transition-colors">
                    <div>
                      <div className="flex items-center gap-2">
                        <a
                          href={item.txHash ? `${CONTRACT_CONFIG.blockExplorerUrl}/tx/${item.txHash}` : `${CONTRACT_CONFIG.blockExplorerUrl}/address/${CONTRACT_CONFIG.address}`}
                          target="_blank"
                          rel="noreferrer"
                          className="font-semibold text-xs text-zinc-950 font-mono hover:underline inline-flex items-center gap-1 group"
                          title="Xem giao dịch on-chain trên Sepolia Etherscan"
                        >
                          <span>{item.maHoaDon}</span>
                          <ExternalLink className="w-2.5 h-2.5 text-zinc-500 group-hover:text-zinc-950" />
                        </a>
                        <span className="text-xs bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded font-mono font-medium border border-zinc-200">
                          Sepolia
                        </span>
                      </div>
                      <div className="text-xs text-zinc-600 font-mono mt-0.5">
                        Bên mua: {shortenAddress(item.nguoiMua)} • {dateObj.toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-xs text-zinc-950 tabular-nums">
                        {formatVND(item.giaTri)}
                      </div>
                      <button 
                        onClick={() => onQuickLookup(item.maHoaDon)}
                        className="text-xs text-zinc-900 hover:underline cursor-pointer font-semibold mt-0.5 block ml-auto"
                      >
                        Đối soát →
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
