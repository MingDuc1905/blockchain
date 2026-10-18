import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { shortenAddress } from '../utils/contract';
import { Shield, Wallet, Circle } from 'lucide-react';

export default function Navbar({ activeTab, onSelectTab }) {
  const { account, balance, connectWallet } = useWeb3();

  return (
    <header className="h-14 border-b border-zinc-200 bg-white sticky top-0 z-50 px-6 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); onSelectTab('dashboard'); }} 
          className="flex items-center gap-2 font-bold text-sm tracking-tight text-zinc-950 no-underline"
        >
          <div className="w-7 h-7 bg-zinc-900 rounded-md flex items-center justify-center text-white">
            <Shield className="w-4 h-4" />
          </div>
          <span className="font-semibold">HUFLIT TaxChain</span>
        </a>

        <nav className="hidden md:flex items-center gap-1">
          <button 
            onClick={() => onSelectTab('dashboard')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'dashboard' ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            Tổng Quan
          </button>
          <button 
            onClick={() => onSelectTab('issue')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'issue' ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            Phát Hành Hóa Đơn
          </button>
          <button 
            onClick={() => onSelectTab('lookup')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'lookup' ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            Tra Cứu & Đối Soát
          </button>
          <button 
            onClick={() => onSelectTab('ledger')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'ledger' ? 'bg-zinc-100 text-zinc-950 font-semibold' : 'text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            Sổ Cái On-Chain
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Sepolia (11155111)
        </div>

        <button 
          onClick={connectWallet}
          className="inline-flex items-center gap-2 h-8 px-3 text-xs font-medium rounded-md bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-sm"
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>{account ? `${shortenAddress(account)} (${balance} ETH)` : 'Kết Nối MetaMask'}</span>
        </button>
      </div>
    </header>
  );
}
