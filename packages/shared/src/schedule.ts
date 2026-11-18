/**
 * Smart Finance Management System - Installment Schedule Generator
 *
 * Rules:
 * 1. Expected end date = start date + duration days - 1 day.
 * 2. Each day creates an installment record indexed from 1 to durationDays.
 * 3. Daily collection amount must be positive.
 * 4. Sum of all installment expected amounts MUST equal totalCollectionAmountPaise.
 *    Any remainder (e.g. if total is not evenly divisible) is allocated to the final installment.
 */

export interface ScheduleGenerationParams {
  financePlanId: string;
  startDate: string; // YYYY-MM-DD
  durationDays: number;
  dailyCollectionAmountPaise: number;
  totalCollectionAmountPaise: number;
}

export interface GeneratedInstallment {
  financePlanId: string;
  installmentNumber: number;
  scheduledDate: string; // YYYY-MM-DD
  expectedAmountPaise: number;
  paidAmountPaise: number;
  status: 'pending';
}

/**
 * Calculates end date: start_date + duration_days - 1 day.
 */
export function calculateEndDate(startDateStr: string, durationDays: number): string {
  if (durationDays < 1) {
    throw new Error('Duration days must be at least 1');
  }

  const [year, month, day] = startDateStr.split('-').map(Number);
  if (!year || !month || !day) {
    throw new Error(`Invalid start date format: ${startDateStr}. Expected YYYY-MM-DD`);
  }

  // Use UTC to prevent daylight saving time / timezone skew
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + (durationDays - 1));

  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
}

/**
 * Adds N days to a YYYY-MM-DD date in UTC.
 */
export function addDays(startDateStr: string, daysToAdd: number): string {
  const [year, month, day] = startDateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + daysToAdd);

  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');

  return `${y}-${m}-${d}`;
}

/**
 * Generates the complete array of installments for a finance plan.
 */
export function generateInstallmentSchedule(
  params: ScheduleGenerationParams
): GeneratedInstallment[] {
  const {
    financePlanId,
    startDate,
    durationDays,
    dailyCollectionAmountPaise,
    totalCollectionAmountPaise,
  } = params;

  if (durationDays <= 0) {
    throw new Error('Duration must be greater than 0 days');
  }
  if (dailyCollectionAmountPaise <= 0) {
    throw new Error('Daily collection amount must be greater than 0');
  }
  if (totalCollectionAmountPaise <= 0) {
    throw new Error('Total collection amount must be greater than 0');
  }

  const installments: GeneratedInstallment[] = [];
  let accumulatedPaise = 0;

  for (let i = 1; i <= durationDays; i++) {
    const scheduledDate = addDays(startDate, i - 1);
    const isLast = i === durationDays;

    let installmentAmount = dailyCollectionAmountPaise;
    if (isLast) {
      // Allocate the remaining exact paise to the last installment
      installmentAmount = totalCollectionAmountPaise - accumulatedPaise;
    }

    accumulatedPaise += installmentAmount;

    installments.push({
      financePlanId,
      installmentNumber: i,
      scheduledDate,
      expectedAmountPaise: installmentAmount,
      paidAmountPaise: 0,
      status: 'pending',
    });
  }

  if (accumulatedPaise !== totalCollectionAmountPaise) {
    throw new Error(
      `Schedule generation error: Total generated (${accumulatedPaise}) does not match expected (${totalCollectionAmountPaise})`
    );
  }

  return installments;
}
