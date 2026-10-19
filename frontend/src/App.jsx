import React, { useState, useEffect } from 'react';
import { Web3Provider, useWeb3 } from './context/Web3Context';
import AppSidebar from './components/AppSidebar';
import SiteHeader from './components/SiteHeader';
import SectionCards from './components/SectionCards';
import DashboardTab from './components/DashboardTab';
import IssueInvoiceTab from './components/IssueInvoiceTab';
import LookupTab from './components/LookupTab';
import DataTable from './components/DataTable';
import CommandPalette from './components/CommandPalette';
import InvoicePrintModal from './components/InvoicePrintModal';
import { Search, Plus } from './components/Icons';

function DashboardApp() {
  const { readContract, latestBlock, fetchBlockNumber, toast } = useWeb3();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [invoices, setInvoices] = useState([]);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [lookupInitialCode, setLookupInitialCode] = useState('');
  const [showSidebar, setShowSidebar] = useState(true);
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [selectedPrintInvoice, setSelectedPrintInvoice] = useState(null);

  const loadLedger = async () => {
    if (!readContract) return;
    setLoadingLedger(true);
    try {
      fetchBlockNumber();
      const list = await readContract.layDanhSachMaHoaDon();
      const loaded = [];
      for (let i = list.length - 1; i >= 0; i--) {
        const code = list[i];
        try {
          const hd = await readContract.traCuuHoaDon(code);
          const [maHoaDon, nguoiBan, nguoiMua, giaTri, thoiGian] = hd;
          loaded.push({
            index: i + 1,
            maHoaDon,
            nguoiBan,
            nguoiMua,
            giaTri: Number(giaTri),
            thoiGian: Number(thoiGian)
          });
        } catch (e) {
          console.warn(`Lỗi đọc ${code}:`, e);
        }
      }
      setInvoices(loaded);
    } catch (err) {
      console.error('Lỗi nạp sổ cái:', err);
    } finally {
      setLoadingLedger(false);
    }
  };

  const totalRevenue = invoices.reduce((acc, cur) => acc + (cur.giaTri || 0), 0);

  useEffect(() => {
    if (readContract) {
      loadLedger();
    }
  }, [readContract]);

  const handleSelectInvoiceForLookup = (code) => {
    setLookupInitialCode(code);
    setActiveTab('lookup');
  };

  const handleSelectFromCommandPalette = (inv) => {
    setSelectedPrintInvoice(inv);
  };

  return (
    <div className="min-h-screen bg-white text-zinc-950 flex antialiased">
      {/* 1. AppSidebar (Collapsible Inset style) */}
      {showSidebar && (
        <AppSidebar activeTab={activeTab} onSelectTab={setActiveTab} />
      )}

      {/* 2. Main Content Inset */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        <SiteHeader 
          activeTab={activeTab} 
          onToggleSidebar={() => setShowSidebar(!showSidebar)} 
          onOpenCommandPalette={() => setIsCommandOpen(true)}
        />

        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {/* Header Action Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
                {activeTab === 'dashboard' && 'Dashboard Tổng Quan'}
                {activeTab === 'issue' && 'Kê Khai & Ký Số Hóa Đơn Mới'}
                {activeTab === 'lookup' && 'Tra Cứu & Xác Thực Toàn Vẹn'}
                {activeTab === 'ledger' && 'Sổ Cái Hóa Đơn Điện Tử On-Chain'}
              </h2>
              <p className="text-xs text-zinc-700 mt-1 max-w-md leading-relaxed">
                Hệ thống hóa đơn điện tử chống gian lận thuế doanh nghiệp trên mạng Ethereum Sepolia.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsCommandOpen(true)}
                className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium rounded-md border border-zinc-300 bg-white text-zinc-800 hover:bg-zinc-50 transition-colors shadow-2xs btn-tactile cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-zinc-600" />
                <span>Tìm Kiếm (Ctrl K)</span>
              </button>
              <button 
                onClick={() => setActiveTab('issue')}
                className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded-md bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-xs btn-tactile cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-white" />
                <span>Lập Hóa Đơn Mới</span>
              </button>
            </div>
          </div>

          {/* SectionCards (4 KPI Cards chuẩn Shadcn v4) */}
          <SectionCards 
            totalInvoices={invoices.length} 
            latestBlock={latestBlock}
            totalRevenue={totalRevenue}
          />

          {/* Dynamic Content Views */}
          <div className="mt-6">
            {activeTab === 'dashboard' && (
              <DashboardTab 
                recentInvoices={invoices} 
                loading={loadingLedger}
                onSelectTab={setActiveTab} 
                onQuickLookup={handleSelectInvoiceForLookup}
                onRefresh={loadLedger}
              />
            )}

            {activeTab === 'issue' && (
              <IssueInvoiceTab onInvoiceIssued={loadLedger} />
            )}

            {activeTab === 'lookup' && (
              <LookupTab initialCode={lookupInitialCode} />
            )}

            {activeTab === 'ledger' && (
              <DataTable 
                invoices={invoices} 
                loading={loadingLedger}
                onRefresh={loadLedger} 
                onSelectInvoice={handleSelectInvoiceForLookup}
              />
            )}
          </div>
        </main>
      </div>


      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={() => setIsCommandOpen(false)}
        invoices={invoices}
        onSelectInvoice={handleSelectFromCommandPalette}
        onSelectTab={setActiveTab}
      />

      {/* Global Invoice Print Modal */}
      {selectedPrintInvoice && (
        <InvoicePrintModal
          invoice={selectedPrintInvoice}
          onClose={() => setSelectedPrintInvoice(null)}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white border border-zinc-200 rounded-xl shadow-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
          <div className="flex-1">
            <div className={`text-xs font-semibold ${
              toast.type === 'success' ? 'text-emerald-700' : 
              toast.type === 'danger' ? 'text-red-700' : 'text-zinc-900'
            }`}>
              {toast.title}
            </div>
            <div className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{toast.message}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Web3Provider>
      <DashboardApp />
    </Web3Provider>
  );
}
