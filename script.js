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

    if (wallet.mnemonic && wallet.mnemonic.phrase) {
        mnemonicVal.textContent = wallet.mnemonic.phrase;
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
}

function generateNewWallet() {
    try {
        const wallet = ethers.Wallet.createRandom();
        displayWallet(wallet);
    } catch (e) {
        alert("Error generating wallet: " + e.message);
    }
}

function restoreFromKey() {
    const input = document.getElementById('privateKeyInput').value.trim();
    if (!input) return alert("Please enter a private key");

    try {
        const wallet = new ethers.Wallet(input);
        displayWallet(wallet);
    } catch (e) {
        alert("Invalid Private Key: " + e.message);
    }
}

function restoreFromMnemonic() {
    const input = document.getElementById('mnemonicInput').value.trim();
    if (!input) return alert("Please enter a mnemonic phrase");

    try {
        // Validation handled by ethers
        const wallet = ethers.Wallet.fromPhrase(input);
        displayWallet(wallet);
    } catch (e) {
        alert("Invalid Mnemonic: " + e.message);
    }
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
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
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
