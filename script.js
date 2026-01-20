// -- Status Check --
function updateStatus() {
    const isOnline = navigator.onLine;
    const text = document.getElementById('statusText');
    const dot = document.getElementById('statusDot');
    const explorerLink = document.getElementById('explorerLink');

    if (isOnline) {
        text.textContent = 'Network Detected (Not Secure)';
        dot.className = 'dot online';
        text.style.color = 'var(--text-muted)';
        // Show link if we have an address
        if (document.getElementById('resultCard').style.display === 'block') {
            explorerLink.style.display = 'block';
        }
    } else {
        text.textContent = 'Offline (Secure)';
        dot.className = 'dot offline';
        text.style.color = 'var(--accent)';
        explorerLink.style.display = 'none';
    }
}
window.addEventListener('online', updateStatus);
window.addEventListener('offline', updateStatus);
// Initial check
updateStatus();

// -- Tabs --
function switchTab(tabId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');

    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');

    document.getElementById('resultCard').style.display = 'none';
}

// -- Logic --
// -- Worker Setup --
const worker = new Worker('worker.js');
let isGenerating = false;

worker.onmessage = function (e) {
    const { type, payload } = e.data;

    if (type === 'ERROR') {
        setLoading(false);
        alert("Error: " + payload);
        return;
    }

    if (type === 'WALLET_GENERATED' || type === 'WALLET_RESTORED') {
        setLoading(false);
        displayWallet(payload);
    } else if (type === 'BULK_RESULT') {
        setLoading(false);
        displayBulkWallets(payload);
    } else if (type === 'PROGRESS') {
        updateProgress(payload.current, payload.total);
    }
};

function setLoading(active, text = "Processing...") {
    isGenerating = active;
    const btn = document.querySelector('.btn'); // simplistic targeting, might need refinement per section
    // In a real app we'd target specific buttons, but here we can just add a global overlay or text change

    // For now, let's just change cursor and maybe show a toast or overlay
    document.body.style.cursor = active ? 'wait' : 'default';

    const toast = document.getElementById('toast');
    if (active) {
        toast.textContent = text;
        toast.classList.add('show', 'loading-toast');
    } else {
        toast.textContent = 'Copied to Clipboard!'; // Reset to default
        toast.classList.remove('show', 'loading-toast');
    }
}

function updateProgress(current, total) {
    const toast = document.getElementById('toast');
    if (toast.classList.contains('loading-toast')) {
        toast.textContent = `Generated ${current}/${total}...`;
    }
}

// -- Logic --
function displayWallet(wallet) {
    const resultCard = document.getElementById('resultCard');
    const addressVal = document.getElementById('addressVal');
    const secretVal = document.getElementById('secretVal');
    const qrContainer = document.getElementById('qrCode');
    const explorerLink = document.getElementById('explorerLink');
    const blockscanUrl = document.getElementById('blockscanUrl');

    addressVal.textContent = wallet.address;
    secretVal.textContent = wallet.privateKey;

    // hide secret by default
    secretVal.classList.remove('revealed');

    // Set explorer URL using Blockscan (aggregates etherscan etc)
    blockscanUrl.href = `https://blockscan.com/address/${wallet.address}`;

    // Show explorer link ONLY if online
    if (navigator.onLine) {
        explorerLink.style.display = 'block';
    } else {
        explorerLink.style.display = 'none';
    }

    // Handle Mnemonic Display
    const mnemonicRow = document.getElementById('mnemonicRow');
    const mnemonicVal = document.getElementById('mnemonicVal');

    if (wallet.mnemonic) {
        mnemonicVal.textContent = wallet.mnemonic;
        mnemonicRow.style.display = 'block';
        // Hide by default
        mnemonicVal.classList.remove('revealed');
        // Reset button text (in case it was "Hide")
        const mnemBtn = mnemonicRow.querySelector('.toggle-btn');
        if (mnemBtn) mnemBtn.textContent = "Reveal";
    } else {
        mnemonicRow.style.display = 'none';
    }

    // QR Code
    qrContainer.innerHTML = '';
    new QRCode(qrContainer, {
        text: wallet.address,
        width: 128,
        height: 128,
        colorDark: "#1e293b",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });

    resultCard.style.display = 'block';

    // Scroll to result
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function generateNewWallet() {
    if (isGenerating) return;
    setLoading(true, "Generating Wallet...");
    worker.postMessage({ type: 'GENERATE' });
}

function restoreFromKey() {
    if (isGenerating) return;
    const input = document.getElementById('privateKeyInput').value.trim();
    if (!input) return alert("Please enter a private key");

    setLoading(true, "Restoring...");
    worker.postMessage({ type: 'RESTORE_KEY', payload: input });
}

function restoreFromMnemonic() {
    if (isGenerating) return;
    const input = document.getElementById('mnemonicInput').value.trim();
    if (!input) return alert("Please enter a mnemonic phrase");

    setLoading(true, "Restoring...");
    worker.postMessage({ type: 'RESTORE_PHRASE', payload: input });
}

// -- UI Helpers --
function toggleSecret(elemId, btn) {
    const el = document.getElementById(elemId);
    el.classList.toggle('revealed');
    if (btn) btn.textContent = el.classList.contains('revealed') ? "Hide" : "Reveal";
}

function copyToClipboard(elementId) {
    const text = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(text).then(() => {
        showToast();
    });
}

function showToast() {
    const toast = document.getElementById('toast');
    // Don't override if loading
    if (toast.classList.contains('loading-toast')) return;

    toast.textContent = "Copied to clipboard!";
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

// -- Bulk Generation --
let bulkWallets = [];

function generateBulkWallets() {
    if (isGenerating) return;
    const countInput = document.getElementById('bulkCount');
    let count = parseInt(countInput.value);

    if (isNaN(count) || count < 1) count = 1;
    if (count > 50) {
        count = 50;
        countInput.value = 50;
        alert("Max limit is 50 wallets to prevent browser lag.");
    }

    bulkWallets = [];
    const list = document.getElementById('bulkList');
    list.innerHTML = ''; // Clear previous
    document.getElementById('bulkResult').style.display = 'block';

    setLoading(true, "Generating Batch...");
    worker.postMessage({ type: 'BULK_GENERATE', payload: count });
}

function displayBulkWallets(wallets) {
    bulkWallets = wallets;
    const list = document.getElementById('bulkList');
    let html = '';

    wallets.forEach((w, i) => {
        html += `
        <div class="bulk-item">
            <div class="bulk-idx">#${i + 1}</div>
            <div class="bulk-data">
                <div><strong>Addr:</strong> ${w.address}</div>
                <div><strong>Key:</strong> <span class="blur-text revealed" style="filter: blur(4px);" onclick="this.style.filter='none'">${w.privateKey}</span></div>
                <div><strong>Phrase:</strong> <span class="blur-text revealed" style="filter: blur(4px);" onclick="this.style.filter='none'">${w.mnemonic || 'N/A'}</span></div>
            </div>
        </div>`;
    });

    list.innerHTML = html;
}

function downloadCSV() {
    if (bulkWallets.length === 0) return alert("No wallets generated yet.");

    let csvContent = "data:text/csv;charset=utf-8,Address,PrivateKey,Mnemonic\n";

    bulkWallets.forEach(w => {
        csvContent += `${w.address},${w.privateKey},${w.mnemonic || ''}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `eth-wallets-bulk-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// -- Theme Logic --
function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const sun = document.querySelector('.sun-icon');
    const moon = document.querySelector('.moon-icon');

    if (theme === 'dark') {
        sun.style.display = 'block';
        moon.style.display = 'none';
    } else {
        sun.style.display = 'none';
        moon.style.display = 'block';
    }
}

// Init Theme
(function initTheme() {
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
})();
