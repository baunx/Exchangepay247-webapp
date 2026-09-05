window.CONFIG = {

  // ==================================================
  // GENERAL SETTINGS
  // ==================================================

  settings: {
    feePercent: 28.00,
    refreshMs: 60000,

    adminTelegram: "@exchangepay2477",
    supportTelegram: "@exchangepay2477"
  },


  // ==================================================
  // CRYPTO ASSETS
  // ==================================================

  crypto: {

    USDT: {
      name: "Tether USDT",
      icon: "assets/icons/usdt.svg",
      networks: [
        "TRC20",
        "ERC20",
        "BEP20",
        "Solana"
      ]
    },

    BTC: {
      name: "Bitcoin",
      icon: "assets/icons/btc.svg",
      networks: [
        "Bitcoin"
      ]
    },

    ETH: {
      name: "Ethereum",
      icon: "assets/icons/eth.svg",
      networks: [
        "ERC20"
      ]
    }

  },


  // ==================================================
  // PAYMENT METHODS
  // ==================================================

  paymentMethods: {

    "Bank US": {
      status: "available",
      currency: "USD",
      title: "Bank US",
      icon: "assets/icons/bank-us.svg",

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
      icon: "assets/icons/bank-eu.svg",

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
      icon: "assets/icons/zelle.svg",

      fields: [
        ["Name", "YOUR ZELLE NAME"],
        ["Email", "YOUR ZELLE EMAIL"]
      ]
    },


    "Venmo": {
      status: "request",
      currency: "USD",
      title: "Venmo",
      icon: "assets/icons/venmo.svg",

      fields: []
    },


    "Cash App": {
      status: "request",
      currency: "USD",
      title: "Cash App",
      icon: "assets/icons/cashapp.svg",

      fields: []
    },


    "PayPal": {
      status: "request",
      currency: "USD",
      title: "PayPal",
      icon: "assets/icons/paypal.svg",

      fields: []
    },


    "Wise": {
      status: "request",
      currency: "USD",
      title: "Wise",
      icon: "assets/icons/wise.svg",

      fields: []
    }

  }

};
