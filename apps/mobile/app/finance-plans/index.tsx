import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { localDb, CachedPlan } from '../../src/services/localDatabase';
import { formatINR } from '@smart-finance/shared';
import { colors } from '../../src/theme/colors';

export default function FinancePlansListScreen() {
  const router = useRouter();
  const [plans, setPlans] = useState<CachedPlan[]>([]);

  useEffect(() => {
    localDb.getPlans().then(setPlans);
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={plans}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/finance-plans/${item.id}`)}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={styles.planTitle}>Daily Collection Plan</Text>
              <Text style={styles.badge}>{item.status.toUpperCase()}</Text>
            </View>

            <View style={styles.grid}>
              <View>
                <Text style={styles.label}>Principal</Text>
                <Text style={styles.val}>{formatINR(item.principal_amount_paise, false)}</Text>
              </View>
              <View>
                <Text style={styles.label}>Daily Collection</Text>
                <Text style={[styles.val, { color: colors.teal600 }]}>{formatINR(item.daily_collection_amount_paise, false)}</Text>
              </View>
              <View>
                <Text style={styles.label}>Total Expected</Text>
                <Text style={[styles.val, { color: colors.emerald600 }]}>{formatINR(item.total_collection_amount_paise, false)}</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                {item.duration_days} Days &bull; {item.start_date} to {item.end_date}
              </Text>
              <Text style={styles.arrowText}>View Schedule &rarr;</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate50 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.slate200,
    elevation: 1,
  },
  planTitle: { fontSize: 13, fontWeight: 'bold', color: colors.slate900 },
  badge: { fontSize: 9, fontWeight: 'bold', backgroundColor: colors.emerald100, color: colors.emerald600, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  label: { fontSize: 10, color: colors.slate400, textTransform: 'uppercase' },
  val: { fontSize: 14, fontWeight: 'bold', color: colors.slate900, marginTop: 2 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: colors.slate100 },
  footerText: { fontSize: 10, color: colors.slate500 },
  arrowText: { fontSize: 10, color: colors.teal600, fontWeight: 'bold' },
});

