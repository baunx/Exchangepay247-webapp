// EXCHANGEPAY247 — EDIT THESE SETTINGS ONLY

const CONFIG = {
  // Admin Telegram username WITHOUT @
  adminTelegram: "exchangepay2477",

  // Your fee. Example: 1 = 1%, 1.5 = 1.5%
  feePercent: 25.0,

  // Live rate refresh interval
  refreshMs: 60000,

  // Payment information shown to customers.
  // Replace the placeholder values with YOUR OWN receiving details.
  payment: {
    "Bank US": {
      title: "Bank US",
      fields: [
        ["Account Name", "YOUR NAME / BUSINESS"],
        ["Routing Number", "YOUR ROUTING NUMBER"],
        ["Account Number", "YOUR ACCOUNT NUMBER"]
      ]
    },
    "Bank EU": {
      title: "Bank EU",
      fields: [
        ["Account Name", "YOUR NAME / BUSINESS"],
        ["IBAN", "YOUR IBAN"],
        ["BIC / SWIFT", "YOUR SWIFT / BIC"]
      ]
    },
    "Zelle": {
      title: "Zelle",
      fields: [
        ["Name", "Thai Hinh"],
        ["Email/Phone", "978 908 8895"]
      ]
    },
    "Venmo": {
      title: "Venmo",
      fields: [
        ["Username", "@YOUR_VENMO"],
        ["Name", "YOUR NAME"]
      ]
    },
    "Cash App": {
      title: "Cash App",
      fields: [
        ["Cashtag", "$YOUR_CASHTAG"],
        ["Name", "YOUR NAME"]
      ]
    },
    "PayPal": {
      title: "PayPal",
      fields: [
        ["Email", "YOUR PAYPAL EMAIL"],
        ["Name", "YOUR NAME"]
      ]
    },
    "Wise": {
      title: "Wise",
      fields: [
        ["Recipient", "YOUR NAME / BUSINESS"],
        ["Email", "YOUR WISE EMAIL"]
      ]
    },
    "E-Wallet": {
      title: "E-Wallet",
      fields: [
        ["Account", "YOUR E-WALLET ACCOUNT"],
        ["Name", "YOUR NAME"]
      ]
    }
  },

  supportUrl: "https://t.me/exchangepay2477"
};
