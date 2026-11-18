import test from 'node:test';
import assert from 'node:assert/strict';
import {
  customerSchema,
  financePlanSchema,
  paymentRecordSchema,
} from '../schemas.ts';

test('Customer schema validation', () => {
  const validCustomer = {
    fullName: 'Ramesh Kumar',
    phone: '9876543210',
    address: 'Shop 12, Main Bazaar, Salem',
    shopName: 'Kumar Provision Store',
    isActive: true,
  };
  const parsed = customerSchema.safeParse(validCustomer);
  assert.equal(parsed.success, true);

  // Invalid phone (not 10 digits)
  const invalidPhone = { ...validCustomer, phone: '12345' };
  const invalidParsed = customerSchema.safeParse(invalidPhone);
  assert.equal(invalidParsed.success, false);
});

test('Finance plan validation rules', () => {
  const validPlan = {
    customerId: 'a0000000-0000-4000-8000-000000000001',
    principalAmountPaise: 900000, // ₹9,000
    totalCollectionAmountPaise: 1000000, // ₹10,000
    dailyCollectionAmountPaise: 10000, // ₹100
    durationDays: 100,
    startDate: '2026-11-01',
    assignedAgentId: 'a0000000-0000-4000-8000-000000000002',
  };
  const parsed = financePlanSchema.safeParse(validPlan);
  assert.equal(parsed.success, true);

  // Total collection less than principal must fail
  const invalidTotal = {
    ...validPlan,
    totalCollectionAmountPaise: 800000,
  };
  const invalidTotalParsed = financePlanSchema.safeParse(invalidTotal);
  assert.equal(invalidTotalParsed.success, false);

  // Daily * duration less than total must fail
  const insufficientDaily = {
    ...validPlan,
    dailyCollectionAmountPaise: 5000, // ₹50 * 100 = ₹5,000 < ₹10,000
  };
  const insufficientParsed = financePlanSchema.safeParse(insufficientDaily);
  assert.equal(insufficientParsed.success, false);
});

test('Payment recording schema validation', () => {
  const validPayment = {
    financePlanId: 'a0000000-0000-4000-8000-000000000001',
    customerId: 'a0000000-0000-4000-8000-000000000002',
    agentId: 'a0000000-0000-4000-8000-000000000003',
    scheduledDate: '2026-11-07',
    expectedAmountPaise: 10000,
    amountPaidPaise: 10000,
    paymentMethod: 'cash' as const,
    idempotencyKey: 'a0000000-0000-4000-8000-000000000004',
  };
  const parsed = paymentRecordSchema.safeParse(validPayment);
  assert.equal(parsed.success, true);

  // Non-positive payment amount must fail
  const zeroPayment = { ...validPayment, amountPaidPaise: 0 };
  const zeroParsed = paymentRecordSchema.safeParse(zeroPayment);
  assert.equal(zeroParsed.success, false);
});
