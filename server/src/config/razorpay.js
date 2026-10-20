import Razorpay from 'razorpay';

let instance = null;

export function getRazorpay() {
  if (instance) return instance;
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials missing');
  }
  instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
  return instance;
}