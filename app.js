/* =========================================================
   EXCHANGEPAY247 — APP.JS
   TWO-WAY EXCHANGE

   Crypto → Payment
   Payment → Crypto

   BOTH AMOUNTS ARE EDITABLE
   ========================================================= */


/* =========================================================
   STATE
========================================================= */

let direction = "crypto-to-payment";

let sendAsset = "USDT";
let receiveAsset = "Bank US";

let pickerSide = "send";

let liveRates = {};

let orderId = "";

let calculating = false;

/*
   Which amount did the customer edit last?
   This is more reliable than document.activeElement.
*/
let lastEdited = "send";


/* =========================================================
   HELPERS
========================================================= */

const $ = id =>
  document.getElementById(id);

const cfg = () =>
  window.CONFIG || {};

const settings = () =>
  cfg().settings || {};

const cryptos = () =>
  cfg().crypto || {};

const payments = () =>
  cfg().paymentMethods || {};

const fee = () =>
  Number(settings().feePercent || 0) / 100;

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

const fmt = value =>
  Number(value).toLocaleString(
    undefined,
    {
      maximumFractionDigits: 8
    }
  );


/* =========================================================
   ESCAPE HTML
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
   DIRECTION
========================================================= */

function isCryptoToPayment() {

  return direction ===
    "crypto-to-payment";

}

function isPaymentToCrypto() {

  return direction ===
    "payment-to-crypto";

}


/* =========================================================
   TYPES
========================================================= */

function sendType() {

  return isCryptoToPayment()
    ? "crypto"
    : "payment";

}

function receiveType() {

  return isCryptoToPayment()
    ? "payment"
    : "crypto";

}


/* =========================================================
   DATA
========================================================= */

function sendData() {

  if (sendType() === "crypto") {

    return (
      cryptos()[sendAsset] ||
      {}
    );

  }

  return (
    payments()[sendAsset] ||
    {}
  );

}


function receiveData() {

  if (receiveType() === "crypto") {

    return (
      cryptos()[receiveAsset] ||
      {}
    );

  }

  return (
    payments()[receiveAsset] ||
    {}
  );

}


/* =========================================================
   CURRENCY
========================================================= */

function sendCurrency() {

  if (sendType() === "crypto") {

    return sendAsset;

  }

  return (
    sendData().currency ||
    "USD"
  );

}


function receiveCurrency() {

  if (receiveType() === "crypto") {

    return receiveAsset;

  }

  return (
    receiveData().currency ||
    "USD"
  );

}


/* =========================================================
   ICONS
========================================================= */

function fallbackCryptoIcon(asset) {

  return {

    USDT: "₮",
    BTC: "₿",
    ETH: "Ξ",
    USDC: "$",
    SOL: "◎"

  }[asset] || "◆";

}


function fallbackPaymentIcon(method) {

  return {

    "Bank US": "🏦",
    "Bank EU": "🏦",
    "Bank Canada": "🏦",
    "Bank Australia": "🏦",

    Zelle: "Z",
    Venmo: "V",
    "Cash App": "$",
    PayPal: "P",
    Wise: "W"

  }[method] || "◆";

}


function cryptoIcon(asset) {

  const data =
    cryptos()[asset] || {};

  if (data.icon) {

    return `
      <img
        class="asset-logo"
        src="${escapeHTML(data.icon)}"
        alt="${escapeHTML(asset)}"
        onerror="this.style.display='none'"
      >
    `;

  }

  return fallbackCryptoIcon(asset);

}


function paymentIcon(method) {

  const data =
    payments()[method] || {};

  if (data.icon) {

    return `
      <img
        class="asset-logo"
        src="${escapeHTML(data.icon)}"
        alt="${escapeHTML(method)}"
        onerror="this.style.display='none'"
      >
    `;

  }

  return fallbackPaymentIcon(method);

}


/* =========================================================
   ENSURE ASSETS
========================================================= */

function ensureAssets() {

  const cryptoKeys =
    Object.keys(cryptos());

  const paymentKeys =
    Object.keys(payments());


  /*
     CRYPTO → PAYMENT
  */

  if (isCryptoToPayment()) {

    if (!cryptos()[sendAsset]) {

      sendAsset =
        cryptoKeys[0] ||
        "USDT";

    }

    if (!payments()[receiveAsset]) {

      receiveAsset =
        paymentKeys[0] ||
        "Bank US";

    }

  }


  /*
     PAYMENT → CRYPTO
  */

  else {

    if (!payments()[sendAsset]) {

      sendAsset =
        paymentKeys[0] ||
        "Bank US";

    }

    if (!cryptos()[receiveAsset]) {

      receiveAsset =
        cryptoKeys[0] ||
        "USDT";

    }

  }

}


/* =========================================================
   DIRECTION BUTTONS
========================================================= */

function updateDirectionButtons() {

  const sendCryptoBtn =
    $("sendCryptoBtn");

  const sendPaymentBtn =
    $("sendPaymentBtn");

  const receiveTypeLabel =
    $("receiveTypeLabel");


  if (sendCryptoBtn) {

    sendCryptoBtn.classList.toggle(
      "active",
      isCryptoToPayment()
    );

  }


  if (sendPaymentBtn) {

    sendPaymentBtn.classList.toggle(
      "active",
      isPaymentToCrypto()
    );

  }


  if (receiveTypeLabel) {

    receiveTypeLabel.textContent =
      isCryptoToPayment()
        ? "Payment"
        : "Crypto";

  }

}


/* =========================================================
   RENDER SEND
========================================================= */

function renderSend() {

  const data =
    sendData();

  if (sendType() === "crypto") {

    $("sendIcon").innerHTML =
      cryptoIcon(sendAsset);

    $("sendName").textContent =
      sendAsset;

    $("sendSub").textContent =
      data.name ||
      sendAsset;

  }

  else {

    $("sendIcon").innerHTML =
      paymentIcon(sendAsset);

    $("sendName").textContent =
      sendAsset;

    $("sendSub").textContent =
      `${data.currency || "USD"} • ${
        data.status === "request"
          ? "By Request"
          : "Available"
      }`;

  }


  $("sendAmountToken")
    .textContent =
      sendType() === "crypto"
        ? `${fallbackCryptoIcon(sendAsset)} ${sendAsset}`
        : data.currency || "USD";

}


/* =========================================================
   RENDER RECEIVE
========================================================= */

function renderReceive() {

  const data =
    receiveData();


  if (receiveType() === "crypto") {

    $("receiveIcon").innerHTML =
      cryptoIcon(receiveAsset);

    $("receiveName").textContent =
      receiveAsset;

    $("receiveSub").textContent =
      data.name ||
      receiveAsset;

    $("receiveAmountToken")
      .textContent =
        `${fallbackCryptoIcon(receiveAsset)} ${receiveAsset}`;

  }

  else {

    $("receiveIcon").innerHTML =
      paymentIcon(receiveAsset);

    $("receiveName").textContent =
      receiveAsset;

    $("receiveSub").textContent =
      `${data.currency || "USD"} • ${
        data.status === "request"
          ? "By Request"
          : "Available"
      }`;

    $("receiveAmountToken")
      .textContent =
        data.currency ||
        "USD";

  }

}


/* =========================================================
   NETWORK
========================================================= */

function renderNetwork() {

  const network =
    $("network");

  const networkField =
    $("networkField");

  const preview =
    $("networkPreview");


  if (receiveType() !== "crypto") {

    networkField
      .classList
      .add("hidden");

    preview
      .classList
      .add("hidden");

    network.innerHTML = `
      <option>
        Not applicable
      </option>
    `;

    return;

  }


  networkField
    .classList
    .remove("hidden");


  const data =
    cryptos()[receiveAsset] || {};

  const networks =
    Array.isArray(data.networks)
      ? data.networks
      : [];


  if (!networks.length) {

    network.innerHTML = `
      <option>
        Not applicable
      </option>
    `;

  }

  else {

    network.innerHTML =
      networks
        .map(item => `
          <option value="${escapeHTML(item)}">
            ${escapeHTML(item)}
          </option>
        `)
        .join("");

  }


  updateNetworkPreview();

}


/* =========================================================
   NETWORK PREVIEW
========================================================= */

function updateNetworkPreview() {

  const preview =
    $("networkPreview");

  const value =
    $("network").value;


  if (
    receiveType() === "crypto" &&
    value &&
    value !== "Not applicable"
  ) {

    preview
      .classList
      .remove("hidden");

    $("networkPreviewValue")
      .textContent =
        value;

  }

  else {

    preview
      .classList
      .add("hidden");

  }

}


/* =========================================================
   MARKET RATE
========================================================= */

function marketRate() {

  /*
     CRYPTO → PAYMENT

     Crypto = SEND
     Fiat   = RECEIVE
  */

  if (isCryptoToPayment()) {

    const crypto =
      sendAsset;

    const fiat =
      receiveData().currency ||
      "USD";

    return Number(
      liveRates?.[crypto]?.[fiat]
    ) || null;

  }


  /*
     PAYMENT → CRYPTO

     Crypto = RECEIVE
     Fiat   = SEND
  */

  const crypto =
    receiveAsset;

  const fiat =
    sendData().currency ||
    "USD";

  return Number(
    liveRates?.[crypto]?.[fiat]
  ) || null;

}


/* =========================================================
   CUSTOMER RATE
========================================================= */

function customerRate() {

  const market =
    marketRate();

  if (!(market > 0)) {

    return null;

  }

  return market * (1 + fee());

}


/* =========================================================
   CALCULATE FROM SEND
========================================================= */

function calculateFromSend(amount) {

  const rate =
    customerRate();


  if (
    !(rate > 0) ||
    !(amount > 0)
  ) {

    return null;

  }


  /*
     Crypto → Payment

     100 USDT × 1.28
     = 128 USD
  */

  if (isCryptoToPayment()) {

    return {

      send: amount,

      receive:
        amount * rate,

      rate

    };

  }


  /*
     Payment → Crypto

     128 USD ÷ 1.28
     = 100 USDT
  */

  return {

    send: amount,

    receive:
      amount / rate,

    rate

  };

}


/* =========================================================
   CALCULATE FROM RECEIVE
========================================================= */

function calculateFromReceive(amount) {

  const rate =
    customerRate();


  if (
    !(rate > 0) ||
    !(amount > 0)
  ) {

    return null;

  }


  /*
     Crypto → Payment

     128 USD ÷ 1.28
     = 100 USDT
  */

  if (isCryptoToPayment()) {

    return {

      send:
        amount / rate,

      receive: amount,

      rate

    };

  }


  /*
     Payment → Crypto

     100 USDT × 1.28
     = 128 USD
  */

  return {

    send:
      amount * rate,

    receive: amount,

    rate

  };

}


/* =========================================================
   CLEAN NUMBER
========================================================= */

function cleanNumber(value) {

  const number =
    Number(value);


  if (
    !Number.isFinite(number)
  ) {

    return "";

  }


  return Number(
    number.toFixed(8)
  );

}


/* =========================================================
   UPDATE CALCULATION
========================================================= */

function update() {

  if (calculating) {

    return;

  }


  calculating = true;


  try {

    const sendInput =
      Number(
        $("sendAmount").value || 0
      );


    const receiveInput =
      Number(
        $("receiveAmount").value || 0
      );


    /*
       SEND WAS EDITED
    */

    if (lastEdited === "send") {

      const result =
        calculateFromSend(
          sendInput
        );


      if (result) {

        $("receiveAmount").value =
          cleanNumber(
            result.receive
          );

      }

    }


    /*
       RECEIVE WAS EDITED
    */

    else if (lastEdited === "receive") {

      const result =
        calculateFromReceive(
          receiveInput
        );


      if (result) {

        $("sendAmount").value =
          cleanNumber(
            result.send
          );

      }

    }


    /*
       RATE
    */

    const market =
      marketRate();

    const customer =
      customerRate();


    if (
      !(market > 0) ||
      !(customer > 0)
    ) {

      $("marketRate")
        .textContent = "—";

      $("customerRate")
        .textContent = "—";

      return;

    }


    /*
       Always display:

       1 CRYPTO ≈ FIAT
    */

    let crypto;
    let fiat;


    if (isCryptoToPayment()) {

      crypto =
        sendAsset;

      fiat =
        receiveData().currency ||
        "USD";

    }

    else {

      crypto =
        receiveAsset;

      fiat =
        sendData().currency ||
        "USD";

    }


    $("marketRate")
      .textContent =
        `1 ${crypto} ≈ ${fmt(market)} ${fiat}`;


    $("customerRate")
      .textContent =
        `1 ${crypto} ≈ ${fmt(customer)} ${fiat}`;

  }

  finally {

    calculating = false;

  }

}


/* =========================================================
   DESTINATION
========================================================= */

function renderDestination() {

  if (isPaymentToCrypto()) {

    $("destinationLabel")
      .textContent =
        "Receiving Crypto Address";

    $("destination")
      .placeholder =
        "Enter your crypto wallet address";

  }

  else {

    $("destinationLabel")
      .textContent =
        "Receiving Payment Account";

    $("destination")
      .placeholder =
        "Enter your receiving account / email";

  }

}


/* =========================================================
   RENDER
========================================================= */

function render() {

  ensureAssets();

  updateDirectionButtons();

  renderSend();

  renderReceive();

  renderNetwork();

  renderDestination();

  update();

}


/* =========================================================
   PICKER
========================================================= */

function openPicker(side) {

  pickerSide =
    side;


  $("pickerTitle")
    .textContent =
      side === "send"
        ? "You Send From"
        : "You Receive To";


  $("pickerList")
    .innerHTML = "";


  const type =
    side === "send"
      ? sendType()
      : receiveType();


  const source =
    type === "crypto"
      ? cryptos()
      : payments();


  Object.entries(source)
    .forEach(
      ([id, data]) => {

        const button =
          document.createElement(
            "button"
          );


        button.type =
          "button";


        button.className =
          "picker-item";


        const icon =
          type === "crypto"
            ? cryptoIcon(id)
            : paymentIcon(id);


        let sub;


        if (type === "crypto") {

          sub =
            data.name ||
            id;

        }

        else {

          sub =
            `${data.currency || ""} • ${
              data.status === "request"
                ? "By Request"
                : "Available"
            }`;

        }


        button.innerHTML = `

          <span class="coin-icon">
            ${icon}
          </span>

          <span class="selector-text">

            <b>
              ${escapeHTML(id)}
            </b>

            <small>
              ${escapeHTML(sub)}
            </small>

          </span>

          <span>
            ›
          </span>

        `;


        button.onclick =
          () => {

            if (side === "send") {

              sendAsset =
                id;

            }

            else {

              receiveAsset =
                id;

            }


            closePicker();

            render();

          };


        $("pickerList")
          .appendChild(
            button
          );

      }
    );


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
   SWAP — TWO WAY
========================================================= */

function swap() {

  /*
     Save everything BEFORE changing direction.
  */

  const oldSendAsset =
    sendAsset;

  const oldReceiveAsset =
    receiveAsset;


  const oldSendAmount =
    $("sendAmount").value;


  const oldReceiveAmount =
    $("receiveAmount").value;


  /*
     Swap assets.
  */

  sendAsset =
    oldReceiveAsset;

  receiveAsset =
    oldSendAsset;


  /*
     Reverse direction.
  */

  if (
    direction ===
    "crypto-to-payment"
  ) {

    direction =
      "payment-to-crypto";

  }

  else {

    direction =
      "crypto-to-payment";

  }


  /*
     Swap amounts.
  */

  $("sendAmount").value =
    oldReceiveAmount;

  $("receiveAmount").value =
    oldSendAmount;


  /*
     After swap, SEND is the
     source of the new calculation.
  */

  lastEdited =
    "send";


  /*
     Make sure the swapped assets
     are valid for the new direction.
  */

  ensureAssets();


  /*
     Render new side types,
     logos, network, rate, etc.
  */

  updateDirectionButtons();

  renderSend();

  renderReceive();

  renderNetwork();

  renderDestination();


  /*
     IMPORTANT:

     Do NOT let update() overwrite
     the swapped receive amount
     incorrectly before the new
     direction is ready.

     Recalculate from the swapped
     SEND amount.
  */

  const result =
    calculateFromSend(
      Number(
        $("sendAmount").value || 0
      )
    );


  if (result) {

    $("receiveAmount").value =
      cleanNumber(
        result.receive
      );

  }


  update();

}


/* =========================================================
   LIVE RATE API
========================================================= */

async function fetchLiveRate() {

  const cryptoList =
    Object.keys(
      cryptos()
    );


  const fiatList = [
    "USD",
    "EUR",
    "CAD",
    "AUD",
    "GBP",
    "BRL",
    "MXN"
  ];


  const newRates = {};


  $("rateStatus")
    .textContent =
      "Updating live market rate…";


  $("rateStatus")
    .classList
    .remove("ok");


  /*
     Request every configured
     crypto separately.
  */

  for (
    const crypto of cryptoList
  ) {

    try {

      const response =
        await fetch(
          `https://api.coinbase.com/v2/exchange-rates?currency=${encodeURIComponent(crypto)}`,
          {
            cache:
              "no-store"
          }
        );


      if (!response.ok) {

        continue;

      }


      const data =
        await response.json();


      const rates =
        data?.data?.rates;


      if (!rates) {

        continue;

      }


      newRates[crypto] =
        {};


      fiatList.forEach(
        fiat => {

          const value =
            Number(
              rates[fiat]
            );


          if (value > 0) {

            newRates[crypto][fiat] =
              value;

          }

        }
      );


    }

    catch (error) {

      console.warn(
        `Rate failed for ${crypto}`,
        error
      );

    }

  }


  /*
     Only replace rates if at least
     one crypto loaded successfully.
  */

  if (
    Object.keys(newRates).length
  ) {

    liveRates =
      newRates;


    $("rateStatus")
      .textContent =
        "● Live market rate";


    $("rateStatus")
      .classList
      .add("ok");

  }

  else {

    $("rateStatus")
      .textContent =
        "Live rate temporarily unavailable";


    $("rateStatus")
      .classList
      .remove("ok");

  }


  update();

}


/* =========================================================
   ORDER ID
========================================================= */

function newOrder() {

  return (
    "EP247-" +
    String(
      Date.now()
    ).slice(-6)
  );

}


/* =========================================================
   DRAWER
========================================================= */

function showDrawer(
  id,
  show
) {

  $(id)
    .classList
    .toggle(
      "hidden",
      !show
    );

}


/* =========================================================
   PAYMENT DATA FOR ORDER
========================================================= */

function paymentDataForOrder() {

  /*
     Crypto → Payment

     Payment information =
     RECEIVE payment.
  */

  if (
    isCryptoToPayment()
  ) {

    return receiveData();

  }


  /*
     Payment → Crypto

     Payment information =
     SEND payment.
  */

  return sendData();

}


/* =========================================================
   RENDER PAYMENT
========================================================= */

function renderPayment() {

  /*
     Use SEND amount as the
     actual amount being sent.
  */

  const sendAmount =
    Number(
      $("sendAmount").value || 0
    );


  const result =
    calculateFromSend(
      sendAmount
    );


  if (!result) {

    alert(
      "Live market rate is not available yet."
    );

    return false;

  }


  orderId =
    newOrder();


  const payment =
    paymentDataForOrder();


  $("orderBadge")
    .textContent =
      orderId;


  /*
     PAYMENT → CRYPTO
  */

  if (
    isPaymentToCrypto()
  ) {

    /*
       If payment method requires
       manual request, open support.
    */

    if (
      payment.status ===
      "request"
    ) {

      window.open(
        `https://t.me/${support()}`,
        "_blank"
      );

      return false;

    }


    $("paymentTitle")
      .textContent =
        `${
          payment.title ||
          sendAsset
        } Payment Details`;


    const fields =
      payment.fields ||
      [];


    $("paymentInfo")
      .innerHTML =
        fields
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


    if (!fields.length) {

      $("paymentInfo")
        .innerHTML = `

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

  }


  /*
     CRYPTO → PAYMENT
  */

  else {

    $("paymentTitle")
      .textContent =
        `Send ${sendAsset}`;


    $("paymentInfo")
      .innerHTML = `

        <div class="payment-row">

          <span>
            Asset
          </span>

          <b>
            ${escapeHTML(sendAsset)}
          </b>

        </div>


        <div class="payment-row">

          <span>
            Amount
          </span>

          <b>
            ${fmt(result.send)}
            ${escapeHTML(sendAsset)}
          </b>

        </div>


        <div class="payment-row">

          <span>
            Network
          </span>

          <b>
            ${escapeHTML(
              $("network").value ||
              "Not applicable"
            )}
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

      `;

  }


  $("paySummary")
    .textContent =
      `${fmt(result.send)} ${sendCurrency()}`;


  $("receiveSummary")
    .textContent =
      `${fmt(result.receive)} ${receiveCurrency()}`;


  $("methodSummary")
    .textContent =
      receiveAsset;


  $("rateSummary")
    .textContent =
      $("customerRate").textContent;


  return true;

}


/* =========================================================
   PAYMENT TEXT
========================================================= */

function paymentText() {

  const lines = [];


  lines.push(
    "EXCHANGEPAY247"
  );


  lines.push(
    `Order ID: ${orderId}`
  );


  lines.push(
    `Direction: ${
      isCryptoToPayment()
        ? "Crypto → Payment"
        : "Payment → Crypto"
    }`
  );


  lines.push(
    `Send: ${
      $("paySummary").textContent
    }`
  );


  lines.push(
    `Receive: ${
      $("receiveSummary").textContent
    }`
  );


  lines.push(
    `Method: ${
      $("methodSummary").textContent
    }`
  );


  lines.push(
    `Rate: ${
      $("rateSummary").textContent
    }`
  );


  /*
     Payment → Crypto

     Include payment fields.
  */

  if (
    isPaymentToCrypto()
  ) {

    const payment =
      sendData();


    (
      payment.fields ||
      []
    )
      .forEach(
        ([key, value]) => {

          lines.push(
            `${key}: ${value}`
          );

        }
      );

  }


  return lines.join("\n");

}


/* =========================================================
   EVENTS
========================================================= */


/*
   SEND = CRYPTO
*/

$("sendCryptoBtn")
  .onclick =
    () => {

      /*
         Select a crypto asset.
      */

      if (!cryptos()[sendAsset]) {

        sendAsset =
          Object.keys(
            cryptos()
          )[0] ||
          "USDT";

      }


      /*
         Receive must be payment.
      */

      if (!payments()[receiveAsset]) {

        receiveAsset =
          Object.keys(
            payments()
          )[0] ||
          "Bank US";

      }


      direction =
        "crypto-to-payment";


      lastEdited =
        "send";


      render();

    };


/*
   SEND = PAYMENT
*/

$("sendPaymentBtn")
  .onclick =
    () => {

      /*
         Select a payment asset.
      */

      if (!payments()[sendAsset]) {

        sendAsset =
          Object.keys(
            payments()
          )[0] ||
          "Bank US";

      }


      /*
         Receive must be crypto.
      */

      if (!cryptos()[receiveAsset]) {

        receiveAsset =
          Object.keys(
            cryptos()
          )[0] ||
          "USDT";

      }


      direction =
        "payment-to-crypto";


      lastEdited =
        "send";


      render();

    };


/*
   SEND SELECTOR
*/

$("sendSelector")
  .onclick =
    () =>
      openPicker("send");


/*
   RECEIVE SELECTOR
*/

$("receiveSelector")
  .onclick =
    () =>
      openPicker("receive");


/*
   CLOSE PICKER
*/

$("closePicker")
  .onclick =
    closePicker;


$("picker")
  .addEventListener(
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


/*
   SEND AMOUNT
*/

$("sendAmount")
  .addEventListener(
    "input",
    () => {

      lastEdited =
        "send";

      update();

    }
  );


/*
   RECEIVE AMOUNT
*/

$("receiveAmount")
  .addEventListener(
    "input",
    () => {

      lastEdited =
        "receive";

      update();

    }
  );


/*
   NETWORK
*/

$("network")
  .addEventListener(
    "change",
    updateNetworkPreview
  );


/*
   SWAP
*/

$("swapBtn")
  .onclick =
    swap;


/* =========================================================
   CONTINUE
========================================================= */

$("continueBtn")
  .onclick =
    () => {

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

          behavior:
            "smooth"

        });

      }

    };


/* =========================================================
   BACK HOME
========================================================= */

$("backHome")
  .onclick =
    () => {

      showDrawer(
        "paymentStep",
        false
      );

    };


/* =========================================================
   PAID
========================================================= */

$("paidBtn")
  .onclick =
    () => {

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

        behavior:
          "smooth"

      });

    };


/* =========================================================
   BACK PAYMENT
========================================================= */

$("backPayment")
  .onclick =
    () => {

      showDrawer(
        "submitStep",
        false
      );


      showDrawer(
        "paymentStep",
        true
      );

    };


/* =========================================================
   COPY
========================================================= */

$("copyInfo")
  .onclick =
    async () => {

      const text =
        paymentText();


      try {

        await navigator
          .clipboard
          .writeText(
            text
          );


        $("copyInfo")
          .textContent =
            "✓ COPIED";


        setTimeout(
          () => {

            $("copyInfo")
              .textContent =
                "COPY PAYMENT INFO";

          },
          1500
        );

      }

      catch {

        alert(text);

      }

    };


/* =========================================================
   SUBMIT ORDER
========================================================= */

$("submitOrder")
  .onclick =
    () => {

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
        receiveType() === "crypto" &&
        (
          !$("network").value ||
          $("network").value ===
            "Not applicable"
        )
      ) {

        alert(
          "Please select a receiving network."
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
        !$("confirmCheck")
          .checked
      ) {

        alert(
          "Please confirm your information."
        );

        return;

      }


      $("successText")
        .textContent =
          `Order ${orderId} has been submitted. Please send your successful payment screenshot to our admin on Telegram with this Order ID.`;


      $("success")
        .classList
        .remove("hidden");


      $("submitOrder")
        .classList
        .add("hidden");

    };


/* =========================================================
   TELEGRAM
========================================================= */

$("sendTelegram")
  .onclick =
    () => {

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


      const text =
        `Payment screenshot for Order ${orderId}\n` +
        `Direction: ${
          isCryptoToPayment()
            ? "Crypto → Payment"
            : "Payment → Crypto"
        }\n` +
        `Send: ${
          $("paySummary").textContent
        }\n` +
        `Receive: ${
          $("receiveSummary").textContent
        }\n` +
        `Method: ${
          $("methodSummary").textContent
        }\n` +
        `Telegram: ${
          $("telegram")
            .value
            .trim()
        }\n` +
        `Transaction ID: ${transaction}\n` +
        `Receiving: ${destination}\n` +
        `Network: ${network}\n` +
        `Note: ${note}`;


      const username =
        admin();


      if (!username) {

        alert(
          "Telegram admin is not configured."
        );

        return;

      }


      window.open(
        `https://t.me/${username}?text=${encodeURIComponent(text)}`,
        "_blank"
      );

    };


/* =========================================================
   NEW ORDER
========================================================= */

$("newOrder")
  .onclick =
    () =>
      location.reload();


/* =========================================================
   SUPPORT
========================================================= */

const supportUsername =
  support();


if (supportUsername) {

  $("supportNav")
    .href =
      `https://t.me/${supportUsername}`;


  $("contactBtn")
    .href =
      `https://t.me/${supportUsername}`;

}


/* =========================================================
   INITIALIZE
========================================================= */

ensureAssets();

render();

fetchLiveRate();


/* =========================================================
   AUTO REFRESH LIVE RATE
========================================================= */

setInterval(
  fetchLiveRate,
  Number(
    settings().refreshMs ||
    60000
  )
);
