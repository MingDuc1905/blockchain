export const CONTRACT_CONFIG = {
  address: "0x3aDc03271FeAb484c84598874aB08DeEec89dEF4",
  deployBlock: 12179409, // block triển khai (giới hạn phạm vi quét event)
  chainId: "0xaa36a7",
  chainIdDecimal: 11155111,
  chainName: "Sepolia Testnet",
  rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  abi: [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_arbiter",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "arbiterCu",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "arbiterMoi",
          "type": "address"
        }
      ],
      "name": "ArbiterThayDoi",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "string",
          "name": "maHoaDon",
          "type": "string"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "nguoiBan",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "nguoiMua",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "giaTri",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "thoiGianPhatHanh",
          "type": "uint256"
        }
      ],
      "name": "HoaDonPhatHanh",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "string",
          "name": "maHoaDon",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "enum HoaDonDienTu.TrangThai",
          "name": "trangThaiCu",
          "type": "uint8"
        },
        {
          "indexed": false,
          "internalType": "enum HoaDonDienTu.TrangThai",
          "name": "trangThaiMoi",
          "type": "uint8"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "nguoiThucHien",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "ghiChu",
          "type": "string"
        }
      ],
      "name": "TrangThaiThayDoi",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "GHI_CHU_TOI_DA",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "arbiter",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_maHoaDon",
          "type": "string"
        }
      ],
      "name": "daTungTranhChap",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_maHoaDon",
          "type": "string"
        }
      ],
      "name": "huyHoaDon",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_maHoaDon",
          "type": "string"
        }
      ],
      "name": "kiemTraTrungLap",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "layDanhSachMaHoaDon",
      "outputs": [
        {
          "internalType": "string[]",
          "name": "",
          "type": "string[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "layTongSoHoaDon",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_maHoaDon",
          "type": "string"
        }
      ],
      "name": "layTrangThai",
      "outputs": [
        {
          "internalType": "enum HoaDonDienTu.TrangThai",
          "name": "",
          "type": "uint8"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_maHoaDon",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "_nguoiMua",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "_giaTri",
          "type": "uint256"
        }
      ],
      "name": "phatHanhHoaDon",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_maHoaDon",
          "type": "string"
        }
      ],
      "name": "raiseDispute",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_maHoaDon",
          "type": "string"
        },
        {
          "internalType": "bool",
          "name": "_xacNhan",
          "type": "bool"
        }
      ],
      "name": "resolveDispute",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_arbiterMoi",
          "type": "address"
        }
      ],
      "name": "setArbiter",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_maHoaDon",
          "type": "string"
        }
      ],
      "name": "traCuuHoaDon",
      "outputs": [
        {
          "internalType": "string",
          "name": "maHoaDon",
          "type": "string"
        },
        {
          "internalType": "address",
          "name": "nguoiBan",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "nguoiMua",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "giaTri",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "thoiGianPhatHanh",
          "type": "uint256"
        },
        {
          "internalType": "enum HoaDonDienTu.TrangThai",
          "name": "trangThai",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "ghiChu",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_maHoaDon",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_ghiChu",
          "type": "string"
        }
      ],
      "name": "tuChoiHoaDon",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_maHoaDon",
          "type": "string"
        }
      ],
      "name": "xacNhanHoaDon",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
};

export function shortenAddress(addr) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
}
