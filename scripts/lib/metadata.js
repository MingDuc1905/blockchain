/**
 * Tiện ích giải mã phần metadata (CBOR) nằm ở cuối bytecode do solc sinh ra.
 *
 * Cấu trúc đuôi bytecode:  [ ...mã chạy... ][ CBOR metadata ][ 2 byte độ dài CBOR ]
 * Trong CBOR có trường "solc" = 3 byte (major, minor, patch) -> phiên bản compiler THẬT đã biên dịch ra bytecode.
 * Có thể dùng để kiểm tra lại compiler version khi không chắc, trước khi verify trên Etherscan.
 */

function hexToBytes(hex) {
  const h = hex.startsWith("0x") ? hex.slice(2) : hex;
  return Uint8Array.from(Buffer.from(h, "hex"));
}

// Bộ giải mã CBOR tối giản: đủ cho map {text: bytes | text | bool} mà solc sinh ra
function decodeCbor(bytes) {
  let pos = 0;

  function readLen(info) {
    if (info < 24) return info;
    if (info === 24) return bytes[pos++];
    if (info === 25) {
      const v = (bytes[pos] << 8) | bytes[pos + 1];
      pos += 2;
      return v;
    }
    throw new Error("CBOR: độ dài không được hỗ trợ");
  }

  function readItem() {
    const initial = bytes[pos++];
    const major = initial >> 5;
    const info = initial & 0x1f;
    switch (major) {
      case 2: { // byte string
        const len = readLen(info);
        const out = bytes.slice(pos, pos + len);
        pos += len;
        return out;
      }
      case 3: { // text string
        const len = readLen(info);
        const out = Buffer.from(bytes.slice(pos, pos + len)).toString("utf8");
        pos += len;
        return out;
      }
      case 5: { // map
        const n = readLen(info);
        const obj = {};
        for (let i = 0; i < n; i++) {
          const k = readItem();
          obj[k] = readItem();
        }
        return obj;
      }
      case 7: // simple values: false/true/null
        if (info === 20) return false;
        if (info === 21) return true;
        if (info === 22) return null;
        throw new Error("CBOR: simple value không được hỗ trợ");
      default:
        throw new Error("CBOR: kiểu dữ liệu không được hỗ trợ (major " + major + ")");
    }
  }

  return readItem();
}

/**
 * Tách metadata khỏi bytecode.
 * @param {string} hex bytecode dạng hex (có hoặc không có 0x)
 * @returns {{ code: string, metadata: object|null, solcVersion: string|null, ipfs: string|null }}
 */
function decodeMetadata(hex) {
  const bytes = hexToBytes(hex);
  const cborLen = (bytes[bytes.length - 2] << 8) | bytes[bytes.length - 1];
  if (cborLen === 0 || cborLen + 2 > bytes.length) {
    return { code: "0x" + Buffer.from(bytes).toString("hex"), metadata: null, solcVersion: null, ipfs: null };
  }
  const start = bytes.length - 2 - cborLen;
  let metadata = null;
  try {
    metadata = decodeCbor(bytes.slice(start, bytes.length - 2));
  } catch (e) {
    return { code: "0x" + Buffer.from(bytes).toString("hex"), metadata: null, solcVersion: null, ipfs: null };
  }
  const solc = metadata.solc instanceof Uint8Array && metadata.solc.length === 3
    ? Array.from(metadata.solc).join(".")
    : typeof metadata.solc === "string" ? metadata.solc : null; // bản thử nghiệm (nightly) lưu dạng text
  const ipfs = metadata.ipfs instanceof Uint8Array ? Buffer.from(metadata.ipfs).toString("hex") : null;
  return {
    code: "0x" + Buffer.from(bytes.slice(0, start)).toString("hex"),
    metadata,
    solcVersion: solc,
    ipfs,
  };
}

module.exports = { decodeMetadata };
