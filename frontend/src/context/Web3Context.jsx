import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_CONFIG, shortenAddress } from '../utils/contract';

const Web3Context = createContext();

export function Web3Provider({ children }) {
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [balance, setBalance] = useState('0.0000');
  const [networkOk, setNetworkOk] = useState(false);
  const [readContract, setReadContract] = useState(null);
  const [writeContract, setWriteContract] = useState(null);
  const [toast, setToast] = useState(null);
  const [latestBlock, setLatestBlock] = useState(null);

  const fetchBlockNumber = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(CONTRACT_CONFIG.rpcUrl);
      const blk = await provider.getBlockNumber();
      setLatestBlock(blk);
    } catch (e) {
      console.warn("Không lấy được block number:", e);
    }
  };

  // Khởi tạo Provider đọc dữ liệu ban đầu
  useEffect(() => {
    try {
      const publicProvider = new ethers.JsonRpcProvider(CONTRACT_CONFIG.rpcUrl);
      const contract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_CONFIG.abi, publicProvider);
      setReadContract(contract);
      fetchBlockNumber();
    } catch (err) {
      console.warn("Không kết nối được Public RPC:", err);
    }
  }, []);

  // Lắng nghe sự kiện đổi tài khoản từ MetaMask
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet();
        }
      });
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  const showToast = (title, message, type = 'info') => {
    setToast({ title, message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      showToast('Chưa Cài Đặt Ví', 'Vui lòng cài đặt MetaMask trên trình duyệt!', 'danger');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send('eth_requestAccounts', []);
      const activeAccount = accounts[0];
      const activeSigner = await browserProvider.getSigner();

      // Kiểm tra Sepolia network
      const network = await browserProvider.getNetwork();
      if (network.chainId !== BigInt(CONTRACT_CONFIG.chainIdDecimal)) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: CONTRACT_CONFIG.chainId }],
          });
        } catch (switchError) {
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: CONTRACT_CONFIG.chainId,
                chainName: CONTRACT_CONFIG.chainName,
                rpcUrls: [CONTRACT_CONFIG.rpcUrl],
                nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
                blockExplorerUrls: [CONTRACT_CONFIG.blockExplorerUrl]
              }],
            });
          } else {
            throw switchError;
          }
        }
      }

      setNetworkOk(true);
      setAccount(activeAccount);
      setSigner(activeSigner);

      const contract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_CONFIG.abi, activeSigner);
      setWriteContract(contract);
      setReadContract(contract);

      // Cập nhật balance
      const balanceWei = await browserProvider.getBalance(activeAccount);
      setBalance(parseFloat(ethers.formatEther(balanceWei)).toFixed(4));

      showToast('Thành Công', `Đã liên kết ví MetaMask: ${shortenAddress(activeAccount)}`, 'success');

    } catch (err) {
      console.error('Lỗi kết nối ví:', err);
      showToast('Lỗi Kết Nối', err.message || 'Người dùng đã từ chối kết nối.', 'danger');
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setSigner(null);
    setWriteContract(null);
    setBalance('0.0000');
    setNetworkOk(false);
  };

  const refreshBalance = async () => {
    if (account && window.ethereum) {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const balanceWei = await browserProvider.getBalance(account);
      setBalance(parseFloat(ethers.formatEther(balanceWei)).toFixed(4));
    }
  };

  return (
    <Web3Context.Provider value={{
      account,
      signer,
      balance,
      networkOk,
      readContract,
      writeContract,
      latestBlock,
      fetchBlockNumber,
      connectWallet,
      disconnectWallet,
      refreshBalance,
      showToast,
      toast
    }}>
      {children}
    </Web3Context.Provider>
  );
}

export const useWeb3 = () => useContext(Web3Context);
