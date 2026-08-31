EXCHANGEPAY247 — 3 STEP + TELEGRAM ADMIN SUBMIT

Flow:
1. Exchange
2. Payment Information
3. Submit Order
4. After submission, customer taps "SEND SCREENSHOT TO ADMIN"
   and Telegram opens the admin chat.

NO IMAGE UPLOAD TO SERVER
-------------------------
The Web App does not upload or store payment screenshots.
The customer sends the screenshot manually in Telegram.

ADMIN TELEGRAM
--------------
Open config.js and change:
  adminTelegram: "exchangepay2477"

Use the username WITHOUT @.

FEE
---
Change:
  feePercent: 1.0

The live USDT market rate is fetched from CoinGecko.
BUY uses market + fee.
SELL uses market - fee.

IMPORTANT
---------
The Telegram button opens the admin's Telegram chat and pre-fills an
Order ID / transaction information message. The customer must attach
the payment screenshot manually in Telegram.

The frontend does not process real payments or verify transactions.
