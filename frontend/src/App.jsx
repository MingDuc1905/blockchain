import React, { useState, useEffect } from 'react';
import { Web3Provider, useWeb3 } from './context/Web3Context';
import Navbar from './components/Navbar';
import MetricCards from './components/MetricCards';
import DashboardTab from './components/DashboardTab';
import IssueInvoiceTab from './components/IssueInvoiceTab';
import LookupTab from './components/LookupTab';
import LedgerTab from './components/LedgerTab';
import { CONTRACT_CONFIG } from './utils/contract';

function MainApp() {
  const { readContract, toast } = useWeb3();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [invoices, setInvoices] = useState([]);
  const [lookupInitialCode, setLookupInitialCode] = useState('');

  const loadLedger = async () => {
    if (!readContract) return;
    try {
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
    }
  };

  useEffect(() => {
    if (readContract) {
      loadLedger();
    }
  }, [readContract]);

  const handleSelectInvoiceForLookup = (code) => {
    setLookupInitialCode(code);
    setActiveTab('lookup');
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'dashboard': return 'Bảng Điều Khiển Hóa Đơn Điện Tử';
      case 'issue': return 'Kê Khai & Ký Số Hóa Đơn Mới';
      case 'lookup': return 'Tra Cứu & Xác Thực Tính Toàn Vẹn';
      case 'ledger': return 'Sổ Cái Hóa Đơn Điện Tử On-Chain';
      default: return 'HUFLIT Blockchain';
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-950 flex flex-col font-sans">
      <Navbar activeTab={activeTab} onSelectTab={setActiveTab} />

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 sm:p-8">
        {/* Page Title & Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
              {getPageTitle()}
            </h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Hệ thống chống gian lận và xuất khống hóa đơn doanh nghiệp trên Ethereum Sepolia
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('lookup')}
              className="h-8 px-3 text-xs font-medium rounded-md border border-zinc-200 bg-white text-zinc-800 hover:bg-zinc-50 transition-colors"
            >
              Tra Cứu Nhanh
            </button>
            <button 
              onClick={() => setActiveTab('issue')}
              className="h-8 px-3 text-xs font-medium rounded-md bg-zinc-900 text-white hover:bg-zinc-800 transition-colors shadow-sm"
            >
              Lập Hóa Đơn Mới
            </button>
          </div>
        </div>

        {/* Tab Selection Pill Bar (Shadcn Style) */}
        <div className="inline-flex bg-zinc-100 p-1 rounded-lg gap-1 mb-6 text-xs sm:text-sm">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1.5 font-medium rounded-md transition-all ${
              activeTab === 'dashboard' ? 'bg-white text-zinc-950 shadow-sm font-semibold' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Tổng Quan
          </button>
          <button 
            onClick={() => setActiveTab('issue')}
            className={`px-3 py-1.5 font-medium rounded-md transition-all ${
              activeTab === 'issue' ? 'bg-white text-zinc-950 shadow-sm font-semibold' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Phát Hành Hóa Đơn
          </button>
          <button 
            onClick={() => setActiveTab('lookup')}
            className={`px-3 py-1.5 font-medium rounded-md transition-all ${
              activeTab === 'lookup' ? 'bg-white text-zinc-950 shadow-sm font-semibold' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Tra Cứu & Đối Soát
          </button>
          <button 
            onClick={() => setActiveTab('ledger')}
            className={`px-3 py-1.5 font-medium rounded-md transition-all ${
              activeTab === 'ledger' ? 'bg-white text-zinc-950 shadow-sm font-semibold' : 'text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Sổ Cái Toàn Bộ
          </button>
        </div>

        {/* 4 Metric Stats Cards */}
        <MetricCards totalInvoices={invoices.length} />

        {/* Dynamic Tab Views */}
        <div className="mt-6">
          {activeTab === 'dashboard' && (
            <DashboardTab 
              recentInvoices={invoices} 
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
            <LedgerTab 
              invoices={invoices} 
              onRefresh={loadLedger} 
              onSelectInvoice={handleSelectInvoiceForLookup}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-zinc-400 py-8 border-t border-zinc-200 mt-12">
        Trường Đại học Ngoại ngữ - Tin học TP. Hồ Chí Minh (HUFLIT) • Khoa Công Nghệ Thông Tin<br />
        <strong>Đồ án Môn học: Blockchain và Ứng dụng</strong> • Đề tài 4: Hóa đơn điện tử chống gian lận thuế<br />
        Giảng viên hướng dẫn: TS. Trần Minh Thái
      </footer>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white border border-zinc-200 rounded-lg shadow-lg p-4 flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
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
      <MainApp />
    </Web3Provider>
  );
}
