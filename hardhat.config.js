require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { subtask } = require("hardhat/config");
const { TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD } = require("hardhat/builtin-tasks/task-names");

// ---------------------------------------------------------------------------
// CẤU HÌNH BIÊN DỊCH - PHẢI DÙNG ĐÚNG CÁC THÔNG SỐ NÀY KHI VERIFY TRÊN ETHERSCAN
//   Compiler : solc 0.8.20 (khớp với `pragma solidity 0.8.20;` trong contract)
//   Optimizer: bật, 200 runs
//   EVM      : shanghai (mặc định của solc 0.8.20, Sepolia hỗ trợ)
//   License  : MIT
// ---------------------------------------------------------------------------
const SOLC_VERSION = "0.8.20";

// Chỉ dùng khi máy không tải được trình biên dịch gốc (mạng chặn binaries.soliditylang.org):
//   set USE_SOLCJS=1   (Windows CMD)   hoặc   USE_SOLCJS=1 npx hardhat test
// Khi đó Hardhat dùng gói npm `solc@0.8.20` (cùng phiên bản, cùng bytecode).
if (process.env.USE_SOLCJS === "1") {
  subtask(TASK_COMPILE_SOLIDITY_GET_SOLC_BUILD, async (args, hre, runSuper) => {
    if (args.solcVersion !== SOLC_VERSION) return runSuper();
    const compilerPath = require.resolve("solc/soljson.js");
    const solc = require("solc");
    return {
      compilerPath,
      isSolcJs: true,
      version: SOLC_VERSION,
      longVersion: solc.version(),
    };
  });
}

const { SEPOLIA_RPC_URL, PRIVATE_KEY, ETHERSCAN_API_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: SOLC_VERSION,
    settings: {
      optimizer: { enabled: true, runs: 200 },
      evmVersion: "shanghai",
    },
  },
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
      chainId: 11155111,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
    },
  },
  etherscan: {
    // Hardhat-verify dùng Etherscan API v2: một key dùng chung cho mọi chain
    apiKey: ETHERSCAN_API_KEY || "",
  },
  sourcify: { enabled: false },
};
