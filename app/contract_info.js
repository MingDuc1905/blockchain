// Cấu hình Smart Contract HoaDonDienTu trên mạng Ethereum Sepolia Testnet
const CONTRACT_CONFIG = {
    // Địa chỉ hợp đồng mẫu đã verify trên Sepolia Testnet
    address: "0x358AA13c52544ECCEF6B0ADD0f801012ADAD5eE3",
    chainId: "0xaa36a7", // Hex 11155111
    chainIdDecimal: 11155111,
    chainName: "Sepolia Testnet",
    rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
    blockExplorerUrl: "https://sepolia.etherscan.io",
    
    // ABI đầy đủ của Smart Contract HoaDonDienTu
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
