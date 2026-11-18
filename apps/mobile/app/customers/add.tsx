import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { localDb } from '../../src/services/localDatabase';
import { customerSchema } from '@smart-finance/validation';
import { colors } from '../../src/theme/colors';

export default function AddCustomerScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [address, setAddress] = useState('');
  const [shopName, setShopName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    const parsed = customerSchema.safeParse({
      fullName,
      phone,
      alternatePhone: alternatePhone || null,
      address,
      shopName: shopName || null,
      isActive: true,
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    const customerId = crypto.randomUUID();
    const customerCode = `CUST-LOCAL-${Math.floor(1000 + Math.random() * 9000)}`;

    // Save to local SQLite
    await localDb.enqueueOutbox(
      'CREATE_CUSTOMER',
      customerId,
      {
        id: customerId,
        customerCode,
        fullName,
        phone,
        alternatePhone: alternatePhone || null,
        address,
        shopName: shopName || null,
      },
      crypto.randomUUID()
    );

    Alert.alert(
      'Customer Saved',
      `Customer "${fullName}" has been saved to local offline database and queued for synchronization.`,
      [{ text: 'OK', onPress: () => router.replace('/(tabs)/customers') }]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>New Retail Customer Lead</Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Text style={styles.label}>Proprietor Full Name *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Ramesh Kumar"
          placeholderTextColor={colors.slate400}
          value={fullName}
          onChangeText={setFullName}
        />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>10-Digit Mobile *</Text>
            <TextInput
              style={styles.input}
              placeholder="9876543210"
              placeholderTextColor={colors.slate400}
              keyboardType="number-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.label}>Alternate Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="Optional"
              placeholderTextColor={colors.slate400}
              keyboardType="number-pad"
              maxLength={10}
              value={alternatePhone}
              onChangeText={setAlternatePhone}
            />
          </View>
        </View>

        <Text style={styles.label}>Shop / Business Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Kumar Provision Store"
          placeholderTextColor={colors.slate400}
          value={shopName}
          onChangeText={setShopName}
        />

        <Text style={styles.label}>Physical Address *</Text>
        <TextInput
          style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
          placeholder="Street address, market stall #, landmark"
          placeholderTextColor={colors.slate400}
          multiline
          value={address}
          onChangeText={setAddress}
        />

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>Save to Offline Database</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.slate50, padding: 16 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.slate200,
    elevation: 1,
  },
  header: { fontSize: 16, fontWeight: 'bold', color: colors.slate900, marginBottom: 16 },
  errorBox: {
    backgroundColor: 'rgba(225, 29, 72, 0.15)',
    borderWidth: 1,
    borderColor: colors.rose600,
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: { color: colors.rose600, fontSize: 11, fontWeight: '500' },
  label: { fontSize: 11, fontWeight: 'bold', color: colors.slate700, marginBottom: 4, textTransform: 'uppercase' },
  input: {
    backgroundColor: colors.slate100,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: colors.slate900,
    borderWidth: 1,
    borderColor: colors.slate200,
    marginBottom: 14,
  },
  row: { flexDirection: 'row' },
  saveBtn: {
    backgroundColor: colors.teal600,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  saveBtnText: { color: colors.white, fontSize: 13, fontWeight: 'bold' },
});

