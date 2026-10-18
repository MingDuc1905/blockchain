import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_CONFIG, shortenAddress } from '../utils/contract';
import { Copy } from 'lucide-react';

export default function SectionCards({ totalInvoices, latestBlock, totalRevenue }) {
  const { account, balance, showToast } = useWeb3();

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast('Đã Sao Chép', `${label} đã được lưu vào bộ nhớ tạm!`, 'info');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Card 1: Hóa đơn đã ghi khối */}
      <div className="bg-white border border-zinc-200/90 rounded-xl p-5 shadow-xs relative">
        <div className="flex justify-between items-center gap-2">
          <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider truncate">Hóa Đơn On-Chain</span>
          <span className="inline-flex items-center text-xs font-mono font-semibold text-zinc-800 bg-zinc-100 px-2.5 py-0.5 rounded border border-zinc-200 shrink-0">
            #{latestBlock || 'Synced'}
          </span>
        </div>
        <div className="text-3xl font-bold tracking-tight text-zinc-950 mt-2 font-mono tabular-nums">
          {totalInvoices}
        </div>
        <div className="text-xs text-zinc-700 mt-1">Đã chốt bất biến trên sổ cái</div>
      </div>

      {/* Card 2: Hợp đồng EVM */}
      <div className="bg-white border border-zinc-200/90 rounded-xl p-5 shadow-xs">
        <div className="flex justify-between items-center gap-2">
          <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider truncate">Smart Contract</span>
          <span className="inline-flex items-center text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 shrink-0">
            Sepolia Verified
          </span>
        </div>
        <div className="text-sm font-mono font-bold tracking-tight text-zinc-950 mt-2.5 flex items-center gap-1.5">
          <a 
            href={`${CONTRACT_CONFIG.blockExplorerUrl}/address/${CONTRACT_CONFIG.address}`} 
            target="_blank" 
            rel="noreferrer" 
            className="hover:underline underline-offset-2 hover:text-emerald-700"
          >
            {shortenAddress(CONTRACT_CONFIG.address)} ↗
          </a>
          <button 
            onClick={() => handleCopy(CONTRACT_CONFIG.address, 'Địa chỉ hợp đồng')}
            className="text-zinc-600 hover:text-zinc-950 p-0.5 rounded cursor-pointer"
            title="Sao chép"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="text-xs text-zinc-700 mt-1">Pháp lý: HoaDonDienTu.sol</div>
      </div>

      {/* Card 3: Doanh nghiệp phát hành */}
      <div className="bg-white border border-zinc-200/90 rounded-xl p-5 shadow-xs">
        <div className="flex justify-between items-center gap-2">
          <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider truncate">Ví Doanh Nghiệp</span>
          <span className="inline-flex items-center text-xs font-mono font-semibold text-zinc-800 bg-zinc-100 px-2.5 py-0.5 rounded border border-zinc-200 shrink-0">
            {account ? 'Đã Ký Số' : 'Chưa Kết Nối'}
          </span>
        </div>
        <div className="text-sm font-mono font-bold tracking-tight text-zinc-950 mt-2.5 flex items-center gap-1.5">
          {account ? (
            <>
              <span>{shortenAddress(account)}</span>
              <button 
                onClick={() => handleCopy(account, 'Địa chỉ ví')}
                className="text-zinc-600 hover:text-zinc-950 p-0.5 rounded cursor-pointer"
                title="Sao chép"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <span className="text-zinc-600 font-sans text-xs font-medium">Chưa liên kết ví</span>
          )}
        </div>
        <div className="text-xs text-zinc-700 mt-1">Đơn vị phát hành hóa đơn GTGT</div>
      </div>

      {/* Card 4: Tổng doanh thu */}
      <div className="bg-white border border-zinc-200/90 rounded-xl p-5 shadow-xs">
        <div className="flex justify-between items-center gap-2">
          <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider truncate">Doanh Thu On-Chain</span>
          <span className="inline-flex items-center text-xs font-mono font-semibold text-zinc-800 bg-zinc-100 px-2.5 py-0.5 rounded border border-zinc-200 shrink-0">
            VNĐ
          </span>
        </div>
        <div className="text-2xl font-bold tracking-tight text-zinc-950 mt-2 font-mono tabular-nums truncate">
          {totalRevenue ? `${totalRevenue.toLocaleString('vi-VN')}` : '0'} <span className="text-xs font-normal text-zinc-700">₫</span>
        </div>
        <div className="text-xs text-zinc-700 mt-1">Số dư ví: {balance} ETH</div>
      </div>
    </div>

  );
}
