import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_CONFIG, shortenAddress } from '../utils/contract';
import { FileText, Cpu, User, Flame, Copy } from 'lucide-react';

export default function MetricCards({ totalInvoices }) {
  const { account, balance, showToast } = useWeb3();

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    showToast('Đã Sao Chép', `${label} đã được lưu vào clipboard!`, 'info');
  };

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Tổng Hóa Đơn On-Chain</span>
          <FileText className="w-4 h-4 text-zinc-400" />
        </div>
        <div className="text-2xl font-bold tracking-tight text-zinc-900">{totalInvoices}</div>
        <div className="text-xs text-zinc-500 mt-1">Đã băm bất biến vào block</div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Hợp Đồng Thông Minh</span>
          <Cpu className="w-4 h-4 text-zinc-400" />
        </div>
        <div className="text-base font-mono font-semibold text-zinc-900 flex items-center gap-1.5">
          <a 
            href={`${CONTRACT_CONFIG.blockExplorerUrl}/address/${CONTRACT_CONFIG.address}`} 
            target="_blank" 
            rel="noreferrer" 
            className="text-zinc-900 underline underline-offset-2 hover:text-blue-600"
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
        <div className="text-xs text-zinc-500 mt-1">Sepolia EVM Verified</div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Ví Doanh Nghiệp Ký Số</span>
          <User className="w-4 h-4 text-zinc-400" />
        </div>
        <div className="text-base font-mono font-semibold text-zinc-900">
          {account ? (
            <div className="flex items-center gap-1.5">
              <span>{shortenAddress(account)}</span>
              <button 
                onClick={() => handleCopy(account, 'Ví người dùng')}
                className="text-zinc-400 hover:text-zinc-900 p-0.5 rounded"
                title="Sao chép"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <span className="text-zinc-400 font-sans text-sm">Chưa liên kết</span>
          )}
        </div>
        <div className="text-xs text-zinc-500 mt-1">msg.sender phát hành hóa đơn</div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-lg p-5 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Số Dư Gas Khả Dụng</span>
          <Flame className="w-4 h-4 text-zinc-400" />
        </div>
        <div className="text-2xl font-mono font-bold tracking-tight text-zinc-900">{balance} ETH</div>
        <div className="text-xs text-zinc-500 mt-1">Sepolia testnet tokens</div>
      </div>
    </section>
  );
}
