// Logic kết nối Web3 và tương tác Smart Contract Ethereum Sepolia
// Môn học: Blockchain và Ứng dụng - Đề tài 4: Hóa đơn điện tử chống gian lận thuế

let userProvider = null;
let userSigner = null;
let userAddress = null;
let readOnlyContract = null;
let writeContract = null;

// Khởi tạo ngay khi tải trang
window.addEventListener('DOMContentLoaded', async () => {
    initDefaultReadOnlyProvider();
    setupEventListeners();
    await loadBlockchainLedger();
});

// Khởi tạo Provider đọc dữ liệu (hoạt động ngay cả khi người dùng chưa kết nối ví)
function initDefaultReadOnlyProvider() {
    try {
        const publicProvider = new ethers.JsonRpcProvider(CONTRACT_CONFIG.rpcUrl);
        readOnlyContract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_CONFIG.abi, publicProvider);
    } catch (err) {
        console.warn("Không thể kết nối Public RPC, sử dụng Fallback:", err);
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

    const inputGiaTri = document.getElementById('inputGiaTri');
    if (inputGiaTri) {
        inputGiaTri.addEventListener('input', (e) => {
            const val = Number(e.target.value);
            const display = document.getElementById('formattedGiaTriDisplay');
            if (val > 0) {
                display.innerText = val.toLocaleString('vi-VN') + " VNĐ";
                display.style.color = "#34d399";
            } else {
                display.innerText = "0 VNĐ";
                display.style.color = "var(--text-dim)";
            }
        });
    }

    // Nếu MetaMask đã có sẵn trong trình duyệt và đã kết nối trước đó
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

// Điền nhanh mã hóa đơn
function quickFillInvoice(code) {
    const input = document.getElementById('inputMaHD');
    if (input) input.value = code;
}

// Kết nối Ví MetaMask
async function connectWallet() {
    if (!window.ethereum) {
        showToast("Lỗi Trình Duyệt", "Vui lòng cài đặt tiện ích mở rộng MetaMask trên trình duyệt!", "danger");
        window.open("https://metamask.io/download/", "_blank");
        return;
    }

    try {
        userProvider = new ethers.BrowserProvider(window.ethereum);
        
        // Yêu cầu cấp quyền truy cập tài khoản
        const accounts = await userProvider.send("eth_requestAccounts", []);
        userAddress = accounts[0];
        userSigner = await userProvider.getSigner();

        // Kiểm tra mạng Sepolia
        const network = await userProvider.getNetwork();
        if (network.chainId !== BigInt(CONTRACT_CONFIG.chainIdDecimal)) {
            try {
                // Yêu cầu MetaMask chuyển sang mạng Sepolia
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: CONTRACT_CONFIG.chainId }],
                });
            } catch (switchError) {
                // Nếu ví chưa thêm mạng Sepolia, tự động gửi yêu cầu thêm mạng
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
        readOnlyContract = writeContract; // Dùng luôn provider của ví để đọc cho ổn định

        // Cập nhật giao diện
        updateWalletUI(userAddress);
        await updateWalletBalance();
        showToast("Kết Nối Thành Công", `Đã liên kết ví MetaMask: ${shortenAddress(userAddress)}`, "success");

        // Lắng nghe sự kiện phát hành hóa đơn realtime từ blockchain
        listenToContractEvents();

    } catch (err) {
        console.error("Lỗi kết nối ví:", err);
        showToast("Kết Nối Thất Bại", err.message || "Người dùng đã từ chối kết nối ví.", "danger");
    }
}

// Cập nhật hiển thị ví trên Header
function updateWalletUI(address) {
    const btnText = document.getElementById('walletBtnText');
    const userDisplay = document.getElementById('userWalletDisplay');
    
    if (btnText) btnText.innerText = shortenAddress(address);
    if (userDisplay) {
        userDisplay.innerHTML = `<a href="${CONTRACT_CONFIG.blockExplorerUrl}/address/${address}" target="_blank" class="addr-link">${shortenAddress(address)} ↗</a>`;
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

// Lấy số dư Sepolia ETH của ví
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
        showToast("Thông Báo", "Vui lòng nhập Mã Hóa Đơn cần kiểm tra!", "warning");
        return;
    }

    try {
        const contract = getActiveContract();
        const daTonTai = await contract.kiemTraTrungLap(maHD);
        
        if (daTonTai) {
            showToast("🚨 CẢNH BÁO TRÙNG LẶP", `Mã [${maHD}] ĐÃ TỒN TẠI trên Blockchain! Không thể tái sử dụng.`, "danger");
        } else {
            showToast("✅ MÃ HỢP LỆ", `Mã [${maHD}] chưa từng tồn tại trên Blockchain. Sẵn sàng phát hành!`, "success");
        }
    } catch (err) {
        console.error("Lỗi kiểm tra trùng lặp:", err);
        showToast("Lỗi Truy Vấn", err.message, "danger");
    }
}

// Xử lý phát hành hóa đơn mới lên Blockchain
async function handleIssueInvoice() {
    if (!writeContract || !userSigner) {
        showToast("Chưa Kết Nối Ví", "Vui lòng bấm 'Kết Nối MetaMask' ở góc trên để ký phát hành hóa đơn!", "warning");
        await connectWallet();
        return;
    }

    const maHD = document.getElementById('inputMaHD').value.trim();
    const nguoiMua = document.getElementById('inputNguoiMua').value.trim();
    const giaTri = document.getElementById('inputGiaTri').value.trim();
    const resultBox = document.getElementById('issueResultBox');

    // Kiểm tra dữ liệu đầu vào
    if (!maHD) {
        showToast("Thiếu Dữ Liệu", "Vui lòng nhập Mã Hóa Đơn!", "warning");
        return;
    }
    if (!ethers.isAddress(nguoiMua)) {
        showToast("Địa Chỉ Không Hợp Lệ", "Địa chỉ ví người mua phải là địa chỉ Ethereum hợp lệ (bắt đầu bằng 0x)!", "danger");
        return;
    }
    if (!giaTri || Number(giaTri) <= 0) {
        showToast("Giá Trị Không Hợp Lệ", "Giá trị hóa đơn phải lớn hơn 0 VNĐ!", "danger");
        return;
    }

    const btnSubmit = document.getElementById('btnSubmitInvoice');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = `<span class="pulse-dot"></span> Đang Xử Lý Giao Dịch Trên MetaMask...`;

    resultBox.style.display = "block";
    resultBox.innerHTML = `
        <div class="alert alert-info">
            <span class="pulse-dot"></span>
            <div>Vui lòng xác nhận giao dịch trên cửa sổ ví MetaMask và chờ mạng Ethereum Sepolia xác thực khối...</div>
        </div>
    `;

    try {
        // Kiểm tra trùng lặp trước khi gửi để tiết kiệm gas cho người dùng
        const daTonTai = await writeContract.kiemTraTrungLap(maHD);
        if (daTonTai) {
            throw new Error(`PHÁT HIỆN GIAN LẬN: Mã hóa đơn "${maHD}" đã tồn tại trên hệ thống! Giao dịch bị hủy.`);
        }

        // Gọi hàm Smart Contract
        const tx = await writeContract.phatHanhHoaDon(maHD, nguoiMua, BigInt(giaTri));
        
        resultBox.innerHTML = `
            <div class="alert alert-warning">
                <span class="pulse-dot"></span>
                <div>
                    <strong>Giao dịch đã phát sóng lên mạng Sepolia!</strong><br>
                    Mã TxHash: <a href="${CONTRACT_CONFIG.blockExplorerUrl}/tx/${tx.hash}" target="_blank" class="addr-link">${shortenAddress(tx.hash)} ↗</a><br>
                    Đang đợi thợ đào đóng gói vào Block...
                </div>
            </div>
        `;

        // Chờ xác nhận từ blockchain (1 block confirmation)
        const receipt = await tx.wait(1);

        resultBox.innerHTML = `
            <div class="alert alert-success">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <div>
                    <strong>Phát Hành Hóa Đơn Lên Blockchain Thành Công!</strong><br>
                    • Mã Hóa Đơn: <strong>${maHD}</strong><br>
                    • Block Number: <strong>#${receipt.blockNumber}</strong><br>
                    • Gas Tiêu Thụ: <strong>${receipt.gasUsed.toString()} Units</strong><br>
                    • TxHash: <a href="${CONTRACT_CONFIG.blockExplorerUrl}/tx/${receipt.hash}" target="_blank" class="addr-link" style="color: #6ee7b7; font-weight: bold;">Xem trên Sepolia Etherscan ↗</a>
                </div>
            </div>
        `;

        showToast("Thành Công", `Hóa đơn ${maHD} đã được ghi nhận bất biến vào Blockchain!`, "success");

        // Xóa form và cập nhật sổ cái
        document.getElementById('inputMaHD').value = '';
        document.getElementById('inputGiaTri').value = '';
        document.getElementById('formattedGiaTriDisplay').innerText = "0 VNĐ";

        await updateWalletBalance();
        await loadBlockchainLedger();

    } catch (err) {
        console.error("Lỗi phát hành hóa đơn:", err);
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
                    <strong>Lỗi Giao Dịch Blockchain:</strong><br>
                    ${errorMsg}
                </div>
            </div>
        `;
        showToast("Lỗi Phát Hành", errorMsg, "danger");
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Ký Duyệt & Phát Hành Lên Sepolia Blockchain
        `;
    }
}

// Xử lý tra cứu hóa đơn trực tiếp từ Smart Contract
async function handleLookupInvoice() {
    const maHD = document.getElementById('inputLookupMaHD').value.trim();
    const resultBox = document.getElementById('lookupResultBox');

    if (!maHD) {
        showToast("Thông Báo", "Vui lòng nhập Mã Hóa Đơn cần tra cứu!", "warning");
        return;
    }

    try {
        const contract = getActiveContract();
        
        // Kiểm tra xem hóa đơn có tồn tại không
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
                        <strong>CẢNH BÁO GIAN LẬN / KHÔNG TỒN TẠI:</strong><br>
                        Không tìm thấy hóa đơn có mã <strong>"${maHD}"</strong> trên Blockchain Sepolia.<br>
                        Hóa đơn này có thể là giả mạo hoặc chưa từng được doanh nghiệp đăng ký phát hành.
                    </div>
                </div>
            `;
            showToast("Không Tìm Thấy", `Hóa đơn "${maHD}" không tồn tại trên hệ thống!`, "danger");
            return;
        }

        // Đọc dữ liệu chi tiết
        const hd = await contract.traCuuHoaDon(maHD);
        const [maHoaDon, nguoiBan, nguoiMua, giaTri, thoiGian] = hd;
        const dateObj = new Date(Number(thoiGian) * 1000);
        const thoiGianFormatted = dateObj.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
        const giaTriFormatted = Number(giaTri).toLocaleString('vi-VN');

        resultBox.innerHTML = `
            <div class="invoice-certificate">
                <div class="cert-header">
                    <div>
                        <div style="font-size: 0.75rem; color: var(--accent-cyan); font-weight: 700;">HÓA ĐƠN ĐIỆN TỬ BLOCKCHAIN</div>
                        <h3 style="font-size: 1.15rem; color: #fff; margin-top: 2px;">#${maHoaDon}</h3>
                    </div>
                    <span class="cert-badge">✓ VERIFIED ON SEPOLIA</span>
                </div>

                <div class="cert-row">
                    <span class="label">Đơn Vị Phát Hành (Người Bán):</span>
                    <span class="val">
                        <a href="${CONTRACT_CONFIG.blockExplorerUrl}/address/${nguoiBan}" target="_blank" class="addr-link">${shortenAddress(nguoiBan)} ↗</a>
                    </span>
                </div>

                <div class="cert-row">
                    <span class="label">Khách Hàng (Người Mua):</span>
                    <span class="val">
                        <a href="${CONTRACT_CONFIG.blockExplorerUrl}/address/${nguoiMua}" target="_blank" class="addr-link">${shortenAddress(nguoiMua)} ↗</a>
                    </span>
                </div>

                <div class="cert-row">
                    <span class="label">Thời Gian Ghi Khối (Timestamp):</span>
                    <span class="val">${thoiGianFormatted}</span>
                </div>

                <div class="cert-row" style="margin-top: 14px; padding-top: 10px; border-top: 1px dashed rgba(255,255,255,0.1);">
                    <span class="label" style="font-size: 0.95rem; align-self: center;">Tổng Giá Trị Thanh Toán:</span>
                    <span class="val cert-amount">${giaTriFormatted} VNĐ</span>
                </div>

                <div style="margin-top: 16px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px; padding: 10px 14px; font-size: 0.75rem; color: #34d399; display: flex; align-items: center; gap: 8px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    Chứng thực điện tử: Dữ liệu bất biến, chống xuất khống & chống sửa đổi giá trị 100%.
                </div>
            </div>
        `;

        showToast("Tra Cứu Thành Công", `Đã xác thực hóa đơn ${maHD}`, "success");

    } catch (err) {
        console.error("Lỗi tra cứu:", err);
        showToast("Lỗi Tra Cứu", err.message, "danger");
    }
}

// Tải toàn bộ sổ cái hóa đơn từ Blockchain Sepolia
async function loadBlockchainLedger() {
    const tableBody = document.getElementById('ledgerTableBody');
    const statTotal = document.getElementById('statTotalInvoices');

    try {
        const contract = getActiveContract();
        
        // Gọi hàm layDanhSachMaHoaDon()
        let danhSachMa = [];
        try {
            danhSachMa = await contract.layDanhSachMaHoaDon();
        } catch (e) {
            console.warn("Không gọi được layDanhSachMaHoaDon, thử layTongSoHoaDon:", e);
        }

        if (statTotal) {
            statTotal.innerText = `${danhSachMa.length} Hóa đơn`;
        }

        if (!danhSachMa || danhSachMa.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; color: var(--text-muted); padding: 36px;">
                        Chưa có hóa đơn nào được phát hành trên Smart Contract này.<br>
                        <span style="font-size: 0.8rem; color: var(--text-dim);">Hãy dùng biểu mẫu bên trên để phát hành hóa đơn đầu tiên vào khối!</span>
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; color: var(--accent-cyan); padding: 24px;">
                    <span class="pulse-dot"></span> Đang đồng bộ hóa ${danhSachMa.length} bản ghi từ Sepolia...
                </td>
            </tr>
        `;

        // Lấy chi tiết từng hóa đơn
        const rowsHtml = [];
        for (let i = danhSachMa.length - 1; i >= 0; i--) {
            const maHD = danhSachMa[i];
            try {
                const hd = await contract.traCuuHoaDon(maHD);
                const [maHoaDon, nguoiBan, nguoiMua, giaTri, thoiGian] = hd;
                const dateObj = new Date(Number(thoiGian) * 1000);
                const timeStr = dateObj.toLocaleString('vi-VN');

                rowsHtml.push(`
                    <tr>
                        <td style="color: var(--text-dim); font-weight: bold;">#${i + 1}</td>
                        <td style="font-weight: 700; color: #fff;">${maHoaDon}</td>
                        <td>
                            <a href="${CONTRACT_CONFIG.blockExplorerUrl}/address/${nguoiBan}" target="_blank" class="addr-link" title="${nguoiBan}">
                                ${shortenAddress(nguoiBan)} ↗
                            </a>
                        </td>
                        <td>
                            <a href="${CONTRACT_CONFIG.blockExplorerUrl}/address/${nguoiMua}" target="_blank" class="addr-link" title="${nguoiMua}">
                                ${shortenAddress(nguoiMua)} ↗
                            </a>
                        </td>
                        <td style="font-weight: 700; color: #34d399;">${Number(giaTri).toLocaleString('vi-VN')} VNĐ</td>
                        <td style="color: var(--text-muted); font-size: 0.8rem;">${timeStr}</td>
                        <td>
                            <button class="btn btn-outline btn-sm" onclick="quickLookup('${maHoaDon}')">
                                Đối Soát
                            </button>
                        </td>
                    </tr>
                `);
            } catch (errRow) {
                console.warn(`Lỗi đọc hóa đơn ${maHD}:`, errRow);
            }
        }

        tableBody.innerHTML = rowsHtml.join('');

    } catch (err) {
        console.error("Lỗi nạp sổ cái:", err);
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

// Bấm nút Đối Soát từ bảng
window.quickLookup = function(maHD) {
    const input = document.getElementById('inputLookupMaHD');
    if (input) {
        input.value = maHD;
        handleLookupInvoice();
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
};

// Lắng nghe sự kiện HoaDonPhatHanh từ Smart Contract
function listenToContractEvents() {
    if (!readOnlyContract) return;
    try {
        readOnlyContract.on("HoaDonPhatHanh", (maHoaDon, nguoiBan, nguoiMua, giaTri, thoiGian) => {
            showToast("🔔 Sự Kiện On-Chain Mới", `Hóa đơn [${maHoaDon}] vừa được xác thực vào khối Sepolia!`, "info");
            loadBlockchainLedger();
        });
    } catch (e) {
        console.warn("Không thể kích hoạt websocket/polling event listener:", e);
    }
}

// Helper lấy instance hợp đồng hiện hành
function getActiveContract() {
    if (writeContract) return writeContract;
    if (readOnlyContract) return readOnlyContract;
    throw new Error("Chưa kết nối được với Smart Contract trên Sepolia.");
}

// Helper rút gọn địa chỉ Hex
function shortenAddress(addr) {
    if (!addr || addr.length < 10) return addr;
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
}

// Hiển thị Toast thông báo hiện đại
function showToast(title, desc, type = "info") {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';

    let color = "#38bdf8";
    if (type === "success") color = "#34d399";
    if (type === "danger") color = "#f43f5e";
    if (type === "warning") color = "#fbbf24";

    toast.style.borderColor = color;

    toast.innerHTML = `
        <div style="width: 10px; height: 10px; border-radius: 50%; background: ${color}; margin-top: 6px; flex-shrink: 0;"></div>
        <div style="flex: 1;">
            <div class="toast-title" style="color: ${color};">${title}</div>
            <div class="toast-desc">${desc}</div>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s ease';
        setTimeout(() => toast.remove(), 400);
    }, 5000);
}
