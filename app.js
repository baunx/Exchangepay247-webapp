/* =========================================================
   EXCHANGEPAY247 — APP.JS
   Dynamic Crypto + Payment Method Configuration
   ========================================================= */

let sendAsset = "USDT";
let receiveMethod = "Bank US";
let pickerType = "";

let live = {
  usd: null,
  eur: null
};

let orderId = "";


/* =========================================================
   HELPERS
   ========================================================= */

const $ = id => document.getElementById(id);

const cfg = () => window.CONFIG || {};

const settings = () =>
  cfg().settings || {};

const payments = () =>
  cfg().paymentMethods || {};

const cryptos = () =>
  cfg().crypto || {};

const admin = () =>
  String(settings().adminTelegram || "")
    .replace(/^@/, "");

const support = () =>
  String(
    settings().supportTelegram ||
    settings().adminTelegram ||
    ""
  ).replace(/^@/, "");

const fee = () =>
  Number(settings().feePercent || 0) / 100;

const fmt = n =>
  Number(n).toLocaleString(undefined, {
    maximumFractionDigits: 8
  });


/* =========================================================
   LOGO SYSTEM
   config.js can define:
   icon: "assets/icons/usdt.svg"

   If no icon exists, fallback symbol is used.
   ========================================================= */

function iconAsset(asset) {

  const data = cryptos()[asset] || {};

  if (data.icon) {
    return `
      <img
        class="asset-logo"
        src="${data.icon}"
        alt="${asset}"
        onerror="this.style.display='none';this.parentElement.innerText='${fallbackAssetIcon(asset)}'"
      >
    `;
  }

  return fallbackAssetIcon(asset);
}


function iconMethod(method) {

  const data = payments()[method] || {};

  if (data.icon) {
    return `
      <img
        class="asset-logo"
        src="${data.icon}"
        alt="${method}"
        onerror="this.style.display='none';this.parentElement.innerText='${fallbackMethodIcon(method)}'"
      >
    `;
  }

  return fallbackMethodIcon(method);
}


function fallbackAssetIcon(asset) {

  return {
    USDT: "₮",
    BTC: "₿",
    ETH: "Ξ",
    USDC: "$",
    SOL: "◎"
  }[asset] || "◆";

}


function fallbackMethodIcon(method) {

  return {
    "Bank US": "🏦",
    "Bank EU": "🏦",
    "Bank Canada": "🏦",
    "Bank Australia": "🏦",
    Zelle: "Z",
    Venmo: "V",
    "Cash App": "$",
    PayPal: "P",
    Wise: "W",
    "E-Wallet": "◆"
  }[method] || "◆";

}


/* =========================================================
   CURRENT DATA
   ========================================================= */

function methodData() {

  return payments()[receiveMethod] || {};

}


function currency() {

  return methodData().currency || "USD";

}


/* =========================================================
   RENDER MAIN EXCHANGE
   ========================================================= */

function render() {

  const crypto = cryptos()[sendAsset] || {};
  const payment = methodData();


  /* SEND */

  $("sendIcon").innerHTML =
    iconAsset(sendAsset);

  $("sendName").textContent =
    sendAsset;

  $("sendSub").textContent =
    crypto.name || sendAsset;


  /* RECEIVE */

  $("receiveIcon").innerHTML =
    iconMethod(receiveMethod);

  $("receiveName").textContent =
    receiveMethod;

  $("receiveSub").textContent =
    `${payment.currency || "USD"} • ${
      payment.status === "request"
        ? "By Request"
        : "Available"
    }`;


  /* AMOUNT */

  $("amountToken").innerHTML =
    `${iconAsset(sendAsset)} ${sendAsset}`;


  /* RECEIVE RESULT */

  $("receiveSmallIcon").innerHTML =
    iconMethod(receiveMethod);

  $("receiveCurrency").textContent =
    payment.currency || "USD";


  $("receiveCurrencyName").textContent =
    currencyName(payment.currency);


  renderNetwork();

  update();

}


/* =========================================================
   CURRENCY NAME
   ========================================================= */

function currencyName(cur) {

  return {

    USD: "US Dollar",

    EUR: "Euro",

    CAD: "Canadian Dollar",

    AUD: "Australian Dollar",

    GBP: "British Pound",

    BRL: "Brazilian Real",

    MXN: "Mexican Peso"

  }[cur] || cur || "Currency";

}


/* =========================================================
   PICKER ITEMS
   ========================================================= */

function items(type) {

  if (type === "crypto") {

    return Object.entries(cryptos())
      .map(([id, data]) => ({

        id,

        name: id,

        sub: data.name || id,

        icon: iconAsset(id)

      }));

  }


  return Object.entries(payments())
    .map(([id, data]) => ({

      id,

      name: id,

      sub:
        `${data.currency || ""} • ${
          data.status === "request"
            ? "By Request"
            : "Available"
        }`,

      icon: iconMethod(id)

    }));

}


/* =========================================================
   OPEN PICKER
   ========================================================= */

function openPicker(type) {

  pickerType = type;


  $("pickerTitle").textContent =
    type === "crypto"
      ? "You Send From"
      : "You Receive To";


  $("pickerList").innerHTML = "";


  items(type).forEach(item => {

    const button =
      document.createElement("button");

    button.type = "button";

    button.className =
      "picker-item";


    button.innerHTML = `

      <span class="coin-icon">
        ${item.icon}
      </span>

      <span class="selector-text">

        <b>
          ${escapeHTML(item.name)}
        </b>

        <small>
          ${escapeHTML(item.sub)}
        </small>

      </span>

      <span>
        ›
      </span>

    `;


    button.onclick = () => {

      if (type === "crypto") {

        sendAsset = item.id;

      } else {

        receiveMethod = item.id;

      }

      closePicker();

      render();

    };


    $("pickerList")
      .appendChild(button);

  });


  $("picker")
    .classList
    .remove("hidden");

}


/* =========================================================
   CLOSE PICKER
   ========================================================= */

function closePicker() {

  $("picker")
    .classList
    .add("hidden");

}


/* =========================================================
   SAFE HTML
   ========================================================= */

function escapeHTML(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

}


/* =========================================================
   SELECTORS
   ========================================================= */

$("sendSelector").onclick =
  () => openPicker("crypto");


$("receiveSelector").onclick =
  () => openPicker("payment");


$("closePicker").onclick =
  closePicker;


/* Close picker by tapping outside */

$("picker").addEventListener(
  "click",
  event => {

    if (
      event.target === $("picker")
    ) {
      closePicker();
    }

  }
);


/* =========================================================
   SWAP
   ========================================================= */

$("swapBtn").onclick = () => {

  const currentCrypto =
    sendAsset;

  const currentPayment =
    receiveMethod;


  /*
    Current structure is:
    Crypto → Payment

    Swap is only possible when the
    selected payment currency can be
    represented as a configured crypto.
  */

  const matchingCrypto =
    Object.keys(cryptos())
      .find(
        x =>
          x.toUpperCase() ===
          currentPayment.toUpperCase()
      );


  const matchingPayment =
    Object.entries(payments())
      .find(
        ([, data]) =>
          String(data.currency || "")
            .toUpperCase() ===
          currentCrypto.toUpperCase()
      );


  if (
    matchingCrypto &&
    matchingPayment
  ) {

    sendAsset =
      matchingCrypto;

    receiveMethod =
      matchingPayment[0];

  }


  render();

};


/* =========================================================
   MARKET RATE
   ========================================================= */

function marketRate() {

  const cur =
    currency();


  if (
    sendAsset === "USDT" &&
    cur === "USD"
  ) {

    return live.usd;

  }


  if (
    sendAsset === "USDT" &&
    cur === "EUR"
  ) {

    return live.eur;

  }


  return null;

}


/* =========================================================
   CALCULATE
   ========================================================= */

function calculate() {

  const amount =
    Number(
      $("amount").value || 0
    );


  const market =
    marketRate();


  if (
    !(market > 0) ||
    amount <= 0
  ) {

    return null;

  }


  /*
    Customer rate includes your fee.

    Example:

    Market = 1.00 USD

    Fee = 28%

    Customer rate = 1.28 USD
  */

  const customer =
    market * (1 + fee());


  const receive =
    amount * customer;


  return {

    amount,

    market,

    customer,

    receive

  };

}


/* =========================================================
   UPDATE CALCULATION
   ========================================================= */

function update() {

  const result =
    calculate();


  if (!result) {

    $("receive").textContent =
      "—";

    $("marketRate").textContent =
      "—";

    $("customerRate").textContent =
      "—";

    return;

  }


  $("receive").textContent =
    `${fmt(result.receive)} ${currency()}`;


  $("marketRate").textContent =
    `1 ${sendAsset} ≈ ${
      fmt(result.market)
    } ${currency()}`;


  $("customerRate").textContent =
    `1 ${sendAsset} ≈ ${
      fmt(result.customer)
    } ${currency()}`;

}


/* =========================================================
   NETWORK
   ========================================================= */

function renderNetwork() {

  const networks =
    cryptos()[sendAsset]?.networks || [];


  $("network").innerHTML =
    (
      networks.length
        ? networks
        : ["Not applicable"]
    )
      .map(
        network =>
          `<option>${escapeHTML(network)}</option>`
      )
      .join("");

}


/* =========================================================
   LIVE RATE
   ========================================================= */

async function fetchLiveRate() {

  try {

    $("rateStatus").textContent =
      "Updating live market rate…";


    const response =
      await fetch(
        "https://api.coinbase.com/v2/exchange-rates?currency=USDT",
        {
          cache: "no-store"
        }
      );


    if (!response.ok) {

      throw new Error(
        "Rate request failed"
      );

    }


    const data =
      await response.json();


    const usd =
      Number(
        data?.data?.rates?.USD
      );


    const eur =
      Number(
        data?.data?.rates?.EUR
      );


    if (
      !(usd > 0) ||
      !(eur > 0)
    ) {

      throw new Error(
        "Invalid market rate"
      );

    }


    live = {
      usd,
      eur
    };


    $("rateStatus").textContent =
      "● Live market rate";


    $("rateStatus")
      .classList
      .add("ok");


    update();

  } catch (error) {

    $("rateStatus").textContent =
      "Live rate temporarily unavailable";


    $("rateStatus")
      .classList
      .remove("ok");

  }

}


/* =========================================================
   ORDER ID
   ========================================================= */

function newOrder() {

  return (
    "EP247-" +
    String(Date.now()).slice(-6)
  );

}


/* =========================================================
   DRAWERS
   ========================================================= */

function showDrawer(id, show) {

  $(id)
    .classList
    .toggle(
      "hidden",
      !show
    );

}


/* =========================================================
   RENDER PAYMENT
   ========================================================= */

function renderPayment() {

  const result =
    calculate();


  const payment =
    methodData();


  if (!result) {

    alert(
      "Live market rate is not available yet."
    );

    return false;

  }


  /*
    Payment methods marked "request"
    go directly to support.
  */

  if (
    payment.status === "request"
  ) {

    window.open(
      `https://t.me/${support()}`,
      "_blank"
    );

    return false;

  }


  orderId =
    newOrder();


  $("orderBadge").textContent =
    orderId;


  $("paymentTitle").textContent =
    `${payment.title || receiveMethod} Payment Details`;


  $("paymentInfo").innerHTML =
    (payment.fields || [])
      .map(
        ([key, value]) => `

          <div class="payment-row">

            <span>
              ${escapeHTML(key)}
            </span>

            <b>
              ${escapeHTML(value)}
            </b>

          </div>

        `
      )
      .join("");


  /*
    If a payment has no configured
    fields, show support instead.
  */

  if (
    !(payment.fields || []).length
  ) {

    $("paymentInfo").innerHTML = `

      <div class="payment-row">

        <span>
          Status
        </span>

        <b>
          Contact Support
        </b>

      </div>

    `;

  }


  $("paySummary").textContent =
    `${fmt(result.amount)} ${sendAsset}`;


  $("receiveSummary").textContent =
    `${fmt(result.receive)} ${currency()}`;


  $("methodSummary").textContent =
    receiveMethod;


  $("rateSummary").textContent =
    `1 ${sendAsset} ≈ ${
      fmt(result.customer)
    } ${currency()}`;


  return true;

}


/* =========================================================
   PAYMENT TEXT
   ========================================================= */

function paymentText() {

  const payment =
    methodData();


  return (
    payment.title ||
    receiveMethod
  )
  +
  "\n"
  +
  (payment.fields || [])
    .map(
      ([key, value]) =>
        `${key}: ${value}`
    )
    .join("\n");

}


/* =========================================================
   AMOUNT EVENTS
   ========================================================= */

$("amount").oninput =
  update;


/* =========================================================
   CONTINUE
   ========================================================= */

$("continueBtn").onclick = () => {

  if (
    renderPayment()
  ) {

    showDrawer(
      "paymentStep",
      true
    );

    showDrawer(
      "submitStep",
      false
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }

};


/* =========================================================
   BACK HOME
   ========================================================= */

$("backHome").onclick = () => {

  showDrawer(
    "paymentStep",
    false
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

};


/* =========================================================
   PAID
   ========================================================= */

$("paidBtn").onclick = () => {

  showDrawer(
    "paymentStep",
    false
  );

  showDrawer(
    "submitStep",
    true
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

};


/* =========================================================
   BACK PAYMENT
   ========================================================= */

$("backPayment").onclick = () => {

  showDrawer(
    "submitStep",
    false
  );

  showDrawer(
    "paymentStep",
    true
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

};


/* =========================================================
   COPY PAYMENT INFO
   ========================================================= */

$("copyInfo").onclick =
  async () => {

    const text =
      paymentText();


    try {

      await navigator
        .clipboard
        .writeText(text);


      $("copyInfo").textContent =
        "✓ COPIED";


      setTimeout(
        () => {

          $("copyInfo").textContent =
            "COPY PAYMENT INFO";

        },
        1500
      );


    } catch (error) {

      alert(text);

    }

  };


/* =========================================================
   SUBMIT ORDER
   ========================================================= */

$("submitOrder").onclick = () => {

  if (
    !$("destination")
      .value
      .trim()
  ) {

    alert(
      "Please enter your receiving information."
    );

    return;

  }


  if (
    !$("telegram")
      .value
      .trim()
  ) {

    alert(
      "Please enter your Telegram username."
    );

    return;

  }


  if (
    !$("confirmCheck").checked
  ) {

    alert(
      "Please confirm your information."
    );

    return;

  }


  $("successText").textContent =
    `Order ${orderId} has been submitted. Please send your successful payment screenshot to our admin on Telegram with this Order ID.`;


  $("success")
    .classList
    .remove("hidden");


  $("submitOrder")
    .classList
    .add("hidden");

};


/* =========================================================
   SEND TELEGRAM
   ========================================================= */

$("sendTelegram").onclick = () => {

  const telegram =
    $("telegram")
      .value
      .trim();


  const transaction =
    $("txid")
      .value
      .trim() ||
    "N/A";


  const destination =
    $("destination")
      .value
      .trim();


  const network =
    $("network")
      .value;


  const note =
    $("note")
      .value
      .trim() ||
    "N/A";


  const text =
    `Payment screenshot for Order ${orderId}\n` +
    `Telegram: ${telegram}\n` +
    `Transaction ID: ${transaction}\n` +
    `Receiving: ${destination}\n` +
    `Network: ${network}\n` +
    `Note: ${note}`;


  window.open(
    `https://t.me/${admin()}?text=${encodeURIComponent(text)}`,
    "_blank"
  );

};


/* =========================================================
   NEW ORDER
   ========================================================= */

$("newOrder").onclick =
  () => location.reload();


/* =========================================================
   SUPPORT LINKS
   ========================================================= */

$("supportNav").href =
  `https://t.me/${support()}`;


$("contactBtn").href =
  `https://t.me/${support()}`;


/* =========================================================
   INITIALIZE
   ========================================================= */

render();

fetchLiveRate();


setInterval(
  fetchLiveRate,
  Number(
    settings().refreshMs || 60000
  )
);
