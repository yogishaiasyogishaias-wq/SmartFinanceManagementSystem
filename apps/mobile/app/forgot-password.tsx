import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../src/theme/colors';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleReset = () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid staff email address.');
      return;
    }
    setSent(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Password Recovery</Text>
        <Text style={styles.info}>
          Enter your registered field agent email. Your branch administrator will verify and reset your credentials.
        </Text>

        {sent ? (
          <View style={styles.successBox}>
            <Text style={styles.successTitle}>Request Submitted</Text>
            <Text style={styles.successText}>
              A reset request has been logged with Operations Support for {email}. Please contact your Central Office Supervisor.
            </Text>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Text style={styles.backBtnText}>Return to Login</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="agent@smartfinance.com"
              placeholderTextColor={colors.slate400}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.submitBtn} onPress={handleReset}>
              <Text style={styles.submitBtnText}>Request Admin Reset</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.slate50,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: colors.white,
    padding: 24,
    borderRadius: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.slate900,
    marginBottom: 8,
  },
  info: {
    fontSize: 12,
    color: colors.slate600,
    lineHeight: 18,
    marginBottom: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: 'bold',
    color: colors.slate700,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.slate100,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.slate900,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.slate300,
  },
  submitBtn: {
    backgroundColor: colors.teal600,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
  successBox: {
    backgroundColor: colors.emerald100,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  successTitle: {
    color: colors.emerald600,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  successText: {
    color: colors.slate700,
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 14,
  },
  backBtn: {
    backgroundColor: colors.emerald600,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

