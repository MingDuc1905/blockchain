/**
 * VERIFY SOURCE TRÊN SEPOLIA ETHERSCAN
 * Yêu cầu: ETHERSCAN_API_KEY trong .env (https://etherscan.io/myapikey - một key dùng cho mọi chain, API v2)
 *
 * Chạy:  npm run verify:sepolia
 * Cấu hình compiler (0.8.20, optimizer 200 runs, shanghai) lấy từ hardhat.config.js
 * nên khớp đúng với lúc deploy. Constructor argument (địa chỉ Arbiter) lấy từ deployments/sepolia.json.
 */
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const f = path.join(__dirname, "..", "deployments", hre.network.name + ".json");
  if (!fs.existsSync(f)) throw new Error("Chưa có " + f + " - hãy chạy deploy trước.");
  const info = JSON.parse(fs.readFileSync(f, "utf8"));

  if (!process.env.ETHERSCAN_API_KEY) throw new Error("Thiếu ETHERSCAN_API_KEY trong .env");

  console.log("Verify", info.address, "với constructor args", info.constructorArguments);
  try {
    await hre.run("verify:verify", {
      address: info.address,
      constructorArguments: info.constructorArguments,
      contract: "contracts/HoaDonDienTu.sol:HoaDonDienTu",
    });
    console.log("Verify thành công: https://sepolia.etherscan.io/address/" + info.address + "#code");
  } catch (e) {
    if (/already verified/i.test(e.message)) {
      console.log("Contract đã được verify trước đó: https://sepolia.etherscan.io/address/" + info.address + "#code");
    } else {
      throw e;
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
