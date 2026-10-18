import React, { useState, useEffect } from 'react';
import { Search, FileText, ArrowRight } from 'lucide-react';
import { shortenAddress } from '../utils/contract';
import { formatVND } from '../utils/taxHelper';


export default function CommandPalette({ isOpen, onClose, invoices, onSelectInvoice, onSelectTab }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose(); // toggle or open
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredInvoices = invoices.filter(inv => 
    inv.maHoaDon.toLowerCase().includes(query.toLowerCase()) ||
    inv.nguoiMua.toLowerCase().includes(query.toLowerCase()) ||
    inv.nguoiBan.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-zinc-950/50 backdrop-blur-xs">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
        
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-zinc-200 bg-zinc-50/50 gap-3">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo Mã hóa đơn (HD-...), địa chỉ ví hoặc lệnh..."
            className="w-full text-sm bg-transparent border-none outline-none text-zinc-900 placeholder:text-zinc-400"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-mono text-zinc-700 bg-white border border-zinc-300 rounded shadow-2xs">
            ESC
          </kbd>
        </div>

        {/* Action Commands */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-zinc-100 text-xs">
          {/* Quick navigation */}
          <div className="pb-2">
            <div className="px-3 py-1.5 text-xs font-semibold text-zinc-700">
              Điều hướng nhanh
            </div>
            <div className="grid grid-cols-2 gap-1 px-1">
              <button
                onClick={() => { onSelectTab('issue'); onClose(); }}
                className="flex items-center justify-between p-2 rounded-md hover:bg-zinc-100 text-zinc-800 hover:text-zinc-950 text-left cursor-pointer transition-colors"
              >
                <span>➕ Phát hành hóa đơn mới</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>
              <button
                onClick={() => { onSelectTab('lookup'); onClose(); }}
                className="flex items-center justify-between p-2 rounded-md hover:bg-zinc-100 text-zinc-800 hover:text-zinc-950 text-left cursor-pointer transition-colors"
              >
                <span>🔍 Tra cứu hóa đơn on-chain</span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
              </button>
            </div>
          </div>

          {/* Invoices Search Results */}
          <div className="pt-2">
            <div className="px-3 py-1.5 text-xs font-semibold text-zinc-700 flex justify-between items-center">
              <span>Hóa đơn trên chuỗi khối ({filteredInvoices.length})</span>
            </div>

            {filteredInvoices.length === 0 ? (
              <div className="py-6 text-center text-xs text-zinc-600">
                Không tìm thấy hóa đơn nào khớp với "{query}"
              </div>
            ) : (
              <div className="space-y-0.5 px-1">
                {filteredInvoices.slice(0, 6).map((inv) => (
                  <button
                    key={inv.maHoaDon}
                    onClick={() => {
                      onSelectInvoice(inv);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2 rounded-md hover:bg-zinc-100 text-left cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded bg-zinc-100 group-hover:bg-white flex items-center justify-center text-zinc-600 border border-zinc-200">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-mono font-bold text-zinc-900 group-hover:text-emerald-700">
                          {inv.maHoaDon}
                        </div>
                        <div className="text-xs text-zinc-600">
                          Mua: {shortenAddress(inv.nguoiMua)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-semibold text-zinc-900 tabular-nums">
                        {formatVND(inv.giaTri)}
                      </div>
                      <div className="text-xs text-emerald-800 font-medium">
                        ✓ On-Chain
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-200 text-xs text-zinc-700 flex justify-between items-center">
          <span>Dùng phím <kbd className="font-mono bg-white px-1 py-0.5 border border-zinc-200 rounded">↑</kbd> <kbd className="font-mono bg-white px-1 py-0.5 border border-zinc-200 rounded">↓</kbd> và <kbd className="font-mono bg-white px-1 py-0.5 border border-zinc-200 rounded">Enter</kbd></span>
          <span className="font-mono text-zinc-700">Sepolia EVM Verified</span>
        </div>

      </div>
    </div>
  );
}
