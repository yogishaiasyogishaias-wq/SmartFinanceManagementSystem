/**
 * Smart Finance Management System - Monetary & Accounting Calculations
 *
 * CRITICAL RULE: All internal monetary storage and calculations MUST be in integer paise.
 * 1 INR (₹) = 100 paise.
 * Floats are strictly prohibited in calculation pipelines to prevent floating-point drift.
 */

export const PAISE_PER_RUPEE = 100;

/**
 * Converts integer paise to decimal rupees for display purposes only.
 */
export function paiseToRupees(paise: number): number {
  if (!Number.isSafeInteger(paise)) {
    throw new Error(`paise must be a safe integer, received: ${paise}`);
  }
  return paise / PAISE_PER_RUPEE;
}

/**
 * Converts decimal rupees into integer paise, rounding half-up.
 */
export function rupeesToPaise(rupees: number): number {
  if (typeof rupees !== 'number' || isNaN(rupees)) {
    throw new Error(`Invalid rupee amount: ${rupees}`);
  }
  return Math.round(rupees * PAISE_PER_RUPEE);
}

/**
 * Formats integer paise into Indian Rupee currency string (₹X,XX,XXX.XX or ₹X,XX,XXX).
 */
export function formatINR(paise: number, includeDecimals = true): string {
  const isNegative = paise < 0;
  const absPaise = Math.abs(paise);
  const rupees = absPaise / PAISE_PER_RUPEE;

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: includeDecimals ? 2 : 0,
    maximumFractionDigits: includeDecimals ? 2 : 0,
  }).format(rupees);

  return isNegative ? `-${formatted}` : formatted;
}

/**
 * Calculates Expected Gross Profit.
 * Expected profit = total expected collection - principal amount.
 */
export function calculateExpectedProfit(
  totalCollectionPaise: number,
  principalPaise: number
): number {
  if (totalCollectionPaise < principalPaise) {
    throw new Error('Total collection amount cannot be less than principal amount');
  }
  return totalCollectionPaise - principalPaise;
}

/**
 * Calculates Remaining Collection.
 * Remaining collection = total expected collection - valid collections received.
 */
export function calculateRemainingCollection(
  totalExpectedPaise: number,
  validCollectionsPaise: number
): number {
  return Math.max(0, totalExpectedPaise - validCollectionsPaise);
}

/**
 * Calculates Collection Percentage.
 * Collection percentage = valid collections received / total expected collection * 100.
 * Returns percentage as a number rounded to 2 decimal places.
 */
export function calculateCollectionPercentage(
  validCollectionsPaise: number,
  totalExpectedPaise: number
): number {
  if (totalExpectedPaise <= 0) return 0;
  const rawPercentage = (validCollectionsPaise / totalExpectedPaise) * 100;
  return Math.min(100, Math.round(rawPercentage * 100) / 100);
}

/**
 * Realized Profit (Proportional Revenue-Recognition Model)
 *
 * Realized Gross Profit = round(validCollections * (expectedProfit / totalExpectedCollection))
 * In daily microfinance, each collection contains a principal recovery portion and a profit portion.
 */
export function calculateRealizedProfitProportional(
  validCollectionsPaise: number,
  principalPaise: number,
  totalExpectedPaise: number
): number {
  if (totalExpectedPaise <= 0 || validCollectionsPaise <= 0) return 0;
  const expectedProfit = calculateExpectedProfit(totalExpectedPaise, principalPaise);
  const profitFraction = expectedProfit / totalExpectedPaise;
  return Math.round(validCollectionsPaise * profitFraction);
}

/**
 * Realized Profit (Cost-Recovery / Cash-Basis Model)
 *
 * Realized Profit = max(0, validCollections - principal)
 * Under conservative accounting, no profit is booked until the entire principal is recovered.
 */
export function calculateRealizedProfitConservative(
  validCollectionsPaise: number,
  principalPaise: number
): number {
  if (validCollectionsPaise <= principalPaise) return 0;
  return validCollectionsPaise - principalPaise;
}

/**
 * Determines whether an installment is overdue based on current date.
 * scheduledDate: YYYY-MM-DD
 * currentDate: YYYY-MM-DD
 */
export function isInstallmentOverdue(
  scheduledDate: string,
  currentDate: string,
  paidAmountPaise: number,
  expectedAmountPaise: number
): boolean {
  if (paidAmountPaise >= expectedAmountPaise) return false;
  return scheduledDate < currentDate;
}

/**
 * Computes overdue amount for a set of installments up to a given date.
 */
export function calculateTotalOverduePaise(
  installments: Array<{
    scheduledDate: string;
    expectedAmountPaise: number;
    paidAmountPaise: number;
  }>,
  currentDate: string
): number {
  return installments.reduce((acc, inst) => {
    if (inst.scheduledDate < currentDate && inst.paidAmountPaise < inst.expectedAmountPaise) {
      return acc + (inst.expectedAmountPaise - inst.paidAmountPaise);
    }
    return acc;
  }, 0);
}
