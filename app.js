```js
/* =========================================================
   EXCHANGEPAY247 — APP.JS
   2-WAY EXCHANGE

   Crypto  → Payment Method
   Payment → Crypto

   ========================================================= */


/* =========================================================
   STATE
   ========================================================= */

let sendType = "crypto";
let receiveType = "payment";

let sendAsset = "USDT";
let receiveAsset = "Bank US";

let pickerType = "";

let live = {
  usd: null,
  eur: null
};

let orderId = "";


/* =========================================================
   HELPERS
   ========================================================= */

const $ = id =>
  document.getElementById(id);


const cfg = () =>
  window.CONFIG || {};


const settings = () =>
  cfg().settings || {};


const payments = () =>
  cfg().paymentMethods || {};


const cryptos = () =>
  cfg().crypto || {};


const admin = () =>
  String(
    settings().adminTelegram || ""
  ).replace(/^@/, "");


const support = () =>
  String(
    settings().supportTelegram ||
    settings().adminTelegram ||
    ""
  ).replace(/^@/, "");


const fee = () =>
  Number(
    settings().feePercent || 0
  ) / 100;


const fmt = n =>
  Number(n).toLocaleString(undefined, {
    maximumFractionDigits: 8
  });


/* =========================================================
   DIRECTION
   ========================================================= */

function isCryptoToPayment() {

  return (
    sendType === "crypto" &&
    receiveType === "payment"
  );

}


function isPaymentToCrypto() {

  return (
    sendType === "payment" &&
    receiveType === "crypto"
  );

}


/* =========================================================
   CURRENT PAYMENT DATA
   ========================================================= */

function paymentData() {

  return payments()[receiveAsset] ||
         payments()[sendAsset] ||
         {};

}


/* =========================================================
   CURRENT FIAT CURRENCY
   ========================================================= */

function fiatCurrency() {

  let method = null;

  if (sendType === "payment") {
    method = payments()[sendAsset];
  }

  if (receiveType === "payment") {
    method = payments()[receiveAsset];
  }

  return (
    method?.currency ||
    "USD"
  );

}


/* =========================================================
   LOGO — CRYPTO
   ========================================================= */

function iconAsset(asset) {

  const data =
    cryptos()[asset] || {};


  if (data.icon) {

    return `
      <img
        class="asset-logo"
        src="${escapeAttribute(data.icon)}"
        alt="${escapeAttribute(asset)}"
        onerror="
          this.style.display='none';
          this.parentElement.innerText='${fallbackAssetIcon(asset)}'
        "
      >
    `;

  }


  return fallbackAssetIcon(asset);

}


/* =========================================================
   LOGO — PAYMENT
   ========================================================= */

function iconMethod(method) {

  const data =
    payments()[method] || {};


  if (data.icon) {

    return `
      <img
        class="asset-logo"
        src="${escapeAttribute(data.icon)}"
        alt="${escapeAttribute(method)}"
        onerror="
          this.style.display='none';
          this.parentElement.innerText='${fallbackMethodIcon(method)}'
        "
      >
    `;

  }


  return fallbackMethodIcon(method);

}


/* =========================================================
   FALLBACK CRYPTO ICON
   ========================================================= */

function fallbackAssetIcon(asset) {

  return {

    USDT: "₮",
    BTC: "₿",
    ETH: "Ξ",
    USDC: "$",
    SOL: "◎"

  }[asset] || "◆";

}


/* =========================================================
   FALLBACK PAYMENT ICON
   ========================================================= */

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
   RENDER MAIN
   ========================================================= */

function render() {

  const sendData =
    sendType === "crypto"
      ? cryptos()[sendAsset] || {}
      : payments()[sendAsset] || {};


  const receiveData =
    receiveType === "crypto"
      ? cryptos()[receiveAsset] || {}
      : payments()[receiveAsset] || {};


  /* =====================================================
     SEND
     ===================================================== */

  if (sendType === "crypto") {

    $("sendIcon").innerHTML =
      iconAsset(sendAsset);

    $("sendName").textContent =
      sendAsset;

    $("sendSub").textContent =
      sendData.name || sendAsset;

    $("amountToken").innerHTML =
      `${iconAsset(sendAsset)} ${sendAsset}`;

  } else {

    $("sendIcon").innerHTML =
      iconMethod(sendAsset);

    $("sendName").textContent =
      sendAsset;

    $("sendSub").textContent =
      `${sendData.currency || ""} • ${
        sendData.status === "request"
          ? "By Request"
          : "Available"
      }`;

    $("amountToken").innerHTML =
      `${sendData.currency || ""} ${sendData.currency || ""}`;

  }


  /* =====================================================
     RECEIVE
     ===================================================== */

  if (receiveType === "crypto") {

    $("receiveIcon").innerHTML =
      iconAsset(receiveAsset);

    $("receiveName").textContent =
      receiveAsset;

    $("receiveSub").textContent =
      receiveData.name || receiveAsset;

    $("receiveSmallIcon").innerHTML =
      iconAsset(receiveAsset);

    $("receiveCurrency").textContent =
      receiveAsset;

    $("receiveCurrencyName").textContent =
      receiveData.name || receiveAsset;

  } else {

    $("receiveIcon").innerHTML =
      iconMethod(receiveAsset);

    $("receiveName").textContent =
      receiveAsset;

    $("receiveSub").textContent =
      `${receiveData.currency || "USD"} • ${
        receiveData.status === "request"
          ? "By Request"
          : "Available"
      }`;

    $("receiveSmallIcon").innerHTML =
      iconMethod(receiveAsset);

    $("receiveCurrency").textContent =
      receiveData.currency || "USD";

    $("receiveCurrencyName").textContent =
      currencyName(
        receiveData.currency
      );

  }


  renderNetwork();

  renderDirectionText();

  update();

}


/* =========================================================
   DIRECTION TEXT
   ========================================================= */

function renderDirectionText() {

  const destinationLabel =
    $("destinationLabel");


  if (!destinationLabel) {
    return;
  }


  if (isCryptoToPayment()) {

    destinationLabel.textContent =
      "Receiving Payment Account";

    $("destination").placeholder =
      "Enter your receiving account / email";

  }


  if (isPaymentToCrypto()) {

    destinationLabel.textContent =
      "Receiving Crypto Address";

    $("destination").placeholder =
      "Enter your crypto wallet address";

  }

}


/* =========================================================
   PICKER ITEMS
   ========================================================= */

function items(type) {

  if (type === "crypto") {

    return Object.entries(
      cryptos()
    ).map(
      ([id, data]) => ({

        id,

        name: id,

        sub:
          data.name || id,

        icon:
          iconAsset(id)

      })
    );

  }


  return Object.entries(
    payments()
  ).map(
    ([id, data]) => ({

      id,

      name: id,

      sub:
        `${data.currency || ""} • ${
          data.status === "request"
            ? "By Request"
            : "Available"
        }`,

      icon:
        iconMethod(id)

    })
  );

}


/* =========================================================
   OPEN PICKER
   ========================================================= */

function openPicker(side) {

  pickerType = side;


  const type =
    side === "send"
      ? sendType
      : receiveType;


  $("pickerTitle").textContent =
    side === "send"
      ? "You Send From"
      : "You Receive To";


  $("pickerList").innerHTML =
    "";


  items(type).forEach(item => {

    const button =
      document.createElement("button");


    button.type =
      "button";


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

      if (side === "send") {

        if (sendType === "crypto") {

          sendAsset =
            item.id;

        } else {

          sendAsset =
            item.id;

        }

      } else {

        if (receiveType === "crypto") {

          receiveAsset =
            item.id;

        } else {

          receiveAsset =
            item.id;

        }

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


function escapeAttribute(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

}


/* =========================================================
   SELECTORS
   ========================================================= */

$("sendSelector").onclick =
  () =>
    openPicker("send");


$("receiveSelector").onclick =
  () =>
    openPicker("receive");


$("closePicker").onclick =
  closePicker;


/* =========================================================
   CLOSE OUTSIDE
   ========================================================= */

$("picker").addEventListener(
  "click",
  event => {

    if (
      event.target ===
      $("picker")
    ) {

      closePicker();

    }

  }
);


/* =========================================================
   SWAP
   ========================================================= */

$("swapBtn").onclick = () => {

  /*
    Crypto → Payment
          ↓
    Payment → Crypto
  */


  const oldSendType =
    sendType;

  const oldSendAsset =
    sendAsset;


  const oldReceiveType =
    receiveType;

  const oldReceiveAsset =
    receiveAsset;


  sendType =
    oldReceiveType;

  sendAsset =
    oldReceiveAsset;


  receiveType =
    oldSendType;

  receiveAsset =
    oldSendAsset;


  render();

};


/* =========================================================
   MARKET RATE
   ========================================================= */

function marketRate() {

  /*
    Only Crypto ↔ Fiat is supported.

    Crypto → Payment
    Payment → Crypto
  */


  let crypto =
    null;

  let fiat =
    null;


  if (isCryptoToPayment()) {

    crypto =
      sendAsset;

    fiat =
      fiatCurrency();

  }


  if (isPaymentToCrypto()) {

    crypto =
      receiveAsset;

    fiat =
      fiatCurrency();

  }


  if (!crypto || !fiat) {

    return null;

  }


  /*
    Current live API is based on USDT.

    For other crypto assets, config.js can
    provide a fixed rate:

      rate: 1.00

    Example:

      BTC: {
        name: "Bitcoin",
        rate: 110000
      }

    If no rate is configured, the pair
    is unavailable.
  */


  if (crypto === "USDT") {

    if (
      fiat === "USD"
    ) {

      return live.usd;

    }


    if (
      fiat === "EUR"
    ) {

      return live.eur;

    }

  }


  const cryptoData =
    cryptos()[crypto] || {};


  if (
    Number(
      cryptoData.rate
    ) > 0
  ) {

    return Number(
      cryptoData.rate
    );

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


  if (
    amount <= 0
  ) {

    return null;

  }


  const market =
    marketRate();


  if (
    !(market > 0)
  ) {

    return null;

  }


  /*
    Crypto → Fiat

      customer rate =
      market × (1 + fee)

    Payment → Crypto

      customer rate =
      market × (1 + fee)

      But because the customer is
      receiving crypto, the amount
      must be divided by the customer
      fiat-per-crypto rate.
  */


  const customer =
    market * (1 + fee());


  let receive;


  if (
    isCryptoToPayment()
  ) {

    /*
      Example:

      100 USDT
      rate = 1 USD
      fee = 28%

      receive = 128 USD
    */

    receive =
      amount * customer;

  } else {

    /*
      Example:

      Send 128 USD
      rate = 1 USD / USDT
      fee included

      receive = 100 USDT
    */

    receive =
      amount / customer;

  }


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


  if (
    isCryptoToPayment()
  ) {

    const fiat =
      fiatCurrency();


    $("receive").textContent =
      `${fmt(result.receive)} ${fiat}`;


    $("marketRate").textContent =
      `1 ${sendAsset} ≈ ${
        fmt(result.market)
      } ${fiat}`;


    $("customerRate").textContent =
      `1 ${sendAsset} ≈ ${
        fmt(result.customer)
      } ${fiat}`;

  }


  if (
    isPaymentToCrypto()
  ) {

    const fiat =
      fiatCurrency();


    $("receive").textContent =
      `${fmt(result.receive)} ${receiveAsset}`;


    $("marketRate").textContent =
      `1 ${receiveAsset} ≈ ${
        fmt(result.market)
      } ${fiat}`;


    $("customerRate").textContent =
      `1 ${receiveAsset} ≈ ${
        fmt(result.customer)
      } ${fiat}`;

  }

}


/* =========================================================
   NETWORK
   ========================================================= */

function renderNetwork() {

  const network =
    $("network");


  if (!network) {
    return;
  }


  /*
    Network is needed only when
    receiving crypto.
  */


  if (
    !isPaymentToCrypto()
  ) {

    network.innerHTML = `
      <option>
        Not applicable
      </option>
    `;

    return;

  }


  const networks =
    cryptos()[receiveAsset]?.networks ||
    [];


  network.innerHTML =
    (
      networks.length
        ? networks
        : ["Not applicable"]
    )
      .map(
        item =>
          `<option>
            ${escapeHTML(item)}
          </option>`
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
    String(Date.now())
      .slice(-6)
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
   RENDER PAYMENT STEP
   ========================================================= */

function renderPayment() {

  const result =
    calculate();


  if (!result) {

    alert(
      "Live market rate is not available yet."
    );

    return false;

  }


  /*
    PAYMENT → CRYPTO

    Customer needs our payment
    method details so they can
    send fiat to us.
  */

  if (
    isPaymentToCrypto()
  ) {

    const payment =
      payments()[sendAsset] || {};


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


    $("paymentTitle").textContent =
      `${payment.title || sendAsset} Payment Details`;


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
      `${fmt(result.amount)} ${
        payment.currency || "USD"
      }`;


    $("receiveSummary").textContent =
      `${fmt(result.receive)} ${
        receiveAsset
      }`;


    $("methodSummary").textContent =
      sendAsset;


    $("rateSummary").textContent =
      `1 ${receiveAsset} ≈ ${
        fmt(result.customer)
      } ${payment.currency || "USD"}`;


    $("destinationLabel").textContent =
      "Receiving Crypto Address";


    $("destination").placeholder =
      "Enter your crypto wallet address";


    return true;

  }


  /*
    CRYPTO → PAYMENT

    Customer sends crypto to us.
    Customer then receives fiat/payment.

    No payment credentials from us
    are required here.
  */

  if (
    isCryptoToPayment()
  ) {

    orderId =
      newOrder();


    const payment =
      payments()[receiveAsset] || {};


    $("paymentTitle").textContent =
      "Exchange Order Details";


    $("paymentInfo").innerHTML = `

      <div class="payment-row">

        <span>
          Exchange
        </span>

        <b>
          Crypto → Payment
        </b>

      </div>

      <div class="payment-row">

        <span>
          Receiving Method
        </span>

        <b>
          ${escapeHTML(receiveAsset)}
        </b>

      </div>

      <div class="payment-row">

        <span>
          Receiving Currency
        </span>

        <b>
          ${escapeHTML(
            payment.currency || "USD"
          )}
        </b>

      </div>

    `;


    $("paySummary").textContent =
      `${fmt(result.amount)} ${sendAsset}`;


    $("receiveSummary").textContent =
      `${fmt(result.receive)} ${
        payment.currency || "USD"
      }`;


    $("methodSummary").textContent =
      receiveAsset;


    $("rateSummary").textContent =
      `1 ${sendAsset} ≈ ${
        fmt(result.customer)
      } ${payment.currency || "USD"}`;


    $("destinationLabel").textContent =
      "Receiving Payment Account";


    $("destination").placeholder =
      "Enter your receiving account / email";


    return true;

  }


  return false;

}


/* =========================================================
   PAYMENT TEXT
   ========================================================= */

function paymentText() {

  const lines = [];


  lines.push(
    `Order: ${orderId}`
  );


  lines.push(
    `Direction: ${
      isCryptoToPayment()
        ? "Crypto → Payment"
        : "Payment → Crypto"
    }`
  );


  lines.push(
    `Send: ${$("paySummary").textContent}`
  );


  lines.push(
    `Receive: ${$("receiveSummary").textContent}`
  );


  lines.push(
    `Method: ${$("methodSummary").textContent}`
  );


  lines.push(
    `Rate: ${$("rateSummary").textContent}`
  );


  /*
    Only payment → crypto needs
    actual payment details.
  */

  if (
    isPaymentToCrypto()
  ) {

    const payment =
      payments()[sendAsset] || {};


    if (
      payment.fields?.length
    ) {

      lines.push("");

      lines.push(
        payment.fields
          .map(
            ([key, value]) =>
              `${key}: ${value}`
          )
          .join("\n")
      );

    }

  }


  return lines.join("\n");

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
      isPaymentToCrypto()
        ? "Please enter your receiving crypto address."
        : "Please enter your receiving payment account."
    );

    return;

  }


  /*
    Crypto receiving requires network.
  */

  if (
    isPaymentToCrypto() &&
    (
      !$("network").value ||
      $("network").value ===
        "Not applicable"
    )
  ) {

    alert(
      "Please select your receiving network."
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
      .value ||
    "Not applicable";


  const note =
    $("note")
      .value
      .trim() ||
    "N/A";


  const direction =
    isCryptoToPayment()
      ? "Crypto → Payment"
      : "Payment → Crypto";


  const text =
    `EXCHANGEPAY247 ORDER\n` +
    `Order ID: ${orderId}\n` +
    `Direction: ${direction}\n` +
    `Send: ${$("paySummary").textContent}\n` +
    `Receive: ${$("receiveSummary").textContent}\n` +
    `Method: ${$("methodSummary").textContent}\n` +
    `Rate: ${$("rateSummary").textContent}\n` +
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
    settings().refreshMs ||
    60000
  )
);
```
