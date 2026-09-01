window.CONFIG = {
  settings: {
    // Phí của bạn — khách KHÔNG nhìn thấy dòng này
    feePercent: 28.00,

    // Live rate refresh
    refreshMs: 60000,

    // Telegram admin nhận order
    adminTelegram: "@exchangepay2477",

    // Telegram support
    supportTelegram: "@exchangepay2477"
  },

  // =========================
  // CRYPTO
  // =========================
  crypto: {

    USDT: {
      name: "Tether USDT",
      networks: [
        "TRC20",
        "ERC20",
        "BEP20",
        "Solana"
      ]
    },

    BTC: {
      name: "Bitcoin",
      networks: [
        "Bitcoin"
      ]
    },

    ETH: {
      name: "Ethereum",
      networks: [
        "ERC20"
      ]
    }

  },


  // =========================
  // PAYMENT METHODS
  // =========================
  paymentMethods: {

    "Bank US": {
      status: "available",
      currency: "USD",
      title: "Bank US",

      fields: [
        ["Account Name", "YOUR NAME"],
        ["Bank Name", "YOUR BANK"],
        ["Account Number", "YOUR ACCOUNT"],
        ["Routing Number", "YOUR ROUTING"]
      ]
    },


    "Bank EU": {
      status: "available",
      currency: "EUR",
      title: "Bank EU",

      fields: [
        ["Account Name", "YOUR NAME"],
        ["IBAN", "YOUR IBAN"],
        ["BIC / SWIFT", "YOUR BIC"]
      ]
    },


    "Zelle": {
      status: "available",
      currency: "USD",
      title: "Zelle",

      fields: [
        ["Name", "YOUR ZELLE NAME"],
        ["Email", "YOUR ZELLE EMAIL"]
      ]
    },


    "Venmo": {
      status: "request",
      currency: "USD",
      title: "Venmo",

      fields: []
    },


    "Cash App": {
      status: "request",
      currency: "USD",
      title: "Cash App",

      fields: []
    },


    "PayPal": {
      status: "request",
      currency: "USD",
      title: "PayPal",

      fields: []
    },


    "Wise": {
      status: "request",
      currency: "USD",
      title: "Wise",

      fields: []
    }

  }
};
