let sendType = "crypto";
let receiveType = "payment";

let sendAsset = "USDT";
let receiveMethod = "Bank US";

let pickerType = "";

let live = {
  usd: null,
  eur: null
};

let orderId = "";

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

const fmt = number =>
  Number(number).toLocaleString(undefined, {
    maximumFractionDigits: 8
  });


// ==================================================
// ICON
// ==================================================

function cryptoIcon(asset) {

  const data = cryptos()[asset];

  if (data && data.icon) {

    return `
      <img
        src="${data.icon}"
        alt="${asset}"
        class="asset-logo"
      >
    `;
  }

  return asset;
}


function paymentIcon(method) {

  const data = payments()[method];

  if (data && data.icon) {

    return `
      <img
        src="${data.icon}"
        alt="${method}"
        class="asset-logo"
      >
    `;
  }

  return "◆";
}


// ==================================================
// DATA
// ==================================================

function sendData() {

  if (sendType === "crypto") {

    return cryptos()[sendAsset] || {};

  }

  return payments()[sendAsset] || {};
}


function receiveData() {

  if (receiveType === "crypto") {

    return cryptos()[receiveMethod] || {};

  }

  return payments()[receiveMethod] || {};
}


// ==================================================
// CURRENCY
// ==================================================

function sendCurrency() {

  if (sendType === "crypto") {

    return sendAsset;

  }

  return sendData().currency || "USD";
}


function receiveCurrency() {

  if (receiveType === "crypto") {

    return receiveMethod;

  }

  return receiveData().currency || "USD";
}


// ==================================================
// RENDER MAIN EXCHANGE
// ==================================================

function render() {

  const send = sendData();

  const receive = receiveData();


  // ----------------------------------------------
  // SEND
  // ----------------------------------------------

  $("sendIcon").innerHTML =

    sendType === "crypto"

      ? cryptoIcon(sendAsset)

      : paymentIcon(sendAsset);


  $("sendName").textContent =
    sendType === "crypto"
      ? sendAsset
      : sendAsset;


  $("sendSub").textContent =

    sendType === "crypto"

      ? (
          send.name ||
          sendAsset
        )

      : (
          `${send.currency || "USD"} • ` +
          (
            send.status === "request"
              ? "By Request"
              : "Available"
          )
        );


  // ----------------------------------------------
  // RECEIVE
  // ----------------------------------------------

  $("receiveIcon").innerHTML =

    receiveType === "crypto"

      ? cryptoIcon(receiveMethod)

      : paymentIcon(receiveMethod);


  $("receiveName").textContent =
    receiveType === "crypto"
      ? receiveMethod
      : receiveMethod;


  $("receiveSub").textContent =

    receiveType === "crypto"

      ? (
          receive.name ||
          receiveMethod
        )

      : (
          `${receive.currency || "USD"} • ` +
          (
            receive.status === "request"
              ? "By Request"
              : "Available"
          )
        );


  // ----------------------------------------------
  // AMOUNT
  // ----------------------------------------------

  $("amountToken").innerHTML =

    sendType === "crypto"

      ? `${cryptoIcon(sendAsset)} ${sendAsset}`

      : `${paymentIcon(sendAsset)} ${sendAsset}`;


  // ----------------------------------------------
  // RECEIVE SUMMARY
  // ----------------------------------------------

  $("receiveSmallIcon").innerHTML =

    receiveType === "crypto"

      ? cryptoIcon(receiveMethod)

      : paymentIcon(receiveMethod);


  $("receiveCurrency").textContent =
    receiveCurrency();


  if (receiveType === "crypto") {

    $("receiveCurrencyName").textContent =
      receive.name ||
      receiveMethod;

  } else {

    const currency =
      receive.currency || "USD";

    const names = {

      USD: "US Dollar",

      EUR: "Euro",

      CAD: "Canadian Dollar",

      AUD: "Australian Dollar",

      GBP: "British Pound"

    };

    $("receiveCurrencyName").textContent =
      names[currency] ||
      currency;
  }


  renderNetwork();

  update();
}


// ==================================================
// PICKER ITEMS
// ==================================================

function pickerItems(type) {

  if (type === "crypto") {

    return Object.entries(
      cryptos()
    ).map(([id, data]) => ({

      id,

      name: id,

      sub:
        data.name ||
        id,

      icon:
        data.icon
          ? `<img src="${data.icon}" alt="${id}" class="picker-logo">`
          : id

    }));

  }


  return Object.entries(
    payments()
  ).map(([id, data]) => ({

    id,

    name: id,

    sub:
      `${data.currency || ""} • ` +
      (
        data.status === "request"
          ? "By Request"
          : "Available"
      ),

    icon:
      data.icon
        ? `<img src="${data.icon}" alt="${id}" class="picker-logo">`
        : "◆"

  }));
}


// ==================================================
// OPEN PICKER
// ==================================================

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


  $("pickerList").innerHTML = "";


  // ------------------------------------------------
  // TYPE SWITCH
  // ------------------------------------------------

  const switchBox =
    document.createElement("div");

  switchBox.className =
    "picker-switch";


  const cryptoButton =
    document.createElement("button");

  cryptoButton.textContent =
    "CRYPTO";


  const paymentButton =
    document.createElement("button");

  paymentButton.textContent =
    "PAYMENT";


  if (type === "crypto") {

    cryptoButton.classList.add(
      "active"
    );

  } else {

    paymentButton.classList.add(
      "active"
    );
  }


  cryptoButton.onclick = () => {

    if (side === "send") {

      sendType = "crypto";

    } else {

      receiveType = "crypto";
    }

    openPicker(side);
  };


  paymentButton.onclick = () => {

    if (side === "send") {

      sendType = "payment";

    } else {

      receiveType = "payment";
    }

    openPicker(side);
  };


  switchBox.appendChild(
    cryptoButton
  );

  switchBox.appendChild(
    paymentButton
  );


  $("pickerList").appendChild(
    switchBox
  );


  // ------------------------------------------------
  // ITEMS
  // ------------------------------------------------

  pickerItems(type).forEach(item => {

    const button =
      document.createElement("button");


    button.className =
      "picker-item";


    button.innerHTML = `

      <span class="coin-icon">

        ${item.icon}

      </span>

      <span class="selector-text">

        <b>${item.name}</b>

        <small>${item.sub}</small>

      </span>

      <span>›</span>

    `;


    button.onclick = () => {

      if (side === "send") {

        sendAsset =
          item.id;

      } else {

        receiveMethod =
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


// ==================================================
// CLOSE PICKER
// ==================================================

function closePicker() {

  $("picker")
    .classList
    .add("hidden");
}


// ==================================================
// SELECT BUTTONS
// ==================================================

$("sendSelector").onclick = () => {

  openPicker("send");
};


$("receiveSelector").onclick = () => {

  openPicker("receive");
};


$("closePicker").onclick =
  closePicker;


// ==================================================
// SWAP
// ==================================================

$("swapBtn").onclick = () => {

  const oldSendType =
    sendType;

  const oldSendAsset =
    sendAsset;


  const oldReceiveType =
    receiveType;

  const oldReceiveMethod =
    receiveMethod;


  sendType =
    oldReceiveType;

  sendAsset =
    oldReceiveMethod;


  receiveType =
    oldSendType;

  receiveMethod =
    oldSendAsset;


  render();
};


// ==================================================
// MARKET RATE
// ==================================================

function marketRate() {

  const from =
    sendCurrency();

  const to =
    receiveCurrency();


  // ----------------------------------------------
  // USDT → USD
  // ----------------------------------------------

  if (

    sendType === "crypto" &&

    sendAsset === "USDT" &&

    receiveType === "payment" &&

    to === "USD"

  ) {

    return live.usd;
  }


  // ----------------------------------------------
  // USDT → EUR
  // ----------------------------------------------

  if (

    sendType === "crypto" &&

    sendAsset === "USDT" &&

    receiveType === "payment" &&

    to === "EUR"

  ) {

    return live.eur;
  }


  // ----------------------------------------------
  // USD → USDT
  // ----------------------------------------------

  if (

    sendType === "payment" &&

    from === "USD" &&

    receiveType === "crypto" &&

    receiveMethod === "USDT"

  ) {

    return live.usd
      ? 1 / live.usd
      : null;
  }


  // ----------------------------------------------
  // EUR → USDT
  // ----------------------------------------------

  if (

    sendType === "payment" &&

    from === "EUR" &&

    receiveType === "crypto" &&

    receiveMethod === "USDT"

  ) {

    return live.eur
      ? 1 / live.eur
      : null;
  }


  return null;
}


// ==================================================
// CALCULATE
// ==================================================

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
    INTERNAL FEE

    Fee is NOT displayed.

    The customer only sees
    the final customer rate.
  */

  const internalFee =
    fee();


  const customerRate =
    market *
    (1 - internalFee);


  const receive =
    amount *
    customerRate;


  return {

    amount,

    market,

    customerRate,

    receive
  };
}


// ==================================================
// UPDATE DISPLAY
// ==================================================

function update() {

  const result =
    calculate();


  const currency =
    receiveCurrency();


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

    `${fmt(result.receive)} ${currency}`;


  $("marketRate").textContent =

    `1 ${sendCurrency()} ≈ ` +
    `${fmt(result.market)} ${currency}`;


  $("customerRate").textContent =

    `1 ${sendCurrency()} ≈ ` +
    `${fmt(result.customerRate)} ${currency}`;
}


// ==================================================
// NETWORK
// ==================================================

function renderNetwork() {

  let networks = [];


  if (

    receiveType === "crypto" &&

    cryptos()[receiveMethod]

  ) {

    networks =
      cryptos()[receiveMethod]
        .networks || [];

  }


  else if (

    sendType === "crypto" &&

    cryptos()[sendAsset]

  ) {

    networks =
      cryptos()[sendAsset]
        .networks || [];
  }


  $("network").innerHTML =

    (
      networks.length
        ? networks
        : ["Not applicable"]
    )

    .map(
      network =>
        `<option>${network}</option>`
    )

    .join("");
}


// ==================================================
// LIVE USDT RATE
// ==================================================

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
        data.data.rates.USD
      );


    const eur =
      Number(
        data.data.rates.EUR
      );


    if (
      !(usd > 0) ||
      !(eur > 0)
    ) {

      throw new Error(
        "Invalid rate"
      );
    }


    live.usd = usd;

    live.eur = eur;


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


// ==================================================
// ORDER ID
// ==================================================

function newOrder() {

  return (
    "EP247-" +
    String(Date.now())
      .slice(-6)
  );
}


// ==================================================
// DRAWER
// ==================================================

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


// ==================================================
// PAYMENT DATA
// ==================================================

function paymentData() {

  if (
    receiveType === "payment"
  ) {

    return (
      payments()[receiveMethod] ||
      {}
    );
  }


  if (
    sendType === "payment"
  ) {

    return (
      payments()[sendAsset] ||
      {}
    );
  }


  return {};
}


function paymentMethodName() {

  if (
    receiveType === "payment"
  ) {

    return receiveMethod;
  }


  if (
    sendType === "payment"
  ) {

    return sendAsset;
  }


  return "Crypto";
}


// ==================================================
// PAYMENT INFORMATION
// ==================================================

function renderPayment() {

  const result =
    calculate();


  const payment =
    paymentData();


  if (!result) {

    alert(
      "Live rate is not available yet."
    );

    return false;
  }


  // Crypto → Crypto
  if (

    sendType === "crypto" &&

    receiveType === "crypto"

  ) {

    alert(
      "Crypto to Crypto payment information is not configured yet."
    );

    return false;
  }


  // Payment method requires support
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


  $("orderBadge")
    .textContent =
    orderId;


  const method =
    paymentMethodName();


  $("paymentTitle")
    .textContent =

    `${payment.title || method} Payment Details`;


  $("paymentInfo")
    .innerHTML =

    (payment.fields || [])

      .map(
        ([key, value]) => `

          <div class="payment-row">

            <span>${key}</span>

            <b>${value}</b>

          </div>

        `
      )

      .join("");


  $("paySummary")
    .textContent =

    `${fmt(result.amount)} ${sendCurrency()}`;


  $("receiveSummary")
    .textContent =

    `${fmt(result.receive)} ${receiveCurrency()}`;


  $("methodSummary")
    .textContent =
    method;


  $("rateSummary")
    .textContent =

    `1 ${sendCurrency()} ≈ ` +
    `${fmt(result.customerRate)} ` +
    `${receiveCurrency()}`;


  return true;
}


// ==================================================
// PAYMENT TEXT
// ==================================================

function paymentText() {

  const payment =
    paymentData();


  const method =
    paymentMethodName();


  return (

    (payment.title || method) +

    "\n" +

    (payment.fields || [])

      .map(
        ([key, value]) =>
          `${key}: ${value}`
      )

      .join("\n")
  );
}


// ==================================================
// AMOUNT
// ==================================================

$("amount").oninput =
  update;


// ==================================================
// CONTINUE
// ==================================================

$("continueBtn").onclick =
  () => {

    if (
      renderPayment()
    ) {

      showDrawer(
        "paymentStep",
        true
      );
    }
  };


// ==================================================
// BACK HOME
// ==================================================

$("backHome").onclick =
  () => {

    showDrawer(
      "paymentStep",
      false
    );
  };


// ==================================================
// I'VE PAID
// ==================================================

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
  };


// ==================================================
// BACK PAYMENT
// ==================================================

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
  };


// ==================================================
// COPY PAYMENT INFO
// ==================================================

$("copyInfo").onclick =
  async () => {

    const text =
      paymentText();


    try {

      await navigator
        .clipboard
        .writeText(text);


      $("copyInfo")
        .textContent =
        "✓ COPIED";


      setTimeout(() => {

        $("copyInfo")
          .textContent =
          "COPY PAYMENT INFO";

      }, 1500);


    } catch (error) {

      alert(text);
    }
  };


// ==================================================
// SUBMIT ORDER
// ==================================================

$("submitOrder").onclick =
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

      `Order ${orderId} has been submitted. ` +
      `Please send your successful payment screenshot ` +
      `to our admin on Telegram with this Order ID.`;


    $("success")
      .classList
      .remove("hidden");


    $("submitOrder")
      .classList
      .add("hidden");
  };


// ==================================================
// TELEGRAM ADMIN
// ==================================================

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


    const receiving =
      $("destination")
        .value
        .trim();


    const network =
      $("network")
        .value;


    const text =

`Payment screenshot for Order ${orderId}

Telegram: ${telegram}

Transaction ID: ${transaction}

Receiving: ${receiving}

Network: ${network}`;


    window.open(

      `https://t.me/${admin()}?text=` +
      encodeURIComponent(text),

      "_blank"

    );
  };


// ==================================================
// NEW ORDER
// ==================================================

$("newOrder").onclick =
  () => location.reload();


// ==================================================
// TELEGRAM LINKS
// ==================================================

if ($("supportNav")) {

  $("supportNav").href =
    `https://t.me/${support()}`;
}


if ($("contactBtn")) {

  $("contactBtn").href =
    `https://t.me/${support()}`;
}


// ==================================================
// INITIALIZE
// ==================================================

render();

fetchLiveRate();


setInterval(

  fetchLiveRate,

  Number(
    settings().refreshMs ||
    60000
  )

);
