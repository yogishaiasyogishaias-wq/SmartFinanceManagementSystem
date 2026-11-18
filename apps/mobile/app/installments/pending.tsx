import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { formatINR } from '@smart-finance/shared';
import { colors } from '../../src/theme/colors';

interface PendingItem {
  id: string;
  customerName: string;
  shopName: string;
  planId: string;
  installmentNumber: number;
  expectedPaise: number;
  scheduledDate: string;
}

const mockPending: PendingItem[] = [
  {
    id: 'p-1',
    customerName: 'Murugan Chettiar',
    shopName: 'Murugan Veggies',
    planId: '30000000-0000-0000-0000-000000000001',
    installmentNumber: 38,
    expectedPaise: 10000,
    scheduledDate: '2026-11-07',
  },
  {
    id: 'p-2',
    customerName: 'Anandhi Selvam',
    shopName: 'Meenakshi Flower Mart',
    planId: '30000000-0000-0000-0000-000000000002',
    installmentNumber: 38,
    expectedPaise: 20000,
    scheduledDate: '2026-11-07',
  },
  {
    id: 'p-3',
    customerName: 'Selvam Arumugam',
    shopName: 'Sri Selvam Tea Stall',
    planId: '30000000-0000-0000-0000-000000000004',
    installmentNumber: 24,
    expectedPaise: 10000,
    scheduledDate: '2026-11-07',
  },
];

export default function PendingInstallmentsScreen() {
  const router = useRouter();
  const [items] = useState<PendingItem[]>(mockPending);

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.customerName}</Text>
              <Text style={styles.shop}>{item.shopName}</Text>
              <Text style={styles.meta}>Day #{item.installmentNumber} &bull; Scheduled {item.scheduledDate}</Text>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.amount}>{formatINR(item.expectedPaise)}</Text>
              <TouchableOpacity
                style={styles.collectBtn}
                onPress={() =>
                  router.push({
                    pathname: '/payments/record',
                    params: {
                      customerName: item.customerName,
                      planId: item.planId,
                      installmentId: item.id,
                      expectedPaise: item.expectedPaise.toString(),
                    },
                  })
                }
              >
                <Text style={styles.collectBtnText}>Collect &rarr;</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate50 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  name: { fontSize: 13, fontWeight: 'bold', color: colors.slate900 },
  shop: { fontSize: 11, color: colors.slate500, marginTop: 1 },
  meta: { fontSize: 10, color: colors.slate400, marginTop: 4 },
  amount: { fontSize: 15, fontWeight: 'bold', color: colors.slate900, marginBottom: 6 },
  collectBtn: { backgroundColor: colors.teal600, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  collectBtnText: { color: colors.white, fontSize: 10, fontWeight: 'bold' },
});

