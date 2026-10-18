import React from 'react';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_CONFIG, shortenAddress } from '../utils/contract';
import { 
  LayoutDashboard, 
  FileText, 
  Search, 
  Database, 
  FileCheck, 
  Shield, 
  User, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';


export default function AppSidebar({ activeTab, onSelectTab }) {
  const { account, balance } = useWeb3();

  const navMain = [
    { id: 'dashboard', title: 'Dashboard', icon: LayoutDashboard },
    { id: 'issue', title: 'Phát Hành Hóa Đơn', icon: FileText },
    { id: 'lookup', title: 'Tra Cứu & Xác Thực', icon: Search },
    { id: 'ledger', title: 'Sổ Cái Blockchain', icon: Database },
  ];

  const documents = [
    { title: 'Báo Cáo Thuế GTGT', icon: FileCheck },
    { title: 'Kiểm Định Hợp Đồng', icon: ExternalLink, href: `${CONTRACT_CONFIG.blockExplorerUrl}/address/${CONTRACT_CONFIG.address}` },
  ];

  return (
    <aside className="w-64 h-screen border-r border-zinc-200 bg-zinc-50/50 flex flex-col justify-between shrink-0 sticky top-0">
      <div>
        {/* Sidebar Header: Logo TaxChain */}
        <div className="h-14 px-4 flex items-center border-b border-zinc-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-white shrink-0 shadow-sm">
              <Shield className="w-4 h-4" />
            </div>
            <div className="grid leading-tight">
              <span className="font-semibold text-sm text-zinc-950 truncate">TaxChain</span>
              <span className="text-xs text-zinc-600 font-mono truncate">Sepolia Enterprise</span>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="px-3 py-4">
          <div className="text-xs font-semibold text-zinc-700 px-2.5 mb-2">
            Nghiệp vụ chính
          </div>
          <nav className="space-y-1">
            {navMain.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-md transition-all ${
                    isActive 
                      ? 'bg-zinc-900 text-white font-semibold shadow-xs' 
                      : 'text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-600'}`} />
                    <span>{item.title}</span>
                  </div>
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Documents Section */}
        <div className="px-3 py-2 border-t border-zinc-200/80">
          <div className="text-xs font-semibold text-zinc-700 px-2.5 mb-2">
            Kiểm toán & đối soát
          </div>
          <div className="space-y-1">
            {documents.map((doc, idx) => {
              const Icon = doc.icon;
              return doc.href ? (
                <a
                  key={idx}
                  href={doc.href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200/70 rounded-md transition-colors"
                >
                  <Icon className="w-4 h-4 text-zinc-500" />
                  <span>{doc.title}</span>
                </a>
              ) : (
                <button
                  key={idx}
                  onClick={() => onSelectTab('ledger')}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-zinc-700 hover:text-zinc-950 hover:bg-zinc-200/70 rounded-md transition-colors text-left"
                >
                  <Icon className="w-4 h-4 text-zinc-500" />
                  <span>{doc.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sidebar Footer: Accessible User Status (No cramped padding) */}
      <div className="p-4 border-t border-zinc-200/80 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-zinc-200/90 flex items-center justify-center text-zinc-800 font-bold text-xs shrink-0 font-mono">
          {account ? account.substring(2, 4).toUpperCase() : <User className="w-4 h-4 text-zinc-700" />}
        </div>
        <div className="grid leading-tight flex-1 min-w-0">
          <span className="font-semibold text-xs text-zinc-950 font-mono truncate">
            {account ? shortenAddress(account) : 'Chưa kết nối ví'}
          </span>
          <span className="text-xs text-zinc-700 font-mono truncate mt-0.5">
            {balance} Sepolia ETH
          </span>
        </div>
      </div>


    </aside>
  );
}
