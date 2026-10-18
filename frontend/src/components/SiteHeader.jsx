import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { shortenAddress } from '../utils/contract';
import { Wallet, PanelLeft, Search } from 'lucide-react';

export default function SiteHeader({ activeTab, onToggleSidebar, onOpenCommandPalette }) {
  const { account, balance, connectWallet } = useWeb3();

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard Tổng Quan';
      case 'issue': return 'Phát Hành Hóa Đơn Điện Tử';
      case 'lookup': return 'Tra Cứu & Xác Thực Toàn Vẹn';
      case 'ledger': return 'Sổ Cái Giao Dịch On-Chain';
      default: return 'Tài liệu';
    }
  };

  return (
    <header className="h-14 border-b border-zinc-200/80 bg-white px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button 
            onClick={onToggleSidebar} 
            className="p-1.5 -ml-1.5 rounded-md text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
            title="Đóng/Mở Sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        )}

        {/* Separator vertical */}
        <div className="h-4 w-[1px] bg-zinc-200"></div>

        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-zinc-400 font-medium">Cổng Thuế</span>
          <span className="text-zinc-300">/</span>
          <span className="text-zinc-900 font-semibold">{getBreadcrumb()}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Search Shortcut Button */}
        {onOpenCommandPalette && (
          <button
            onClick={onOpenCommandPalette}
            className="hidden md:inline-flex items-center gap-2 h-8 px-2.5 text-xs text-zinc-700 bg-zinc-100/80 border border-zinc-300 rounded-md hover:border-zinc-400 hover:text-zinc-950 transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-zinc-600" />
            <span className="font-medium">Tìm kiếm...</span>
            <kbd className="text-xs font-mono font-bold bg-white border border-zinc-300 px-1.5 py-0.5 rounded text-zinc-900 shadow-2xs">
              Ctrl K
            </kbd>
          </button>

        )}

        {/* Network Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
          Sepolia (11155111)
        </div>


        {/* Connect Button */}
        <button 
          onClick={connectWallet}
          className="inline-flex items-center gap-2 h-8 px-3 text-xs font-medium rounded-md bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-xs btn-tactile cursor-pointer"
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>{account ? `${shortenAddress(account)} (${balance} ETH)` : 'Kết Nối MetaMask'}</span>
        </button>
      </div>
    </header>
  );
}
