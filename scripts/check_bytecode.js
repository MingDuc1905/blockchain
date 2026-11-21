/**
 * KIỂM TRA BYTECODE ON-CHAIN so với mã nguồn hiện tại (dùng khi không chắc compiler version).
 *
 *  1) Lấy runtime bytecode đang chạy trên chuỗi (eth_getCode)
 *  2) Giải mã metadata CBOR ở đuôi -> đọc ra phiên bản solc THẬT đã dùng khi deploy
 *  3) So sánh phần mã chạy với deployedBytecode biên dịch cục bộ (bỏ phần metadata hash)
 *
 * Chạy:  CONTRACT_ADDRESS=0x... npx hardhat run scripts/check_bytecode.js --network sepolia
 *        (nếu không đặt CONTRACT_ADDRESS sẽ đọc từ deployments/<network>.json)
 */
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");
const { decodeMetadata } = require("./lib/metadata");

async function main() {
  const { ethers, artifacts, network } = hre;

  let address = process.env.CONTRACT_ADDRESS;
  if (!address) {
    const f = path.join(__dirname, "..", "deployments", network.name + ".json");
    if (!fs.existsSync(f)) throw new Error("Chưa có CONTRACT_ADDRESS và không thấy " + f);
    address = JSON.parse(fs.readFileSync(f, "utf8")).address;
  }

  const onchain = await ethers.provider.getCode(address);
  if (onchain === "0x") throw new Error("Không có bytecode tại " + address + " (sai địa chỉ hoặc sai mạng?)");

  const artifact = await artifacts.readArtifact("HoaDonDienTu");
  const local = artifact.deployedBytecode;

  const a = decodeMetadata(onchain);
  const b = decodeMetadata(local);

  console.log("Địa chỉ                 :", address);
  console.log("Compiler ON-CHAIN (solc):", a.solcVersion || "(không đọc được metadata)");
  console.log("Compiler cục bộ   (solc):", b.solcVersion || "(không đọc được metadata)");
  console.log("Metadata hash on-chain  :", a.ipfs || "-");
  console.log("Metadata hash cục bộ    :", b.ipfs || "-");

  const codeEqual = a.code.toLowerCase() === b.code.toLowerCase();
  const fullEqual = onchain.toLowerCase() === local.toLowerCase();
  console.log("\nMã chạy (bỏ metadata) khớp:", codeEqual ? "CÓ" : "KHÔNG");
  console.log("Toàn bộ bytecode khớp      :", fullEqual ? "CÓ (khớp tuyệt đối, verify sẽ 'Exact Match')" : "KHÔNG");

  if (!codeEqual) {
    console.log("\n=> Mã nguồn / compiler / optimizer hiện tại KHÔNG khớp với contract đã deploy.");
    console.log("   Dùng phiên bản solc ở dòng 'Compiler ON-CHAIN', và đúng optimizer runs + evmVersion khi deploy.");
    process.exitCode = 1;
  } else if (!fullEqual) {
    console.log("\n=> Mã chạy giống nhau, chỉ khác metadata hash (thường do khác đường dẫn file / comment / EOL).");
    console.log("   Etherscan vẫn có thể verify ở mức 'Similar Match'; nên biên dịch lại đúng file đã deploy để Exact Match.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
