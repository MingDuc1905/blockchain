import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_CONFIG, shortenAddress } from '../utils/contract';
import { Send, CheckCircle2, AlertTriangle, AlertCircle, Loader2 } from 'lucide-react';
import { ethers } from 'ethers';

export default function IssueInvoiceTab({ onInvoiceIssued }) {
  const { writeContract, account, connectWallet, refreshBalance, showToast } = useWeb3();

  const [maHD, setMaHD] = useState('');
  const [nguoiMua, setNguoiMua] = useState('');
  const [giaTri, setGiaTri] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 0: Idle, 1: Ký ví, 2: Mempool, 3: Đóng khối
  const [txResult, setTxResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleCheckDuplicate = async () => {
    if (!maHD.trim()) {
      showToast('Thông Báo', 'Vui lòng nhập Mã Hóa Đơn cần kiểm tra!', 'warning');
      return;
    }
    try {
      if (!writeContract) {
        showToast('Chưa Kết Nối Ví', 'Vui lòng kết nối MetaMask để kiểm tra!', 'warning');
        return;
      }
      const daTonTai = await writeContract.kiemTraTrungLap(maHD.trim());
      if (daTonTai) {
        showToast('🚨 CẢNH BÁO TRÙNG LẶP', `Mã hóa đơn [${maHD}] ĐÃ TỒN TẠI trên Blockchain!`, 'danger');
      } else {
        showToast('✅ MÃ HỢP LỆ', `Mã hóa đơn [${maHD}] chưa từng tồn tại. Sẵn sàng phát hành!`, 'success');
      }
    } catch (err) {
      showToast('Lỗi Kiểm Tra', err.message, 'danger');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setTxResult(null);

    if (!account || !writeContract) {
      showToast('Chưa Kết Nối Ví', 'Vui lòng bấm kết nối MetaMask trước!', 'warning');
      await connectWallet();
      return;
    }

    if (!maHD.trim()) {
      showToast('Thiếu Thông Tin', 'Vui lòng nhập mã số hóa đơn!', 'warning');
      return;
    }

    if (!ethers.isAddress(nguoiMua.trim())) {
      showToast('Địa Chỉ Sai Định Dạng', 'Địa chỉ ví bên mua phải là địa chỉ EVM hợp lệ (0x...)!', 'danger');
      return;
    }

    if (!giaTri || Number(giaTri) <= 0) {
      showToast('Giá Trị Sai', 'Tổng tiền thanh toán phải lớn hơn 0 VNĐ!', 'danger');
      return;
    }

    setLoading(true);
    setStep(1); // Bước 1: Ký MetaMask

    try {
      // 1. Kiểm tra trùng mã trước
      const daTonTai = await writeContract.kiemTraTrungLap(maHD.trim());
      if (daTonTai) {
        throw new Error(`PHÁT HIỆN GIAN LẬN: Mã hóa đơn "${maHD}" đã tồn tại trên sổ cái blockchain! Hợp đồng sẽ revert để chống xuất khống.`);
      }

      // 2. Ký giao dịch
      const tx = await writeContract.phatHanhHoaDon(maHD.trim(), nguoiMua.trim(), BigInt(giaTri));
      setStep(2); // Bước 2: Mempool

      // 3. Chờ đóng khối
      const receipt = await tx.wait(1);
      setStep(3); // Bước 3: Hoàn tất

      setTxResult({
        maHD: maHD.trim(),
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        hash: receipt.hash
      });

      showToast('Thành Công On-Chain', `Hóa đơn [${maHD}] đã được băm vào khối #${receipt.blockNumber}!`, 'success');

      // Reset form
      setMaHD('');
      setGiaTri('');

      await refreshBalance();
      if (onInvoiceIssued) onInvoiceIssued();

    } catch (err) {
      console.error('Lỗi phát hành:', err);
      let msg = err.reason || err.message || 'Giao dịch bị từ chối.';
      if (err.data && err.data.message) msg = err.data.message;
      setErrorMsg(msg);
      showToast('Thất Bại', msg, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-zinc-200 rounded-lg shadow-sm">
      <div className="p-5 border-b border-zinc-200 flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-base text-zinc-950">Kê Khai & Ký Số Hóa Đơn Điện Tử</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Dữ liệu hóa đơn sẽ được chốt bất biến trên mạng Ethereum Sepolia</p>
        </div>
        <span className="text-xs font-mono bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded font-medium">
          ERC-EVM Tx
        </span>
      </div>

      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="flex justify-between items-center text-xs font-medium text-zinc-700 mb-1.5">
              <span>Mã Số Hóa Đơn (* Định danh duy nhất)</span>
              <span className="text-[11px] text-zinc-400">Chống xuất khống</span>
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={maHD}
                onChange={(e) => setMaHD(e.target.value)}
                placeholder="VD: HD-HUFLIT-001 hoặc VAT-2026-99" 
                className="flex-1 h-9 px-3 text-sm font-mono border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-950"
                required
              />
              <button 
                type="button" 
                onClick={handleCheckDuplicate}
                className="h-9 px-3 text-xs font-medium border border-zinc-200 rounded-md hover:bg-zinc-50 transition-colors"
              >
                Kiểm Tra Trùng
              </button>
            </div>
            <div className="flex gap-1.5 mt-2 flex-wrap items-center">
              <span className="text-[11px] text-zinc-400">Điền nhanh:</span>
              <button type="button" onClick={() => setMaHD('HD-HUFLIT-001')} className="text-xs font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded hover:bg-zinc-200">
                HD-HUFLIT-001
              </button>
              <button type="button" onClick={() => setMaHD('HD-SEPOLIA-002')} className="text-xs font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded hover:bg-zinc-200">
                HD-SEPOLIA-002
              </button>
              <button type="button" onClick={() => setMaHD('VAT-TAX-2026')} className="text-xs font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded hover:bg-zinc-200">
                VAT-TAX-2026
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-700 mb-1.5">
              Địa Chỉ Ví Bên Mua Hàng (Address 0x...) (*)
            </label>
            <input 
              type="text" 
              value={nguoiMua}
              onChange={(e) => setNguoiMua(e.target.value)}
              placeholder="0x..." 
              className="w-full h-9 px-3 text-sm font-mono border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-950"
              required
            />
            <div className="flex gap-1.5 mt-2 flex-wrap items-center">
              <span className="text-[11px] text-zinc-400">Khách hàng mẫu:</span>
              <button type="button" onClick={() => setNguoiMua('0x70997970C51812dc3A010C7d01b50e0d17dc79C8')} className="text-xs font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded hover:bg-zinc-200">
                0x7099...79C8 (Khách hàng A)
              </button>
              <button type="button" onClick={() => setNguoiMua('0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC')} className="text-xs font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded hover:bg-zinc-200">
                0x3C44...93BC (Khách hàng B)
              </button>
            </div>
          </div>

          <div>
            <label className="flex justify-between items-center text-xs font-medium text-zinc-700 mb-1.5">
              <span>Tổng Tiền Thanh Toán (VNĐ) (*)</span>
              <span className="font-mono text-xs font-bold text-emerald-600">
                {giaTri ? `${Number(giaTri).toLocaleString('vi-VN')} VNĐ` : '0 VNĐ'}
              </span>
            </label>
            <input 
              type="number" 
              value={giaTri}
              onChange={(e) => setGiaTri(e.target.value)}
              placeholder="5000000" 
              min="1000"
              step="1000"
              className="w-full h-9 px-3 text-sm font-mono border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-950"
              required
            />
            <p className="text-[11px] text-zinc-400 mt-1">Số tiền thanh toán sẽ được khóa bất biến vào khối, phục vụ đối soát thuế.</p>
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full h-10 inline-flex items-center justify-center gap-2 text-sm font-medium rounded-md bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 transition-colors shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang Xử Lý Giao Dịch On-Chain...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Ký Số & Phát Hành Lên Sepolia Blockchain</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Stepper */}
        {loading && (
          <div className="mt-5 p-3.5 bg-zinc-50 border border-zinc-200 rounded-md">
            <div className="flex justify-between text-xs font-medium">
              <span className={step >= 1 ? 'text-zinc-950 font-bold' : 'text-zinc-400'}>
                {step > 1 ? '✓ 1. Đã Ký Ví' : '● 1. Ký Xác Nhận'}
              </span>
              <span className={step >= 2 ? 'text-zinc-950 font-bold' : 'text-zinc-400'}>
                {step > 2 ? '✓ 2. Đã Phát Sóng' : '● 2. Mempool P2P'}
              </span>
              <span className={step >= 3 ? 'text-emerald-600 font-bold' : 'text-zinc-400'}>
                {step === 3 ? '✓ 3. Đã Đóng Khối' : '○ 3. Đóng Gói Block'}
              </span>
            </div>
          </div>
        )}

        {/* Success Box */}
        {txResult && (
          <div className="mt-5 p-4 bg-emerald-50 border border-emerald-200 rounded-md text-sm text-emerald-900 flex gap-3 items-start">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Phát Hành Thành Công Vào Sổ Cái Blockchain!</strong>
              <div className="text-xs text-emerald-800 space-y-1 mt-1 font-mono">
                <div>• Mã Hóa Đơn: <strong>{txResult.maHD}</strong></div>
                <div>• Block Number: #{txResult.blockNumber}</div>
                <div>• Gas Tiêu Thụ: {txResult.gasUsed} Units</div>
                <div>
                  • TxHash: <a href={`${CONTRACT_CONFIG.blockExplorerUrl}/tx/${txResult.hash}`} target="_blank" rel="noreferrer" className="underline font-bold text-emerald-700">
                    {shortenAddress(txResult.hash)} ↗
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error Box */}
        {errorMsg && (
          <div className="mt-5 p-4 bg-red-50 border border-red-200 rounded-md text-sm text-red-900 flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">CẢNH BÁO AN TOÀN / REVERT:</strong>
              <p className="text-xs text-red-800 mt-1">{errorMsg}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
