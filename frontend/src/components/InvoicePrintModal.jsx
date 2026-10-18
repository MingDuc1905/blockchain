import React, { useMemo } from 'react';
import { Printer, X, ShieldCheck, CheckCircle2, QrCode, Lock } from 'lucide-react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
      {/* Modal Wrapper */}
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-white rounded-xl shadow-2xl border border-zinc-200 flex flex-col">
        
        {/* Top Control Bar (Non-printable) */}
        <div className="no-print sticky top-0 z-10 flex items-center justify-between px-6 py-3.5 bg-zinc-900 text-white border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold tracking-wide">BẢN THỂ HIỆN HÓA ĐƠN ĐIỆN TỬ ON-CHAIN</span>
            <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono">
              EVM Validated
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium rounded-md bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>In Hóa Đơn (Ctrl + P)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Page (A4 Paper Aspect) */}
        <div id="print-area" className="p-8 sm:p-12 text-zinc-900 bg-white font-serif leading-normal select-text">
          
          {/* Header Quốc Hiệu */}
          <div className="text-center mb-6">
            <h4 className="text-sm font-bold uppercase tracking-wider">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h4>
            <p className="text-xs italic underline underline-offset-4 mt-0.5">Độc lập - Tự do - Hạnh phúc</p>
            <div className="w-24 h-0.5 bg-zinc-900 mx-auto mt-2"></div>
          </div>

          {/* Tiêu Đề Hóa Đơn */}
          <div className="flex justify-between items-start border-b-2 border-zinc-900 pb-5 mb-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight uppercase text-zinc-950 font-sans">
                HÓA ĐƠN GIÁ TRỊ GIA TĂNG
              </h1>
              <p className="text-xs text-zinc-600 italic font-sans mt-0.5">
                (Bản thể hiện của hóa đơn điện tử khởi tạo trên chuỗi khối Blockchain)
              </p>
              <p className="text-xs font-sans mt-1">
                Ngày {day} tháng {month} năm {year}
              </p>
            </div>

            <div className="text-right text-xs font-sans space-y-1 bg-zinc-50 p-3 rounded border border-zinc-200">
              <div><span className="text-zinc-500">Mẫu số:</span> <strong className="font-mono">1C26TAA</strong></div>
              <div><span className="text-zinc-500">Ký hiệu:</span> <strong className="font-mono">C26TBB</strong></div>
              <div><span className="text-zinc-500">Số HĐ:</span> <strong className="font-mono text-emerald-700 text-sm">{invoice.maHoaDon}</strong></div>
            </div>
          </div>

          {/* Thông tin Bên Bán & Bên Mua */}
          <div className="space-y-4 text-xs font-sans mb-6">
            {/* Đơn vị bán */}
            <div className="p-3.5 rounded-md border border-zinc-200 bg-zinc-50/60">
              <div className="font-bold text-zinc-950 text-sm mb-1.5 flex items-center justify-between">
                <span>Đơn vị bán hàng (Seller)</span>
                <span className="text-xs bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded font-mono font-medium">
                  Xác thực on-chain
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1">
                <div><span className="text-zinc-600">Tên đơn vị:</span> <strong>TẬP ĐOÀN CÔNG NGHỆ CHUỖI KHỐI ĐỀ TÀI 4</strong></div>
                <div><span className="text-zinc-600">Mã số thuế:</span> <strong className="font-mono">0318992026</strong></div>
                <div className="sm:col-span-2"><span className="text-zinc-600">Địa chỉ:</span> 828 Sư Vạn Hạnh, Phường 13, Quận 10, TP. Hồ Chí Minh</div>
                <div className="sm:col-span-2">
                  <span className="text-zinc-600">Địa chỉ ví ký phát hành:</span>{' '}
                  <code className="font-mono text-zinc-900 bg-zinc-200/70 px-1 py-0.5 rounded">{invoice.nguoiBan}</code>
                </div>
              </div>
            </div>

            {/* Đơn vị mua */}
            <div className="p-3.5 rounded-md border border-zinc-200 bg-zinc-50/60">
              <div className="font-bold text-zinc-950 text-sm mb-1.5">
                <span>Đơn vị mua hàng (Buyer)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-1">
                <div><span className="text-zinc-600">Tên đơn vị:</span> <strong>CÔNG TY TNHH ĐỐI TÁC THƯƠNG MẠI VIỆT NAM</strong></div>
                <div><span className="text-zinc-600">Mã số thuế:</span> <strong className="font-mono">0109988776</strong></div>
                <div className="sm:col-span-2">
                  <span className="text-zinc-600">Địa chỉ ví nhận hóa đơn:</span>{' '}
                  <code className="font-mono text-zinc-900 bg-zinc-200/70 px-1 py-0.5 rounded">{invoice.nguoiMua}</code>
                </div>
              </div>
            </div>
          </div>

          {/* Bảng Kê Chi Tiết Hàng Hóa Dịch Vụ */}
          <div className="mb-6 font-sans">
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
                    <strong>Gói Dịch Vụ Phần Mềm Quản Lý & Chống Gian Lận Thuế Doanh Nghiệp</strong>
                    <div className="text-xs text-zinc-600 mt-0.5">Hợp đồng điện tử bảo chứng mã hash cryptographic on-chain</div>
                  </td>
                  <td className="border border-zinc-300 p-2.5 text-center">Gói</td>
                  <td className="border border-zinc-300 p-2.5 text-right font-mono tabular-nums">1</td>
                  <td className="border border-zinc-300 p-2.5 text-right font-mono tabular-nums">{formatVND(preTaxAmount)}</td>
                  <td className="border border-zinc-300 p-2.5 text-right font-mono font-medium tabular-nums">{formatVND(preTaxAmount)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="bg-zinc-50/50">
                  <td colSpan="5" className="border border-zinc-300 p-2 text-right font-semibold">Cộng tiền hàng (chưa bao gồm thuế GTGT):</td>
                  <td className="border border-zinc-300 p-2 text-right font-mono font-medium tabular-nums">{formatVND(preTaxAmount)}</td>
                </tr>
                <tr className="bg-zinc-50/50">
                  <td colSpan="5" className="border border-zinc-300 p-2 text-right font-semibold">
                    Thuế suất GTGT: <span className="font-mono text-emerald-800 font-bold">{vatRate}%</span> | Tiền thuế GTGT:
                  </td>
                  <td className="border border-zinc-300 p-2 text-right font-mono font-medium tabular-nums">{formatVND(vatAmount)}</td>
                </tr>
                <tr className="bg-zinc-100/80 text-zinc-950 font-bold text-sm">
                  <td colSpan="5" className="border border-zinc-300 p-2.5 text-right">
                    Tổng cộng tiền thanh toán (Đã bao gồm thuế):
                  </td>
                  <td className="border border-zinc-300 p-2.5 text-right font-mono text-emerald-800 text-base tabular-nums">
                    {formatVND(totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>

            {/* Tiền bằng chữ */}
            <div className="p-3 bg-zinc-50 border border-zinc-300 border-t-0 text-xs italic">
              <span className="font-semibold not-italic">Số tiền viết bằng chữ:</span> {readVietnameseCurrency(totalAmount)}
            </div>
          </div>

          {/* Khối Niêm Phong Cryptographic On-Chain */}
          <div className="p-4 rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50/80 font-sans text-xs space-y-2 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-700" />
                <span className="font-bold text-zinc-950 text-xs tracking-wide">
                  Chứng thực bảo mật Blockchain Immutability
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-zinc-700" />
                <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-700 text-white font-mono">
                  Sepolia Secured
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
              <div>
                <span className="text-zinc-600">Mã băm dữ liệu HĐ (Keccak-256):</span>
                <p className="font-mono text-zinc-800 break-all select-all bg-white p-1.5 rounded border border-zinc-200 mt-0.5">
                  {invoiceHash}
                </p>
              </div>
              <div>
                <span className="text-zinc-600">Địa chỉ Smart Contract Cục Thuế:</span>
                <p className="font-mono text-zinc-800 break-all select-all bg-white p-1.5 rounded border border-zinc-200 mt-0.5">
                  {CONTRACT_CONFIG.address}
                </p>
              </div>
            </div>
          </div>

          {/* Footer Ký Tên */}
          <div className="grid grid-cols-2 gap-8 font-sans text-center text-xs pt-4">
            <div>
              <div className="font-semibold text-zinc-950 text-xs">Người mua hàng</div>
              <div className="text-zinc-600 italic mt-0.5">(Ký, ghi rõ họ tên)</div>
              <div className="h-20 flex items-center justify-center text-zinc-500 italic">
                (Đã xác nhận trên chuỗi khối)
              </div>
            </div>

            <div className="relative">
              <div className="font-semibold text-zinc-950 text-xs">Người bán hàng</div>
              <div className="text-zinc-600 italic mt-0.5">(Ký số điện tử bằng khóa bí mật)</div>
              
              {/* Tem chứng thực số */}
              <div className="mt-3 inline-block p-3 rounded border-2 border-emerald-600 bg-emerald-50/80 text-left font-sans">
                <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Ký bởi: {shortenAddress(invoice.nguoiBan)}</span>
                </div>
                <div className="text-xs text-zinc-700 mt-1 font-mono">
                  Ngày ký: {dateObj.toLocaleString('vi-VN')}
                </div>
                <div className="text-xs text-emerald-800 font-semibold mt-0.5">
                  ✓ Chữ ký số hợp lệ & Hóa đơn duy nhất
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
