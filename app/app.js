// Logic kết nối Web3 và tương tác Smart Contract Ethereum Sepolia
// Đề tài 4: Hóa đơn điện tử chống gian lận thuế - HUFLIT (TS. Trần Minh Thái)
// Thiết kế đạt chuẩn UI/UX Pro Max & Taste Design

let userProvider = null;
let userSigner = null;
let userAddress = null;
let readOnlyContract = null;
let writeContract = null;
let ledgerCache = [];

// Khởi chạy ngay khi DOM sẵn sàng
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
                display.style.color = "var(--accent-emerald)";
            } else {
                display.innerText = "0 VNĐ";
                display.style.color = "var(--text-dim)";
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
window.copyText = function(text, label = "Văn bản") {
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
        showToast("Chưa Cài Đặt Ví", "Vui lòng cài đặt tiện ích mở rộng MetaMask để tương tác on-chain!", "danger");
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
    document.getElementById('walletBtnText').innerText = "Kết Nối MetaMask";
    document.getElementById('userWalletDisplay').innerText = "Chưa kết nối";
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
        showToast("Thông Báo", "Vui lòng nhập Mã Hóa Đơn cần kiểm tra trước!", "warning");
        return;
    }

    try {
        const contract = getActiveContract();
        const daTonTai = await contract.kiemTraTrungLap(maHD);
        
        if (daTonTai) {
            showToast("🚨 CẢNH BÁO GIAN LẬN", `Mã hóa đơn [${maHD}] ĐÃ TỒN TẠI trên Blockchain! Giao dịch sẽ bị REVERT nếu cố tình gửi.`, "danger");
        } else {
            showToast("✅ MÃ HỢP LỆ", `Mã hóa đơn [${maHD}] chưa từng tồn tại trên Blockchain. Hoàn toàn sẵn sàng phát hành!`, "success");
        }
    } catch (err) {
        console.error("Lỗi kiểm tra trùng lặp:", err);
        showToast("Lỗi Truy Vấn", err.message, "danger");
    }
}

// Xử lý Phát Hành Hóa Đơn Lên Blockchain
async function handleIssueInvoice() {
    if (!writeContract || !userSigner) {
        showToast("Chưa Kết Nối Ví", "Vui lòng bấm 'Kết Nối MetaMask' ở góc trên trước khi ký phát hành!", "warning");
        await connectWallet();
        return;
    }

    const maHD = document.getElementById('inputMaHD').value.trim();
    const nguoiMua = document.getElementById('inputNguoiMua').value.trim();
    const giaTri = document.getElementById('inputGiaTri').value.trim();
    const resultBox = document.getElementById('issueResultBox');

    if (!maHD) {
        showToast("Thiếu Dữ Liệu", "Vui lòng nhập Mã Hóa Đơn!", "warning");
        return;
    }
    if (!ethers.isAddress(nguoiMua)) {
        showToast("Địa Chỉ Không Hợp Lệ", "Địa chỉ ví người mua phải là địa chỉ EVM hợp lệ (0x...)!", "danger");
        return;
    }
    if (!giaTri || Number(giaTri) <= 0) {
        showToast("Giá Trị Không Hợp Lệ", "Giá trị thanh toán phải lớn hơn 0 VNĐ!", "danger");
        return;
    }

    const btnSubmit = document.getElementById('btnSubmitInvoice');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<span class="pulse-radar" style="display:inline-block; margin-right:8px;"></span> Đang Xử Lý Giao Dịch...`;

    resultBox.style.display = "block";
    resultBox.innerHTML = `
        <div class="alert alert-info">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            <div>
                <strong>Bước 1/3: Ký duyệt trên ví MetaMask</strong><br>
                Vui lòng xác nhận giao dịch trên cửa sổ MetaMask đang bật lên...
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
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <div>
                    <strong>Bước 2/3: Giao dịch đã phát sóng lên mạng Sepolia!</strong><br>
                    Mã TxHash: <a href="${CONTRACT_CONFIG.blockExplorerUrl}/tx/${tx.hash}" target="_blank" class="addr-link">${shortenAddress(tx.hash)} ↗</a>
                    <button class="copy-btn" onclick="copyText('${tx.hash}', 'Mã TxHash')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button><br>
                    Đang chờ các thợ đào Sepolia xác nhận và đóng gói vào khối tiếp theo...
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <div>
                    <strong>Bước 3/3: Phát Hành Thành Công Vào Sổ Cái Blockchain!</strong><br>
                    • Mã Hóa Đơn: <strong>${maHD}</strong><br>
                    • Block Number: <span class="font-mono">#${receipt.blockNumber}</span><br>
                    • Gas Tiêu Thụ: <span class="font-mono">${receipt.gasUsed.toString()} Units</span><br>
                    • TxHash: <a href="${CONTRACT_CONFIG.blockExplorerUrl}/tx/${receipt.hash}" target="_blank" class="addr-link" style="color: #34d399; font-weight: bold;">${shortenAddress(receipt.hash)} ↗</a>
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
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
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
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
            Ký Duyệt & Phát Hành Lên Sepolia Blockchain
        `;
    }
}

// Xử lý Tra Cứu Đối Soát Hóa Đơn & Xuất Chứng Thư Số
async function handleLookupInvoice() {
    const maHD = document.getElementById('inputLookupMaHD').value.trim();
    const resultBox = document.getElementById('lookupResultBox');

    if (!maHD) {
        showToast("Thông Báo", "Vui lòng nhập Mã Hóa Đơn cần tra cứu!", "warning");
        return;
    }

    try {
        const contract = getActiveContract();
        
        const daTonTai = await contract.kiemTraTrungLap(maHD);
        if (!daTonTai) {
            resultBox.innerHTML = `
                <div class="alert alert-danger">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <div>
                        <strong>CẢNH BÁO GIAN LẬN / KHÔNG TỒN TẠI TRÊN BLOCKCHAIN:</strong><br>
                        Hóa đơn <strong>"${maHD}"</strong> không có bản ghi nào trên Ethereum Sepolia.<br>
                        <em>Khuyến cáo: Hóa đơn này không có giá trị khấu trừ thuế hoặc có dấu hiệu làm giả ngoài sổ cái.</em>
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
            <div class="invoice-certificate">
                <!-- Watermark SVG Icon chìm -->
                <svg class="cert-watermark" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    <path d="m9 12 2 2 4-4"></path>
                </svg>

                <div class="cert-header">
                    <div>
                        <div style="font-size: 0.72rem; color: var(--accent-cyan); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;">
                            CHỨNG THƯ ĐIỆN TỬ BLOCKCHAIN
                        </div>
                        <h3 class="font-display" style="font-size: 1.25rem; color: #fff; margin-top: 2px;">#${maHoaDon}</h3>
                    </div>
                    <span class="cert-badge">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        XÁC THỰC BẤT BIẾN ON-CHAIN
                    </span>
                </div>

                <div class="cert-row">
                    <span class="label">Đơn Vị Phát Hành (Doanh Nghiệp Bán):</span>
                    <span class="val">
                        <a href="${CONTRACT_CONFIG.blockExplorerUrl}/address/${nguoiBan}" target="_blank" class="addr-link">${shortenAddress(nguoiBan)} ↗</a>
                        <button class="copy-btn" onclick="copyText('${nguoiBan}', 'Ví người bán')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
                    </span>
                </div>

                <div class="cert-row">
                    <span class="label">Khách Hàng (Người Mua Hàng):</span>
                    <span class="val">
                        <a href="${CONTRACT_CONFIG.blockExplorerUrl}/address/${nguoiMua}" target="_blank" class="addr-link">${shortenAddress(nguoiMua)} ↗</a>
                        <button class="copy-btn" onclick="copyText('${nguoiMua}', 'Ví người mua')"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg></button>
                    </span>
                </div>

                <div class="cert-row">
                    <span class="label">Thời Điểm Ghi Khối (Timestamp):</span>
                    <span class="val">${thoiGianFormatted}</span>
                </div>

                <div class="cert-row" style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed rgba(255,255,255,0.12);">
                    <span class="label" style="font-size: 0.95rem; font-weight: 600; color: #fff;">Tổng Tiền Thanh Toán:</span>
                    <span class="val cert-amount">${giaTriFormatted} VNĐ</span>
                </div>

                <div style="margin-top: 18px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: var(--radius-sm); padding: 10px 14px; font-size: 0.76rem; color: #34d399; display: flex; align-items: center; gap: 8px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    Chứng thực điện tử: Dữ liệu được bảo chứng bởi mạng phi tập trung Ethereum Sepolia, chống tẩy xóa, chống sửa ngày giờ và chống gian lận thuế 100%.
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
                        <span style="font-size: 0.8rem; color: var(--text-dim);">Hãy dùng biểu mẫu bên trên để phát hành hóa đơn đầu tiên vào sổ cái!</span>
                    </td>
                </tr>
            `;
            ledgerCache = [];
            return;
        }

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: var(--accent-cyan); padding: 28px;">
                    <span class="pulse-radar" style="display:inline-block; margin-right:8px;"></span>
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
                <td colspan="7" style="text-align: center; color: var(--accent-rose); padding: 32px;">
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
                <td style="color: var(--text-dim); font-weight: 700; font-family: var(--font-mono);">#${item.index}</td>
                <td style="font-weight: 700; color: #fff; font-family: var(--font-mono);">
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
                <td style="font-weight: 700; color: var(--accent-emerald); font-family: var(--font-mono);">
                    ${item.giaTri.toLocaleString('vi-VN')} VNĐ
                </td>
                <td style="color: var(--text-muted); font-size: 0.8rem;">${timeStr}</td>
                <td style="text-align: center;">
                    <button class="btn btn-outline btn-sm" onclick="quickLookup('${item.maHoaDon}')">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
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

// Toast thông báo hiện đại
function showToast(title, desc, type = "info") {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';

    let color = "var(--accent-cyan)";
    if (type === "success") color = "var(--accent-emerald)";
    if (type === "danger") color = "var(--accent-rose)";
    if (type === "warning") color = "var(--accent-amber)";

    toast.style.borderColor = color;

    toast.innerHTML = `
        <div style="width: 10px; height: 10px; border-radius: 50%; background: ${color}; margin-top: 5px; flex-shrink: 0; box-shadow: 0 0 10px ${color};"></div>
        <div style="flex: 1;">
            <div class="toast-title" style="color: ${color};">${title}</div>
            <div class="toast-desc">${desc}</div>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.35s ease';
        setTimeout(() => toast.remove(), 350);
    }, 5000);
}
