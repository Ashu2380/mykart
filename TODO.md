# Blockchain Wallet Payment Integration TODO

## Status: ✅ Dependencies Installed | Next: Model Edit

### 1. [✅] Setup Dependencies & Config
- [✅] Backend: axios, ethers, @emurgo/blockfrost-js ✅
- [✅] Frontend: qrcode.react, lucide-react ✅
- [✅] Created .env.blockchain.example ✅ Copy & configure!

### 2. [ ] Backend Model Update (orderModel.js)
- [ ] Add `cryptoTxHash` and `cryptoNetwork` fields

### 3. [ ] Backend Controller Updates (orderController.js)
- [ ] Add `generateCryptoOrder(network)`
- [ ] Add `verifyCryptoPayment(orderId)`

### 4. [ ] Backend Routes (orderRoutes.js)
- [ ] POST `/crypto-order`
- [ ] GET `/verify-crypto/:orderId`

### 5. [ ] Frontend Checkout Update (PlaceOrder.jsx)
- [ ] Add ETH/ADA payment buttons
- [ ] Crypto payment modal with QR/address/poll

### 6. [ ] Frontend Invoice Update (Invoice.jsx)
- [ ] Display crypto details/tx link

### 7. [ ] UI Polish
- [ ] Footer.jsx: Add crypto logos

### 8. [ ] Testing
- [ ] Testnet tx verification


### 2. [ ] Backend Model Update (orderModel.js)
- [ ] Add `cryptoTxHash` and `cryptoNetwork` fields

### 3. [ ] Backend Controller Updates (orderController.js)
- [ ] Add `generateCryptoOrder(network)`
- [ ] Add `verifyCryptoPayment(orderId)`

### 4. [ ] Backend Routes (orderRoutes.js)
- [ ] POST `/crypto-order`
- [ ] GET `/verify-crypto/:orderId`

### 5. [ ] Frontend Checkout Update (PlaceOrder.jsx)
- [ ] Add ETH/ADA payment buttons
- [ ] Crypto payment modal with QR/address/poll

### 6. [ ] Frontend Invoice Update (Invoice.jsx)
- [ ] Display crypto details/tx link

### 7. [ ] UI Polish
- [ ] Footer.jsx: Add crypto logos
- [ ] Icons/components

### 8. [ ] Testing
- [ ] Testnet tx verification
- [ ] E2E checkout flow
- [ ] Admin view

### 9. [ ] Production Prep
- [ ] Mainnet config
- [ ] Monitoring/alerts

**Next: Dependencies → Model → Controller → Routes → Frontend**

