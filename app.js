let mode = "buy";
let selectedMethod = "Bank US";
let live = {
  usd: null,
  eur: null
};
let orderId = "";

const $ = id => document.getElementById(id);

function fill(sel, items) {
  if (!sel) return;
  sel.innerHTML = items
    .map(x => `<option value="${x}">${x}</option>`)
    .join("");
}

function setup() {
  if (mode === "buy") {
    fill($("sendAsset"), ["USD", "EUR"]);
    fill($("receiveAsset"), ["USDT"]);
  } else {
    fill($("sendAsset"), ["USDT"]);
    fill($("receiveAsset"), ["USD", "EUR"]);
  }

  if ($("sendLabel")) {
    $("sendLabel").textContent =
      mode === "buy" ? "You Pay" : "You Send";
  }

  renderMethods();
  update();
}

function marketRate(from, to) {
  if (from === "USDT" && to === "USD") {
    return live.usd;
  }

  if (from === "USD" && to === "USDT") {
    return live.usd ? 1 / live.usd : null;
  }

  if (from === "USDT" && to === "EUR") {
    return live.eur;
  }

  if (from === "EUR" && to === "USDT") {
    return live.eur ? 1 / live.eur : null;
  }

  return null;
}

function calculate() {
  const sendAsset = $("sendAsset")?.value;
  const receiveAsset = $("receiveAsset")?.value;
  const amount = Number($("amount")?.value || 0);

  const market = marketRate(sendAsset, receiveAsset);
  const fee = Number(CONFIG.feePercent || 0) / 100;

  if (!market || !Number.isFinite(market)) {
    return null;
  }

  /*
    BUY:
    Customer pays market rate + fee.

    SELL:
    Customer receives market rate - fee.
  */

  const customerRate =
    mode === "buy"
      ? market * (1 + fee)
      : market * (1 - fee);

  const receive =
    mode === "buy"
      ? amount / customerRate
      : amount * customerRate;

  return {
    sendAsset,
    receiveAsset,
    amount,
    market,
    customerRate,
    receive
  };
}

function formatNumber(value, max = 8) {
  return Number(value).toLocaleString(undefined, {
    maximumFractionDigits: max
  });
}

function update() {
  const c = calculate();

  if ($("fee")) {
    $("fee").textContent =
      `${Number(CONFIG.feePercent || 0).toFixed(2)}%`;
  }

  if (!c) {
    if ($("receive")) {
      $("receive").value = "—";
    }

    if ($("marketRate")) {
      $("marketRate").textContent = "Waiting for live rate…";
    }

    if ($("customerRate")) {
      $("customerRate").textContent = "Waiting for live rate…";
    }

    return;
  }

  if ($("receive")) {
    $("receive").value = formatNumber(c.receive);
  }

  if ($("marketRate")) {
    $("marketRate").textContent =
      `1 ${c.sendAsset} ≈ ${formatNumber(c.market)} ${c.receiveAsset}`;
  }

  if ($("customerRate")) {
    $("customerRate").textContent =
      `1 ${c.sendAsset} ≈ ${formatNumber(c.customerRate)} ${c.receiveAsset}`;
  }
}


/* =====================================================
   LIVE USDT RATE
   Coinbase public Exchange Rates API
   ===================================================== */

async function fetchLiveRate() {
  try {
    if ($("liveStatus")) {
      $("liveStatus").textContent = "● UPDATING";
      $("liveStatus").classList.remove("live-ok");
    }

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 10000);

    const response = await fetch(
      "https://api.coinbase.com/v2/exchange-rates?currency=USDT",
      {
        method: "GET",
        cache: "no-store",
        signal: controller.signal
      }
    );

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(
        `Rate API error: ${response.status}`
      );
    }

    const data = await response.json();

    if (
      !data ||
      !data.data ||
      !data.data.rates
    ) {
      throw new Error("Invalid rate response");
    }

    const rates = data.data.rates;

    const usd = Number(rates.USD);
    const eur = Number(rates.EUR);

    if (
      !Number.isFinite(usd) ||
      !Number.isFinite(eur) ||
      usd <= 0 ||
      eur <= 0
    ) {
      throw new Error("Invalid USDT rates");
    }

    live.usd = usd;
    live.eur = eur;

    if ($("liveStatus")) {
      $("liveStatus").textContent = "● LIVE";
      $("liveStatus").classList.add("live-ok");
    }

    update();

    console.log(
      "USDT live rate:",
      {
        USD: live.usd,
        EUR: live.eur
      }
    );

  } catch (error) {

    console.error(
      "Live rate error:",
      error
    );

    if ($("liveStatus")) {
      $("liveStatus").textContent =
        "● RATE UNAVAILABLE";

      $("liveStatus").classList.remove(
        "live-ok"
      );
    }

    /*
      Do NOT use an old/stale rate when the API fails.
      Customer sees rate unavailable instead.
    */

    update();
  }
}


/* =====================================================
   PAYMENT METHODS
   ===================================================== */

function renderMethods() {

  const container = $("methodList");

  if (!container) return;

  const icons = {
    "Bank US": "🏦",
    "Bank EU": "🇪🇺",
    "Zelle": "💜",
    "Venmo": "💳",
    "Cash App": "💵",
    "PayPal": "🅿️",
    "Wise": "🌍",
    "E-Wallet": "👛"
  };

  container.innerHTML =
    Object.keys(CONFIG.payment)
      .map(name => {

        const icon =
          icons[name] || "💳";

        return `
          <button
            class="method ${
              name === selectedMethod
                ? "selected"
                : ""
            }"
            data-name="${name}"
          >
            <span>${icon}</span>
            <b>${name}</b>
          </button>
        `;

      })
      .join("");

  document
    .querySelectorAll(".method")
    .forEach(button => {

      button.onclick = () => {

        selectedMethod =
          button.dataset.name;

        renderMethods();

      };

    });
}


/* =====================================================
   STEP NAVIGATION
   ===================================================== */

function showStep(step) {

  [1, 2, 3].forEach(i => {

    const section =
      $(`step${i}`);

    if (section) {
      section.classList.toggle(
        "hidden",
        i !== step
      );
    }

  });

  [1, 2, 3].forEach(i => {

    const stepElement =
      $(`s${i}`);

    if (stepElement) {

      stepElement.classList.toggle(
        "active",
        i <= step
      );

    }

  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =====================================================
   ORDER
   ===================================================== */

function newOrderId() {

  return (
    "EP247-" +
    String(Date.now()).slice(-6)
  );

}


/* =====================================================
   PAYMENT INFORMATION
   ===================================================== */

function renderPayment() {

  const c = calculate();

  if (!c) {
    alert(
      "Live USDT rate is currently unavailable."
    );
    return false;
  }

  orderId = newOrderId();

  if ($("orderBadge")) {
    $("orderBadge").textContent =
      orderId;
  }

  const info =
    CONFIG.payment[selectedMethod];

  if (!info) {
    alert(
      "Payment information is unavailable for this method."
    );
    return false;
  }

  if ($("paymentTitle")) {
    $("paymentTitle").textContent =
      info.title +
      " Payment Details";
  }

  if ($("paymentInfo")) {

    $("paymentInfo").innerHTML =
      info.fields
        .map(([key, value]) => `
          <div class="payment-row">
            <span>${key}</span>
            <strong>${value}</strong>
          </div>
        `)
        .join("");

  }

  if ($("paySummary")) {

    $("paySummary").textContent =
      `${formatNumber(c.amount)} ${c.sendAsset}`;

  }

  if ($("receiveSummary")) {

    $("receiveSummary").textContent =
      `${formatNumber(c.receive)} ${c.receiveAsset}`;

  }

  if ($("methodSummary")) {

    $("methodSummary").textContent =
      selectedMethod;

  }

  if ($("rateSummary")) {

    $("rateSummary").textContent =
      `1 ${c.sendAsset} ≈ ${formatNumber(
        c.customerRate
      )} ${c.receiveAsset}`;

  }

  return true;
}


/* =====================================================
   COPY PAYMENT INFO
   ===================================================== */

function paymentText() {

  const info =
    CONFIG.payment[selectedMethod];

  if (!info) return "";

  return (
    info.title +
    "\n" +
    info.fields
      .map(
        ([key, value]) =>
          `${key}: ${value}`
      )
      .join("\n")
  );
}


/* =====================================================
   BUY / SELL
   ===================================================== */

document
  .querySelectorAll(".mode")
  .forEach(button => {

    button.onclick = () => {

      document
        .querySelectorAll(".mode")
        .forEach(item =>
          item.classList.remove(
            "active"
          )
        );

      button.classList.add(
        "active"
      );

      mode =
        button.dataset.mode;

      setup();

    };

  });


/* =====================================================
   INPUTS
   ===================================================== */

if ($("amount")) {
  $("amount").oninput = update;
}

if ($("sendAsset")) {
  $("sendAsset").onchange = update;
}

if ($("receiveAsset")) {
  $("receiveAsset").onchange = update;
}


/* =====================================================
   CONTINUE → PAYMENT
   ===================================================== */

if ($("toPayment")) {

  $("toPayment").onclick = () => {

    if (!calculate()) {

      alert(
        "Live USDT rate is currently unavailable. Please try again in a few seconds."
      );

      return;
    }

    if (
      renderPayment()
    ) {

      showStep(2);

    }

  };

}


/* =====================================================
   PAYMENT → SUBMIT
   ===================================================== */

if ($("toSubmit")) {

  $("toSubmit").onclick =
    () => showStep(3);

}


/* =====================================================
   BACK BUTTONS
   ===================================================== */

if ($("back1")) {

  $("back1").onclick =
    () => showStep(1);

}

if ($("back2")) {

  $("back2").onclick =
    () => showStep(2);

}


/* =====================================================
   COPY
   ===================================================== */

if ($("copyInfo")) {

  $("copyInfo").onclick =
    async () => {

      const text =
        paymentText();

      try {

        await navigator.clipboard
          .writeText(text);

        $("copyInfo").textContent =
          "✓ COPIED";

        setTimeout(() => {

          $("copyInfo").textContent =
            "📋 COPY PAYMENT INFO";

        }, 1500);

      } catch (error) {

        alert(text);

      }

    };

}


/* =====================================================
   SUBMIT ORDER
   ===================================================== */

if ($("submitOrder")) {

  $("submitOrder").onclick =
    () => {

      if (
        !$("destination")?.value.trim()
      ) {

        alert(
          "Please enter your receiving information."
        );

        return;
      }

      if (
        !$("telegram")?.value.trim()
      ) {

        alert(
          "Please enter your Telegram username."
        );

        return;
      }

      if (
        !$("confirmCheck")?.checked
      ) {

        alert(
          "Please confirm your payment information."
        );

        return;
      }

      if ($("successText")) {

        $("successText").textContent =
          `Order ${orderId} has been submitted. Please send your successful payment screenshot to our admin on Telegram with this Order ID.`;

      }

      if ($("success")) {

        $("success")
          .classList
          .remove("hidden");

      }

      $("submitOrder")
        .classList
        .add("hidden");

    };

}


/* =====================================================
   TELEGRAM ADMIN
   ===================================================== */

if ($("sendTelegram")) {

  $("sendTelegram").onclick =
    () => {

      const username =
        String(
          CONFIG.adminTelegram || ""
        ).replace(/^@/, "");

      if (!username) {

        alert(
          "Admin Telegram is not configured."
        );

        return;
      }

      const message =
        `Payment screenshot for Order ${orderId}\n` +
        `Telegram: ${
          $("telegram")?.value.trim() || "N/A"
        }\n` +
        `Transaction ID: ${
          $("txid")?.value.trim() || "N/A"
        }`;

      const url =
        `https://t.me/${username}?text=${encodeURIComponent(
          message
        )}`;

      window.open(
        url,
        "_blank"
      );

    };

}


/* =====================================================
   NEW ORDER
   ===================================================== */

if ($("newOrder")) {

  $("newOrder").onclick =
    () => location.reload();

}


/* =====================================================
   START APP
   ===================================================== */

setup();

fetchLiveRate();

setInterval(
  fetchLiveRate,
  Number(CONFIG.refreshMs || 60000)
);
