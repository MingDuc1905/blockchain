import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_CONFIG, shortenAddress } from '../utils/contract';
import { TrendingUp, Copy, Check, ShieldCheck, Flame, Cpu, FileText } from 'lucide-react';

export default function SectionCards({ totalInvoices, totalRevenue }) {
  const { account, balance, showToast } = useWeb3();

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast('Đã Sao Chép', `${label} đã được lưu vào clipboard!`, 'info');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Card 1: Total Invoices */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs relative overflow-hidden">
        <div className="flex justify-between items-start">
          <span className="text-xs font-medium text-zinc-500">Tổng Hóa Đơn On-Chain</span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <TrendingUp className="w-3 h-3" />
            +100%
          </span>
        </div>
        <div className="text-2xl font-bold tracking-tight text-zinc-950 mt-2 font-mono tabular-nums">
          {totalInvoices}
        </div>
        <div className="text-xs text-zinc-500 mt-1">Đã băm bất biến vào khối Sepolia</div>
      </div>

      {/* Card 2: Smart Contract */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
        <div className="flex justify-between items-start">
          <span className="text-xs font-medium text-zinc-500">Smart Contract</span>
          <span className="inline-flex items-center text-[11px] font-mono font-medium text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-full border border-zinc-200">
            Sepolia EVM
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
            onClick={() => handleCopy(CONTRACT_CONFIG.address, 'Hợp đồng')}
            className="text-zinc-400 hover:text-zinc-900 p-0.5 rounded"
            title="Sao chép"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="text-xs text-zinc-500 mt-1">Hợp đồng quản lý đối soát thuế</div>
      </div>

      {/* Card 3: Enterprise Wallet */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
        <div className="flex justify-between items-start">
          <span className="text-xs font-medium text-zinc-500">Ví Doanh Nghiệp Ký Số</span>
          <span className="inline-flex items-center text-[11px] font-mono font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            {account ? 'Connected' : 'Offline'}
          </span>
        </div>
        <div className="text-base font-mono font-bold tracking-tight text-zinc-950 mt-2 flex items-center gap-1.5">
          {account ? (
            <>
              <span>{shortenAddress(account)}</span>
              <button 
                onClick={() => handleCopy(account, 'Ví người dùng')}
                className="text-zinc-400 hover:text-zinc-900 p-0.5 rounded"
                title="Sao chép"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <span className="text-zinc-400 font-sans text-sm font-normal">Chưa liên kết</span>
          )}
        </div>
        <div className="text-xs text-zinc-500 mt-1">msg.sender phát hành hóa đơn</div>
      </div>

      {/* Card 4: Gas Balance */}
      <div className="bg-white border border-zinc-200 rounded-xl p-5 shadow-xs">
        <div className="flex justify-between items-start">
          <span className="text-xs font-medium text-zinc-500">Số Dư Gas Khả Dụng</span>
          <span className="inline-flex items-center text-[11px] font-mono font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
            Gas Tank
          </span>
        </div>
        <div className="text-2xl font-bold tracking-tight text-zinc-950 mt-2 font-mono tabular-nums">
          {balance} ETH
        </div>
        <div className="text-xs text-zinc-500 mt-1">Sepolia testnet tokens</div>
      </div>
    </div>
  );
}
