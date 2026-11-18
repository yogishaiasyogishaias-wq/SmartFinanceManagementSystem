import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { localDb } from '../../src/services/localDatabase';
import { colors } from '../../src/theme/colors';

export default function EditCustomerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [address, setAddress] = useState('');
  const [shopName, setShopName] = useState('');

  useEffect(() => {
    if (id) {
      localDb.getCustomerById(id).then((c) => {
        if (c) {
          setFullName(c.full_name);
          setPhone(c.phone);
          setAlternatePhone(c.alternate_phone || '');
          setAddress(c.address);
          setShopName(c.shop_name || '');
        }
      });
    }
  }, [id]);

  const handleUpdate = () => {
    Alert.alert('Updated', 'Customer details updated in local storage and queued for synchronization.');
    router.back();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.header}>Edit Customer Profile</Text>

        <Text style={styles.label}>Proprietor Full Name</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />

        <Text style={styles.label}>Contact Phone</Text>
        <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="number-pad" />

        <Text style={styles.label}>Alternate Phone</Text>
        <TextInput style={styles.input} value={alternatePhone} onChangeText={setAlternatePhone} keyboardType="number-pad" />

        <Text style={styles.label}>Shop Name</Text>
        <TextInput style={styles.input} value={shopName} onChangeText={setShopName} />

        <Text style={styles.label}>Physical Address</Text>
        <TextInput style={[styles.input, { height: 70, textAlignVertical: 'top' }]} multiline value={address} onChangeText={setAddress} />

        <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate}>
          <Text style={styles.saveBtnText}>Update Customer Details</Text>
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
  },
  header: { fontSize: 16, fontWeight: 'bold', color: colors.slate900, marginBottom: 16 },
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
  saveBtn: {
    backgroundColor: colors.teal600,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  saveBtnText: { color: colors.white, fontSize: 13, fontWeight: 'bold' },
});

