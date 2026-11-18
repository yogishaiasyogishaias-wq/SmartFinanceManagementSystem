import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { localDb, CachedCustomer, CachedPlan } from '../../src/services/localDatabase';
import { formatINR } from '@smart-finance/shared';
import { colors } from '../../src/theme/colors';

export default function CustomerDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [customer, setCustomer] = useState<CachedCustomer | null>(null);
  const [plans, setPlans] = useState<CachedPlan[]>([]);

  useEffect(() => {
    if (id) {
      localDb.getCustomerById(id).then((c) => setCustomer(c || null));
      localDb.getPlans().then((allPlans) => {
        setPlans(allPlans.filter((p) => p.customer_id === id));
      });
    }
  }, [id]);

  if (!customer) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.slate400 }}>Loading customer profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.headerRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{customer.full_name.slice(0, 1)}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.name}>{customer.full_name}</Text>
            <Text style={styles.code}>{customer.customer_code}</Text>
            <Text style={styles.shop}>{customer.shop_name || 'Retail Business'}</Text>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push(`/customers/edit/${customer.id}`)}
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Primary Phone</Text>
            <Text style={styles.infoValue}>📞 {customer.phone}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Alternate Phone</Text>
            <Text style={styles.infoValue}>{customer.alternate_phone || 'None'}</Text>
          </View>
          <View style={[styles.infoItem, { width: '100%' }]}>
            <Text style={styles.infoLabel}>Physical Address</Text>
            <Text style={styles.infoValue}>{customer.address}</Text>
          </View>
        </View>
      </View>

      {/* Finance Plans */}
      <Text style={styles.sectionTitle}>Active Finance Plans ({plans.length})</Text>
      {plans.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={{ color: colors.slate400, fontSize: 12 }}>No active plans for this customer.</Text>
        </View>
      ) : (
        plans.map((p) => (
          <View key={p.id} style={styles.planCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={styles.planTitle}>Daily Collection Plan</Text>
              <Text style={styles.planStatus}>{p.status.toUpperCase()}</Text>
            </View>
            <View style={styles.planDetailsGrid}>
              <View>
                <Text style={styles.planLabel}>Principal Disbursed</Text>
                <Text style={styles.planVal}>{formatINR(p.principal_amount_paise, false)}</Text>
              </View>
              <View>
                <Text style={styles.planLabel}>Daily Collection</Text>
                <Text style={[styles.planVal, { color: colors.teal600 }]}>
                  {formatINR(p.daily_collection_amount_paise, false)}/day
                </Text>
              </View>
              <View>
                <Text style={styles.planLabel}>Total Expected</Text>
                <Text style={[styles.planVal, { color: colors.emerald600 }]}>
                  {formatINR(p.total_collection_amount_paise, false)}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.recordPaymentBtn}
              onPress={() =>
                router.push({
                  pathname: '/payments/record',
                  params: {
                    customerId: customer.id,
                    customerName: customer.full_name,
                    planId: p.id,
                    expectedPaise: p.daily_collection_amount_paise,
                  },
                })
              }
            >
              <Text style={styles.recordPaymentText}>+ Record Payment for this Plan</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate50, padding: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.slate200,
    marginBottom: 20,
    elevation: 2,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.navy900,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.white, fontSize: 22, fontWeight: 'bold' },
  name: { fontSize: 16, fontWeight: 'bold', color: colors.slate900 },
  code: { fontSize: 11, color: colors.teal600, fontWeight: '700', fontFamily: 'monospace' },
  shop: { fontSize: 12, color: colors.slate500, marginTop: 2 },
  editBtn: { backgroundColor: colors.slate100, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  editBtnText: { color: colors.slate700, fontSize: 11, fontWeight: '600' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.slate100 },
  infoItem: { width: '46%' },
  infoLabel: { fontSize: 10, color: colors.slate400, textTransform: 'uppercase', fontWeight: 'bold' },
  infoValue: { fontSize: 12, color: colors.slate800, fontWeight: '600', marginTop: 2 },

  sectionTitle: { fontSize: 13, fontWeight: 'bold', color: colors.slate800, textTransform: 'uppercase', marginBottom: 10 },
  planCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.slate200,
    marginBottom: 12,
  },
  planTitle: { fontSize: 13, fontWeight: 'bold', color: colors.slate900 },
  planStatus: { fontSize: 9, fontWeight: 'bold', backgroundColor: colors.emerald100, color: colors.emerald600, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  planDetailsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 10 },
  planLabel: { fontSize: 10, color: colors.slate400 },
  planVal: { fontSize: 13, fontWeight: 'bold', color: colors.slate900, marginTop: 2 },
  recordPaymentBtn: {
    backgroundColor: colors.teal600,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  recordPaymentText: { color: colors.white, fontSize: 11, fontWeight: 'bold' },
  emptyCard: { backgroundColor: colors.white, padding: 20, borderRadius: 12, alignItems: 'center' },
});

