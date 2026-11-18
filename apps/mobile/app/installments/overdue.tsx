import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { formatINR } from '@smart-finance/shared';
import { colors } from '../../src/theme/colors';

interface OverdueItem {
  id: string;
  customerName: string;
  phone: string;
  shopName: string;
  planId: string;
  installmentNumber: number;
  expectedPaise: number;
  paidPaise: number;
  daysOverdue: number;
  dueDate: string;
}

const mockOverdue: OverdueItem[] = [
  {
    id: 'ov-1',
    customerName: 'Anandhi Selvam',
    phone: '9876500002',
    shopName: 'Meenakshi Flower Mart',
    planId: '30000000-0000-0000-0000-000000000002',
    installmentNumber: 35,
    expectedPaise: 20000,
    paidPaise: 0,
    daysOverdue: 3,
    dueDate: '2026-11-04',
  },
  {
    id: 'ov-2',
    customerName: 'Murugan Chettiar',
    phone: '9876500001',
    shopName: 'Murugan Veggies',
    planId: '30000000-0000-0000-0000-000000000001',
    installmentNumber: 36,
    expectedPaise: 10000,
    paidPaise: 5000,
    daysOverdue: 2,
    dueDate: '2026-11-05',
  },
  {
    id: 'ov-3',
    customerName: 'Murugan Chettiar',
    phone: '9876500001',
    shopName: 'Murugan Veggies',
    planId: '30000000-0000-0000-0000-000000000001',
    installmentNumber: 37,
    expectedPaise: 10000,
    paidPaise: 0,
    daysOverdue: 1,
    dueDate: '2026-11-06',
  },
];

export default function OverdueInstallmentsScreen() {
  const router = useRouter();
  const [items] = useState<OverdueItem[]>(mockOverdue);

  const totalOverduePaise = items.reduce(
    (sum, i) => sum + (i.expectedPaise - i.paidPaise),
    0
  );

  return (
    <View style={styles.container}>
      {/* Alert Header */}
      <View style={styles.alertBox}>
        <View style={{ flex: 1 }}>
          <Text style={styles.alertTitle}>Total Overdue Exposure</Text>
          <Text style={styles.alertAmount}>{formatINR(totalOverduePaise)}</Text>
        </View>
        <Text style={styles.alertCount}>{items.length} Missed Installments</Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => {
          const balancePaise = item.expectedPaise - item.paidPaise;
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.customerName}</Text>
                  <Text style={styles.shop}>{item.shopName}</Text>
                  <Text style={styles.dateText}>Due Date: {item.dueDate} (Day #{item.installmentNumber})</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={styles.overdueBadge}>
                    <Text style={styles.overdueBadgeText}>{item.daysOverdue} DAYS OVERDUE</Text>
                  </View>
                  <Text style={styles.balanceAmount}>{formatINR(balancePaise)}</Text>
                  {item.paidPaise > 0 && (
                    <Text style={styles.partialNote}>Partial: {formatINR(item.paidPaise)} paid</Text>
                  )}
                </View>
              </View>

              <View style={styles.cardFooter}>
                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => Linking.openURL(`tel:${item.phone}`)}
                >
                  <Text style={styles.callBtnText}>📞 Call {item.phone}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.collectBtn}
                  onPress={() =>
                    router.push({
                      pathname: '/payments/record',
                      params: {
                        customerName: item.customerName,
                        planId: item.planId,
                        installmentId: item.id,
                        expectedPaise: balancePaise.toString(),
                      },
                    })
                  }
                >
                  <Text style={styles.collectBtnText}>Collect Overdue &rarr;</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate50 },
  alertBox: {
    backgroundColor: '#FFF1F2',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.rose100,
  },
  alertTitle: { fontSize: 10, fontWeight: '700', color: colors.rose600, textTransform: 'uppercase' },
  alertAmount: { fontSize: 22, fontWeight: '900', color: colors.rose600, marginTop: 2 },
  alertCount: { fontSize: 11, fontWeight: 'bold', color: colors.rose600 },

  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.rose600,
    borderWidth: 1,
    borderColor: colors.slate200,
    elevation: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  name: { fontSize: 14, fontWeight: 'bold', color: colors.slate900 },
  shop: { fontSize: 11, color: colors.slate600, marginTop: 1 },
  dateText: { fontSize: 10, color: colors.slate400, marginTop: 4 },
  overdueBadge: { backgroundColor: colors.rose100, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginBottom: 4 },
  overdueBadgeText: { fontSize: 9, fontWeight: '900', color: colors.rose600 },
  balanceAmount: { fontSize: 15, fontWeight: 'bold', color: colors.rose600 },
  partialNote: { fontSize: 9, color: colors.slate400, marginTop: 2 },

  cardFooter: { flexDirection: 'row', gap: 8, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.slate100 },
  callBtn: { flex: 1, backgroundColor: colors.slate100, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  callBtnText: { color: colors.slate700, fontSize: 11, fontWeight: 'bold' },
  collectBtn: { flex: 1, backgroundColor: colors.teal600, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  collectBtnText: { color: colors.white, fontSize: 11, fontWeight: 'bold' },
});

