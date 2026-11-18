import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { formatINR } from '@smart-finance/shared';
import { colors } from '../../src/theme/colors';

export default function AgentPerformanceScreen() {
  const { user, agentCode } = useAuth();

  const dailyTargetPaise = 500000; // ₹5,000
  const dailyCollectedPaise = 30000; // ₹300
  const monthlyTargetPaise = 12500000; // ₹1,25,000
  const monthlyCollectedPaise = 11200000; // ₹1,12,000

  const dailyPct = Math.round((dailyCollectedPaise / dailyTargetPaise) * 100);
  const monthlyPct = Math.round((monthlyCollectedPaise / monthlyTargetPaise) * 100);

  return (
    <ScrollView style={styles.container}>
      {/* Agent Card */}
      <View style={styles.card}>
        <Text style={styles.title}>Field Agent Performance Card</Text>
        <Text style={styles.agentName}>{user?.fullName || 'Kumar Velu'}</Text>
        <Text style={styles.agentCode}>Employee Code: {agentCode} &bull; Route: Central Market</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Assigned Plans</Text>
            <Text style={styles.statVal}>42</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Active Customers</Text>
            <Text style={styles.statVal}>38</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Route Efficiency</Text>
            <Text style={[styles.statVal, { color: colors.emerald600 }]}>94.2%</Text>
          </View>
        </View>
      </View>

      {/* Target Meters */}
      <View style={styles.metricCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={styles.metricTitle}>Today's Collection Quota</Text>
          <Text style={styles.metricPct}>{dailyPct}% Achieved</Text>
        </View>
        <View style={styles.meterBg}>
          <View style={[styles.meterFill, { width: `${Math.min(100, dailyPct)}%` }]} />
        </View>
        <View style={styles.quotaRow}>
          <Text style={styles.quotaText}>Collected: {formatINR(dailyCollectedPaise)}</Text>
          <Text style={styles.quotaText}>Target: {formatINR(dailyTargetPaise)}</Text>
        </View>
      </View>

      <View style={styles.metricCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={styles.metricTitle}>Monthly Target Completion</Text>
          <Text style={styles.metricPct}>{monthlyPct}% Achieved</Text>
        </View>
        <View style={styles.meterBg}>
          <View style={[styles.meterFill, { width: `${Math.min(100, monthlyPct)}%`, backgroundColor: colors.emerald600 }]} />
        </View>
        <View style={styles.quotaRow}>
          <Text style={styles.quotaText}>Month Collected: {formatINR(monthlyCollectedPaise, false)}</Text>
          <Text style={styles.quotaText}>Target: {formatINR(monthlyTargetPaise, false)}</Text>
        </View>
      </View>

      {/* Route Guidelines */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Field Agent Guidelines</Text>
        <Text style={styles.infoItem}>1. Always issue a digital or SMS receipt immediately upon accepting cash.</Text>
        <Text style={styles.infoItem}>2. Synchronize before 06:00 PM daily at the branch terminal.</Text>
        <Text style={styles.infoItem}>3. Never adjust or delete previously confirmed receipts without branch manager approval.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate50, padding: 16 },
  card: { backgroundColor: colors.navy900, borderRadius: 16, padding: 18, marginBottom: 16 },
  title: { fontSize: 10, fontWeight: '700', color: colors.teal500, textTransform: 'uppercase', letterSpacing: 0.5 },
  agentName: { fontSize: 18, fontWeight: 'bold', color: colors.white, marginTop: 4 },
  agentCode: { fontSize: 11, color: colors.slate400, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.navy800 },
  statBox: { flex: 1, backgroundColor: colors.navy950, borderRadius: 10, padding: 10, alignItems: 'center' },
  statLabel: { fontSize: 9, color: colors.slate400, textTransform: 'uppercase', fontWeight: 'bold' },
  statVal: { fontSize: 16, fontWeight: '900', color: colors.white, marginTop: 4 },

  metricCard: { backgroundColor: colors.white, borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.slate200 },
  metricTitle: { fontSize: 13, fontWeight: 'bold', color: colors.slate800 },
  metricPct: { fontSize: 12, fontWeight: 'bold', color: colors.teal600 },
  meterBg: { height: 8, backgroundColor: colors.slate100, borderRadius: 4, overflow: 'hidden', marginVertical: 8 },
  meterFill: { height: 8, backgroundColor: colors.teal600, borderRadius: 4 },
  quotaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  quotaText: { fontSize: 11, color: colors.slate500, fontWeight: '500' },

  infoBox: { backgroundColor: colors.white, borderRadius: 14, padding: 16, marginTop: 4, borderWidth: 1, borderColor: colors.slate200 },
  infoTitle: { fontSize: 12, fontWeight: 'bold', color: colors.slate800, textTransform: 'uppercase', marginBottom: 8 },
  infoItem: { fontSize: 11, color: colors.slate600, lineHeight: 18, marginBottom: 4 },
});

