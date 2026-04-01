# Blockchain Payment Integration TODO
## Status: 🚀 In Progress

### ✅ Step 1: Create TODO.md [COMPLETED]

### ✅ Step 2: Update PaymentSettings.jsx
- [x] Remove card/upi/netbanking options (keep only wallet)
- [x] Wallet dropdown: Remove bitcoin, keep ethereum/cardano  
- [x] Auto-connect wallet on type change
- [x] Set wallet as default type
- [x] Update UI titles to "Blockchain Wallet Settings"

### ⏳ Step 3: Update PlaceOrder.jsx
- [ ] Hide/disable Razorpay/QR buttons (keep COD + Crypto)
- [ ] Make Crypto default payment method
- [ ] Test checkout flow

### ⏳ Step 4: Enhance CryptoPayment.jsx  
- [ ] Auto-connect on modal open
- [ ] Prominent balance display
- [ ] Success feedback

### ⏳ Step 5: Testing & Verification
- [ ] Test PaymentSettings wallet auto-connect
- [ ] Test PlaceOrder -> CryptoPayment flow
- [ ] Verify backend order creation
- [ ] Backend payment verification works

### ⏳ Step 6: Final Testing
- [ ] Complete checkout with ETH/ADA
- [ ] Order appears in /order page
- [ ] attempt_completion

**Next Action:** Implement PaymentSettings.jsx changes
