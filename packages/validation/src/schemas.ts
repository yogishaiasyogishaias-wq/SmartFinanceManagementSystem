import { z } from 'zod';

/**
 * Standard 10-digit Indian mobile number validation (starts with 6, 7, 8, or 9).
 */
export const indianPhoneRegex = /^[6-9]\d{9}$/;

/**
 * Customer validation schema
 */
export const customerSchema = z.object({
  fullName: z
    .string({ required_error: 'Full name is required' })
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name cannot exceed 100 characters'),
  phone: z
    .string({ required_error: 'Phone number is required' })
    .trim()
    .regex(indianPhoneRegex, 'Must be a valid 10-digit Indian mobile number (e.g., 9876543210)'),
  alternatePhone: z
    .string()
    .trim()
    .regex(indianPhoneRegex, 'Alternate phone must be a valid 10-digit number')
    .optional()
    .nullable()
    .or(z.literal('')),
  address: z
    .string({ required_error: 'Address is required' })
    .trim()
    .min(5, 'Address must be at least 5 characters')
    .max(500, 'Address cannot exceed 500 characters'),
  shopName: z
    .string()
    .trim()
    .max(150, 'Shop/Business name cannot exceed 150 characters')
    .optional()
    .nullable()
    .or(z.literal('')),
  photoPath: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export type CustomerInput = z.infer<typeof customerSchema>;

/**
 * Finance plan creation schema
 */
export const financePlanSchema = z
  .object({
    customerId: z.string().uuid('Customer ID must be a valid UUID'),
    principalAmountPaise: z
      .number({ required_error: 'Principal amount is required' })
      .int('Amount must be an integer paise value')
      .positive('Principal amount must be positive')
      .min(100000, 'Minimum principal is ₹1,000 (100,000 paise)'),
    totalCollectionAmountPaise: z
      .number({ required_error: 'Total collection amount is required' })
      .int('Total collection must be an integer paise value')
      .positive('Total collection amount must be positive'),
    dailyCollectionAmountPaise: z
      .number({ required_error: 'Daily collection amount is required' })
      .int('Daily collection must be an integer paise value')
      .positive('Daily collection amount must be positive'),
    durationDays: z
      .number({ required_error: 'Duration in days is required' })
      .int('Duration must be an integer')
      .min(1, 'Duration must be at least 1 day')
      .max(365, 'Duration cannot exceed 365 days'),
    startDate: z
      .string({ required_error: 'Start date is required' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
    assignedAgentId: z.string().uuid('Assigned agent must be a valid UUID'),
  })
  .refine(
    (data) => data.totalCollectionAmountPaise > data.principalAmountPaise,
    {
      message: 'Total collection amount must be strictly greater than principal amount',
      path: ['totalCollectionAmountPaise'],
    }
  )
  .refine(
    (data) =>
      data.dailyCollectionAmountPaise * data.durationDays >= data.totalCollectionAmountPaise,
    {
      message:
        'Daily collection multiplied by duration must cover or match the total collection amount',
      path: ['dailyCollectionAmountPaise'],
    }
  );

export type FinancePlanInput = z.infer<typeof financePlanSchema>;

/**
 * Payment collection recording schema
 */
export const paymentRecordSchema = z.object({
  financePlanId: z.string().uuid('Finance plan ID must be a valid UUID'),
  customerId: z.string().uuid('Customer ID must be a valid UUID'),
  agentId: z.string().uuid('Agent ID must be a valid UUID'),
  installmentId: z.string().uuid('Installment ID must be a valid UUID').optional().nullable(),
  scheduledDate: z
    .string({ required_error: 'Scheduled date is required' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  expectedAmountPaise: z
    .number()
    .int()
    .nonnegative('Expected amount cannot be negative'),
  amountPaidPaise: z
    .number({ required_error: 'Amount paid is required' })
    .int('Amount paid must be integer paise')
    .positive('Amount paid must be greater than zero'),
  paymentMethod: z.enum(['cash', 'upi', 'bank_transfer', 'other'], {
    required_error: 'Payment method is required',
  }),
  referenceNumber: z.string().trim().max(100).optional().nullable(),
  idempotencyKey: z
    .string({ required_error: 'Idempotency key is required' })
    .uuid('Idempotency key must be a valid UUIDv4'),
  notes: z.string().trim().max(500).optional().nullable(),
});

export type PaymentRecordInput = z.infer<typeof paymentRecordSchema>;

/**
 * Payment adjustment schema (Authorized reversal or correction)
 */
export const paymentAdjustmentSchema = z.object({
  paymentId: z.string().uuid('Payment ID must be a valid UUID'),
  financePlanId: z.string().uuid('Finance plan ID must be a valid UUID'),
  adjustedAmountPaise: z
    .number({ required_error: 'Adjusted amount is required' })
    .int()
    .nonnegative('Adjusted amount cannot be negative'),
  reason: z
    .string({ required_error: 'Reason for adjustment is mandatory' })
    .trim()
    .min(5, 'Reason must be at least 5 characters')
    .max(500, 'Reason cannot exceed 500 characters'),
  authorizedBy: z.string().uuid('Authorizing user ID is required'),
});

export type PaymentAdjustmentInput = z.infer<typeof paymentAdjustmentSchema>;

/**
 * User authentication schema
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Invalid email address'),
  password: z
    .string({ required_error: 'Password is required' })
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;
