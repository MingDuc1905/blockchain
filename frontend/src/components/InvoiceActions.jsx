import React, { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { CONTRACT_CONFIG, shortenAddress } from '../utils/contract';
import {
  TRANG_THAI,
  getTrangThaiInfo,
  sameAddress,
  friendlyError,
} from '../utils/invoiceStatus';
import { Loader2, Wallet } from './Icons';

const GHI_CHU_TOI_DA = 500; // byte, khớp GHI_CHU_TOI_DA trong contract

const byteLength = (s) => new TextEncoder().encode(s).length;

const BTN_BASE =
  'h-8 px-3.5 text-xs font-semibold rounded-md transition-colors cursor-pointer btn-tactile shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5';
const BTN_PRIMARY = `${BTN_BASE} bg-zinc-900 text-white hover:bg-zinc-800`;
const BTN_DANGER = `${BTN_BASE} bg-red-600 text-white hover:bg-red-700`;
const BTN_OUTLINE = `${BTN_BASE} bg-white text-zinc-800 border border-zinc-300 hover:bg-zinc-50`;

/**
 * Khối thao tác theo vai trò & trạng thái của hóa đơn:
 *  - Người mua  + Pending  : Xác nhận / Từ chối (kèm lý do)
 *  - Người bán  + Pending  : Hủy hóa đơn
 *  - Người bán  + Rejected : Khiếu nại (raiseDispute), tối đa 1 lần
 *  - Arbiter    + Disputed : Phán quyết xác nhận / bác bỏ (resolveDispute)
 * Quyền được kiểm tra lại bởi Smart Contract; giao diện chỉ hiện nút phù hợp với ví đang kết nối.
 */
export default function InvoiceActions({ invoice, onChanged }) {
  const { account, writeContract, arbiter, connectWallet, showToast, refreshBalance } = useWeb3();
  const [form, setForm] = useState(null); // { key, title, desc, danger, needReason, run }
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);
  const [lastTx, setLastTx] = useState(null);

  const { maHoaDon, trangThai } = invoice;
  const info = getTrangThaiInfo(trangThai);

  const isBuyer = sameAddress(account, invoice.nguoiMua);
  const isSeller = sameAddress(account, invoice.nguoiBan);
  const isArbiter = sameAddress(account, arbiter);

  const roles = [
    isSeller && 'Người bán',
    isBuyer && 'Người mua',
    isArbiter && 'Trọng tài',
  ].filter(Boolean);

  // Danh sách thao tác khả dụng cho ví hiện tại
  const actions = [];
  if (trangThai === TRANG_THAI.PENDING && isBuyer) {
    actions.push({
      key: 'confirm',
      label: 'Xác nhận hóa đơn',
      style: BTN_PRIMARY,
      title: 'Xác nhận hóa đơn',
      desc: `Bạn xác nhận hóa đơn ${maHoaDon} là hợp lệ. Hóa đơn chuyển sang "Đã xác nhận" và không thể thay đổi nữa.`,
      run: (c) => c.xacNhanHoaDon(maHoaDon),
    });
    actions.push({
      key: 'reject',
      label: 'Từ chối',
      style: BTN_DANGER,
      title: 'Từ chối hóa đơn',
      desc: `Hóa đơn ${maHoaDon} sẽ chuyển sang "Bị từ chối". Lý do được lưu công khai trên blockchain, hãy tránh nhập thông tin cá nhân nhạy cảm.`,
      danger: true,
      needReason: true,
      run: (c, r) => c.tuChoiHoaDon(maHoaDon, r),
    });
  }
  if (trangThai === TRANG_THAI.PENDING && isSeller) {
    actions.push({
      key: 'cancel',
      label: 'Hủy hóa đơn',
      style: BTN_OUTLINE,
      title: 'Hủy hóa đơn',
      desc: `Hóa đơn ${maHoaDon} sẽ chuyển sang "Đã hủy". Mã hóa đơn vẫn bị chiếm vĩnh viễn và không thể phát hành lại.`,
      danger: true,
      run: (c) => c.huyHoaDon(maHoaDon),
    });
  }
  if (trangThai === TRANG_THAI.REJECTED && isSeller && !invoice.daTranhChap) {
    actions.push({
      key: 'dispute',
      label: 'Khiếu nại (Tranh chấp)',
      style: BTN_PRIMARY,
      title: 'Khiếu nại việc bị từ chối',
      desc: `Bạn gửi hóa đơn ${maHoaDon} cho Trọng tài phân xử. Mỗi hóa đơn chỉ được khiếu nại một lần.`,
      run: (c) => c.raiseDispute(maHoaDon),
    });
  }
  if (trangThai === TRANG_THAI.DISPUTED && isArbiter && !isBuyer && !isSeller) {
    actions.push({
      key: 'resolve-true',
      label: 'Phán quyết: Xác nhận hợp lệ',
      style: BTN_PRIMARY,
      title: 'Phán quyết: xác nhận hóa đơn',
      desc: `Trọng tài xác nhận hóa đơn ${maHoaDon} hợp lệ. Hóa đơn chuyển sang "Đã xác nhận".`,
      run: (c) => c.resolveDispute(maHoaDon, true),
    });
    actions.push({
      key: 'resolve-false',
      label: 'Phán quyết: Bác bỏ',
      style: BTN_DANGER,
      title: 'Phán quyết: bác bỏ khiếu nại',
      desc: `Trọng tài giữ nguyên quyết định từ chối hóa đơn ${maHoaDon}. Hóa đơn quay về "Bị từ chối" và không thể khiếu nại lại.`,
      danger: true,
      run: (c) => c.resolveDispute(maHoaDon, false),
    });
  }

  const openForm = (action) => {
    setReason('');
    setLastTx(null);
    setForm(action);
  };

  const submit = async () => {
    if (!form || busy) return;
    const trimmed = reason.trim();
    if (form.needReason) {
      if (!trimmed) {
        showToast('Thiếu Lý Do', 'Vui lòng nhập lý do từ chối!', 'warning');
        return;
      }
      if (byteLength(trimmed) > GHI_CHU_TOI_DA) {
        showToast('Lý Do Quá Dài', `Lý do tối đa ${GHI_CHU_TOI_DA} byte.`, 'warning');
        return;
      }
    }
    if (!writeContract) {
      showToast('Chưa Sẵn Sàng', 'Hãy kết nối ví MetaMask trước!', 'warning');
      return;
    }

    setBusy(true);
    try {
      showToast('Ký Ví', 'Vui lòng xác nhận giao dịch trên MetaMask...', 'info');
      const tx = await form.run(writeContract, trimmed);
      showToast('Đang Mining', `Giao dịch ${shortenAddress(tx.hash)} đã gửi, đang chờ đóng khối...`, 'info');
      const receipt = await tx.wait();
      setLastTx({ hash: tx.hash, block: receipt.blockNumber, title: form.title });
      showToast('Thành Công', `${form.title}: đã ghi nhận vào Block #${receipt.blockNumber}.`, 'success');
      setForm(null);
      setReason('');
      if (refreshBalance) refreshBalance();
      if (onChanged) await onChanged();
    } catch (err) {
      console.error('Lỗi đổi trạng thái hóa đơn:', err);
      showToast('Thất Bại', friendlyError(err), 'danger');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pt-4 border-t border-zinc-100 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-xs font-semibold text-zinc-700">Thao tác trên hóa đơn</span>
        {account && (
          <span className="text-xs text-zinc-600 font-mono">
            Ví {shortenAddress(account)}: {roles.length ? roles.join(' + ') : 'không phải bên liên quan'}
          </span>
        )}
      </div>

      <p className="text-xs text-zinc-600 leading-relaxed">{info.hint}</p>

      {!account ? (
        <button type="button" onClick={connectWallet} className={BTN_OUTLINE}>
          <Wallet className="w-3.5 h-3.5" />
          <span>Kết nối MetaMask để thao tác</span>
        </button>
      ) : actions.length === 0 ? (
        <p className="text-xs text-zinc-500 italic">
          Ví đang kết nối không có thao tác khả dụng ở trạng thái “{info.label}”.
          {arbiter && !isArbiter && trangThai === TRANG_THAI.DISPUTED && (
            <> Chỉ Trọng tài ({shortenAddress(arbiter)}) được phán quyết.</>
          )}
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {actions.map((a) => (
            <button
              key={a.key}
              type="button"
              disabled={busy}
              onClick={() => openForm(a)}
              className={a.style}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}

      {/* Bảng xác nhận trước khi ký giao dịch */}
      {form && (
        <div
          className={`border rounded-md p-4 space-y-3 text-xs ${
            form.danger ? 'border-red-200 bg-red-50/50' : 'border-zinc-300 bg-zinc-50'
          }`}
        >
          <div className="font-semibold text-zinc-950">{form.title}</div>
          <p className="text-zinc-700 leading-relaxed">{form.desc}</p>

          {form.needReason && (
            <div>
              <label className="block text-zinc-700 font-medium mb-1" htmlFor="ly-do-tu-choi">
                Lý do từ chối (bắt buộc)
              </label>
              <textarea
                id="ly-do-tu-choi"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={busy}
                placeholder="VD: Sai mã số thuế người mua, sai đơn giá..."
                className="w-full px-3 py-2 text-xs border border-zinc-300 rounded-md focus:outline-none focus:ring-1 focus:ring-zinc-950 bg-white text-zinc-900"
              />
              <div
                className={`text-right mt-0.5 font-mono ${
                  byteLength(reason) > GHI_CHU_TOI_DA ? 'text-red-600' : 'text-zinc-500'
                }`}
              >
                {byteLength(reason)} / {GHI_CHU_TOI_DA} byte
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={submit}
              disabled={busy}
              className={form.danger ? BTN_DANGER : BTN_PRIMARY}
            >
              {busy && <Loader2 size={14} className="animate-spin" />}
              <span>{busy ? 'Đang xử lý...' : 'Ký & Gửi giao dịch'}</span>
            </button>
            <button type="button" onClick={() => setForm(null)} disabled={busy} className={BTN_OUTLINE}>
              Bỏ qua
            </button>
          </div>
        </div>
      )}

      {lastTx && (
        <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
          {lastTx.title} thành công · Block #{lastTx.block} ·{' '}
          <a
            href={`${CONTRACT_CONFIG.blockExplorerUrl}/tx/${lastTx.hash}`}
            target="_blank"
            rel="noreferrer"
            className="underline font-mono"
          >
            {shortenAddress(lastTx.hash)}
          </a>
        </div>
      )}
    </div>
  );
}
