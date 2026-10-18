import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_CONFIG, shortenAddress } from '../utils/contract';
import { Copy, ShieldCheck, Flame, Cpu, FileText, Check } from 'lucide-react';

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
        <div className="flex justify-between items-start">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Hóa Đơn On-Chain</span>
          <span className="inline-flex items-center text-[11px] font-mono font-medium text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
            Block #{latestBlock || 'Synced'}
          </span>
        </div>
        <div className="text-3xl font-bold tracking-tight text-zinc-950 mt-2 font-mono tabular-nums">
          {totalInvoices}
        </div>
        <div className="text-xs text-zinc-500 mt-1">Đã chốt bất biến trên sổ cái</div>
      </div>

      {/* Card 2: Hợp đồng EVM */}
      <div className="bg-white border border-zinc-200/90 rounded-xl p-5 shadow-xs">
        <div className="flex justify-between items-start">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Smart Contract</span>
          <span className="inline-flex items-center text-[11px] font-mono font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Sepolia Verified
          </span>
        </div>
        <div className="text-base font-mono font-bold tracking-tight text-zinc-950 mt-2 flex items-center gap-1.5">
          <a 
            href={`${CONTRACT_CONFIG.blockExplorerUrl}/address/${CONTRACT_CONFIG.address}`} 
            target="_blank" 
            rel="noreferrer" 
            className="hover:underline underline-offset-2 hover:text-blue-600"
          >
            {shortenAddress(CONTRACT_CONFIG.address)} ↗
          </a>
          <button 
            onClick={() => handleCopy(CONTRACT_CONFIG.address, 'Địa chỉ hợp đồng')}
            className="text-zinc-400 hover:text-zinc-900 p-0.5 rounded cursor-pointer"
            title="Sao chép"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="text-xs text-zinc-500 mt-1">Pháp lý: HoaDonDienTu.sol</div>
      </div>

      {/* Card 3: Doanh nghiệp phát hành */}
      <div className="bg-white border border-zinc-200/90 rounded-xl p-5 shadow-xs">
        <div className="flex justify-between items-start">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Ví Doanh Nghiệp (msg.sender)</span>
          <span className="inline-flex items-center text-[11px] font-mono font-medium text-zinc-700 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
            {account ? 'Đã Ký Số' : 'Chưa Kết Nối'}
          </span>
        </div>
        <div className="text-base font-mono font-bold tracking-tight text-zinc-950 mt-2 flex items-center gap-1.5">
          {account ? (
            <>
              <span>{shortenAddress(account)}</span>
              <button 
                onClick={() => handleCopy(account, 'Địa chỉ ví')}
                className="text-zinc-400 hover:text-zinc-900 p-0.5 rounded cursor-pointer"
                title="Sao chép"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <span className="text-zinc-400 font-sans text-sm font-normal">Chưa liên kết MetaMask</span>
          )}
        </div>
        <div className="text-xs text-zinc-500 mt-1">Đơn vị phát hành hóa đơn GTGT</div>
      </div>

      {/* Card 4: Tổng doanh thu đối soát thực */}
      <div className="bg-white border border-zinc-200/90 rounded-xl p-5 shadow-xs">
        <div className="flex justify-between items-start">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Doanh Thu Đối Soát Thực</span>
          <span className="inline-flex items-center text-[11px] font-mono font-medium text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            VNĐ On-Chain
          </span>
        </div>
        <div className="text-2xl font-bold tracking-tight text-zinc-950 mt-2 font-mono tabular-nums">
          {totalRevenue ? `${totalRevenue.toLocaleString('vi-VN')}` : '0'} <span className="text-xs font-normal text-zinc-500">VNĐ</span>
        </div>
        <div className="text-xs text-zinc-500 mt-1">Gas khả dụng: {balance} ETH</div>
      </div>
    </div>
  );
}
