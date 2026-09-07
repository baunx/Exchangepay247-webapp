const ICON_BASE_URLS = {
    crypto: (code) => `https://cdn.jsdelivr.net/gh/atomiclabs/cryptocurrency-icons@1a63539be13e331802464b03b44369527c327423/128/color/${code.toLowerCase()}.png`,
    payment: (slug) => `https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/${slug}.svg`
};

const CRYPTOS = [
    { code: "USDT", name: "USDT (TRC20/ERC20)", icon: ICON_BASE_URLS.crypto("usdt"), decimals: 2 },
    { code: "BTC", name: "BTC (Bitcoin)", icon: ICON_BASE_URLS.crypto("btc"), decimals: 6 },
    { code: "ETH", name: "ETH (Ethereum)", icon: ICON_BASE_URLS.crypto("eth"), decimals: 6 }
];

const PAYMENTS = [
    { code: "ZELLE", name: "Zelle", icon: ICON_BASE_URLS.payment("zelle") },
    { code: "VENMO", name: "Venmo", icon: ICON_BASE_URLS.payment("venmo") },
    { code: "CASHAPP", name: "Cash App", icon: ICON_BASE_URLS.payment("cashapp") },
    { code: "PAYPAL", name: "PayPal", icon: ICON_BASE_URLS.payment("paypal") },
    { code: "USD_BANK", name: "USD Bank (US)", icon: "https://img.icons8.com/color/48/bank.png" },
    { code: "EUR_BANK", name: "EUR Bank (SEPA)", icon: "https://img.icons8.com/color/48/bank.png" },
    { code: "AUD_BANK", name: "AUD Bank (Australia)", icon: "https://img.icons8.com/color/48/bank.png" },
    { code: "KRW_BANK", name: "KRW Bank (Korea)", icon: "https://img.icons8.com/color/48/bank.png" },
    { code: "JPY_BANK", name: "JPY Bank (Japan)", icon: "https://img.icons8.com/color/48/bank.png" },
    { code: "ALIPAY", name: "Alipay", icon: ICON_BASE_URLS.payment("alipay") },
    { code: "WECHAT", name: "WeChat Pay", icon: ICON_BASE_URLS.payment("wechat") }
];

// 🔒 Admin Configuration & Security
// ⚠️ SECURITY NOTE: Do not expose plain-text passwords in production code.
const ADMIN_SECURITY = {
    password: "Admin@123@", // Recommended: Use Backend/Telegram WebApp ID authentication
    telegramAdminIds: [5322206115]
};

// Fallback System Configuration
const SYSTEM_CONFIG = window.SYSTEM_CONFIG || { telegramAdmin: "exchangepay2477" };
const FEE_CONFIG = window.FEE_CONFIG || { defaultFee: 2, fees: {} };
const DEFAULT_PAYMENT_ACCOUNTS = window.PAYMENT_ACCOUNTS || {};

let currentDirection = "C2P"; // C2P: Crypto -> Payment | P2C: Payment -> Crypto
let marketPrices = { USDT: 1.0, BTC: 65000.0, ETH: 3500.0 };
let lastEditedInput = "send";
let isAdminAuthenticated = false;

// ⚡ Load payment account data (Priority: Base Config -> LocalStorage)
function loadAccountsData() {
    try {
        const savedLocal = localStorage.getItem("PAYMENT_ACCOUNTS_DATA");
        const localData = savedLocal ? JSON.parse(savedLocal) : {};
        return { ...DEFAULT_PAYMENT_ACCOUNTS, ...localData };
    } catch (e) {
        console.error("Error loading LocalStorage:", e);
        return DEFAULT_PAYMENT_ACCOUNTS || {};
    }
}

let activeAccounts = loadAccountsData();

document.addEventListener("DOMContentLoaded", () => {
    initSelectOptions();
    bindEvents();
    fetchRealtimePrices();
    recalculate();
});

function bindEvents() {
    const sendInput = document.getElementById("sendAmount");
    const receiveInput = document.getElementById("receiveAmount");
    const sendSelect = document.getElementById("sendCurrency");
    const receiveSelect = document.getElementById("receiveCurrency");

    if (sendInput) sendInput.addEventListener("input", onSendAmountChange);
    if (receiveInput) receiveInput.addEventListener("input", onReceiveAmountChange);
    if (sendSelect) sendSelect.addEventListener("change", onCurrencyChange);
    if (receiveSelect) receiveSelect.addEventListener("change", onCurrencyChange);
}

function getMethodLogo(code) {
    const cryptoItem = CRYPTOS.find(c => c.code === code);
    if (cryptoItem) return cryptoItem.icon;

    const paymentItem = PAYMENTS.find(p => p.code === code);
    if (paymentItem) return paymentItem.icon;

    return "https://img.icons8.com/color/48/bank.png";
}

function initSelectOptions() {
    const sendSelect = document.getElementById("sendCurrency");
    const receiveSelect = document.getElementById("receiveCurrency");

    if (!sendSelect || !receiveSelect) return;

    sendSelect.innerHTML = "";
    receiveSelect.innerHTML = "";

    const modeBadge = document.getElementById("modeBadge");

    if (currentDirection === "C2P") {
        if (modeBadge) modeBadge.innerText = "Direction: Crypto ➔ Payment";
        CRYPTOS.forEach(c => sendSelect.add(new Option(c.name, c.code)));
        PAYMENTS.forEach(p => receiveSelect.add(new Option(p.name, p.code)));
    } else {
        if (modeBadge) modeBadge.innerText = "Direction: Payment ➔ Crypto";
        PAYMENTS.forEach(p => sendSelect.add(new Option(p.name, p.code)));
        CRYPTOS.forEach(c => receiveSelect.add(new Option(c.name, c.code)));
    }
}

function toggleDirection() {
    currentDirection = (currentDirection === "C2P") ? "P2C" : "C2P";
    initSelectOptions();
    recalculate();
}

async function fetchRealtimePrices() {
    try {
        const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=tether,bitcoin,ethereum&vs_currencies=usd");
        if (!res.ok) throw new Error("API Limit / Network Error");
        const data = await res.json();
        
        marketPrices.USDT = data.tether ? data.tether.usd : 1.0;
        marketPrices.BTC = data.bitcoin ? data.bitcoin.usd : 65000.0;
        marketPrices.ETH = data.ethereum ? data.ethereum.usd : 3500.0;
        recalculate();
    } catch (err) {
        console.warn("Using fallback market prices:", err.message);
    }
}

function getFeePercentage(cryptoCode, paymentCode, direction) {
    const pairKey = `${cryptoCode}_${paymentCode}`;
    const pairConfig = FEE_CONFIG.fees ? FEE_CONFIG.fees[pairKey] : null;
    const dirKey = (direction === "C2P") ? "CRYPTO_TO_PAYMENT" : "PAYMENT_TO_CRYPTO";

    if (pairConfig && pairConfig[dirKey] !== undefined) {
        return pairConfig[dirKey];
    }
    return FEE_CONFIG.defaultFee || 0;
}

function onSendAmountChange() { lastEditedInput = "send"; recalculate(); }
function onReceiveAmountChange() { lastEditedInput = "receive"; recalculate(); }
function onCurrencyChange() { recalculate(); }

function recalculate() {
    const sendSelect = document.getElementById("sendCurrency");
    const receiveSelect = document.getElementById("receiveCurrency");
    
    if (!sendSelect || !receiveSelect) return;

    const sendVal = sendSelect.value;
    const receiveVal = receiveSelect.value;

    const cryptoCode = (currentDirection === "C2P") ? sendVal : receiveVal;
    const paymentCode = (currentDirection === "C2P") ? receiveVal : sendVal;

    const cryptoObj = CRYPTOS.find(c => c.code === cryptoCode);
    const cryptoDecimals = cryptoObj ? cryptoObj.decimals : 4;

    const cryptoSymbolElem = document.getElementById("cryptoSymbol");
    if (cryptoSymbolElem) cryptoSymbolElem.innerText = cryptoCode;

    const cryptoPriceUSD = marketPrices[cryptoCode] || 1.0;
    const marketRateElem = document.getElementById("marketRateText");
    if (marketRateElem) {
        marketRateElem.innerText = `$${cryptoPriceUSD.toLocaleString('en-US', {minimumFractionDigits: 2})}`;
    }

    const feePercent = getFeePercentage(cryptoCode, paymentCode, currentDirection);
    const feeTextElem = document.getElementById("feeText");
    if (feeTextElem) feeTextElem.innerText = `${feePercent}%`;

    const feeRate = feePercent / 100.0;
    const sendInput = document.getElementById("sendAmount");
    const receiveInput = document.getElementById("receiveAmount");
    const effectiveRateElem = document.getElementById("effectiveRateText");

    if (currentDirection === "C2P") {
        const effectiveRate = cryptoPriceUSD * (1 - feeRate);
        if (effectiveRateElem) {
            effectiveRateElem.innerText = `1 ${cryptoCode} = $${effectiveRate.toFixed(2)} USD`;
        }

        if (lastEditedInput === "send") {
            const sendAmt = parseFloat(sendInput.value) || 0;
            receiveInput.value = sendAmt ? (sendAmt * effectiveRate).toFixed(2) : "";
        } else {
            const recvAmt = parseFloat(receiveInput.value) || 0;
            sendInput.value = (recvAmt && effectiveRate > 0) ? (recvAmt / effectiveRate).toFixed(cryptoDecimals) : "";
        }
    } else {
        const effectiveRateUSDPerCrypto = cryptoPriceUSD / (1 - feeRate);
        if (effectiveRateElem) {
            effectiveRateElem.innerText = `$${effectiveRateUSDPerCrypto.toFixed(2)} USD = 1 ${cryptoCode}`;
        }

        if (lastEditedInput === "send") {
            const sendAmt = parseFloat(sendInput.value) || 0;
            receiveInput.value = sendAmt ? (sendAmt / effectiveRateUSDPerCrypto).toFixed(cryptoDecimals) : "";
        } else {
            const recvAmt = parseFloat(receiveInput.value) || 0;
            sendInput.value = recvAmt ? (recvAmt * effectiveRateUSDPerCrypto).toFixed(2) : "";
        }
    }

    updateAccountDisplay(paymentCode);
}

function updateAccountDisplay(paymentCode) {
    const accCard = document.getElementById("paymentAccountCard");
    const btnSubmit = document.getElementById("btnSubmit");
    if (!accCard || !btnSubmit) return;

    const logoUrl = getMethodLogo(paymentCode);

    if (currentDirection === "P2C") {
        accCard.style.display = "block";

        if (activeAccounts[paymentCode] && activeAccounts[paymentCode].accountNo) {
            const accInfo = activeAccounts[paymentCode];
            accCard.innerHTML = `
                <div class="account-title" style="display: flex; align-items: center; gap: 10px;">
                    <img src="${logoUrl}" alt="${paymentCode}" style="width: 22px; height: 22px; object-fit: contain; filter: drop-shadow(0 0 2px rgba(255,255,255,0.3));">
                    <span>RECEIVING ACCOUNT DETAILS</span>
                </div>
                <div class="account-row"><span>Method/Bank:</span> <strong>${accInfo.bankName || ''}</strong></div>
                <div class="account-row">
                    <span>Account No / Email:</span> 
                    <strong id="accNo" class="highlight-text">${accInfo.accountNo || ''}</strong> 
                    <button type="button" class="btn-copy" onclick="copyAccountNo()"><i class="fa-regular fa-copy"></i> Copy</button>
                </div>
                <div class="account-row"><span>Account Holder:</span> <strong>${accInfo.accountHolder || ''}</strong></div>
                <div class="account-note"><i class="fa-solid fa-circle-info"></i> ${accInfo.note || ''}</div>
            `;
            btnSubmit.innerHTML = `<i class="fa-brands fa-telegram"></i> PAYMENT SENT - NOTIFY ADMIN`;
        } else {
            accCard.innerHTML = `
                <div class="account-title" style="color: #f59e0b; display: flex; align-items: center; gap: 10px;">
                    <img src="${logoUrl}" alt="${paymentCode}" style="width: 22px; height: 22px; object-fit: contain;">
                    <span>PAYMENT ACCOUNT REQUEST</span>
                </div>
                <div style="font-size: 0.875rem; color: #94a3b8; line-height: 1.5; margin-top: 8px;">
                    Automated details for <strong>${paymentCode}</strong> are currently unavailable. Please contact Admin to get transfer details!
                </div>
                <div class="account-note" style="color: #38bdf8; margin-top: 10px;">
                    <i class="fa-brands fa-telegram"></i> Telegram Support: @${SYSTEM_CONFIG.telegramAdmin}
                </div>
            `;
            btnSubmit.innerHTML = `<i class="fa-brands fa-telegram"></i> CONTACT ADMIN FOR DETAILS`;
        }
    } else {
        accCard.style.display = "none";
        btnSubmit.innerHTML = `<i class="fa-brands fa-telegram"></i> EXCHANGE VIA TELEGRAM`;
    }
}

// 📋 Copy to clipboard with fallback for unsupported browsers
function copyAccountNo() {
    const accNoElem = document.getElementById("accNo");
    if (!accNoElem) return;

    const textToCopy = accNoElem.innerText.trim();

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy).then(() => alert("Copied: " + textToCopy));
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            alert("Copied: " + textToCopy);
        } catch (err) {
            alert("Unable to copy automatically, please select manually.");
        }
        document.body.removeChild(textArea);
    }
}

// 🔐 Verify Admin Permissions
function verifyAdminPermission() {
    const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
    if (tgUser && tgUser.id) {
        if (ADMIN_SECURITY.telegramAdminIds.includes(Number(tgUser.id))) {
            isAdminAuthenticated = true;
            return true;
        } else {
            alert("❌ This Telegram account does not have Admin access!");
            isAdminAuthenticated = false;
            return false;
        }
    }

    const userInput = prompt("🔒 Please enter Admin Password:");
    if (userInput !== null && userInput.trim() === ADMIN_SECURITY.password) {
        isAdminAuthenticated = true;
        return true;
    }

    alert("❌ Incorrect password!");
    isAdminAuthenticated = false;
    return false;
}

function openAdminModal() {
    if (!verifyAdminPermission()) return;

    const select = document.getElementById("adminMethodSelect");
    if (select) {
        select.innerHTML = "";
        PAYMENTS.forEach(p => select.add(new Option(p.name, p.code)));
        loadAdminForm();
    }
    const modal = document.getElementById("adminModal");
    if (modal) modal.style.display = "flex";
}

function closeAdminModal() {
    isAdminAuthenticated = false; 
    const modal = document.getElementById("adminModal");
    if (modal) modal.style.display = "none";
}

function loadAdminForm() {
    const code = document.getElementById("adminMethodSelect").value;
    const data = activeAccounts[code] || {};

    document.getElementById("adminBankName").value = data.bankName || "";
    document.getElementById("adminAccNo").value = data.accountNo || "";
    document.getElementById("adminAccHolder").value = data.accountHolder || "";
    document.getElementById("adminNote").value = data.note || "";
}

function saveAccountManual() {
    if (!isAdminAuthenticated && !verifyAdminPermission()) return;

    const code = document.getElementById("adminMethodSelect").value;
    const bankName = document.getElementById("adminBankName").value.trim();
    const accountNo = document.getElementById("adminAccNo").value.trim();
    const accountHolder = document.getElementById("adminAccHolder").value.trim();
    const note = document.getElementById("adminNote").value.trim();

    if (!accountNo) {
        alert("Please enter an Account Number or Email!");
        return;
    }

    activeAccounts[code] = { bankName, accountNo, accountHolder, note };
    localStorage.setItem("PAYMENT_ACCOUNTS_DATA", JSON.stringify(activeAccounts));

    alert(`Successfully updated payment details for: ${code}`);
    closeAdminModal();
    recalculate();
}

function deleteAccountManual() {
    if (!isAdminAuthenticated && !verifyAdminPermission()) return;

    const code = document.getElementById("adminMethodSelect").value;
    if (confirm(`Are you sure you want to delete account details for ${code}?`)) {
        delete activeAccounts[code];
        localStorage.setItem("PAYMENT_ACCOUNTS_DATA", JSON.stringify(activeAccounts));
        alert(`Deleted account details for ${code}`);
        closeAdminModal();
        recalculate();
    }
}

function copyConfigToClipboard() {
    const codeStr = `window.PAYMENT_ACCOUNTS = ${JSON.stringify(activeAccounts, null, 4)};`;
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(codeStr).then(() => {
            alert("📋 Configuration code copied to clipboard!\n\nPaste this into your main configuration file.");
        });
    } else {
        console.log(codeStr);
        alert("Please open Browser Console (F12) to copy the configuration code.");
    }
}

function handleExchangeSubmit(event) {
    if (event) event.preventDefault();
    const sendAmt = document.getElementById("sendAmount").value;
    const sendCurr = document.getElementById("sendCurrency").value;
    const recvAmt = document.getElementById("receiveAmount").value;
    const recvCurr = document.getElementById("receiveCurrency").value;

    if (!sendAmt || parseFloat(sendAmt) <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    let msg = "";
    if (currentDirection === "P2C" && activeAccounts[sendCurr] && activeAccounts[sendCurr].accountNo) {
        msg = `Hi Admin, I have transferred funds via the account details on the website:\n` +
              `------------------------\n` +
              `🔴 Amount Sent: ${sendAmt} ${sendCurr}\n` +
              `🟢 Amount to Receive: ${recvAmt} ${recvCurr}\n` +
              `------------------------\n` +
              `Please verify and release ${recvCurr} to me!`;
    } else {
        msg = `Hi Admin, I would like to initiate an exchange:\n` +
              `------------------------\n` +
              `🔴 Send: ${sendAmt} ${sendCurr}\n` +
              `🟢 Receive: ${recvAmt} ${recvCurr}\n` +
              `------------------------\n` +
              `Please provide payment details to proceed!`;
    }

    window.open(`https://t.me/${SYSTEM_CONFIG.telegramAdmin}?text=${encodeURIComponent(msg)}`, "_blank");
}

// Admin Modal Shortcut (Ctrl + Shift + A)
document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        openAdminModal();
    }
});
