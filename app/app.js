// Logic kết nối Web3 và tương tác Smart Contract Ethereum Sepolia
// Đồ án: Hóa đơn điện tử chống gian lận thuế - HUFLIT (GVHD: TS. Trần Minh Thái)
// Phong cách: Enterprise Fintech & Tax Authority (Clean Light Mode)

let userProvider = null;
let userSigner = null;
let userAddress = null;
let readOnlyContract = null;
let writeContract = null;
let ledgerCache = [];

// Khởi chạy khi DOM sẵn sàng
window.addEventListener('DOMContentLoaded', async () => {
    initDefaultReadOnlyProvider();
    setupEventListeners();
    await loadBlockchainLedger();
});

// Khởi tạo Provider đọc dữ liệu từ Public RPC Sepolia
function initDefaultReadOnlyProvider() {
    try {
        const publicProvider = new ethers.JsonRpcProvider(CONTRACT_CONFIG.rpcUrl);
        readOnlyContract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_CONFIG.abi, publicProvider);
    } catch (err) {
        console.warn("Không thể kết nối RPC mặc định:", err);
    }
}

// Thiết lập các sự kiện giao diện
function setupEventListeners() {
    const btnConnect = document.getElementById('btnConnectWallet');
    if (btnConnect) btnConnect.addEventListener('click', connectWallet);

    const btnSubmit = document.getElementById('btnSubmitInvoice');
    if (btnSubmit) btnSubmit.addEventListener('click', handleIssueInvoice);

    const btnCheckDup = document.getElementById('btnCheckDuplicate');
    if (btnCheckDup) btnCheckDup.addEventListener('click', handleCheckDuplicate);

    const btnLookup = document.getElementById('btnLookupInvoice');
    if (btnLookup) btnLookup.addEventListener('click', handleLookupInvoice);

    const btnRefresh = document.getElementById('btnRefreshLedger');
    if (btnRefresh) btnRefresh.addEventListener('click', loadBlockchainLedger);

    // Format tiền tệ realtime khi người dùng nhập số
    const inputGiaTri = document.getElementById('inputGiaTri');
    if (inputGiaTri) {
        inputGiaTri.addEventListener('input', (e) => {
            const val = Number(e.target.value);
            const display = document.getElementById('formattedGiaTriDisplay');
            if (val > 0) {
                display.innerText = val.toLocaleString('vi-VN') + " VNĐ";
                display.style.color = "var(--color-emerald)";
            } else {
                display.innerText = "0 VNĐ";
                display.style.color = "var(--text-muted)";
            }
        });
    }

    // Lắng nghe thay đổi tài khoản hoặc mạng từ MetaMask
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                disconnectWalletUI();
            } else {
                connectWallet();
            }
        });

        window.ethereum.on('chainChanged', () => {
            window.location.reload();
        });
    }
}

// Điền nhanh mã hóa đơn mẫu
window.quickFillInvoice = function(code) {
    const input = document.getElementById('inputMaHD');
    if (input) {
        input.value = code;
        input.focus();
    }
};

// Tiện ích Sao chép văn bản vào bộ nhớ tạm
window.copyText = function(text, label = "Dữ liệu") {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
        showToast("Đã Sao Chép", `${label} đã được lưu vào bộ nhớ tạm!`, "info");
    }).catch(err => {
        console.error("Lỗi copy:", err);
    });
};

// Kết nối Ví MetaMask
async function connectWallet() {
    if (!window.ethereum) {
        showToast("Chưa Cài Đặt Ví", "Vui lòng cài đặt tiện ích mở rộng MetaMask trên trình duyệt!", "danger");
        window.open("https://metamask.io/download/", "_blank");
        return;
    }

    try {
        userProvider = new ethers.BrowserProvider(window.ethereum);
        
        // Yêu cầu quyền truy cập tài khoản
        const accounts = await userProvider.send("eth_requestAccounts", []);
        userAddress = accounts[0];
        userSigner = await userProvider.getSigner();

        // Kiểm tra và tự động chuyển sang mạng Sepolia (ChainId: 11155111)
        const network = await userProvider.getNetwork();
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

        // Tạo Contract instance với Signer
        writeContract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_CONFIG.abi, userSigner);
        readOnlyContract = writeContract;

        updateWalletUI(userAddress);
        await updateWalletBalance();
        showToast("Kết Nối Thành Công", `Đã liên kết ví doanh nghiệp: ${shortenAddress(userAddress)}`, "success");

        // Lắng nghe sự kiện realtime từ blockchain
        listenToContractEvents();

    } catch (err) {
        console.error("Lỗi kết nối ví:", err);
        showToast("Kết Nối Thất Bại", err.message || "Người dùng đã từ chối quyền truy cập ví.", "danger");
    }
}

// Cập nhật giao diện Header
function updateWalletUI(address) {
    const btnText = document.getElementById('walletBtnText');
    const userDisplay = document.getElementById('userWalletDisplay');
    
    if (btnText) btnText.innerText = shortenAddress(address);
    if (userDisplay) {
        userDisplay.innerHTML = `
            <a href="${CONTRACT_CONFIG.blockExplorerUrl}/address/${address}" target="_blank" class="addr-link">
                ${shortenAddress(address)} ↗
            </a>
            <button class="copy-btn" onclick="copyText('${address}', 'Địa chỉ ví')" title="Sao chép ví">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
        `;
    }
}

// Đặt lại giao diện khi ngắt kết nối
function disconnectWalletUI() {
    userAddress = null;
    userSigner = null;
    writeContract = null;
    document.getElementById('walletBtnText').innerText = "Liên Kết Ví MetaMask";
    document.getElementById('userWalletDisplay').innerText = "Chưa liên kết";
    document.getElementById('userBalanceDisplay').innerText = "0.0000 ETH";
}

// Lấy số dư Sepolia ETH
async function updateWalletBalance() {
    if (!userProvider || !userAddress) return;
    try {
        const balanceWei = await userProvider.getBalance(userAddress);
        const ethVal = parseFloat(ethers.formatEther(balanceWei)).toFixed(4);
        const balDisplay = document.getElementById('userBalanceDisplay');
        if (balDisplay) balDisplay.innerText = `${ethVal} Sepolia ETH`;
    } catch (err) {
        console.error("Lỗi lấy số dư ví:", err);
    }
}

// Kiểm tra trùng lặp mã hóa đơn
async function handleCheckDuplicate() {
    const maHD = document.getElementById('inputMaHD').value.trim();
    if (!maHD) {
        showToast("Thông Báo", "Vui lòng nhập Mã Số Hóa Đơn cần kiểm tra!", "warning");
        return;
    }

    try {
        const contract = getActiveContract();
        const daTonTai = await contract.kiemTraTrungLap(maHD);
        
        if (daTonTai) {
            showToast("🚨 CẢNH BÁO TRÙNG LẶP", `Mã hóa đơn [${maHD}] ĐÃ TỒN TẠI trên Blockchain! Giao dịch sẽ bị Revert nếu gửi.`, "danger");
        } else {
            showToast("✅ MÃ HỢP LỆ", `Mã hóa đơn [${maHD}] chưa từng tồn tại trên Blockchain. Sẵn sàng phát hành!`, "success");
        }
    } catch (err) {
        console.error("Lỗi kiểm tra trùng lặp:", err);
        showToast("Lỗi Truy Vấn", err.message, "danger");
    }
}

// Xử lý Phát Hành Hóa Đơn Lên Blockchain
async function handleIssueInvoice() {
    if (!writeContract || !userSigner) {
        showToast("Chưa Kết Nối Ví", "Vui lòng bấm 'Liên Kết Ví MetaMask' ở góc trên để ký phát hành!", "warning");
        await connectWallet();
        return;
    }

    const maHD = document.getElementById('inputMaHD').value.trim();
    const nguoiMua = document.getElementById('inputNguoiMua').value.trim();
    const giaTri = document.getElementById('inputGiaTri').value.trim();
    const resultBox = document.getElementById('issueResultBox');

    if (!maHD) {
        showToast("Thiếu Dữ Liệu", "Vui lòng nhập Mã Số Hóa Đơn!", "warning");
        return;
    }
    if (!ethers.isAddress(nguoiMua)) {
        showToast("Địa Chỉ Không Hợp Lệ", "Địa chỉ ví khách hàng phải là địa chỉ EVM hợp lệ (bắt đầu bằng 0x)!", "danger");
        return;
    }
    if (!giaTri || Number(giaTri) <= 0) {
        showToast("Giá Trị Không Hợp Lệ", "Tổng tiền thanh toán phải lớn hơn 0 VNĐ!", "danger");
        return;
    }

    const btnSubmit = document.getElementById('btnSubmitInvoice');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<span class="live-dot" style="display:inline-block; margin-right:6px;"></span> Đang Xử Lý Chữ Ký Số...`;

    resultBox.style.display = "block";
    resultBox.innerHTML = `
        <div class="alert alert-info">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <div>
                <strong>Bước 1/3: Ký duyệt trên ví MetaMask doanh nghiệp</strong><br>
                Vui lòng xác nhận giao dịch trên cửa sổ MetaMask đang hiển thị...
            </div>
        </div>
        <div class="tx-stepper">
            <span class="step-item active">● 1. Ký Xác Nhận</span>
            <span class="step-item">○ 2. Mempool P2P</span>
            <span class="step-item">○ 3. Đóng Gói Block</span>
        </div>
    `;

    try {
        // Kiểm tra chống trùng lặp trước
        const daTonTai = await writeContract.kiemTraTrungLap(maHD);
        if (daTonTai) {
            throw new Error(`PHÁT HIỆN GIAN LẬN: Mã hóa đơn "${maHD}" đã tồn tại trên sổ cái blockchain! Hợp đồng sẽ revert để chống xuất khống.`);
        }

        // Ký và gửi transaction
        const tx = await writeContract.phatHanhHoaDon(maHD, nguoiMua, BigInt(giaTri));
        
        resultBox.innerHTML = `
            <div class="alert alert-warning">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <div>
                    <strong>Bước 2/3: Giao dịch đã phát sóng lên mạng Sepolia!</strong><br>
                    Mã TxHash: <a href="${CONTRACT_CONFIG.blockExplorerUrl}/tx/${tx.hash}" target="_blank" class="addr-link">${shortenAddress(tx.hash)} ↗</a>
                    <button class="copy-btn" onclick="copyText('${tx.hash}', 'Mã TxHash')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button><br>
                    Đang chờ các nút mạng Sepolia kiểm định và đóng gói vào khối...
                </div>
            </div>
            <div class="tx-stepper">
                <span class="step-item completed">✓ 1. Đã Ký</span>
                <span class="step-item active">● 2. Mempool P2P</span>
                <span class="step-item">○ 3. Đóng Gói Block</span>
            </div>
        `;

        // Chờ 1 Block confirmation
        const receipt = await tx.wait(1);

        resultBox.innerHTML = `
            <div class="alert alert-success">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <div>
                    <strong>Bước 3/3: Phát Hành Thành Công Vào Sổ Cái Blockchain!</strong><br>
                    • Mã Hóa Đơn: <strong>${maHD}</strong><br>
                    • Block Number: <span class="font-mono">#${receipt.blockNumber}</span><br>
                    • Gas Tiêu Thụ: <span class="font-mono">${receipt.gasUsed.toString()} Units</span><br>
                    • TxHash: <a href="${CONTRACT_CONFIG.blockExplorerUrl}/tx/${receipt.hash}" target="_blank" class="addr-link" style="color: #059669; font-weight: bold;">${shortenAddress(receipt.hash)} ↗</a>
                    <button class="copy-btn" onclick="copyText('${receipt.hash}', 'Mã giao dịch')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
                </div>
            </div>
            <div class="tx-stepper">
                <span class="step-item completed">✓ 1. Đã Ký</span>
                <span class="step-item completed">✓ 2. Đã Phát Sóng</span>
                <span class="step-item completed">✓ 3. Đã Đóng Khối #${receipt.blockNumber}</span>
            </div>
        `;

        showToast("Thành Công On-Chain", `Hóa đơn [${maHD}] đã được băm bất biến vào khối #${receipt.blockNumber}!`, "success");

        document.getElementById('inputMaHD').value = '';
        document.getElementById('inputGiaTri').value = '';
        document.getElementById('formattedGiaTriDisplay').innerText = "0 VNĐ";

        await updateWalletBalance();
        await loadBlockchainLedger();

    } catch (err) {
        console.error("Lỗi phát hành:", err);
        let errorMsg = err.reason || err.message || "Giao dịch bị từ chối.";
        if (err.data && err.data.message) errorMsg = err.data.message;

        resultBox.innerHTML = `
            <div class="alert alert-danger">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                <div>
                    <strong>CẢNH BÁO AN TOÀN / GIAO DỊCH BỊ REVERT:</strong><br>
                    ${errorMsg}
                </div>
            </div>
        `;
        showToast("Thất Bại", errorMsg, "danger");
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
            Ký Số & Phát Hành Lên Sepolia Blockchain
        `;
    }
}

// Xử lý Tra Cứu Đối Soát & Xuất Phiếu Hóa Đơn GTGT Điện Tử Chuẩn
async function handleLookupInvoice() {
    const maHD = document.getElementById('inputLookupMaHD').value.trim();
    const resultBox = document.getElementById('lookupResultBox');

    if (!maHD) {
        showToast("Thông Báo", "Vui lòng nhập Mã Số Hóa Đơn cần tra cứu!", "warning");
        return;
    }

    try {
        const contract = getActiveContract();
        
        const daTonTai = await contract.kiemTraTrungLap(maHD);
        if (!daTonTai) {
            resultBox.innerHTML = `
                <div class="alert alert-danger">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <div>
                        <strong>CẢNH BÁO GIAN LẬN / KHÔNG TỒN TẠI TRÊN BLOCKCHAIN:</strong><br>
                        Hóa đơn <strong>"${maHD}"</strong> không có bản ghi nào trên Ethereum Sepolia.<br>
                        <em>Hóa đơn này không có giá trị khấu trừ thuế hoặc có dấu hiệu làm giả ngoài sổ cái.</em>
                    </div>
                </div>
            `;
            showToast("Không Tồn Tại", `Hóa đơn "${maHD}" không có trên hệ thống!`, "danger");
            return;
        }

        // Đọc dữ liệu chi tiết từ State Mapping
        const hd = await contract.traCuuHoaDon(maHD);
        const [maHoaDon, nguoiBan, nguoiMua, giaTri, thoiGian] = hd;
        const dateObj = new Date(Number(thoiGian) * 1000);
        const thoiGianFormatted = dateObj.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        const giaTriFormatted = Number(giaTri).toLocaleString('vi-VN');

        resultBox.innerHTML = `
            <div class="vat-invoice-paper">
                <!-- Tiêu đề chuẩn hóa đơn GTGT điện tử -->
                <div class="invoice-official-header">
                    <div class="title-main">HÓA ĐƠN GIÁ TRỊ GIA TĂNG (ĐIỆN TỬ)</div>
                    <div class="title-sub">Bản thể hiện điện tử tra cứu từ Sổ cái Blockchain Ethereum Sepolia</div>
                    <div style="font-size: 0.75rem; color: var(--color-blue); font-family: var(--font-mono); margin-top: 4px; font-weight: 700;">
                        Mã Số: #${maHoaDon} • Ký Hiệu: 1C26TMB
                    </div>
                </div>

                <!-- Bảng kê đơn vị bán & mua -->
                <div class="invoice-meta-grid">
                    <div>
                        <div style="font-weight: 700; color: var(--color-navy); margin-bottom: 6px; font-size: 0.82rem;">ĐƠN VỊ BÁN HÀNG:</div>
                        <div class="meta-row">
                            <span class="label">Địa chỉ ví:</span>
                            <span class="val font-mono">
                                <a href="${CONTRACT_CONFIG.blockExplorerUrl}/address/${nguoiBan}" target="_blank" class="addr-link">${shortenAddress(nguoiBan)} ↗</a>
                                <button class="copy-btn" onclick="copyText('${nguoiBan}', 'Ví người bán')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
                            </span>
                        </div>
                        <div class="meta-row">
                            <span class="label">Hình thức TT:</span>
                            <span class="val">Chuyển khoản / Web3</span>
                        </div>
                    </div>

                    <div>
                        <div style="font-weight: 700; color: var(--color-navy); margin-bottom: 6px; font-size: 0.82rem;">ĐƠN VỊ MUA HÀNG:</div>
                        <div class="meta-row">
                            <span class="label">Địa chỉ ví:</span>
                            <span class="val font-mono">
                                <a href="${CONTRACT_CONFIG.blockExplorerUrl}/address/${nguoiMua}" target="_blank" class="addr-link">${shortenAddress(nguoiMua)} ↗</a>
                                <button class="copy-btn" onclick="copyText('${nguoiMua}', 'Ví người mua')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
                            </span>
                        </div>
                        <div class="meta-row">
                            <span class="label">Thời điểm ghi:</span>
                            <span class="val">${thoiGianFormatted}</span>
                        </div>
                    </div>
                </div>

                <!-- Bảng hàng hóa dịch vụ chuẩn -->
                <table class="invoice-items-table">
                    <thead>
                        <tr>
                            <th style="width: 40px; text-align: center;">STT</th>
                            <th>Tên Hàng Hóa, Dịch Vụ</th>
                            <th style="width: 60px; text-align: center;">ĐVT</th>
                            <th style="width: 70px; text-align: center;">Số Lượng</th>
                            <th style="text-align: right;">Thành Tiền (VNĐ)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="text-align: center;">1</td>
                            <td>Dịch vụ công nghệ & giải pháp số hóa đơn điện tử bảo chứng Blockchain</td>
                            <td style="text-align: center;">Gói</td>
                            <td style="text-align: center;">1</td>
                            <td style="text-align: right; font-weight: 600; font-family: var(--font-mono);">${giaTriFormatted}</td>
                        </tr>
                    </tbody>
                </table>

                <!-- Tổng thanh toán -->
                <div class="invoice-total-section">
                    <div>
                        <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; text-transform: uppercase;">Tổng Tiền Thanh Toán:</div>
                        <div style="font-size: 0.75rem; color: var(--color-navy); font-style: italic;">(Đã bao gồm thuế GTGT hợp lệ)</div>
                    </div>
                    <div class="invoice-total-amount font-mono">
                        ${giaTriFormatted} VNĐ
                    </div>
                </div>

                <!-- Dấu Mộc Điện Tử Ký Số Blockchain (Digital Seal) -->
                <div class="digital-stamp">
                    <div class="stamp-seal">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                            <polyline points="9 12 11 14 15 10"></polyline>
                        </svg>
                    </div>
                    <div class="stamp-text">
                        <strong>ĐÃ KÝ SỐ VÀ BẢO CHỨNG BLOCKCHAIN</strong>
                        Bảo mật: Xác thực tự động bởi Smart Contract Sepolia • Không thể sửa đổi • Chống xuất khống 100%.
                    </div>
                </div>
            </div>
        `;

        showToast("Đối Soát Hợp Lệ", `Hóa đơn [${maHD}] đã được xác thực toàn vẹn!`, "success");

    } catch (err) {
        console.error("Lỗi tra cứu:", err);
        showToast("Lỗi Tra Cứu", err.message, "danger");
    }
}

// Tải dữ liệu toàn bộ Sổ Cái từ Blockchain
async function loadBlockchainLedger() {
    const tableBody = document.getElementById('ledgerTableBody');
    const statTotal = document.getElementById('statTotalInvoices');

    try {
        const contract = getActiveContract();
        let danhSachMa = [];
        try {
            danhSachMa = await contract.layDanhSachMaHoaDon();
        } catch (e) {
            console.warn("Không gọi được layDanhSachMaHoaDon:", e);
        }

        if (statTotal) {
            statTotal.innerText = `${danhSachMa.length} Hóa đơn`;
        }

        if (!danhSachMa || danhSachMa.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 40px;">
                        Chưa có hóa đơn nào được phát hành trên Smart Contract này.<br>
                        <span style="font-size: 0.78rem; color: var(--text-dim);">Hãy dùng biểu mẫu bên trên để phát hành hóa đơn đầu tiên vào sổ cái!</span>
                    </td>
                </tr>
            `;
            ledgerCache = [];
            return;
        }

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: var(--color-blue); padding: 28px;">
                    <span class="live-dot" style="display:inline-block; margin-right:6px;"></span>
                    Đang đồng bộ ${danhSachMa.length} hóa đơn từ các khối Sepolia...
                </td>
            </tr>
        `;

        // Tải chi tiết và lưu vào cache
        ledgerCache = [];
        for (let i = danhSachMa.length - 1; i >= 0; i--) {
            const maHD = danhSachMa[i];
            try {
                const hd = await contract.traCuuHoaDon(maHD);
                const [maHoaDon, nguoiBan, nguoiMua, giaTri, thoiGian] = hd;
                ledgerCache.push({
                    index: i + 1,
                    maHoaDon,
                    nguoiBan,
                    nguoiMua,
                    giaTri: Number(giaTri),
                    thoiGian: Number(thoiGian)
                });
            } catch (errRow) {
                console.warn(`Lỗi đọc hóa đơn ${maHD}:`, errRow);
            }
        }

        renderLedgerTable(ledgerCache);

    } catch (err) {
        console.error("Lỗi tải sổ cái:", err);
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: var(--color-rose); padding: 32px;">
                    Lỗi kết nối RPC Sepolia: ${err.message || 'Không thể đồng bộ sổ cái'}.<br>
                    <button class="btn btn-outline btn-sm" style="margin-top: 10px;" onclick="loadBlockchainLedger()">Thử Lại</button>
                </td>
            </tr>
        `;
    }
}

// Render dữ liệu bảng sổ cái
function renderLedgerTable(list) {
    const tableBody = document.getElementById('ledgerTableBody');
    const filterCount = document.getElementById('ledgerFilterCount');

    if (filterCount) {
        filterCount.innerText = `Hiển thị ${list.length} / ${ledgerCache.length} hóa đơn`;
    }

    if (list.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: var(--text-dim); padding: 32px;">
                    Không tìm thấy hóa đơn nào khớp với từ khóa tìm kiếm.
                </td>
            </tr>
        `;
        return;
    }

    const rowsHtml = list.map(item => {
        const dateObj = new Date(item.thoiGian * 1000);
        const timeStr = dateObj.toLocaleString('vi-VN');

        return `
            <tr>
                <td style="color: var(--text-muted); font-weight: 700; font-family: var(--font-mono); text-align: center;">#${item.index}</td>
                <td style="font-weight: 700; color: var(--color-navy); font-family: var(--font-mono);">
                    ${item.maHoaDon}
                    <button class="copy-btn" onclick="copyText('${item.maHoaDon}', 'Mã hóa đơn')" title="Sao chép">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </button>
                </td>
                <td>
                    <a href="${CONTRACT_CONFIG.blockExplorerUrl}/address/${item.nguoiBan}" target="_blank" class="addr-link" title="${item.nguoiBan}">
                        ${shortenAddress(item.nguoiBan)} ↗
                    </a>
                </td>
                <td>
                    <a href="${CONTRACT_CONFIG.blockExplorerUrl}/address/${item.nguoiMua}" target="_blank" class="addr-link" title="${item.nguoiMua}">
                        ${shortenAddress(item.nguoiMua)} ↗
                    </a>
                </td>
                <td style="font-weight: 700; color: var(--color-emerald); font-family: var(--font-mono);">
                    ${item.giaTri.toLocaleString('vi-VN')} VNĐ
                </td>
                <td style="color: var(--text-muted); font-size: 0.78rem;">${timeStr}</td>
                <td style="text-align: center;">
                    <button class="btn btn-outline btn-sm" onclick="quickLookup('${item.maHoaDon}')">
                        Đối Soát
                    </button>
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = rowsHtml.join('');
}

// Bộ lọc tìm kiếm nhanh trên bảng sổ cái
window.filterLedgerTable = function() {
    const query = document.getElementById('inputLedgerFilter').value.trim().toLowerCase();
    if (!query) {
        renderLedgerTable(ledgerCache);
        return;
    }
    const filtered = ledgerCache.filter(item => 
        item.maHoaDon.toLowerCase().includes(query) ||
        item.nguoiBan.toLowerCase().includes(query) ||
        item.nguoiMua.toLowerCase().includes(query)
    );
    renderLedgerTable(filtered);
};

// Nút Đối Soát nhanh từ bảng
window.quickLookup = function(maHD) {
    const input = document.getElementById('inputLookupMaHD');
    if (input) {
        input.value = maHD;
        handleLookupInvoice();
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
};

// Lắng nghe sự kiện HoaDonPhatHanh từ Blockchain
function listenToContractEvents() {
    if (!readOnlyContract) return;
    try {
        readOnlyContract.on("HoaDonPhatHanh", (maHoaDon, nguoiBan, nguoiMua, giaTri, thoiGian) => {
            showToast("🔔 Sự Kiện Mới On-Chain", `Hóa đơn [${maHoaDon}] vừa được đóng gói thành công vào khối Sepolia!`, "info");
            loadBlockchainLedger();
        });
    } catch (e) {
        console.warn("Không thể kích hoạt websocket/event listener:", e);
    }
}

// Helper lấy instance hợp đồng hiện hành
function getActiveContract() {
    if (writeContract) return writeContract;
    if (readOnlyContract) return readOnlyContract;
    throw new Error("Chưa kết nối được với Smart Contract Sepolia.");
}

// Rút gọn địa chỉ ví Hex
function shortenAddress(addr) {
    if (!addr || addr.length < 10) return addr;
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
}

// Toast thông báo Clean Light Mode
function showToast(title, desc, type = "info") {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';

    let color = "var(--color-blue)";
    if (type === "success") color = "var(--color-emerald)";
    if (type === "danger") color = "var(--color-rose)";
    if (type === "warning") color = "var(--color-amber)";

    toast.style.borderLeft = `4px solid ${color}`;

    toast.innerHTML = `
        <div style="flex: 1;">
            <div class="toast-title" style="color: ${color};">${title}</div>
            <div class="toast-desc">${desc}</div>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.25s ease';
        setTimeout(() => toast.remove(), 250);
    }, 4500);
}
