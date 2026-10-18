export const CONTRACT_CONFIG = {
  address: "0xce2A4698BAcc6F108574B303cA5a633a5AF66B9C",
  chainId: "0xaa36a7",
  chainIdDecimal: 11155111,
  chainName: "Sepolia Testnet",
  rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  abi: [
    {
      "inputs": [
        { "internalType": "string", "name": "_maHD", "type": "string" },
        { "internalType": "address", "name": "_nguoiMua", "type": "address" },
        { "internalType": "uint256", "name": "_giaTri", "type": "uint256" }
      ],
      "name": "phatHanhHoaDon",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "string", "name": "_maHD", "type": "string" }
      ],
      "name": "traCuuHoaDon",
      "outputs": [
        { "internalType": "string", "name": "maHoaDon", "type": "string" },
        { "internalType": "address", "name": "nguoiBan", "type": "address" },
        { "internalType": "address", "name": "nguoiMua", "type": "address" },
        { "internalType": "uint256", "name": "giaTri", "type": "uint256" },
        { "internalType": "uint256", "name": "thoiGianPhatHanh", "type": "uint256" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        { "internalType": "string", "name": "_maHD", "type": "string" }
      ],
      "name": "kiemTraTrungLap",
      "outputs": [
        { "internalType": "bool", "name": "", "type": "bool" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "layTongSoHoaDon",
      "outputs": [
        { "internalType": "uint256", "name": "", "type": "uint256" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "layDanhSachMaHoaDon",
      "outputs": [
        { "internalType": "string[]", "name": "", "type": "string[]" }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "anonymous": false,
      "inputs": [
        { "indexed": true, "internalType": "string", "name": "maHoaDon", "type": "string" },
        { "indexed": true, "internalType": "address", "name": "nguoiBan", "type": "address" },
        { "indexed": true, "internalType": "address", "name": "nguoiMua", "type": "address" },
        { "indexed": false, "internalType": "uint256", "name": "giaTri", "type": "uint256" },
        { "indexed": false, "internalType": "uint256", "name": "thoiGianPhatHanh", "type": "uint256" }
      ],
      "name": "HoaDonPhatHanh",
      "type": "event"
    }
  ]
};

export function shortenAddress(addr) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
}
