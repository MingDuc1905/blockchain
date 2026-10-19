import React from 'react';
import {
  MagnifyingGlass,
  ArrowsClockwise,
  Copy as PhosphorCopy,
  Printer as PhosphorPrinter,
  ArrowSquareOut,
  Wallet as PhosphorWallet,
  SidebarSimple,
  Shield as PhosphorShield,
  ShieldCheck as PhosphorShieldCheck,
  Check as PhosphorCheck,
  CheckCircle as PhosphorCheckCircle,
  Circle as PhosphorCircle,
  X as PhosphorX,
  ArrowRight as PhosphorArrowRight,
  CaretRight,
  Receipt,
  FileText as PhosphorFileText,
  SealCheck,
  Cpu as PhosphorCpu,
  User as PhosphorUser,
  Flame as PhosphorFlame,
  Warning,
  WarningCircle,
  PaperPlaneRight,
  CircleNotch,
  Plus as PhosphorPlus,
  Trash as PhosphorTrash,
  Lock as PhosphorLock,
  QrCode as PhosphorQrCode,
  SquaresFour,
  Database as PhosphorDatabase,
  Sparkle
} from '@phosphor-icons/react';

/**
 * Adapter chuẩn hóa cho toàn bộ ứng dụng sử dụng Phosphor Icons cao cấp
 * Thuộc tiêu chuẩn thiết kế UI/UX Pro Max
 */
const wrap = (Component, defaultWeight = 'bold') => {
  return function IconWrapper({ size = 18, className = '', weight = defaultWeight, ...props }) {
    return <Component size={size} className={className} weight={weight} {...props} />;
  };
};

export const Search = wrap(MagnifyingGlass);
export const RefreshCw = wrap(ArrowsClockwise);
export const Copy = wrap(PhosphorCopy);
export const Printer = wrap(PhosphorPrinter);
export const ExternalLink = wrap(ArrowSquareOut);
export const Wallet = wrap(PhosphorWallet);
export const PanelLeft = wrap(SidebarSimple);
export const Shield = wrap(PhosphorShield);
export const ShieldCheck = wrap(PhosphorShieldCheck);
export const Check = wrap(PhosphorCheck);
export const CheckCircle2 = wrap(PhosphorCheckCircle);
export const Circle = wrap(PhosphorCircle);
export const X = wrap(PhosphorX);
export const ArrowRight = wrap(PhosphorArrowRight);
export const ChevronRight = wrap(CaretRight);
export const FileText = wrap(Receipt);
export const FileCheck = wrap(SealCheck);
export const Cpu = wrap(PhosphorCpu);
export const User = wrap(PhosphorUser);
export const Flame = wrap(PhosphorFlame);
export const AlertTriangle = wrap(Warning);
export const AlertCircle = wrap(WarningCircle);
export const Send = wrap(PaperPlaneRight);
export const Loader2 = ({ size = 18, className = '', ...props }) => (
  <CircleNotch size={size} className={`animate-spin ${className}`} weight="bold" {...props} />
);
export const Plus = wrap(PhosphorPlus);
export const Trash2 = wrap(PhosphorTrash);
export const Lock = wrap(PhosphorLock);
export const QrCode = wrap(PhosphorQrCode);
export const LayoutDashboard = wrap(SquaresFour);
export const Database = wrap(PhosphorDatabase);
export const Sparkles = wrap(Sparkle);
