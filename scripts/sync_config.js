/**
 * ĐỒNG BỘ ABI + ĐỊA CHỈ CONTRACT vào giao diện web sau khi deploy.
 *
 * Đọc:  artifacts/ (ABI mới biên dịch) và deployments/sepolia.json (địa chỉ, block deploy)
 * Ghi:  frontend/src/utils/contract.js, app/contract_info.js, app/index.html
 *       và thay địa chỉ cũ trong các script minh họa (scripts/*.py) nếu có.
 *
 * Chạy:  npm run compile && node scripts/sync_config.js
 *        (thêm --abi-only để chỉ cập nhật ABI, không đổi địa chỉ)
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const abiOnly = process.argv.includes("--abi-only");

const artifactPath = path.join(ROOT, "artifacts", "contracts", "HoaDonDienTu.sol", "HoaDonDienTu.json");
if (!fs.existsSync(artifactPath)) throw new Error("Chưa biên dịch. Chạy `npm run compile` trước.");
const abi = JSON.parse(fs.readFileSync(artifactPath, "utf8")).abi;

let deployment = null;
const depPath = path.join(ROOT, "deployments", "sepolia.json");
if (!abiOnly) {
  if (!fs.existsSync(depPath)) throw new Error("Chưa có deployments/sepolia.json. Hãy deploy trước hoặc dùng --abi-only.");
  deployment = JSON.parse(fs.readFileSync(depPath, "utf8"));
}

// Tìm vị trí ngoặc đóng tương ứng với ngoặc mở tại vị trí `open`
function matchBracket(src, open) {
  let depth = 0, inStr = false, esc = false;
  for (let i = open; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === "[" || c === "{") depth++;
    else if (c === "]" || c === "}") { depth--; if (depth === 0) return i; }
  }
  throw new Error("Không tìm thấy ngoặc đóng của abi");
}

function patchConfig(file) {
  const full = path.join(ROOT, file);
  let src = fs.readFileSync(full, "utf8");
  const eol = src.includes("\r\n") ? "\r\n" : "\n";
  src = src.replace(/\r\n/g, "\n");

  const abiIdx = src.search(/\babi:\s*\[/);
  if (abiIdx < 0) throw new Error("Không thấy `abi: [` trong " + file);
  const lineStart = src.lastIndexOf("\n", abiIdx) + 1;
  const indent = src.slice(lineStart, abiIdx);
  const open = src.indexOf("[", abiIdx);
  const close = matchBracket(src, open);
  const abiText = JSON.stringify(abi, null, 2)
    .split("\n")
    .map((l, i) => (i === 0 ? l : indent + l))
    .join("\n");
  src = src.slice(0, open) + abiText + src.slice(close + 1);

  if (deployment) {
    src = src.replace(/(\baddress:\s*")0x[0-9a-fA-F]{40}(")/, `$1${deployment.address}$2`);
    if (/\bdeployBlock:/.test(src)) {
      src = src.replace(/(\bdeployBlock:\s*)\d+/, `$1${deployment.blockNumber}`);
    } else {
      src = src.replace(/(\baddress:\s*"0x[0-9a-fA-F]{40}",?\n)/, `$1${indent}deployBlock: ${deployment.blockNumber}, // block triển khai (giới hạn phạm vi quét event)\n`);
    }
  }
  fs.writeFileSync(full, src.replace(/\n/g, eol));
  console.log("[OK] Đã cập nhật", file);
}

function currentAddress(file) {
  const m = fs.readFileSync(path.join(ROOT, file), "utf8").match(/\baddress:\s*"(0x[0-9a-fA-F]{40})"/);
  return m ? m[1] : null;
}

// Các địa chỉ cũ cần thay trong tài liệu / script minh họa
const configFiles = ["frontend/src/utils/contract.js", "app/contract_info.js"];
const oldAddrs = new Set([
  "0xce2A4698BAcc6F108574B303cA5a633a5AF66B9C", // contract v1 (frontend + script báo cáo)
  "0x358AA13c52544ECCEF6B0ADD0f801012ADAD5eE3", // contract v1 (app/)
]);
for (const f of configFiles) {
  const a = currentAddress(f);
  if (a) oldAddrs.add(a);
}

configFiles.forEach((f) => fs.existsSync(path.join(ROOT, f)) && patchConfig(f));

if (deployment) {
  const newAddr = deployment.address;
  const short = (a) => a.slice(0, 6) + "..." + a.slice(-4);
  const textFiles = [
    "app/index.html",
    "scripts/demo_hoadon.py",
    "scripts/tao_anh_bao_cao.py",
    "scripts/xuat_hinh_don_le.py",
  ];
  for (const f of textFiles) {
    const full = path.join(ROOT, f);
    if (!fs.existsSync(full)) continue;
    let s = fs.readFileSync(full, "utf8");
    const before = s;
    for (const old of oldAddrs) {
      if (old.toLowerCase() === newAddr.toLowerCase()) continue;
      s = s.split(old).join(newAddr);
      s = s.split(short(old)).join(short(newAddr));
    }
    if (s !== before) {
      fs.writeFileSync(full, s);
      console.log("[OK] Đã thay địa chỉ contract trong", f);
    }
  }
  console.log("\nContract mới:", newAddr, "| block", deployment.blockNumber);
}
