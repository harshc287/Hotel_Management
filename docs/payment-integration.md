
# Razorpay integration checklist
1. Use Razorpay Test Mode keys in `server/.env`.
2. Set `PAYMENT_MODE=razorpay`.
3. Configure raw-body middleware specifically for `/api/payments/webhook` before JSON parsing and verify `X-Razorpay-Signature` with `RAZORPAY_WEBHOOK_SECRET`.
4. Make webhook processing idempotent using the provider event/payment ID and persist a ledger record.
5. Verify captured amount, currency, provider order ID and internal order association.
6. Add authorized refund initiation/status reconciliation and test network retries.
7. Run end-to-end tests before production. The starter webhook deliberately returns 501 until raw-body verification is implemented; do not enable live payments yet.
