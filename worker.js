// Load ethers library
try {
    importScripts('libs/ethers.js');
} catch (e) {
    console.error("Failed to load libs/ethers.js in worker", e);
    self.postMessage({ error: "Failed to load dependencies." });
}

self.onmessage = async function (e) {
    const { type, payload } = e.data;

    try {
        switch (type) {
            case 'GENERATE':
                generateWallet();
                break;

            case 'RESTORE_KEY':
                restoreFromKey(payload);
                break;

            case 'RESTORE_PHRASE':
                restoreFromPhrase(payload);
                break;

            case 'BULK_GENERATE':
                bulkGenerate(payload);
                break;

            default:
                throw new Error("Unknown message type");
        }
    } catch (error) {
        self.postMessage({
            type: 'ERROR',
            payload: error.message
        });
    }
};

function formatWallet(wallet) {
    return {
        address: wallet.address,
        privateKey: wallet.privateKey,
        mnemonic: wallet.mnemonic?.phrase || null
    };
}

function generateWallet() {
    const wallet = ethers.Wallet.createRandom();
    self.postMessage({
        type: 'WALLET_GENERATED',
        payload: formatWallet(wallet)
    });
}

function restoreFromKey(key) {
    const wallet = new ethers.Wallet(key);
    self.postMessage({
        type: 'WALLET_RESTORED',
        payload: formatWallet(wallet)
    });
}

function restoreFromPhrase(phrase) {
    const wallet = ethers.Wallet.fromPhrase(phrase);
    self.postMessage({
        type: 'WALLET_RESTORED',
        payload: formatWallet(wallet)
    });
}

function bulkGenerate(count) {
    const wallets = [];
    // Send progress updates every 5 wallets if count > 10
    const reportProgress = count > 10;

    for (let i = 0; i < count; i++) {
        const w = ethers.Wallet.createRandom();
        wallets.push(formatWallet(w));

        if (reportProgress && (i + 1) % 5 === 0) {
            self.postMessage({
                type: 'PROGRESS',
                payload: { current: i + 1, total: count }
            });
        }
    }

    self.postMessage({
        type: 'BULK_RESULT',
        payload: wallets
    });
}
