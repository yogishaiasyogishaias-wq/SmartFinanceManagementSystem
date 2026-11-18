import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { localDb, CachedCustomer } from '../../src/services/localDatabase';
import { colors } from '../../src/theme/colors';

export default function CustomersScreen() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CachedCustomer[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    localDb.getCustomers().then(setCustomers);
  }, []);

  const filtered = customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(search.toLowerCase()) ||
      c.customer_code.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      (c.shop_name && c.shop_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Search by name, phone, code or shop..."
          placeholderTextColor={colors.slate400}
          value={search}
          onChangeText={setSearch}
        />
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push('/customers/add')}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.customerCard}
            onPress={() => router.push(`/customers/${item.id}`)}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.full_name.slice(0, 1)}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.name}>{item.full_name}</Text>
                <Text style={styles.code}>{item.customer_code}</Text>
              </View>
              <Text style={styles.shop}>{item.shop_name || 'Retail Business'}</Text>
              <Text style={styles.phone}>📞 {item.phone}</Text>
              <Text style={styles.address} numberOfLines={1}>{item.address}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate50 },
  searchBar: {
    backgroundColor: colors.white,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate200,
  },
  input: {
    flex: 1,
    backgroundColor: colors.slate100,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: colors.slate900,
  },
  addBtn: {
    backgroundColor: colors.teal600,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: { color: colors.white, fontSize: 12, fontWeight: 'bold' },
  customerCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.slate200,
    elevation: 1,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.navy100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: colors.navy900 },
  name: { fontSize: 13, fontWeight: 'bold', color: colors.slate900 },
  code: { fontSize: 10, fontWeight: 'bold', color: colors.teal600, fontFamily: 'monospace' },
  shop: { fontSize: 11, color: colors.slate600, marginTop: 1 },
  phone: { fontSize: 11, color: colors.slate700, marginTop: 2 },
  address: { fontSize: 10, color: colors.slate400, marginTop: 2 },
});

