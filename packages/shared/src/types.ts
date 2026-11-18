/**
 * Smart Finance Management System - Shared Domain Types
 * All financial amounts are integer paise (1 INR = 100 paise)
 */

export type UserRole = 'super_admin' | 'admin' | 'collection_agent';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AgentProfile {
  id: string;
  profileId: string;
  employeeCode: string;
  maxActivePlans: number;
  areaAssigned: string;
  dailyTargetPaise: number;
  profile?: UserProfile;
}

export interface Customer {
  id: string;
  customerCode: string;
  fullName: string;
  phone: string;
  alternatePhone?: string | null;
  address: string;
  shopName?: string | null;
  photoPath?: string | null;
  createdBy: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FinancePlanStatus = 'active' | 'completed' | 'defaulted' | 'cancelled';

export interface FinancePlan {
  id: string;
  customerId: string;
  principalAmountPaise: number;
  totalCollectionAmountPaise: number;
  dailyCollectionAmountPaise: number;
  durationDays: number;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  assignedAgentId: string;
  status: FinancePlanStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  customer?: Customer;
  assignedAgent?: UserProfile;
}

export type InstallmentStatus = 'paid' | 'partially_paid' | 'pending' | 'missed' | 'waived';

export interface Installment {
  id: string;
  financePlanId: string;
  installmentNumber: number;
  scheduledDate: string; // YYYY-MM-DD
  expectedAmountPaise: number;
  paidAmountPaise: number;
  status: InstallmentStatus;
  lastPaymentDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'other';

export type SyncStatus = 'pending' | 'synced' | 'failed' | 'conflict';

export interface Payment {
  id: string;
  financePlanId: string;
  customerId: string;
  agentId: string;
  installmentId?: string | null;
  scheduledDate: string; // YYYY-MM-DD
  expectedAmountPaise: number;
  amountPaidPaise: number;
  paymentMethod: PaymentMethod;
  referenceNumber?: string | null;
  recordedAt: string; // ISO 8601 UTC
  recordedBy: string;
  idempotencyKey: string;
  syncStatus: SyncStatus;
  notes?: string | null;
  isReversed: boolean;
  reversedAt?: string | null;
  reversedBy?: string | null;
  reversalReason?: string | null;
  customer?: Customer;
  agent?: UserProfile;
}

export interface PaymentAdjustment {
  id: string;
  paymentId: string;
  financePlanId: string;
  previousAmountPaise: number;
  adjustedAmountPaise: number;
  reason: string;
  authorizedBy: string;
  createdAt: string;
}

export type SyncOperationType = 'CREATE_PAYMENT' | 'UPDATE_CUSTOMER' | 'CREATE_CUSTOMER';

export interface SyncQueueItem {
  id: string;
  operationType: SyncOperationType;
  entityType: string;
  entityId: string;
  payloadJson: string;
  idempotencyKey: string;
  retryCount: number;
  status: SyncStatus;
  lastError?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalActiveCustomers: number;
  totalPrincipalDistributedPaise: number;
  totalValidCollectionsPaise: number;
  todayExpectedCollectionPaise: number;
  todayActualCollectionPaise: number;
  outstandingScheduledPaise: number;
  overdueAmountPaise: number;
  expectedGrossProfitPaise: number;
  realizedGrossProfitPaise: number;
  collectionPercentage: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
  ipAddress?: string | null;
  createdAt: string;
}
