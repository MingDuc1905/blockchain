import React from 'react';
import { getTrangThaiInfo } from '../utils/invoiceStatus';

export default function StatusBadge({ trangThai, className = '' }) {
  const info = getTrangThaiInfo(trangThai);
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full border text-xs font-semibold whitespace-nowrap ${info.badge} ${className}`}
      title={info.hint}
    >
      {info.label}
    </span>
  );
}
