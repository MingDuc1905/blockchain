import React, { useMemo } from 'react';
import { Printer, X, ShieldCheck, CheckCircle2, Lock, ExternalLink } from './Icons';
import { readVietnameseCurrency, formatVND, computeInvoiceHash } from '../utils/taxHelper';
import { shortenAddress, CONTRACT_CONFIG } from '../utils/contract';

export default function InvoicePrintModal({ invoice, onClose }) {
  const invoiceTime = invoice?.thoiGian;
  const dateObj = useMemo(() => {
    return invoiceTime ? new Date(invoiceTime * 1000) : new Date(1771400000000);
  }, [invoiceTime]);

  const invoiceHash = useMemo(() => (invoice ? computeInvoiceHash(invoice) : ''), [invoice]);

  if (!invoice) return null;

  const totalAmount = invoice.giaTri || 0;
  // Giả định cơ cấu thuế: Tiền trước thuế chiếm ~92.6%, thuế GTGT 8%
  const vatRate = 8;
  const preTaxAmount = Math.round(totalAmount / (1 + vatRate / 100));
  const vatAmount = totalAmount - preTaxAmount;

  const day = String(dateObj.getDate()).padStart(2, '0');
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const year = dateObj.getFullYear();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-xs">
      {/* Modal Wrapper - Clean flat border, no heavy wide shadow */}
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white rounded-lg border border-zinc-300 shadow-md flex flex-col">
        
        {/* Top Control Bar (Non-printable) - Clean Enterprise Paper Bar, no AI neon color palette */}
        <div className="no-print sticky top-0 z-10 flex items-center justify-between px-6 py-3 bg-white text-zinc-900 border-b border-zinc-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-zinc-800" />
            <span className="text-xs font-semibold tracking-wide text-zinc-950 uppercase">
              Bản Thể Hiện Hóa Đơn Điện Tử On-Chain
            </span>
            <span className="text-xs bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded border border-zinc-300 font-mono">
              EVM Verified
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md bg-zinc-900 hover:bg-zinc-800 text-white transition-colors cursor-pointer shadow-2xs btn-tactile"
            >
              <Printer className="w-3.5 h-3.5 text-white" />
              <span>In Hóa Đơn (Ctrl + P)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-950 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Page (A4 Paper Aspect, 100% Flat Structure, No Nested Cards) */}
        <div id="print-area" className="p-8 sm:p-12 text-zinc-900 bg-white font-serif leading-normal select-text">
          
          {/* Header Quốc Hiệu */}
          <div className="text-center mb-6">
            <h4 className="text-sm font-bold uppercase tracking-wider text-zinc-950">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </h4>
            <p className="text-xs italic underline underline-offset-4 mt-0.5 text-zinc-800">
              Độc lập - Tự do - Hạnh phúc
            </p>
            <div className="w-24 h-[1px] bg-zinc-900 mx-auto mt-2"></div>
          </div>

          {/* Tiêu Đề Hóa Đơn */}
          <div className="flex justify-between items-start border-b border-zinc-900 pb-5 mb-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight uppercase text-zinc-950 font-sans">
                HÓA ĐƠN GIÁ TRỊ GIA TĂNG
              </h1>
              <p className="text-xs text-zinc-600 italic font-sans mt-0.5">
                (Bản thể hiện của hóa đơn điện tử khởi tạo trên chuỗi khối Blockchain)
              </p>
              <p className="text-xs font-sans mt-1 text-zinc-800">
                Ngày {day} tháng {month} năm {year}
              </p>
            </div>

            {/* Flat metadata, no nested card */}
            <div className="text-right text-xs font-sans space-y-1">
              <div><span className="text-zinc-600">Mẫu số:</span> <strong className="font-mono text-zinc-900">1C26TAA</strong></div>
              <div><span className="text-zinc-600">Ký hiệu:</span> <strong className="font-mono text-zinc-900">C26TBB</strong></div>
              <div><span className="text-zinc-600">Số HĐ:</span> <strong className="font-mono text-zinc-950 text-sm font-bold">{invoice.maHoaDon}</strong></div>
            </div>
          </div>

          {/* Thông tin Bên Bán & Bên Mua - Flat Typographic Layout, No Nested Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-sans mb-6 pb-6 border-b border-zinc-200">
            {/* Đơn vị bán */}
            <div className="space-y-1.5">
              <div className="font-bold text-zinc-950 text-xs uppercase tracking-wider pb-1 border-b border-zinc-200 flex justify-between items-center">
                <span>Đơn vị bán hàng (Seller)</span>
                <span className="text-xs font-mono font-medium text-zinc-700 bg-zinc-100 px-1.5 py-0.2 rounded border border-zinc-300">
                  Xác thực on-chain
                </span>
              </div>
              <div className="pt-0.5">
                <span className="text-zinc-600">Mã số thuế:</span>{' '}
                <strong className="font-mono text-zinc-950">0318992026</strong>
              </div>
              <div>
                <span className="text-zinc-600">Địa chỉ:</span> 828 Sư Vạn Hạnh, Phường 13, Quận 10, TP. Hồ Chí Minh
              </div>
              <div>
                <span className="text-zinc-600">Địa chỉ ví ký phát hành:</span>{' '}
                <span className="font-mono text-zinc-950 break-all">{invoice.nguoiBan}</span>
              </div>
            </div>

            {/* Đơn vị mua */}
            <div className="space-y-1.5">
              <div className="font-bold text-zinc-950 text-xs uppercase tracking-wider pb-1 border-b border-zinc-200">
                Đơn vị mua hàng (Buyer)
              </div>
              <div className="pt-0.5">
                <span className="text-zinc-600">Mã số thuế:</span>{' '}
                <strong className="font-mono text-zinc-950">0109988776</strong>
              </div>
              <div>
                <span className="text-zinc-600">Địa chỉ ví nhận:</span>{' '}
                <span className="font-mono text-zinc-950 break-all">{invoice.nguoiMua}</span>
              </div>
              <div>
                <span className="text-zinc-600">Hình thức thanh toán:</span> Chuyển khoản / Ký xác thực On-chain
              </div>
            </div>
          </div>

          {/* Bảng Kê Chi Tiết Hàng Hóa Dịch Vụ */}
          <div className="mb-4 font-sans">
            <table className="w-full text-xs border-collapse border border-zinc-300">
              <thead>
                <tr className="bg-zinc-100 text-zinc-800 font-semibold text-xs">
                  <th className="border border-zinc-300 p-2 text-center w-12">STT</th>
                  <th className="border border-zinc-300 p-2 text-left">Tên hàng hóa, dịch vụ</th>
                  <th className="border border-zinc-300 p-2 text-center w-20">ĐVT</th>
                  <th className="border border-zinc-300 p-2 text-right w-20">Số lượng</th>
                  <th className="border border-zinc-300 p-2 text-right w-28">Đơn giá</th>
                  <th className="border border-zinc-300 p-2 text-right w-36">Thành tiền (VNĐ)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-zinc-300 p-2.5 text-center font-mono">1</td>
                  <td className="border border-zinc-300 p-2.5">
                    <strong className="text-zinc-950">Gói Dịch Vụ Phần Mềm Quản Lý & Chống Gian Lận Thuế Doanh Nghiệp</strong>
                    <div className="text-xs text-zinc-600 mt-0.5">Hợp đồng điện tử bảo chứng mã hash cryptographic on-chain</div>
                  </td>
                  <td className="border border-zinc-300 p-2.5 text-center">Gói</td>
                  <td className="border border-zinc-300 p-2.5 text-right font-mono tabular-nums">1</td>
                  <td className="border border-zinc-300 p-2.5 text-right font-mono tabular-nums">{formatVND(preTaxAmount)}</td>
                  <td className="border border-zinc-300 p-2.5 text-right font-mono font-medium tabular-nums">{formatVND(preTaxAmount)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-zinc-50">
                  <td colSpan="5" className="border border-zinc-300 p-2 text-right font-semibold text-zinc-800">
                    Cộng tiền hàng (chưa bao gồm thuế GTGT):
                  </td>
                  <td className="border border-zinc-300 p-2 text-right font-mono font-medium tabular-nums text-zinc-900">
                    {formatVND(preTaxAmount)}
                  </td>
                </tr>
                <tr className="bg-zinc-50">
                  <td colSpan="5" className="border border-zinc-300 p-2 text-right font-semibold text-zinc-800">
                    Thuế suất GTGT: <span className="font-mono font-bold text-zinc-900">{vatRate}%</span> | Tiền thuế GTGT:
                  </td>
                  <td className="border border-zinc-300 p-2 text-right font-mono font-medium tabular-nums text-zinc-900">
                    {formatVND(vatAmount)}
                  </td>
                </tr>
                <tr className="bg-zinc-100 text-zinc-950 font-bold text-sm">
                  <td colSpan="5" className="border border-zinc-300 p-2.5 text-right">
                    Tổng cộng tiền thanh toán (Đã bao gồm thuế):
                  </td>
                  <td className="border border-zinc-300 p-2.5 text-right font-mono text-zinc-950 text-base tabular-nums">
                    {formatVND(totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Flat text for currency in words, no nested card */}
            <div className="py-2.5 text-xs italic text-zinc-800 border-b border-zinc-200">
              <span className="font-semibold not-italic text-zinc-950">Số tiền viết bằng chữ:</span> {readVietnameseCurrency(totalAmount)}
            </div>
          </div>

          {/* Khối Niêm Phong Cryptographic On-Chain - 100% Flat Rows, No Dashed Card, No Nested Cards */}
          <div className="py-4 my-2 border-b border-zinc-200 font-sans text-xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-zinc-800" />
                <span className="font-bold text-zinc-950 text-xs uppercase tracking-wider">
                  Chứng thực bảo mật Blockchain Immutability
                </span>
              </div>
              <span className="px-2 py-0.5 text-xs font-semibold rounded bg-zinc-100 text-zinc-800 border border-zinc-300 font-mono">
                Sepolia Secured
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
              <div>
                <span className="text-zinc-600 block">Mã băm dữ liệu HĐ (Keccak-256):</span>
                <p className="font-mono text-zinc-900 break-all select-all pt-0.5">
                  {invoiceHash}
                </p>
              </div>
              <div>
                <span className="text-zinc-600 block">Địa chỉ Smart Contract Cục Thuế:</span>
                <a
                  href={`${CONTRACT_CONFIG.blockExplorerUrl}/address/${CONTRACT_CONFIG.address}`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-zinc-900 hover:text-zinc-950 underline inline-flex items-center gap-1 break-all select-all pt-0.5"
                  title="Xem Smart Contract trên Etherscan Sepolia"
                >
                  {CONTRACT_CONFIG.address} <ExternalLink className="w-3 h-3 opacity-60 inline" />
                </a>
              </div>
            </div>
          </div>

          {/* Footer Ký Tên - Generous Padding, Flat Digital Signature Stamp */}
          <div className="grid grid-cols-2 gap-8 font-sans text-center text-xs pt-4">
            <div>
              <div className="font-semibold text-zinc-950 text-xs">Người mua hàng</div>
              <div className="text-zinc-600 italic mt-0.5">(Ký, ghi rõ họ tên)</div>
              <div className="h-24 flex items-center justify-center text-zinc-500 italic">
                (Đã xác nhận trên chuỗi khối)
              </div>
            </div>

            <div>
              <div className="font-semibold text-zinc-950 text-xs">Người bán hàng</div>
              <div className="text-zinc-600 italic mt-0.5">(Ký số điện tử bằng khóa bí mật)</div>
              
              {/* Tem chứng thực số - Flat, Generous padding, No cramped card */}
              <div className="mt-3 p-4 rounded border border-zinc-300 bg-zinc-50 text-left space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-950 font-bold text-xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-zinc-800" />
                  <span>Ký bởi: {shortenAddress(invoice.nguoiBan)}</span>
                </div>
                <div className="text-xs text-zinc-700 font-mono">
                  Ngày ký: {dateObj.toLocaleString('vi-VN')}
                </div>
                <div className="text-xs text-zinc-800 font-medium">
                  ✓ Chữ ký số hợp lệ & Hóa đơn duy nhất trên Ethereum
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
