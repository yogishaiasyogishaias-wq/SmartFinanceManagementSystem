import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateExpectedProfit,
  calculateRemainingCollection,
  calculateCollectionPercentage,
  calculateRealizedProfitProportional,
  calculateRealizedProfitConservative,
  paiseToRupees,
  rupeesToPaise,
  formatINR,
  isInstallmentOverdue,
  calculateTotalOverduePaise,
} from '../finance.ts';
import {
  calculateEndDate,
  generateInstallmentSchedule,
} from '../schedule.ts';

test('Monetary conversion tests', () => {
  assert.equal(paiseToRupees(1000000), 10000);
  assert.equal(rupeesToPaise(100), 10000);
  assert.equal(rupeesToPaise(9000), 900000);
  assert.match(formatINR(1000000), /10,000/);
});

test('Business Model Scenario: Principal ₹9,000, Total ₹10,000, Profit ₹1,000', () => {
  const principalPaise = 900000; // ₹9,000
  const totalCollectionPaise = 1000000; // ₹10,000
  const dailyCollectionPaise = 10000; // ₹100
  const durationDays = 100;

  // Expected profit
  const expectedProfit = calculateExpectedProfit(totalCollectionPaise, principalPaise);
  assert.equal(expectedProfit, 100000); // ₹1,000 (100,000 paise)

  // Half-way collected: 50 days * ₹100 = ₹5,000 (500,000 paise)
  const halfCollected = 500000;
  const remaining = calculateRemainingCollection(totalCollectionPaise, halfCollected);
  assert.equal(remaining, 500000); // ₹5,000 remaining

  const percentage = calculateCollectionPercentage(halfCollected, totalCollectionPaise);
  assert.equal(percentage, 50.0);

  // Realized profit under proportional model (10% margin on collections):
  // 500,000 * (100,000 / 1,000,000) = 50,000 paise (₹500)
  const proportionalProfit = calculateRealizedProfitProportional(
    halfCollected,
    principalPaise,
    totalCollectionPaise
  );
  assert.equal(proportionalProfit, 50000);

  // Realized profit under conservative cost-recovery model:
  // ₹5,000 received does not exceed ₹9,000 principal, so realized profit = 0
  const conservativeProfit = calculateRealizedProfitConservative(
    halfCollected,
    principalPaise
  );
  assert.equal(conservativeProfit, 0);

  // After full collection: ₹10,000 received
  const fullProfitConservative = calculateRealizedProfitConservative(
    totalCollectionPaise,
    principalPaise
  );
  assert.equal(fullProfitConservative, 100000); // ₹1,000
});

test('Installment Schedule Generation: 100 days duration', () => {
  const startDate = '2026-11-01';
  const durationDays = 100;
  const dailyPaise = 10000; // ₹100
  const totalPaise = 1000000; // ₹10,000

  // End date rule: startDate + duration - 1 day
  // 2026-11-01 + 99 days = 2027-02-08
  const endDate = calculateEndDate(startDate, durationDays);
  assert.equal(endDate, '2027-02-08');

  const schedule = generateInstallmentSchedule({
    financePlanId: 'plan-123',
    startDate,
    durationDays,
    dailyCollectionAmountPaise: dailyPaise,
    totalCollectionAmountPaise: totalPaise,
  });

  assert.equal(schedule.length, 100);
  assert.equal(schedule[0].installmentNumber, 1);
  assert.equal(schedule[0].scheduledDate, '2026-11-01');
  assert.equal(schedule[0].expectedAmountPaise, 10000);

  assert.equal(schedule[99].installmentNumber, 100);
  assert.equal(schedule[99].scheduledDate, '2027-02-08');
  assert.equal(schedule[99].expectedAmountPaise, 10000);

  // Sum check
  const totalGenerated = schedule.reduce((sum, item) => sum + item.expectedAmountPaise, 0);
  assert.equal(totalGenerated, totalPaise);
});

test('Overdue installment calculations', () => {
  const today = '2026-11-07';
  assert.equal(isInstallmentOverdue('2026-11-05', today, 0, 10000), true);
  assert.equal(isInstallmentOverdue('2026-11-05', today, 10000, 10000), false);
  assert.equal(isInstallmentOverdue('2026-11-08', today, 0, 10000), false);

  const installments = [
    { scheduledDate: '2026-11-04', expectedAmountPaise: 10000, paidAmountPaise: 10000 }, // paid
    { scheduledDate: '2026-11-05', expectedAmountPaise: 10000, paidAmountPaise: 5000 },  // partial overdue
    { scheduledDate: '2026-11-06', expectedAmountPaise: 10000, paidAmountPaise: 0 },     // full overdue
    { scheduledDate: '2026-11-07', expectedAmountPaise: 10000, paidAmountPaise: 0 },     // today, not overdue yet
  ];

  const totalOverdue = calculateTotalOverduePaise(installments, today);
  // (10000 - 5000) + 10000 = 15000 paise (₹150)
  assert.equal(totalOverdue, 15000);
});
