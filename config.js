window.CONFIG = {
  settings: {
    feePercent: 1.00,
    refreshMs: 60000,
    adminTelegram: "@exchangepay247",
    supportTelegram: "@exchangepay247"
  },

  crypto: {
    USDT: { name: "Tether USDT", networks: ["TRC20","ERC20","BEP20","Solana"] },
    BTC:  { name: "Bitcoin", networks: ["Bitcoin"] },
    ETH:  { name: "Ethereum", networks: ["ERC20"] }
  },

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
      fields: [["Name", "YOUR ZELLE NAME"],["Email", "YOUR ZELLE EMAIL"]]
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