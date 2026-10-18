import { ethers } from 'ethers';

/**
 * Đọc số tiền thành chữ tiếng Việt chuẩn hóa đơn tài chính
 */
export function readVietnameseCurrency(number) {
  if (!number || isNaN(number) || number <= 0) return 'Không đồng';
  
  const defaultNumbers = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];

  function readGroupThree(group) {
    let [a, b, c] = [Math.floor(group / 100), Math.floor((group % 100) / 10), group % 10];
    let res = '';
    
    if (a > 0 || group >= 100) {
      res += `${defaultNumbers[a]} trăm `;
    }
    
    if (b > 1) {
      res += `${defaultNumbers[b]} mươi `;
      if (c === 1) res += 'mốt ';
      else if (c === 4) res += 'tư ';
      else if (c === 5) res += 'lăm ';
      else if (c > 0) res += `${defaultNumbers[c]} `;
    } else if (b === 1) {
      res += 'mười ';
      if (c === 1) res += 'một ';
      else if (c === 5) res += 'lăm ';
      else if (c > 0) res += `${defaultNumbers[c]} `;
    } else if (b === 0 && (a > 0 || group >= 100) && c > 0) {
      res += `lẻ ${defaultNumbers[c]} `;
    } else if (b === 0 && a === 0 && c > 0) {
      res += `${defaultNumbers[c]} `;
    }
    
    return res.trim();
  }

  let numStr = Math.floor(number).toString();
  let groups = [];
  while (numStr.length > 0) {
    groups.unshift(parseInt(numStr.slice(-3)));
    numStr = numStr.slice(0, -3);
  }

  let words = [];
  for (let i = 0; i < groups.length; i++) {
    let group = groups[i];
    let unit = units[groups.length - 1 - i];
    if (group > 0) {
      let groupWords = readGroupThree(group);
      words.push(`${groupWords} ${unit}`.trim());
    }
  }

  let finalWords = words.join(' ').trim();
  // Viết hoa chữ cái đầu tiên
  finalWords = finalWords.charAt(0).toUpperCase() + finalWords.slice(1) + ' đồng chẵn.';
  return finalWords;
}

/**
 * Định dạng tiền tệ VNĐ chuẩn ngân hàng
 */
export function formatVND(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

/**
 * Tính toán mã băm SHA-256 đóng dấu niêm phong dữ liệu hóa đơn (EVM compatible)
 */
export function computeInvoiceHash(invoiceData) {
  try {
    const rawPayload = JSON.stringify({
      code: invoiceData.maHoaDon || invoiceData.maHD,
      seller: invoiceData.nguoiBan,
      buyer: invoiceData.nguoiMua,
      amount: String(invoiceData.giaTri),
      timestamp: invoiceData.thoiGian || Date.now(),
      items: invoiceData.items || []
    });
    return ethers.keccak256(ethers.toUtf8Bytes(rawPayload));
  } catch (err) {
    return '0x0000000000000000000000000000000000000000000000000000000000000000';
  }
}

