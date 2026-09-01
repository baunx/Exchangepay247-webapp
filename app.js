/* =========================================================
   EXCHANGEPAY247 — APP.JS
   =========================================================
   SUPPORTED DIRECTIONS

   1. Crypto  → Payment Method
   2. Payment → Crypto

   Example:

   USDT → Bank US
   BTC  → Zelle
   ETH  → Bank EU

   SWAP:

   Bank US → USDT
   Zelle   → BTC
   Bank EU → ETH

   ========================================================= */


/* =========================================================
   STATE
   ========================================================= */

let sendType = "crypto";
let receiveType = "payment";

let sendAsset = "USDT";
let receiveAsset = "Bank US";

let pickerType = "";

let live = {};

let orderId = "";


/* =========================================================
   BASIC HELPERS
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


const fmt = value =>
  Number(value).toLocaleString(
    undefined,
    {
      maximumFractionDigits: 8
    }
  );


/* =========================================================
   DIRECTION HELPERS
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
   CURRENT CRYPTO DATA
   ========================================================= */

function sendCryptoData() {

  if (
    sendType !== "crypto"
  ) {

    return {};

  }


  return (
    cryptos()[sendAsset] ||
    {}
  );

}


function receiveCryptoData() {

  if (
    receiveType !== "crypto"
  ) {

    return {};

  }


  return (
    cryptos()[receiveAsset] ||
    {}
  );

}


/* =========================================================
   CURRENT PAYMENT DATA
   ========================================================= */

function sendPaymentData() {

  if (
    sendType !== "payment"
  ) {

    return {};

  }


  return (
    payments()[sendAsset] ||
    {}
  );

}


function receivePaymentData() {

  if (
    receiveType !== "payment"
  ) {

    return {};

  }


  return (
    payments()[receiveAsset] ||
    {}
  );

}


/* =========================================================
   CURRENT FIAT CURRENCY
   ========================================================= */

function fiatCurrency() {

  if (
    isCryptoToPayment()
  ) {

    return (
      receivePaymentData().currency ||
      "USD"
    );

  }


  if (
    isPaymentToCrypto()
  ) {

    return (
      sendPaymentData().currency ||
      "USD"
    );

  }


  return "USD";

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
   CRYPTO ICON
   ========================================================= */

function iconAsset(asset) {

  const data =
    cryptos()[asset] || {};


  if (
    data.icon
  ) {

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
   PAYMENT ICON
   ========================================================= */

function iconMethod(method) {

  const data =
    payments()[method] || {};


  if (
    data.icon
  ) {

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
   FALLBACK CRYPTO ICONS
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
   FALLBACK PAYMENT ICONS
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
   SAFE ATTRIBUTE
   ========================================================= */

function escapeAttribute(value) {

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

}


/* =========================================================
   PICKER ITEMS
   ========================================================= */

function items(type) {

  if (
    type === "crypto"
  ) {

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


  if (
    type === "payment"
  ) {

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


  return [];

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


  const list =
    items(type);


  if (
    !list.length
  ) {

    $("pickerList").innerHTML = `

      <div class="picker-item">

        <span class="selector-text">

          <b>
            No options available
          </b>

          <small>
            Please contact support.
          </small>

        </span>

      </div>

    `;

  }


  list.forEach(item => {

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

      if (
        side === "send"
      ) {

        sendAsset =
          item.id;

      } else {

        receiveAsset =
          item.id;

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
   RENDER SEND SIDE
   ========================================================= */

function renderSend() {

  if (
    sendType === "crypto"
  ) {

    const data =
      sendCryptoData();


    $("sendIcon").innerHTML =
      iconAsset(sendAsset);


    $("sendName").textContent =
      sendAsset;


    $("sendSub").textContent =
      data.name ||
      sendAsset;


    $("amountToken").innerHTML =
      `${iconAsset(sendAsset)} ${sendAsset}`;

    return;

  }


  if (
    sendType === "payment"
  ) {

    const data =
      sendPaymentData();


    $("sendIcon").innerHTML =
      iconMethod(sendAsset);


    $("sendName").textContent =
      sendAsset;


    $("sendSub").textContent =
      `${data.currency || "USD"} • ${
        data.status === "request"
          ? "By Request"
          : "Available"
      }`;


    $("amountToken").textContent =
      data.currency ||
      "USD";

  }

}


/* =========================================================
   RENDER RECEIVE SIDE
   ========================================================= */

function renderReceive() {

  if (
    receiveType === "crypto"
  ) {

    const data =
      receiveCryptoData();


    $("receiveIcon").innerHTML =
      iconAsset(receiveAsset);


    $("receiveName").textContent =
      receiveAsset;


    $("receiveSub").textContent =
      data.name ||
      receiveAsset;


    $("receiveSmallIcon").innerHTML =
      iconAsset(receiveAsset);


    $("receiveCurrency").textContent =
      receiveAsset;


    $("receiveCurrencyName").textContent =
      data.name ||
      receiveAsset;


    return;

  }


  if (
    receiveType === "payment"
  ) {

    const data =
      receivePaymentData();


    $("receiveIcon").innerHTML =
      iconMethod(receiveAsset);


    $("receiveName").textContent =
      receiveAsset;


    $("receiveSub").textContent =
      `${data.currency || "USD"} • ${
        data.status === "request"
          ? "By Request"
          : "Available"
      }`;


    $("receiveSmallIcon").innerHTML =
      iconMethod(receiveAsset);


    $("receiveCurrency").textContent =
      data.currency ||
      "USD";


    $("receiveCurrencyName").textContent =
      currencyName(
        data.currency
      );

  }

}


/* =========================================================
   RENDER NETWORK
   ========================================================= */

function renderNetwork() {

  const network =
    $("network");


  if (!network) {
    return;
  }


  /*
    Network is required only when
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

    network.disabled =
      true;

    return;

  }


  network.disabled =
    false;


  const networks =
    receiveCryptoData().networks ||
    [];


  if (
    !networks.length
  ) {

    network.innerHTML = `
      <option>
        Not applicable
      </option>
    `;

    return;

  }


  network.innerHTML =
    networks
      .map(
        item =>
          `<option value="${escapeAttribute(item)}">
            ${escapeHTML(item)}
          </option>`
      )
      .join("");

}


/* =========================================================
   RENDER DESTINATION
   ========================================================= */

function renderDestination() {

  if (
    isCryptoToPayment()
  ) {

    $("destinationLabel").textContent =
      "Receiving Payment Account";


    $("destination").placeholder =
      "Enter your receiving account / email";


    return;

  }


  if (
    isPaymentToCrypto()
  ) {

    $("destinationLabel").textContent =
      "Receiving Crypto Address";


    $("destination").placeholder =
      "Enter your crypto wallet address";


    return;

  }

}


/* =========================================================
   MAIN RENDER
   ========================================================= */

function render() {

  renderSend();

  renderReceive();

  renderNetwork();

  renderDestination();

  update();

}


/* =========================================================
   SWAP
   ========================================================= */

$("swapBtn").onclick = () => {

  /*
    Save current values.
  */

  const oldSendType =
    sendType;


  const oldSendAsset =
    sendAsset;


  const oldReceiveType =
    receiveType;


  const oldReceiveAsset =
    receiveAsset;


  /*
    Swap types.
  */

  sendType =
    oldReceiveType;


  receiveType =
    oldSendType;


  /*
    Swap selected assets.
  */

  sendAsset =
    oldReceiveAsset;


  receiveAsset =
    oldSendAsset;


  /*
    Render everything again.
  */

  render();

};


/* =========================================================
   MARKET RATE
   ========================================================= */

function marketRate() {

  let crypto = null;

  let fiat = null;


  /*
    Crypto → Payment

    Example:

    USDT → Bank US

    Market rate:

    1 USDT = X USD
  */

  if (
    isCryptoToPayment()
  ) {

    crypto =
      sendAsset;


    fiat =
      fiatCurrency();

  }


  /*
    Payment → Crypto

    Example:

    Bank US → USDT

    Market rate is still:

    1 USDT = X USD
  */

  if (
    isPaymentToCrypto()
  ) {

    crypto =
      receiveAsset;


    fiat =
      fiatCurrency();

  }


  if (
    !crypto ||
    !fiat
  ) {

    return null;

  }


  /*
    Live rate.
  */

  const liveRate =
    live?.[crypto]?.[fiat];


  if (
    Number(liveRate) > 0
  ) {

    return Number(
      liveRate
    );

  }


  /*
    Optional config fallback.

    Supported examples:

    rate: 100000

    OR

    rates: {
      USD: 100000,
      EUR: 85000
    }
  */

  const data =
    cryptos()[crypto] ||
    {};


  if (
    data.rates &&
    Number(
      data.rates[fiat]
    ) > 0
  ) {

    return Number(
      data.rates[fiat]
    );

  }


  if (
    fiat === "USD" &&
    Number(data.rate) > 0
  ) {

    return Number(
      data.rate
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
    !(amount > 0)
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


  const customer =
    market *
    (1 + fee());


  let receive = 0;


  /*
    Crypto → Payment

    Example:

    100 USDT
    Market = 1 USD
    Fee = 28%

    Customer rate = 1.28 USD

    Receive = 128 USD
  */

  if (
    isCryptoToPayment()
  ) {

    receive =
      amount *
      customer;

  }


  /*
    Payment → Crypto

    Example:

    128 USD
    Market = 1 USD / USDT
    Fee = 28%

    Receive = 100 USDT
  */

  if (
    isPaymentToCrypto()
  ) {

    receive =
      amount /
      customer;

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


  /*
    Crypto → Payment
  */

  if (
    isCryptoToPayment()
  ) {

    const fiat =
      fiatCurrency();


    $("receive").textContent =
      `${fmt(result.receive)} ${fiat}`;


    $("marketRate").textContent =
      `1 ${sendAsset} ≈ ${fmt(result.market)} ${fiat}`;


    $("customerRate").textContent =
      `1 ${sendAsset} ≈ ${fmt(result.customer)} ${fiat}`;


    return;

  }


  /*
    Payment → Crypto
  */

  if (
    isPaymentToCrypto()
  ) {

    const fiat =
      fiatCurrency();


    $("receive").textContent =
      `${fmt(result.receive)} ${receiveAsset}`;


    $("marketRate").textContent =
      `1 ${receiveAsset} ≈ ${fmt(result.market)} ${fiat}`;


    /*
      Customer rate is deliberately
      shown as the crypto price.

      Example:

      1 USDT ≈ 1.28 USD
    */

    $("customerRate").textContent =
      `1 ${receiveAsset} ≈ ${fmt(result.customer)} ${fiat}`;

  }

}


/* =========================================================
   LIVE MARKET RATE
   ========================================================= */

async function fetchLiveRate() {

  try {

    $("rateStatus").textContent =
      "Updating live market rate…";


    const assets =
      Object.keys(
        cryptos()
      );


    if (
      !assets.length
    ) {

      throw new Error(
        "No crypto assets configured"
      );

    }


    const rates = {};


    /*
      Fetch every configured crypto.

      Coinbase endpoint:

      /v2/exchange-rates?currency=BTC
    */

    for (
      const asset of assets
    ) {

      try {

        const response =
          await fetch(
            `https://api.coinbase.com/v2/exchange-rates?currency=${encodeURIComponent(asset)}`,
            {
              cache: "no-store"
            }
          );


        if (
          !response.ok
        ) {

          console.warn(
            `Rate request failed for ${asset}`
          );

          continue;

        }


        const data =
          await response.json();


        const sourceRates =
          data?.data?.rates;


        if (
          !sourceRates
        ) {

          continue;

        }


        rates[asset] = {};


        /*
          Main fiat currencies.
        */

        [
          "USD",
          "EUR",
          "CAD",
          "AUD",
          "GBP",
          "BRL",
          "MXN"

        ].forEach(
          fiat => {

            const value =
              Number(
                sourceRates[fiat]
              );


            if (
              value > 0
            ) {

              rates[asset][fiat] =
                value;

            }

          }
        );

      } catch (error) {

        console.warn(
          `Unable to fetch ${asset} rate`,
          error
        );

      }

    }


    /*
      Save rates.
    */

    if (
      Object.keys(rates).length
    ) {

      live =
        rates;

    }


    if (
      !Object.keys(live).length
    ) {

      throw new Error(
        "No live rates received"
      );

    }


    $("rateStatus").textContent =
      "● Live market rate";


    $("rateStatus")
      .classList
      .add("ok");


    update();

  } catch (error) {

    console.error(
      "Live rate error:",
      error
    );


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
    String(
      Date.now()
    ).slice(-6)
  );

}


/* =========================================================
   DRAWERS
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
   PAYMENT FIELDS HTML
   ========================================================= */

function paymentFieldsHTML(
  payment
) {

  if (
    !payment.fields ||
    !payment.fields.length
  ) {

    return `

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


  return payment.fields
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


  orderId =
    newOrder();


  /*
    =======================================================
    PAYMENT → CRYPTO
    =======================================================
  */

  if (
    isPaymentToCrypto()
  ) {

    const payment =
      sendPaymentData();


    /*
      Payment method requiring
      manual support.
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


    $("paymentTitle").textContent =
      `${payment.title || sendAsset} Payment Details`;


    $("paymentInfo").innerHTML =
      paymentFieldsHTML(
        payment
      );


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
      } ${
        payment.currency || "USD"
      }`;


    $("destinationLabel").textContent =
      "Receiving Crypto Address";


    $("destination").placeholder =
      "Enter your crypto wallet address";


    return true;

  }


  /*
    =======================================================
    CRYPTO → PAYMENT
    =======================================================
  */

  if (
    isCryptoToPayment()
  ) {

    const payment =
      receivePaymentData();


    /*
      If receiving payment method
      requires manual support.
    */

    if (
      payment.status === "request"
    ) {

      /*
        Unlike Payment → Crypto,
        there are no payment details
        required from us here.

        The order can still be created.
      */

      $("paymentTitle").textContent =
        "Exchange Order";


      $("paymentInfo").innerHTML = `

        <div class="payment-row">

          <span>
            Status
          </span>

          <b>
            Contact Support
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

    } else {

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
              payment.currency ||
              "USD"
            )}
          </b>

        </div>

      `;

    }


    $("paySummary").textContent =
      `${fmt(result.amount)} ${sendAsset}`;


    $("receiveSummary").textContent =
      `${fmt(result.receive)} ${
        payment.currency ||
        "USD"
      }`;


    $("methodSummary").textContent =
      receiveAsset;


    $("rateSummary").textContent =
      `1 ${sendAsset} ≈ ${
        fmt(result.customer)
      } ${
        payment.currency ||
        "USD"
      }`;


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
    Payment details are relevant
    when customer sends payment.
  */

  if (
    isPaymentToCrypto()
  ) {

    const payment =
      sendPaymentData();


    if (
      payment.fields?.length
    ) {

      lines.push("");

      payment.fields.forEach(
        ([key, value]) => {

          lines.push(
            `${key}: ${value}`
          );

        }
      );

    }

  }


  return lines.join(
    "\n"
  );

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
   CLOSE PICKER OUTSIDE
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
   AMOUNT EVENT
   ========================================================= */

$("amount").oninput =
  update;


/* =========================================================
   CONTINUE
   ========================================================= */

$("continueBtn").onclick =
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

        behavior: "smooth"

      });

    }

  };


/* =========================================================
   BACK HOME
   ========================================================= */

$("backHome").onclick =
  () => {

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
   I'VE PAID
   ========================================================= */

$("paidBtn").onclick =
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

      behavior: "smooth"

    });

  };


/* =========================================================
   BACK PAYMENT
   ========================================================= */

$("backPayment").onclick =
  () => {

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

$("submitOrder").onclick =
  () => {

    const destination =
      $("destination")
        .value
        .trim();


    if (
      !destination
    ) {

      alert(
        isPaymentToCrypto()
          ? "Please enter your receiving crypto address."
          : "Please enter your receiving payment account."
      );

      return;

    }


    /*
      Receiving crypto requires
      a valid network.
    */

    if (
      isPaymentToCrypto()
    ) {

      const network =
        $("network").value;


      if (
        !network ||
        network ===
        "Not applicable"
      ) {

        alert(
          "Please select your receiving network."
        );

        return;

      }

    }


    /*
      Telegram.
    */

    const telegram =
      $("telegram")
        .value
        .trim();


    if (
      !telegram
    ) {

      alert(
        "Please enter your Telegram username."
      );

      return;

    }


    /*
      Confirmation.
    */

    if (
      !$("confirmCheck").checked
    ) {

      alert(
        "Please confirm your information."
      );

      return;

    }


    const direction =
      isCryptoToPayment()
        ? "Crypto → Payment"
        : "Payment → Crypto";


    $("successText").textContent =
      `Order ${orderId} has been submitted (${direction}). Please send your successful payment screenshot to our admin on Telegram with this Order ID.`;


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

$("sendTelegram").onclick =
  () => {

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
      $("network").value ||
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
  () => {

    location.reload();

  };


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
