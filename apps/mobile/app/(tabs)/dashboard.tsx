import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useSync } from '../../src/context/SyncContext';
import { localDb } from '../../src/services/localDatabase';
import { formatINR } from '@smart-finance/shared';
import { colors } from '../../src/theme/colors';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, agentCode } = useAuth();
  const { isOnline, pendingCount, triggerSync } = useSync();

  const [refreshing, setRefreshing] = useState(false);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [dailyTargetPaise] = useState(500000); // ₹5,000.00
  const [collectedTodayPaise, setCollectedTodayPaise] = useState(30000); // ₹300.00

  const loadData = async () => {
    const items = await localDb.getTodaySchedule('2026-11-07');
    setSchedule(items);
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await triggerSync();
    await loadData();
    setRefreshing(false);
  };

  const pendingTargetPaise = Math.max(0, dailyTargetPaise - collectedTodayPaise);
  const targetPct = Math.round((collectedTodayPaise / dailyTargetPaise) * 100);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Agent Card */}
      <View style={styles.agentCard}>
        <View style={styles.agentHeader}>
          <View style={styles.agentAvatar}>
            <Text style={styles.agentAvatarText}>KV</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.agentName}>{user?.fullName || 'Field Agent'}</Text>
            <Text style={styles.agentCode}>Route Code: {agentCode} &bull; Central Market</Text>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push('/notifications')}
            accessibilityLabel="Notifications"
          >
            <Text style={{ fontSize: 16 }}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>Daily Collection Target</Text>
            <Text style={styles.progressValue}>{targetPct}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${Math.min(100, targetPct)}%` }]} />
          </View>
        </View>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiRow}>
        <View style={[styles.kpiCard, { borderLeftColor: colors.teal600 }]}>
          <Text style={styles.kpiLabel}>Collected Today</Text>
          <Text style={[styles.kpiValue, { color: colors.emerald600 }]}>
            {formatINR(collectedTodayPaise, false)}
          </Text>
          <Text style={styles.kpiSub}>Target: {formatINR(dailyTargetPaise, false)}</Text>
        </View>

        <View style={[styles.kpiCard, { borderLeftColor: colors.amber600 }]}>
          <Text style={styles.kpiLabel}>Pending Target</Text>
          <Text style={[styles.kpiValue, { color: colors.amber600 }]}>
            {formatINR(pendingTargetPaise, false)}
          </Text>
          <Text style={styles.kpiSub}>Remaining today</Text>
        </View>
      </View>

      {/* Quick Actions Grid */}
      <Text style={styles.sectionHeader}>Quick Actions</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.teal600 }]}
          onPress={() => router.push('/payments/record')}
        >
          <Text style={styles.actionIcon}>💰</Text>
          <Text style={styles.actionBtnTitle}>Record Payment</Text>
          <Text style={styles.actionBtnSub}>Cash / UPI receipt</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtnOutline}
          onPress={() => router.push('/(tabs)/schedule')}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionBtnTitleDark}>Daily Route</Text>
          <Text style={styles.actionBtnSubDark}>Today's schedule</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtnOutline}
          onPress={() => router.push('/installments/overdue')}
        >
          <Text style={styles.actionIcon}>⚠️</Text>
          <Text style={styles.actionBtnTitleDark}>Overdue List</Text>
          <Text style={styles.actionBtnSubDark}>Follow-up needed</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtnOutline}
          onPress={() => router.push('/agent/performance')}
        >
          <Text style={styles.actionIcon}>📈</Text>
          <Text style={styles.actionBtnTitleDark}>Performance</Text>
          <Text style={styles.actionBtnSubDark}>Targets & stats</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Route Stops Preview */}
      <View style={styles.routeSection}>
        <View style={styles.routeHeader}>
          <Text style={styles.sectionHeaderNoMargin}>Today's Route Schedule</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/schedule')}>
            <Text style={styles.viewAllText}>View All ({schedule.length}) &rarr;</Text>
          </TouchableOpacity>
        </View>

        {schedule.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No stops scheduled for today.</Text>
          </View>
        ) : (
          schedule.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.stopCard}
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
              <View style={{ flex: 1 }}>
                <Text style={styles.stopCustomer}>{item.customer.full_name}</Text>
                <Text style={styles.stopAddress}>{item.customer.shop_name || item.customer.address}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.stopAmount}>{formatINR(item.expected_amount_paise)}</Text>
                <Text style={[styles.stopStatus, item.status === 'paid' ? styles.statusPaid : styles.statusPending]}>
                  {item.status.toUpperCase()}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate50, padding: 16 },
  agentCard: {
    backgroundColor: colors.navy900,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  agentHeader: { flexDirection: 'row', alignItems: 'center' },
  agentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.teal600,
    alignItems: 'center',
    justifyContent: 'center',
  },
  agentAvatarText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
  agentName: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
  agentCode: { color: colors.slate400, fontSize: 11, marginTop: 2 },
  notifBtn: {
    padding: 8,
    backgroundColor: colors.navy800,
    borderRadius: 10,
  },
  progressContainer: { marginTop: 16 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  progressLabel: { color: colors.slate300, fontSize: 11, fontWeight: '600' },
  progressValue: { color: colors.teal500, fontSize: 11, fontWeight: 'bold' },
  progressBarBg: { height: 6, backgroundColor: colors.navy800, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: 6, backgroundColor: colors.teal500, borderRadius: 3 },

  kpiRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  kpiCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    borderLeftWidth: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  kpiLabel: { fontSize: 10, fontWeight: '700', color: colors.slate500, textTransform: 'uppercase' },
  kpiValue: { fontSize: 18, fontWeight: '900', marginTop: 4 },
  kpiSub: { fontSize: 10, color: colors.slate400, marginTop: 2 },

  sectionHeader: { fontSize: 13, fontWeight: 'bold', color: colors.slate800, marginBottom: 10, textTransform: 'uppercase' },
  sectionHeaderNoMargin: { fontSize: 13, fontWeight: 'bold', color: colors.slate800, textTransform: 'uppercase' },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  actionBtn: {
    width: '48%',
    borderRadius: 12,
    padding: 12,
    elevation: 2,
  },
  actionIcon: { fontSize: 20, marginBottom: 4 },
  actionBtnTitle: { color: colors.white, fontWeight: 'bold', fontSize: 13 },
  actionBtnSub: { color: 'rgba(255,255,255,0.8)', fontSize: 10, marginTop: 2 },
  actionBtnOutline: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.slate200,
    elevation: 1,
  },
  actionBtnTitleDark: { color: colors.slate900, fontWeight: 'bold', fontSize: 13 },
  actionBtnSubDark: { color: colors.slate500, fontSize: 10, marginTop: 2 },

  routeSection: { marginBottom: 30 },
  routeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  viewAllText: { fontSize: 11, fontWeight: '700', color: colors.teal600 },
  stopCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  stopCustomer: { fontSize: 13, fontWeight: 'bold', color: colors.slate900 },
  stopAddress: { fontSize: 11, color: colors.slate500, marginTop: 2 },
  stopAmount: { fontSize: 13, fontWeight: 'bold', color: colors.slate900 },
  stopStatus: { fontSize: 9, fontWeight: 'bold', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginTop: 4 },
  statusPaid: { backgroundColor: colors.emerald100, color: colors.emerald600 },
  statusPending: { backgroundColor: colors.amber100, color: colors.amber600 },
  emptyCard: { backgroundColor: colors.white, padding: 16, borderRadius: 12, alignItems: 'center' },
  emptyText: { color: colors.slate400, fontSize: 12 },
});

