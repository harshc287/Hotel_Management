import crypto from 'crypto';

export function generateOrderNumber() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = crypto.randomBytes(2).toString('hex').toUpperCase();
  return `ORD-${ts}-${rand}`;
}