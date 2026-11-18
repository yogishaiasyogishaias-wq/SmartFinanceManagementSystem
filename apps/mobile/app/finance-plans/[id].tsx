import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { localDb, CachedPlan, CachedCustomer, CachedInstallment } from '../../src/services/localDatabase';
import { formatINR, calculateExpectedProfit } from '@smart-finance/shared';
import { colors } from '../../src/theme/colors';

export default function FinancePlanDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [plan, setPlan] = useState<CachedPlan | null>(null);
  const [customer, setCustomer] = useState<CachedCustomer | null>(null);
  const [installments, setInstallments] = useState<CachedInstallment[]>([]);

  useEffect(() => {
    if (id) {
      localDb.getPlanById(id).then(async (p) => {
        if (p) {
          setPlan(p);
          const c = await localDb.getCustomerById(p.customer_id);
          setCustomer(c || null);
          const inst = await localDb.getInstallmentsForPlan(p.id);
          setInstallments(inst);
        }
      });
    }
  }, [id]);

  if (!plan) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.slate400 }}>Loading plan details...</Text>
      </View>
    );
  }

  const profitPaise = calculateExpectedProfit(
    plan.total_collection_amount_paise,
    plan.principal_amount_paise
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.planTitle}>Daily Collection Finance Plan</Text>
          <Text style={styles.badge}>{plan.status.toUpperCase()}</Text>
        </View>

        <Text style={styles.customerName}>{customer?.full_name || 'Customer'}</Text>
        <Text style={styles.customerShop}>{customer?.shop_name || customer?.address}</Text>

        <View style={styles.grid}>
          <View style={styles.metric}>
            <Text style={styles.label}>Principal Distributed</Text>
            <Text style={styles.val}>{formatINR(plan.principal_amount_paise)}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.label}>Daily Rate</Text>
            <Text style={[styles.val, { color: colors.teal600 }]}>{formatINR(plan.daily_collection_amount_paise)}/day</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.label}>Total Collection</Text>
            <Text style={[styles.val, { color: colors.emerald600 }]}>{formatINR(plan.total_collection_amount_paise)}</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.label}>Expected Profit</Text>
            <Text style={[styles.val, { color: colors.teal600 }]}>+{formatINR(profitPaise)}</Text>
          </View>
        </View>

        <View style={styles.dateRow}>
          <Text style={styles.dateText}>Start: {plan.start_date}</Text>
          <Text style={styles.dateText}>Expected End: {plan.end_date}</Text>
          <Text style={styles.dateText}>Tenure: {plan.duration_days} Days</Text>
        </View>
      </View>

      <Text style={styles.sectionHeader}>Cached Installment Schedule</Text>
      {installments.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No local installments cached for this plan.</Text>
        </View>
      ) : (
        installments.map((inst) => (
          <View key={inst.id} style={styles.instCard}>
            <View>
              <Text style={styles.instNumber}>Day #{inst.installment_number}</Text>
              <Text style={styles.instDate}>{inst.scheduled_date}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.instAmount}>{formatINR(inst.expected_amount_paise)}</Text>
              <Text style={inst.status === 'paid' ? styles.paidText : styles.pendingText}>
                {inst.status.toUpperCase()}
              </Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate50, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.slate200, marginBottom: 20 },
  planTitle: { fontSize: 13, fontWeight: 'bold', color: colors.slate900 },
  badge: { fontSize: 9, fontWeight: 'bold', backgroundColor: colors.emerald100, color: colors.emerald600, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  customerName: { fontSize: 16, fontWeight: 'bold', color: colors.slate900, marginTop: 8 },
  customerShop: { fontSize: 11, color: colors.slate500, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.slate100 },
  metric: { width: '46%' },
  label: { fontSize: 10, color: colors.slate400, textTransform: 'uppercase', fontWeight: 'bold' },
  val: { fontSize: 14, fontWeight: 'bold', color: colors.slate900, marginTop: 2 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.slate100 },
  dateText: { fontSize: 10, color: colors.slate500, fontWeight: '500' },
  sectionHeader: { fontSize: 12, fontWeight: 'bold', color: colors.slate700, textTransform: 'uppercase', marginBottom: 10 },
  instCard: { backgroundColor: colors.white, borderRadius: 10, padding: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: colors.slate200 },
  instNumber: { fontSize: 12, fontWeight: 'bold', color: colors.slate900 },
  instDate: { fontSize: 10, color: colors.slate400, marginTop: 2 },
  instAmount: { fontSize: 13, fontWeight: 'bold', color: colors.slate900 },
  paidText: { fontSize: 9, color: colors.emerald600, fontWeight: 'bold' },
  pendingText: { fontSize: 9, color: colors.amber600, fontWeight: 'bold' },
  emptyCard: { backgroundColor: colors.white, padding: 20, borderRadius: 12, alignItems: 'center' },
  emptyText: { color: colors.slate400, fontSize: 12 },
});

