/*
 EXCHANGEPAY247 — EDIT THIS FILE ONLY
 Payment details, availability, crypto networks and fee are controlled here.
 Fee is used in calculation but is NEVER displayed to customers.
*/

const CONFIG = {
  settings: {
    adminTelegram: "exchangepay2477",
    supportTelegram: "exchangepay2477",
    feePercent: 28.0,
    refreshMs: 60000
  },

  crypto: {
    USDT: { name: "Tether USDT", networks: ["TRC20","ERC20","BEP20","Solana"] },
    BTC:  { name: "Bitcoin", networks: ["Bitcoin"] },
    ETH:  { name: "Ethereum", networks: ["ERC20"] }
  },

  paymentMethods: {
    "Bank US": {
      status: "available", type: "fiat", currency: "USD",
      title: "US Bank Transfer",
      fields: [
        ["Name", "YOUR NAME"],
        ["Bank", "YOUR BANK"],
        ["Account Number", "YOUR ACCOUNT"],
        ["Routing Number", "YOUR ROUTING"]
      ]
    },
    "Bank EU": {
      status: "available", type: "fiat", currency: "EUR",
      title: "EU Bank Transfer",
      fields: [
        ["Name", "YOUR NAME"],
        ["IBAN", "YOUR IBAN"],
        ["BIC / SWIFT", "YOUR SWIFT"]
      ]
    },
    "Zelle": {
      status: "available", type: "fiat", currency: "USD",
      title: "Zelle",
      fields: [["Name","CHAU TRAN"],["Email","tniennien@gmail.com"]]
    },
    "Venmo": {
      status: "available", type: "fiat", currency: "USD",
      title: "Venmo",
      fields: [["Username","@YOUR_VENMO"],["Name","YOUR NAME"]]
    },
    "PayPal": {
      status: "request", type: "fiat", currency: "USD",
      title: "PayPal", fields: []
    },
    "Cash App": {
      status: "request", type: "fiat", currency: "USD",
      title: "Cash App", fields: []
    },
    "Wise": {
      status: "request", type: "fiat", currency: "USD",
      title: "Wise", fields: []
    },
    "E-Wallet": {
      status: "request", type: "fiat",
      title: "E-Wallet", fields: []
    }
  }
};
