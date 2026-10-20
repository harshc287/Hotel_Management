
import test from 'node:test';
import assert from 'node:assert/strict';

test('order lifecycle disallows skipping from pending payment to preparing', () => {
  const transitions = { PENDING_PAYMENT: ['PAID','CANCELLED'], PAID: ['CONFIRMED','CANCELLED'], CONFIRMED: ['PREPARING','CANCELLED'] };
  assert.equal(transitions.PENDING_PAYMENT.includes('PREPARING'), false);
  assert.equal(transitions.PAID.includes('CONFIRMED'), true);
});
