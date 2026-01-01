# Ethereum Vault (Offline Address Generator)

A premium, secure, and completely offline-capable Ethereum wallet generator.

![Security Status](https://img.shields.io/badge/Security-High-green)
![Offline Capable](https://img.shields.io/badge/Offline-100%25-blue)

## � Security & Privacy Features

- **100% Offline Integrity**: All dependencies (`ethers.js`, `qrcode.js`) are stored locally in the `libs/` folder. This tool makes **zero** external network requests.
- **Client-Side Only**: Keys are generated using your browser's cryptographically secure random number generator (via `ethers.js`).
- **Network Detection**: The UI automatically detects if you are connected to the internet and warns you. For maximum security, **disconnect your internet** before generating keys.
- **Ephemeral State**: No data is saved to local storage, cookies, or any database. Refreshing the page wipes all data.

## � Usage Guide

### Recommended Secure Workflow

1.  **Download** this repository to a USB drive or trusted computer.
2.  **Disconnect** the computer from the internet (WiFi/Ethernet).
3.  **Open** `index.html` in your browser.
4.  **Check Status**: Ensure the status bar says "Offline (Secure)" with a green light.
5.  **Generate**: Click "Create New Wallet".
6.  **Backup**: Write down your Private Key and Address on physical paper.
7.  **Clear**: Close the tab before reconnecting to the internet.

## � Technical Details

-   **Core Library**: `ethers.js v6.11.1` (Local UMD build)
-   **QR Generation**: `qrcode.js v1.0.0`
-   **No Build Steps**: Pure HTML/JS/CSS. No `npm install` needed to run. Just open the file.

### How to Audit

Since the code is minimal, you can verify it easily:
1.  Open `index.html` in a text editor.
2.  Verify it only imports scripts from `./libs/`.
3.  Search for `fetch`, `XMLHttpRequest`, or `http` to see there are no hidden beacons (except the status check which relies on the browser's native `navigator.onLine`).

## ⚠️ Disclaimer

This tool is provided "as is". While it uses industry-standard libraries, you are responsible for the safe storage of your private keys. **Never share your private key with anyone.**
