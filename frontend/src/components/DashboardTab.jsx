import React from 'react';
import { shortenAddress } from '../utils/contract';
import { CheckCircle2, ShieldCheck, ArrowRight, RefreshCw } from 'lucide-react';

export default function DashboardTab({ recentInvoices, onSelectTab, onQuickLookup, onRefresh }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Cơ chế chống gian lận thuế */}
      <div className="bg-white border border-zinc-200 rounded-lg shadow-sm flex flex-col">
        <div className="p-5 border-b border-zinc-200 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-base text-zinc-950">Kiến Trúc Chống Gian Lận Thuế On-Chain</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Mô hình phân tán giữa Doanh nghiệp, Khách hàng và Cơ quan Thuế</p>
          </div>
          <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-medium">
            Active
          </span>
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between">
          <div className="space-y-4 text-sm">
            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded bg-zinc-100 flex items-center justify-center font-bold text-xs text-zinc-800 shrink-0 mt-0.5">
                1
              </div>
              <div>
                <strong className="text-zinc-900">Chống Xuất Khống & Trùng Số Hóa Đơn:</strong>
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                  Hợp đồng kiểm tra <code className="bg-zinc-100 px-1 py-0.5 rounded text-zinc-800">require(!daTonTai[_maHD])</code>. Nếu mã đã tồn tại, giao dịch bị REVERT lập tức, không cho phép tạo hóa đơn khống.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded bg-zinc-100 flex items-center justify-center font-bold text-xs text-zinc-800 shrink-0 mt-0.5">
                2
              </div>
              <div>
                <strong className="text-zinc-900">Bất Biến & Chống Sửa Đổi Dữ Liệu:</strong>
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                  Số tiền, thời gian ghi khối (timestamp), và địa chỉ ví doanh nghiệp được đóng khối vĩnh viễn trên blockchain, chống triệt để hành vi sửa ngày giờ hoặc tẩy xóa tiền thuế.
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-6 h-6 rounded bg-zinc-100 flex items-center justify-center font-bold text-xs text-zinc-800 shrink-0 mt-0.5">
                3
              </div>
              <div>
                <strong className="text-zinc-900">Cổng Đối Soát Công Khai Cho Cơ Quan Thuế:</strong>
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">
                  Cơ quan Thuế hoặc bên mua hàng chỉ cần nhập mã số hóa đơn là có thể đọc trực tiếp từ Smart Contract mà không bị phụ thuộc vào máy chủ trung gian.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 flex gap-3">
            <button 
              onClick={() => onSelectTab('issue')}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
            >
              <span>Phát Hành Hóa Đơn Ngay</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={() => onSelectTab('ledger')}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-50 transition-colors"
            >
              Xem Toàn Bộ Sổ Cái
            </button>
          </div>
        </div>
      </div>

      {/* Danh sách hóa đơn gần nhất (Recent Invoices) */}
      <div className="bg-white border border-zinc-200 rounded-lg shadow-sm flex flex-col">
        <div className="p-5 border-b border-zinc-200 flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-base text-zinc-950">Hóa Đơn Phát Hành Gần Đây</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Giao dịch được đóng gói gần nhất trên Sepolia</p>
          </div>
          <button 
            onClick={onRefresh}
            className="p-1 rounded text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-zinc-100 flex-1">
          {recentInvoices.length === 0 ? (
            <div className="p-8 text-center text-xs text-zinc-400">
              Chưa có hóa đơn nào được ghi nhận trên sổ cái.
            </div>
          ) : (
            recentInvoices.slice(0, 5).map((item, idx) => {
              const dateObj = new Date(item.thoiGian * 1000);
              return (
                <div key={idx} className="p-4 flex justify-between items-center hover:bg-zinc-50 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-zinc-900 font-mono">{item.maHoaDon}</span>
                      <span className="text-[10px] bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded font-mono">
                        Sepolia
                      </span>
                    </div>
                    <div className="text-xs text-zinc-500 font-mono mt-0.5">
                      Đến: {shortenAddress(item.nguoiMua)} • {dateObj.toLocaleDateString('vi-VN')}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-sm text-zinc-900">
                      +{Number(item.giaTri).toLocaleString('vi-VN')} VNĐ
                    </div>
                    <button 
                      onClick={() => onQuickLookup(item.maHoaDon)}
                      className="text-xs text-blue-600 hover:underline cursor-pointer"
                    >
                      Đối soát
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
