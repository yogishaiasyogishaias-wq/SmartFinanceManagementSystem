import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { localDb } from '../../src/services/localDatabase';
import { formatINR } from '@smart-finance/shared';
import { colors } from '../../src/theme/colors';

export default function ScheduleScreen() {
  const router = useRouter();
  const [schedule, setSchedule] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid'>('all');

  useEffect(() => {
    localDb.getTodaySchedule('2026-11-07').then(setSchedule);
  }, []);

  const filtered = schedule.filter((item) => {
    const matchSearch =
      item.customer.full_name.toLowerCase().includes(search.toLowerCase()) ||
      (item.customer.shop_name && item.customer.shop_name.toLowerCase().includes(search.toLowerCase()));
    const matchFilter =
      filter === 'all' ? true : filter === 'paid' ? item.status === 'paid' : item.status !== 'paid';
    return matchSearch && matchFilter;
  });

  return (
    <View style={styles.container}>
      {/* Search and Tabs */}
      <View style={styles.topBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search route by shop or customer..."
          placeholderTextColor={colors.slate400}
          value={search}
          onChangeText={setSearch}
        />

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, filter === 'all' && styles.tabBtnActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.tabText, filter === 'all' && styles.tabTextActive]}>All Stops ({schedule.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, filter === 'pending' && styles.tabBtnActive]}
            onPress={() => setFilter('pending')}
          >
            <Text style={[styles.tabText, filter === 'pending' && styles.tabTextActive]}>Pending</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabBtn, filter === 'paid' && styles.tabBtnActive]}
            onPress={() => setFilter('paid')}
          >
            <Text style={[styles.tabText, filter === 'paid' && styles.tabTextActive]}>Collected</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No stops match your search criteria.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.customerName}>{item.customer.full_name}</Text>
                <Text style={styles.shopName}>{item.customer.shop_name || 'Retail Business'}</Text>
                <Text style={styles.addressText}>{item.customer.address}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.amountText}>{formatINR(item.expected_amount_paise)}</Text>
                <Text style={[styles.statusBadge, item.status === 'paid' ? styles.statusPaid : styles.statusPending]}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <Text style={styles.planInfo}>
                Plan: {formatINR(item.plan.principal_amount_paise, false)} (Day {item.installment_number} of {item.plan.duration_days})
              </Text>
              {item.status !== 'paid' ? (
                <TouchableOpacity
                  style={styles.collectBtn}
                  onPress={() =>
                    router.push({
                      pathname: '/payments/record',
                      params: {
                        customerId: item.customer.id,
                        customerName: item.customer.full_name,
                        planId: item.finance_plan_id,
                        installmentId: item.id,
                        expectedPaise: item.expected_amount_paise,
                      },
                    })
                  }
                >
                  <Text style={styles.collectBtnText}>Collect Now &rarr;</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.collectedNote}>✓ Confirmed Collected</Text>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate50 },
  topBar: { backgroundColor: colors.white, padding: 12, borderBottomWidth: 1, borderBottomColor: colors.slate200 },
  searchInput: {
    backgroundColor: colors.slate100,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: colors.slate900,
  },
  tabRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  tabBtn: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6, backgroundColor: colors.slate100 },
  tabBtnActive: { backgroundColor: colors.teal600 },
  tabText: { fontSize: 11, fontWeight: '600', color: colors.slate600 },
  tabTextActive: { color: colors.white },

  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.slate200,
    elevation: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  customerName: { fontSize: 14, fontWeight: 'bold', color: colors.slate900 },
  shopName: { fontSize: 11, fontWeight: '600', color: colors.teal600, marginTop: 1 },
  addressText: { fontSize: 11, color: colors.slate500, marginTop: 2 },
  amountText: { fontSize: 16, fontWeight: 'bold', color: colors.slate900 },
  statusBadge: { fontSize: 9, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  statusPaid: { backgroundColor: colors.emerald100, color: colors.emerald600 },
  statusPending: { backgroundColor: colors.amber100, color: colors.amber600 },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.slate100,
  },
  planInfo: { fontSize: 10, color: colors.slate400 },
  collectBtn: {
    backgroundColor: colors.teal600,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  collectBtnText: { color: colors.white, fontSize: 11, fontWeight: 'bold' },
  collectedNote: { fontSize: 11, color: colors.emerald600, fontWeight: '600' },
  emptyContainer: { padding: 30, alignItems: 'center' },
  emptyText: { color: colors.slate400, fontSize: 12 },
});

