import React, { useState, useMemo } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_CONFIG, shortenAddress } from '../utils/contract';
import { readVietnameseCurrency, formatVND, computeInvoiceHash } from '../utils/taxHelper';
import { 
  Send, CheckCircle2, AlertCircle, Loader2, 
  Plus, Trash2, ShieldCheck, Printer, Copy, Check 
} from './Icons';
import { ethers } from 'ethers';
import InvoicePrintModal from './InvoicePrintModal';

export default function IssueInvoiceTab({ onInvoiceIssued }) {
  const { writeContract, account, connectWallet, refreshBalance, showToast } = useWeb3();

  // Invoice Fields
  const [maHD, setMaHD] = useState('HD-2026-006');
  const [nguoiMua, setNguoiMua] = useState('0x70997970C51812dc3A010C7d01b50e0d17dc79C8');
  const [tenNguoiMua, setTenNguoiMua] = useState('Công Ty TNHH Đối Tác Thương Mại Việt Nam');
  const [mstNguoiMua, setMstNguoiMua] = useState('0109988776');
  
  // Tax rate (8% or 10%)
  const [vatRate, setVatRate] = useState(8);

  // Line items
  const [items, setItems] = useState([
    {
      id: 1,
      name: 'Dịch vụ Giải pháp Phần mềm Kê khai & Chống Gian lận Thuế',
      unit: 'Gói',
      quantity: 1,
      price: 50000000
    }
  ]);

  // States
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(null); // null, true, false
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0); // 0: Idle, 1: Ký ví, 2: Mempool, 3: Đóng khối
  const [txResult, setTxResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [createdInvoiceData, setCreatedInvoiceData] = useState(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Calculations
  const preTaxTotal = items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price) || 0), 0);
  const taxAmount = Math.round(preTaxTotal * (vatRate / 100));
  const finalTotal = preTaxTotal + taxAmount;

  // Realtime Hash with useMemo
  const currentInvoiceData = useMemo(() => ({
    maHoaDon: maHD.trim(),
    nguoiBan: account || CONTRACT_CONFIG.address,
    nguoiMua: nguoiMua.trim(),
    giaTri: finalTotal,
    thoiGian: 1771400000,
    items
  }), [maHD, account, nguoiMua, finalTotal, items]);

  const computedHash = useMemo(() => computeInvoiceHash(currentInvoiceData), [currentInvoiceData]);

  // Line item handlers
  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        name: 'Hàng hóa / Dịch vụ bổ sung',
        unit: 'Chiếc',
        quantity: 1,
        price: 1000000
      }
    ]);
  };

  const handleRemoveItem = (id) => {
    if (items.length <= 1) {
      showToast('Thông Báo', 'Hóa đơn phải có ít nhất 1 dòng hàng hóa!', 'warning');
      return;
    }
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleCheckDuplicate = async () => {
    if (!maHD.trim()) {
      showToast('Thông Báo', 'Vui lòng nhập Mã Hóa Đơn cần kiểm tra!', 'warning');
      return;
    }
    setCheckingDuplicate(true);
    try {
      if (!writeContract) {
        showToast('Chưa Sẵn Sàng', 'Đang kết nối Smart Contract Sepolia...', 'warning');
        return;
      }
      const daCo = await writeContract.kiemTraTrungLap(maHD.trim());
      setIsDuplicate(daCo);
      if (daCo) {
        showToast('Cảnh Báo Trùng', `Mã "${maHD.trim()}" ĐÃ TỒN TẠI trên Blockchain!`, 'danger');
      } else {
        showToast('Hợp Lệ', `Mã "${maHD.trim()}" CHƯA TỒN TẠI, có thể phát hành.`, 'success');
      }
    } catch (err) {
      console.error(err);
      showToast('Lỗi', 'Không kiểm tra được mã: ' + err.message, 'danger');
    } finally {
      setCheckingDuplicate(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setTxResult(null);

    if (!account) {
      showToast('Yêu Cầu Kết Nối', 'Vui lòng kết nối ví MetaMask trước khi phát hành!', 'warning');
      await connectWallet();
      return;
    }

    if (!maHD.trim()) {
      showToast('Thiếu Thông Tin', 'Mã hóa đơn không được để trống!', 'warning');
      return;
    }

    if (!ethers.isAddress(nguoiMua.trim())) {
      showToast('Địa Chỉ Sai', 'Địa chỉ ví người mua không hợp lệ!', 'danger');
      return;
    }

    if (finalTotal <= 0) {
      showToast('Giá Trị Sai', 'Tổng tiền hóa đơn phải lớn hơn 0!', 'danger');
      return;
    }

    setLoading(true);
    setStep(1);

    try {
      const isDup = await writeContract.kiemTraTrungLap(maHD.trim());
      if (isDup) {
        setIsDuplicate(true);
        throw new Error(`Mã hóa đơn "${maHD.trim()}" đã tồn tại trên Blockchain! EVM kích hoạt Revert từ chối giao dịch.`);
      }

      showToast('Ký Ví', 'Vui lòng xác nhận giao dịch trên ví MetaMask...', 'info');
      const tx = await writeContract.phatHanhHoaDon(
        maHD.trim(),
        nguoiMua.trim(),
        BigInt(finalTotal)
      );

      setStep(2);
      showToast('Đang Mining', `Giao dịch đã vào Mempool: ${shortenAddress(tx.hash)}. Đang chờ đóng khối...`, 'info');

      const receipt = await tx.wait();
      localStorage.setItem('tx_' + maHD.trim(), tx.hash);
      setStep(3);

      const resultObj = {
        hash: tx.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        maHD: maHD.trim(),
        giaTri: finalTotal,
        thoiGian: Math.floor(Date.now() / 1000)
      };

      setTxResult(resultObj);
      setCreatedInvoiceData({
        maHoaDon: maHD.trim(),
        nguoiBan: account,
        nguoiMua: nguoiMua.trim(),
        giaTri: finalTotal,
        thoiGian: Math.floor(Date.now() / 1000),
        tenNguoiMua,
        mstNguoiMua,
        items
      });

      showToast('Thành Công', `Hóa đơn ${maHD.trim()} đã được ghi nhận vĩnh viễn vào Block #${receipt.blockNumber}!`, 'success');
      refreshBalance();

      if (onInvoiceIssued) {
        onInvoiceIssued();
      }

    } catch (err) {
      console.error('Lỗi phát hành:', err);
      let msg = err.reason || err.message || 'Giao dịch bị từ chối';
      if (msg.includes('Loi: Ma hoa don da ton tai tren he thong!')) {
        msg = 'Hợp đồng từ chối: Mã hóa đơn này đã tồn tại trên sổ cái blockchain!';
        setIsDuplicate(true);
      }
      setErrorMsg(msg);
      showToast('Thất Bại', msg, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(computedHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Main Form Container - Flat, No wide shadow */}
      <div className="bg-white border border-zinc-200 rounded-lg shadow-sm overflow-hidden">
        {/* Header - Seamless white */}
        <div className="p-5 sm:px-7 border-b border-zinc-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold font-mono px-2 py-0.5 rounded bg-zinc-900 text-white">
                1C26TAA
              </span>
              <h3 className="font-semibold text-base text-zinc-950">
                Kê Khai & Ký Số Hóa Đơn Điện Tử
              </h3>
            </div>
            <p className="text-xs text-zinc-600 mt-1">
              Khởi tạo hóa đơn theo Nghị định 123/2020/NĐ-CP & Khóa bất biến vào sổ cái Ethereum Sepolia
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-medium text-zinc-700 bg-zinc-100 border border-zinc-300 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-700"></span>
              EVM Smart Contract
            </span>
          </div>
        </div>

        {/* Form Body - 100% Flat Structure */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-6">
          {/* Section 1: Thông tin định danh hóa đơn */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-zinc-100">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Mẫu số hóa đơn
              </label>
              <input 
                type="text" 
                disabled 
                value="1C26TAA (HĐ GTGT Điện Tử)" 
                className="w-full h-9 px-3 text-xs font-mono bg-zinc-100 border border-zinc-200 rounded-md text-zinc-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                Ký hiệu hóa đơn
              </label>
              <input 
                type="text" 
                disabled 
                value="C26TBB" 
                className="w-full h-9 px-3 text-xs font-mono bg-zinc-100 border border-zinc-200 rounded-md text-zinc-700 cursor-not-allowed"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-zinc-700">
                  Mã số hóa đơn (*)
                </label>
                {isDuplicate === false && (
                  <span className="text-xs text-zinc-800 font-medium">✓ Mã hợp lệ</span>
                )}
                {isDuplicate === true && (
                  <span className="text-xs text-red-700 font-medium">✗ Đã tồn tại</span>
                )}
              </div>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={maHD}
                  onChange={(e) => {
                    setMaHD(e.target.value);
                    setIsDuplicate(null);
                  }}
                  placeholder="VD: HD-2026-006" 
                  className={`flex-1 h-9 px-3 text-xs font-mono border rounded-md focus:outline-none focus:ring-1 ${
                    isDuplicate === true 
                      ? 'border-red-400 bg-red-50 text-red-900 focus:ring-red-500' 
                      : 'border-zinc-300 focus:ring-zinc-950 text-zinc-900'
                  }`}
                  required
                />
                <button 
                  type="button" 
                  onClick={handleCheckDuplicate}
                  disabled={checkingDuplicate}
                  className="h-9 px-3 text-xs font-medium border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 rounded-md transition-colors cursor-pointer shrink-0"
                >
                  {checkingDuplicate ? 'Đang ktra...' : 'Ktra Trùng'}
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Bên Bán & Bên Mua - Flat structure, No nested cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-zinc-100">
            {/* Seller */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-zinc-100">
                <span className="text-xs font-semibold text-zinc-950">
                  Bên bán (phát hành)
                </span>
                <span className="text-xs font-mono text-zinc-600">MST: 0318992026</span>
              </div>
              <div>
                <span className="text-xs font-medium text-zinc-800 block">
                  Tập Đoàn Giải Pháp Chuỗi Khối Đề Tài 4
                </span>
                <span className="text-xs text-zinc-600">
                  828 Sư Vạn Hạnh, Phường 13, Quận 10, TP.HCM
                </span>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Địa chỉ ví ký phát hành (msg.sender)
                </label>
                <div className="text-xs font-mono text-zinc-800 py-1.5 border-b border-zinc-200 truncate">
                  {account ? account : 'Chưa kết nối ví MetaMask'}
                </div>
              </div>
            </div>

            {/* Buyer */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-1 border-b border-zinc-100">
                <span className="text-xs font-semibold text-zinc-950">
                  Bên mua (khách hàng)
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-zinc-700 font-medium">MST:</span>
                  <input 
                    type="text" 
                    value={mstNguoiMua}
                    onChange={(e) => setMstNguoiMua(e.target.value)}
                    className="h-6 w-28 px-1.5 text-xs font-mono bg-white border border-zinc-300 rounded text-zinc-800"
                  />
                </div>
              </div>

              <div>
                <input 
                  type="text" 
                  value={tenNguoiMua}
                  onChange={(e) => setTenNguoiMua(e.target.value)}
                  placeholder="Tên đơn vị / Cá nhân mua hàng" 
                  className="w-full h-8 px-2.5 text-xs font-medium bg-white border border-zinc-300 rounded text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-950"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Địa chỉ ví nhận hóa đơn (*)
                </label>
                <input 
                  type="text" 
                  value={nguoiMua}
                  onChange={(e) => setNguoiMua(e.target.value)}
                  placeholder="0x..." 
                  className="w-full h-8 px-2.5 text-xs font-mono bg-white border border-zinc-300 rounded text-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-950"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Bảng danh mục dòng hàng hóa */}
          <div className="space-y-4 pb-6 border-b border-zinc-100">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-semibold text-zinc-950">
                  Chi tiết danh mục hàng hóa / dịch vụ
                </h4>
                <p className="text-xs text-zinc-600 mt-0.5">
                  Cơ cấu giá dịch vụ dùng để xác thực giá trị giao dịch đóng thuế
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center gap-1 h-7 px-2.5 text-xs font-medium rounded border border-zinc-300 bg-white hover:bg-zinc-50 text-zinc-800 cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm dòng</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-zinc-700 border-b border-zinc-200 text-left font-semibold">
                    <th className="py-3 px-3 w-10 text-center">STT</th>
                    <th className="py-3 px-3">Tên Hàng Hóa / Dịch Vụ</th>
                    <th className="py-3 px-3 w-20 text-center">ĐVT</th>
                    <th className="py-3 px-3 w-20 text-right">SL</th>
                    <th className="py-3 px-3 w-32 text-right">Đơn Giá (VNĐ)</th>
                    <th className="py-3 px-3 w-36 text-right">Thành Tiền (VNĐ)</th>
                    <th className="py-3 px-3 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {items.map((item, idx) => {
                    const rowTotal = (Number(item.quantity) || 0) * (Number(item.price) || 0);
                    return (
                      <tr key={item.id} className="hover:bg-zinc-50/50">
                        <td className="py-3 px-3 text-center font-mono text-zinc-600">{idx + 1}</td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                            className="w-full h-8 px-2 text-xs bg-transparent border border-transparent hover:border-zinc-300 focus:border-zinc-400 focus:bg-white rounded outline-none text-zinc-900"
                            required
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={item.unit}
                            onChange={(e) => handleItemChange(item.id, 'unit', e.target.value)}
                            className="w-full h-8 px-1 text-xs text-center bg-transparent border border-transparent hover:border-zinc-300 focus:border-zinc-400 focus:bg-white rounded outline-none text-zinc-900"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                            className="w-full h-8 px-1 text-xs font-mono text-right bg-transparent border border-transparent hover:border-zinc-300 focus:border-zinc-400 focus:bg-white rounded outline-none tabular-nums text-zinc-900"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min="0"
                            step="1000"
                            value={item.price}
                            onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                            className="w-full h-8 px-2 text-xs font-mono text-right bg-transparent border border-transparent hover:border-zinc-300 focus:border-zinc-400 focus:bg-white rounded outline-none tabular-nums text-zinc-900"
                          />
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-medium text-zinc-950 tabular-nums">
                          {formatVND(rowTotal)}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-zinc-500 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Calculations & Tax Rate - Flat layout, no nested card */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-zinc-800">Thuế suất GTGT:</span>
                <div className="flex gap-1.5">
                  {[8, 10].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => setVatRate(rate)}
                      className={`h-7 px-2.5 text-xs font-medium rounded cursor-pointer transition-colors ${
                        vatRate === rate 
                          ? 'bg-zinc-900 text-white' 
                          : 'bg-white border border-zinc-300 text-zinc-800 hover:bg-zinc-50'
                      }`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1 text-xs text-right w-full sm:w-auto">
                <div className="flex justify-between sm:justify-end gap-6 text-zinc-600">
                  <span>Tiền hàng chưa thuế:</span>
                  <span className="font-mono tabular-nums text-zinc-900">{formatVND(preTaxTotal)}</span>
                </div>
                <div className="flex justify-between sm:justify-end gap-6 text-zinc-600">
                  <span>Tiền thuế GTGT ({vatRate}%):</span>
                  <span className="font-mono tabular-nums text-zinc-900 font-semibold">{formatVND(taxAmount)}</span>
                </div>
                <div className="flex justify-between sm:justify-end gap-6 text-zinc-950 font-bold text-sm pt-1 border-t border-zinc-200">
                  <span>Tổng tiền thanh toán:</span>
                  <span className="font-mono tabular-nums text-zinc-950 text-base">{formatVND(finalTotal)}</span>
                </div>
              </div>
            </div>

            {/* Số tiền viết bằng chữ */}
            <div className="text-xs text-zinc-800 italic pt-1">
              <strong className="not-italic text-zinc-950 font-semibold">Số tiền viết bằng chữ:</strong>{' '}
              {readVietnameseCurrency(finalTotal)}
            </div>
          </div>

          {/* Section 4: Cryptographic Seal & Hash - Flat layout */}
          <div className="space-y-2 pt-2 pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-zinc-800" />
                <span className="text-xs font-semibold text-zinc-950">
                  Mã băm niêm phong hóa đơn (Keccak-256)
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyHash}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-950 cursor-pointer"
              >
                {copiedHash ? <Check className="w-3.5 h-3.5 text-zinc-900" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedHash ? 'Đã sao chép' : 'Sao chép hash'}</span>
              </button>
            </div>
            <p className="text-xs font-mono text-zinc-800 break-all select-all py-1.5 border-b border-zinc-200">
              {computedHash}
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading || isDuplicate === true}
              className="w-full h-11 inline-flex items-center justify-center gap-2 text-sm font-semibold rounded-md bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 transition-all btn-tactile cursor-pointer shadow-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang Ký Số & Khóa Khối Vào Sổ Cái...</span>
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

        {/* Stepper Feedback - Flat layout */}
        {loading && (
          <div className="mx-6 sm:mx-7 mb-6 pt-4 border-t border-zinc-200">
            <div className="flex justify-between text-xs font-medium">
              <span className={step >= 1 ? 'text-zinc-950 font-bold' : 'text-zinc-500'}>
                {step > 1 ? '✓ 1. Đã Ký Ví MetaMask' : '● 1. Chờ Ký Khóa ECDSA'}
              </span>
              <span className={step >= 2 ? 'text-zinc-950 font-bold' : 'text-zinc-500'}>
                {step > 2 ? '✓ 2. P2P Broadcast' : '● 2. Sepolia Mempool'}
              </span>
              <span className={step >= 3 ? 'text-zinc-950 font-bold' : 'text-zinc-500'}>
                {step === 3 ? '✓ 3. Đã Chốt Khối Block' : '○ 3. Đóng Gói Mining'}
              </span>
            </div>
          </div>
        )}

        {/* Success Box - Flat Alert, No Nested Cards */}
        {txResult && (
          <div className="m-6 p-4 bg-zinc-50 border border-zinc-300 rounded-md text-xs text-zinc-950 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="w-5 h-5 text-zinc-900 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold text-sm text-zinc-950">
                  Hóa Đơn Đã Được Đóng Khối Bất Biến!
                </strong>
                <div className="text-xs text-zinc-700 space-y-0.5 mt-1 font-mono">
                  <div>• Mã Hóa Đơn: <strong>{txResult.maHD}</strong></div>
                  <div>• Block Mined: #{txResult.blockNumber} (Gas: {txResult.gasUsed} Units)</div>
                  <div>
                    • Etherscan: <a href={`${CONTRACT_CONFIG.blockExplorerUrl}/tx/${txResult.hash}`} target="_blank" rel="noreferrer" className="underline font-bold text-zinc-950">
                      {shortenAddress(txResult.hash)} ↗
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPrintModal(true)}
              className="inline-flex items-center gap-1.5 h-8 px-3.5 text-xs font-semibold rounded-md bg-zinc-900 hover:bg-zinc-800 text-white transition-colors cursor-pointer shadow-2xs shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Xem & In Hóa Đơn A4</span>
            </button>
          </div>
        )}

        {/* Error Box */}
        {errorMsg && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-md text-xs text-red-900 flex gap-3 items-start">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">GIAO DỊCH BỊ REVERT / TỪ CHỐI:</strong>
              <p className="text-xs text-red-800 mt-1 leading-relaxed">{errorMsg}</p>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Print Modal */}
      {showPrintModal && createdInvoiceData && (
        <InvoicePrintModal
          invoice={createdInvoiceData}
          onClose={() => setShowPrintModal(false)}
        />
      )}
    </div>
  );
}
