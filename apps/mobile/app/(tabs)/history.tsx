import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { formatINR } from '@smart-finance/shared';
import { colors } from '../../src/theme/colors';

interface HistoryItem {
  id: string;
  customerName: string;
  amountPaise: number;
  method: 'cash' | 'upi' | 'bank_transfer';
  dateStr: string;
  timeStr: string;
  reference?: string;
  status: 'synced' | 'pending';
}

const mockHistory: HistoryItem[] = [
  {
    id: 'pay-001',
    customerName: 'Anandhi Selvam',
    amountPaise: 20000,
    method: 'upi',
    dateStr: '07 Nov 2026',
    timeStr: '11:00 AM',
    reference: 'UPI-98371982',
    status: 'synced',
  },
  {
    id: 'pay-002',
    customerName: 'Murugan Chettiar',
    amountPaise: 10000,
    method: 'cash',
    dateStr: '07 Nov 2026',
    timeStr: '10:15 AM',
    status: 'synced',
  },
  {
    id: 'pay-003',
    customerName: 'Selvam Arumugam',
    amountPaise: 10000,
    method: 'cash',
    dateStr: '06 Nov 2026',
    timeStr: '04:30 PM',
    status: 'synced',
  },
  {
    id: 'pay-004',
    customerName: 'Murugan Chettiar',
    amountPaise: 10000,
    method: 'cash',
    dateStr: '06 Nov 2026',
    timeStr: '09:45 AM',
    status: 'synced',
  },
];

export default function CollectionHistoryScreen() {
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>(mockHistory);
  const [filter, setFilter] = useState<'all' | 'cash' | 'upi'>('all');

  const filtered = history.filter((h) => filter === 'all' || h.method === filter);
  const totalPaise = filtered.reduce((acc, h) => acc + h.amountPaise, 0);

  return (
    <View style={styles.container}>
      {/* Header Stat & Filter */}
      <View style={styles.headerBox}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <View>
            <Text style={styles.headerLabel}>Personal Collection Total</Text>
            <Text style={styles.headerTotal}>{formatINR(totalPaise)}</Text>
          </View>
          <Text style={styles.itemCount}>{filtered.length} collections recorded</Text>
        </View>

        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tab, filter === 'all' && styles.tabActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.tabText, filter === 'all' && styles.tabTextActive]}>All Modes</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, filter === 'cash' && styles.tabActive]}
            onPress={() => setFilter('cash')}
          >
            <Text style={[styles.tabText, filter === 'cash' && styles.tabTextActive]}>Cash Only</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, filter === 'upi' && styles.tabActive]}
            onPress={() => setFilter('upi')}
          >
            <Text style={[styles.tabText, filter === 'upi' && styles.tabTextActive]}>UPI Only</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: `/payments/receipt/${item.id}`,
                params: {
                  customerName: item.customerName,
                  amountPaise: item.amountPaise.toString(),
                  method: item.method,
                  referenceNumber: item.reference,
                  isOfflineRecord: (item.status === 'pending').toString(),
                },
              })
            }
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.customerName}</Text>
              <Text style={styles.timeText}>{item.dateStr} &bull; {item.timeStr}</Text>
              <Text style={styles.methodPill}>{item.method.toUpperCase()} {item.reference ? `(${item.reference})` : ''}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.amount}>+{formatINR(item.amountPaise)}</Text>
              <Text style={item.status === 'synced' ? styles.statusSynced : styles.statusPending}>
                {item.status.toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate50 },
  headerBox: { backgroundColor: colors.white, padding: 16, borderBottomWidth: 1, borderBottomColor: colors.slate200 },
  headerLabel: { fontSize: 10, fontWeight: '700', color: colors.slate400, textTransform: 'uppercase' },
  headerTotal: { fontSize: 22, fontWeight: '900', color: colors.emerald600, marginTop: 2 },
  itemCount: { fontSize: 11, color: colors.slate500, fontWeight: '500' },
  tabRow: { flexDirection: 'row', gap: 8 },
  tab: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 6, backgroundColor: colors.slate100 },
  tabActive: { backgroundColor: colors.teal600 },
  tabText: { fontSize: 11, fontWeight: '600', color: colors.slate600 },
  tabTextActive: { color: colors.white },

  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.slate200,
    elevation: 1,
  },
  name: { fontSize: 13, fontWeight: 'bold', color: colors.slate900 },
  timeText: { fontSize: 10, color: colors.slate400, marginTop: 2 },
  methodPill: { fontSize: 9, fontWeight: 'bold', color: colors.slate600, marginTop: 4 },
  amount: { fontSize: 15, fontWeight: '900', color: colors.emerald600 },
  statusSynced: { fontSize: 9, fontWeight: 'bold', color: colors.emerald600, marginTop: 4 },
  statusPending: { fontSize: 9, fontWeight: 'bold', color: colors.amber600, marginTop: 4 },
});

