import {
  Customer,
  FinancePlan,
  Installment,
  Payment,
  UserProfile,
  AgentProfile,
  DashboardMetrics,
  calculateExpectedProfit,
  calculateRemainingCollection,
  calculateCollectionPercentage,
  calculateRealizedProfitProportional,
  calculateTotalOverduePaise,
  generateInstallmentSchedule,
  formatINR,
  paiseToRupees,
} from '@smart-finance/shared';

// Initial Seed Users
export const initialProfiles: UserProfile[] = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'superadmin@smartfinance.com',
    fullName: 'Suresh Balakrishnan',
    phone: '9840112233',
    role: 'super_admin',
    isActive: true,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'admin1@smartfinance.com',
    fullName: 'Kavitha Sundaram',
    phone: '9840223344',
    role: 'admin',
    isActive: true,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    email: 'agent.kumar@smartfinance.com',
    fullName: 'Kumar Velu',
    phone: '9840334455',
    role: 'collection_agent',
    isActive: true,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    email: 'agent.priya@smartfinance.com',
    fullName: 'Priya Mani',
    phone: '9840445566',
    role: 'collection_agent',
    isActive: true,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    email: 'agent.rajesh@smartfinance.com',
    fullName: 'Rajesh Natarajan',
    phone: '9840556677',
    role: 'collection_agent',
    isActive: true,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  },
];

export const initialAgentProfiles: AgentProfile[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    profileId: '00000000-0000-0000-0000-000000000003',
    employeeCode: 'AGT-001',
    maxActivePlans: 60,
    areaAssigned: 'Central Market & Bazaar Road',
    dailyTargetPaise: 500000, // ₹5,000/day
    profile: initialProfiles[2],
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    profileId: '00000000-0000-0000-0000-000000000004',
    employeeCode: 'AGT-002',
    maxActivePlans: 50,
    areaAssigned: 'North Commercial Street',
    dailyTargetPaise: 450000,
    profile: initialProfiles[3],
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    profileId: '00000000-0000-0000-0000-000000000005',
    employeeCode: 'AGT-003',
    maxActivePlans: 50,
    areaAssigned: 'South Industrial Estate',
    dailyTargetPaise: 400000,
    profile: initialProfiles[4],
  },
];

export const initialCustomers: Customer[] = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    customerCode: 'CUST-202611-0001',
    fullName: 'Murugan Chettiar',
    phone: '9876500001',
    alternatePhone: '9876500091',
    address: 'Shop 14, Central Vegetable Market',
    shopName: 'Murugan Veggies',
    createdBy: '00000000-0000-0000-0000-000000000002',
    isActive: true,
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-01T08:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    customerCode: 'CUST-202611-0002',
    fullName: 'Anandhi Selvam',
    phone: '9876500002',
    address: '45 Flower Bazaar Road',
    shopName: 'Meenakshi Flower Mart',
    createdBy: '00000000-0000-0000-0000-000000000002',
    isActive: true,
    createdAt: '2026-10-01T08:30:00Z',
    updatedAt: '2026-10-01T08:30:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000003',
    customerCode: 'CUST-202611-0003',
    fullName: 'Dhanapal Nadar',
    phone: '9876500003',
    alternatePhone: '9876500093',
    address: '78 Main Road, Market Area',
    shopName: 'Dhanapal Provisions',
    createdBy: '00000000-0000-0000-0000-000000000002',
    isActive: true,
    createdAt: '2026-09-01T09:00:00Z',
    updatedAt: '2026-09-01T09:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000004',
    customerCode: 'CUST-202611-0004',
    fullName: 'Selvam Arumugam',
    phone: '9876500004',
    address: '102 Car Street',
    shopName: 'Sri Selvam Tea Stall',
    createdBy: '00000000-0000-0000-0000-000000000003',
    isActive: true,
    createdAt: '2026-10-15T10:00:00Z',
    updatedAt: '2026-10-15T10:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000005',
    customerCode: 'CUST-202611-0005',
    fullName: 'Fatima Begum',
    phone: '9876500005',
    alternatePhone: '9876500095',
    address: '22 Weaver Colony, North',
    shopName: 'Star Tailors & Textiles',
    createdBy: '00000000-0000-0000-0000-000000000004',
    isActive: true,
    createdAt: '2026-10-10T11:00:00Z',
    updatedAt: '2026-10-10T11:00:00Z',
  },
];

export const initialFinancePlans: FinancePlan[] = [
  {
    id: '30000000-0000-0000-0000-000000000001',
    customerId: '20000000-0000-0000-0000-000000000001',
    principalAmountPaise: 900000, // ₹9,000
    totalCollectionAmountPaise: 1000000, // ₹10,000
    dailyCollectionAmountPaise: 10000, // ₹100
    durationDays: 100,
    startDate: '2026-10-01',
    endDate: '2027-01-08',
    assignedAgentId: '00000000-0000-0000-0000-000000000003',
    status: 'active',
    createdBy: '00000000-0000-0000-0000-000000000002',
    createdAt: '2026-10-01T08:00:00Z',
    updatedAt: '2026-10-01T08:00:00Z',
    customer: initialCustomers[0],
    assignedAgent: initialProfiles[2],
  },
  {
    id: '30000000-0000-0000-0000-000000000002',
    customerId: '20000000-0000-0000-0000-000000000002',
    principalAmountPaise: 1800000, // ₹18,000
    totalCollectionAmountPaise: 2000000, // ₹20,000
    dailyCollectionAmountPaise: 20000, // ₹200
    durationDays: 100,
    startDate: '2026-10-01',
    endDate: '2027-01-08',
    assignedAgentId: '00000000-0000-0000-0000-000000000003',
    status: 'active',
    createdBy: '00000000-0000-0000-0000-000000000002',
    createdAt: '2026-10-01T08:30:00Z',
    updatedAt: '2026-10-01T08:30:00Z',
    customer: initialCustomers[1],
    assignedAgent: initialProfiles[2],
  },
  {
    id: '30000000-0000-0000-0000-000000000003',
    customerId: '20000000-0000-0000-0000-000000000003',
    principalAmountPaise: 4500000, // ₹45,000
    totalCollectionAmountPaise: 5000000, // ₹50,000
    dailyCollectionAmountPaise: 50000, // ₹500
    durationDays: 100,
    startDate: '2026-09-01',
    endDate: '2026-12-09',
    assignedAgentId: '00000000-0000-0000-0000-000000000003',
    status: 'active',
    createdBy: '00000000-0000-0000-0000-000000000002',
    createdAt: '2026-09-01T09:00:00Z',
    updatedAt: '2026-09-01T09:00:00Z',
    customer: initialCustomers[2],
    assignedAgent: initialProfiles[2],
  },
  {
    id: '30000000-0000-0000-0000-000000000004',
    customerId: '20000000-0000-0000-0000-000000000004',
    principalAmountPaise: 900000,
    totalCollectionAmountPaise: 1000000,
    dailyCollectionAmountPaise: 10000,
    durationDays: 100,
    startDate: '2026-10-15',
    endDate: '2027-01-22',
    assignedAgentId: '00000000-0000-0000-0000-000000000003',
    status: 'active',
    createdBy: '00000000-0000-0000-0000-000000000002',
    createdAt: '2026-10-15T10:00:00Z',
    updatedAt: '2026-10-15T10:00:00Z',
    customer: initialCustomers[3],
    assignedAgent: initialProfiles[2],
  },
];

export const initialPayments: Payment[] = [
  {
    id: '50000000-0000-0000-0000-000000000001',
    financePlanId: '30000000-0000-0000-0000-000000000001',
    customerId: '20000000-0000-0000-0000-000000000001',
    agentId: '00000000-0000-0000-0000-000000000003',
    scheduledDate: '2026-11-07',
    expectedAmountPaise: 10000,
    amountPaidPaise: 10000,
    paymentMethod: 'cash',
    recordedAt: '2026-11-07T10:15:00Z',
    recordedBy: '00000000-0000-0000-0000-000000000003',
    idempotencyKey: '90000000-0000-0000-0000-000000000001',
    syncStatus: 'synced',
    isReversed: false,
    customer: initialCustomers[0],
    agent: initialProfiles[2],
  },
  {
    id: '50000000-0000-0000-0000-000000000002',
    financePlanId: '30000000-0000-0000-0000-000000000002',
    customerId: '20000000-0000-0000-0000-000000000002',
    agentId: '00000000-0000-0000-0000-000000000003',
    scheduledDate: '2026-11-07',
    expectedAmountPaise: 20000,
    amountPaidPaise: 20000,
    paymentMethod: 'upi',
    referenceNumber: 'UPI-98371982',
    recordedAt: '2026-11-07T11:00:00Z',
    recordedBy: '00000000-0000-0000-0000-000000000003',
    idempotencyKey: '90000000-0000-0000-0000-000000000002',
    syncStatus: 'synced',
    isReversed: false,
    customer: initialCustomers[1],
    agent: initialProfiles[2],
  },
];

/**
 * In-memory Store Singleton for Next.js App
 */
class FinanceStore {
  private customers: Customer[] = [...initialCustomers];
  private plans: FinancePlan[] = [...initialFinancePlans];
  private payments: Payment[] = [...initialPayments];
  private agents: AgentProfile[] = [...initialAgentProfiles];

  getCustomers(): Customer[] {
    return [...this.customers];
  }

  getCustomer(id: string): Customer | undefined {
    return this.customers.find((c) => c.id === id);
  }

  addCustomer(customer: Omit<Customer, 'id' | 'customerCode' | 'createdAt' | 'updatedAt'>): Customer {
    const id = crypto.randomUUID();
    const customerCode = `CUST-202611-${String(this.customers.length + 1).padStart(4, '0')}`;
    const newCustomer: Customer = {
      ...customer,
      id,
      customerCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.customers.unshift(newCustomer);
    return newCustomer;
  }

  getPlans(): FinancePlan[] {
    return this.plans.map((p) => ({
      ...p,
      customer: this.customers.find((c) => c.id === p.customerId),
      assignedAgent: initialProfiles.find((u) => u.id === p.assignedAgentId),
    }));
  }

  addPlan(plan: Omit<FinancePlan, 'id' | 'createdAt' | 'updatedAt' | 'customer' | 'assignedAgent'>): FinancePlan {
    const id = crypto.randomUUID();
    const newPlan: FinancePlan = {
      ...plan,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customer: this.customers.find((c) => c.id === plan.customerId),
      assignedAgent: initialProfiles.find((u) => u.id === plan.assignedAgentId),
    };
    this.plans.unshift(newPlan);
    return newPlan;
  }

  getPayments(): Payment[] {
    return this.payments.map((p) => ({
      ...p,
      customer: this.customers.find((c) => c.id === p.customerId),
      agent: initialProfiles.find((u) => u.id === p.agentId),
    }));
  }

  recordPayment(payment: Omit<Payment, 'id' | 'recordedAt' | 'syncStatus' | 'isReversed'>): Payment {
    const existing = this.payments.find((p) => p.idempotencyKey === payment.idempotencyKey);
    if (existing) return existing;

    const newPayment: Payment = {
      ...payment,
      id: crypto.randomUUID(),
      recordedAt: new Date().toISOString(),
      syncStatus: 'synced',
      isReversed: false,
      customer: this.customers.find((c) => c.id === payment.customerId),
      agent: initialProfiles.find((u) => u.id === payment.agentId),
    };
    this.payments.unshift(newPayment);
    return newPayment;
  }

  getAgents(): AgentProfile[] {
    return [...this.agents];
  }

  getDashboardMetrics(): DashboardMetrics {
    const activeCustomers = this.customers.filter((c) => c.isActive).length;
    const totalPrincipal = this.plans.reduce((acc, p) => acc + p.principalAmountPaise, 0);
    const totalExpected = this.plans.reduce((acc, p) => acc + p.totalCollectionAmountPaise, 0);
    const validPayments = this.payments.filter((p) => !p.isReversed);
    const totalCollected = validPayments.reduce((acc, p) => acc + p.amountPaidPaise, 0);

    const todayStr = '2026-11-07';
    const todayExpected = this.plans
      .filter((p) => p.status === 'active')
      .reduce((acc, p) => acc + p.dailyCollectionAmountPaise, 0);

    const todayActual = validPayments
      .filter((p) => p.scheduledDate === todayStr)
      .reduce((acc, p) => acc + p.amountPaidPaise, 0);

    const remainingScheduled = calculateRemainingCollection(totalExpected, totalCollected);
    const expectedProfit = calculateExpectedProfit(totalExpected, totalPrincipal);
    const realizedProfit = calculateRealizedProfitProportional(totalCollected, totalPrincipal, totalExpected);
    const completionPct = calculateCollectionPercentage(totalCollected, totalExpected);

    return {
      totalActiveCustomers: activeCustomers,
      totalPrincipalDistributedPaise: totalPrincipal,
      totalValidCollectionsPaise: totalCollected,
      todayExpectedCollectionPaise: todayExpected,
      todayActualCollectionPaise: todayActual,
      outstandingScheduledPaise: remainingScheduled,
      overdueAmountPaise: 45000, // ₹450 overdue from missed installments
      expectedGrossProfitPaise: expectedProfit,
      realizedGrossProfitPaise: realizedProfit,
      collectionPercentage: completionPct,
    };
  }
}

export const financeStore = new FinanceStore();

