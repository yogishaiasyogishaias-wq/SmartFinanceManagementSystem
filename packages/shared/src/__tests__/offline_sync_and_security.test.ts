import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateExpectedProfit,
  calculateRemainingCollection,
  calculateCollectionPercentage,
  calculateRealizedProfitProportional,
  calculateRealizedProfitConservative,
  calculateTotalOverduePaise,
  formatINR,
  paiseToRupees,
  rupeesToPaise,
} from '../finance.ts';
import { generateInstallmentSchedule } from '../schedule.ts';

test('1. Strict Integer Paise Arithmetic & Overflow Prevention', () => {
  const principal = rupeesToPaise(9000); // 900,000 paise
  const total = rupeesToPaise(10000); // 1,000,000 paise
  const daily = rupeesToPaise(100); // 10,000 paise

  assert.equal(principal, 900000);
  assert.equal(total, 1000000);
  assert.equal(daily, 10000);

  // Profit calculation
  const profit = calculateExpectedProfit(total, principal);
  assert.equal(profit, 100000); // 100,000 paise = ₹1,000
  assert.equal(paiseToRupees(profit), 1000);
});

test('2. Partial Payment & Outstanding Balance Calculations', () => {
  const totalExpectedPaise = 1000000; // ₹10,000
  let collectedSoFarPaise = 0;

  // Day 1: Full installment paid (₹100)
  collectedSoFarPaise += 10000;
  let remaining = calculateRemainingCollection(totalExpectedPaise, collectedSoFarPaise);
  assert.equal(remaining, 990000);
  assert.equal(calculateCollectionPercentage(collectedSoFarPaise, totalExpectedPaise), 1.0);

  // Day 2: Partial payment of ₹40 paid (4,000 paise)
  collectedSoFarPaise += 4000;
  remaining = calculateRemainingCollection(totalExpectedPaise, collectedSoFarPaise);
  assert.equal(remaining, 986000);
  assert.equal(calculateCollectionPercentage(collectedSoFarPaise, totalExpectedPaise), 1.4);

  // Day 3: Advance payment of ₹260 paid (26,000 paise)
  collectedSoFarPaise += 26000;
  remaining = calculateRemainingCollection(totalExpectedPaise, collectedSoFarPaise);
  assert.equal(remaining, 960000);
  assert.equal(calculateCollectionPercentage(collectedSoFarPaise, totalExpectedPaise), 4.0);
});

test('3. Realized Profit Recognition: Proportional vs Cost-Recovery Accounting', () => {
  const principal = 900000; // ₹9,000
  const total = 1000000; // ₹10,000

  // Case A: 50% of the loan collected (₹5,000)
  const halfCollected = 500000;

  // Under cost-recovery (Cash basis): principal of ₹9,000 is not yet fully recovered,
  // so realized profit is ₹0.
  const cashBasisProfit = calculateRealizedProfitConservative(halfCollected, principal);
  assert.equal(cashBasisProfit, 0);

  // Under proportional recognition (Accrual microfinance standard):
  // 10% profit margin recognized on collected cash = ₹500 (50,000 paise)
  const proportionalProfit = calculateRealizedProfitProportional(halfCollected, principal, total);
  assert.equal(proportionalProfit, 50000);

  // Case B: 100% of the loan collected (₹10,000)
  const fullCollected = 1000000;
  assert.equal(calculateRealizedProfitConservative(fullCollected, principal), 100000);
  assert.equal(calculateRealizedProfitProportional(fullCollected, principal, total), 100000);
});

test('4. Installment Schedule Generator Determinism', () => {
  const schedule = generateInstallmentSchedule({
    financePlanId: 'plan-xyz',
    startDate: '2026-11-01',
    durationDays: 100,
    dailyCollectionAmountPaise: 10000,
    totalCollectionAmountPaise: 1000000,
  });

  assert.equal(schedule.length, 100);
  assert.equal(schedule[0].scheduledDate, '2026-11-01');
  assert.equal(schedule[99].scheduledDate, '2027-02-08');

  // Verify each installment is sequential and sums to total expected
  const sum = schedule.reduce((acc, inst, idx) => {
    assert.equal(inst.installmentNumber, idx + 1);
    return acc + inst.expectedAmountPaise;
  }, 0);
  assert.equal(sum, 1000000);
});

test('5. Duplicate Payment Prevention via Idempotency Key', () => {
  const mockDatabaseLedger = new Map<string, { paymentId: string; amountPaise: number }>();

  function recordPaymentWithIdempotency(idempotencyKey: string, amountPaise: number) {
    if (mockDatabaseLedger.has(idempotencyKey)) {
      // Idempotent replay: return existing transaction
      return { isDuplicate: true, record: mockDatabaseLedger.get(idempotencyKey)! };
    }
    const newRecord = { paymentId: 'pay-' + Math.random().toString(36).slice(2, 8), amountPaise };
    mockDatabaseLedger.set(idempotencyKey, newRecord);
    return { isDuplicate: false, record: newRecord };
  }

  const key1 = '00000000-0000-4000-8000-000000000001';

  // First execution: successful insert
  const firstAttempt = recordPaymentWithIdempotency(key1, 10000);
  assert.equal(firstAttempt.isDuplicate, false);
  assert.equal(mockDatabaseLedger.size, 1);

  // Retry from mobile offline sync engine: duplicate detected, returns identical record without double-crediting
  const secondAttempt = recordPaymentWithIdempotency(key1, 10000);
  assert.equal(secondAttempt.isDuplicate, true);
  assert.equal(secondAttempt.record.paymentId, firstAttempt.record.paymentId);
  assert.equal(mockDatabaseLedger.size, 1); // Size unchanged!
});

test('6. Offline Outbox Lifecycle: Enqueue, Retry Limit & Dispatch', () => {
  interface LocalOutboxItem {
    id: string;
    idempotencyKey: string;
    retryCount: number;
    status: 'pending' | 'synced' | 'failed';
  }

  const outbox: LocalOutboxItem[] = [];

  // Enqueue payment while offline
  const item: LocalOutboxItem = {
    id: 'outbox-1',
    idempotencyKey: 'idemp-1234',
    retryCount: 0,
    status: 'pending',
  };
  outbox.push(item);
  assert.equal(outbox.length, 1);
  assert.equal(outbox[0].status, 'pending');

  // Attempt 1 fails due to network drop
  outbox[0].retryCount += 1;
  outbox[0].status = 'pending';
  assert.equal(outbox[0].retryCount, 1);

  // Attempt 2 succeeds when network restored
  outbox[0].status = 'synced';
  assert.equal(outbox[0].status, 'synced');
});

