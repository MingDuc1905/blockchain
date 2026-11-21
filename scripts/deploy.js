/**
 * TRIỂN KHAI HoaDonDienTu (v2) LÊN SEPOLIA
 *
 * Chuẩn bị file .env (xem .env.example):
 *   SEPOLIA_RPC_URL, PRIVATE_KEY (ví TESTNET riêng, không chứa tài sản thật), ARBITER_ADDRESS
 *
 * Chạy:  npm run deploy:sepolia
 * Kết quả được ghi vào deployments/sepolia.json (dùng cho bước verify và kiểm tra bytecode).
 */
const fs = require("fs");
const path = require("path");
const hre = require("hardhat");

async function main() {
  const { ethers, network } = hre;
  const arbiter = process.env.ARBITER_ADDRESS;
  if (!arbiter || !ethers.isAddress(arbiter)) {
    throw new Error("Thiếu hoặc sai ARBITER_ADDRESS trong .env (địa chỉ ví Trọng tài, khác ví người bán).");
  }

  const [deployer] = await ethers.getSigners();
  if (!deployer) throw new Error("Chưa cấu hình PRIVATE_KEY trong .env");
  if (deployer.address.toLowerCase() === arbiter.toLowerCase()) {
    console.warn("[CẢNH BÁO] Ví deploy trùng ví Arbiter. Nên dùng ví Arbiter độc lập.");
  }

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Mạng        :", network.name, "(chainId " + (await ethers.provider.getNetwork()).chainId + ")");
  console.log("Ví deploy   :", deployer.address, "| số dư:", ethers.formatEther(balance), "ETH");
  console.log("Arbiter     :", arbiter);

  const Factory = await ethers.getContractFactory("HoaDonDienTu");
  const contract = await Factory.deploy(arbiter);
  const tx = contract.deploymentTransaction();
  console.log("Tx deploy   :", tx.hash, "(đang chờ xác nhận...)");
  await contract.waitForDeployment();
  const receipt = await tx.wait();
  const address = await contract.getAddress();

  const constructorArgsEncoded = Factory.interface.encodeDeploy([arbiter]).slice(2);
  const info = {
    network: network.name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    contract: "HoaDonDienTu",
    address,
    deployer: deployer.address,
    arbiter,
    txHash: tx.hash,
    blockNumber: receipt.blockNumber,
    compiler: "0.8.20",
    optimizer: { enabled: true, runs: 200 },
    evmVersion: "shanghai",
    constructorArguments: [arbiter],
    constructorArgumentsAbiEncoded: constructorArgsEncoded,
    deployedAt: new Date().toISOString(),
  };

  const dir = path.join(__dirname, "..", "deployments");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, network.name + ".json");
  fs.writeFileSync(file, JSON.stringify(info, null, 2) + "\n");

  console.log("\n=== TRIỂN KHAI THÀNH CÔNG ===");
  console.log("Contract    :", address);
  console.log("Block       :", receipt.blockNumber);
  console.log("Etherscan   : https://sepolia.etherscan.io/address/" + address);
  console.log("Đã lưu      :", path.relative(process.cwd(), file));
  console.log("\nBước tiếp theo:");
  console.log("  1) npm run check:bytecode   (đối chiếu bytecode + compiler thật)");
  console.log("  2) npm run verify:sepolia   (verify source trên Etherscan)");
  console.log("  3) Cập nhật địa chỉ + block vào frontend/src/utils/contract.js, app/contract_info.js");
  console.log("     (chạy: node scripts/sync_config.js)");
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
