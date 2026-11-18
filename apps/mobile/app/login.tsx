import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { loginSchema } from '@smart-finance/validation';
import { colors } from '../src/theme/colors';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('agent.kumar@smartfinance.com');
  const [password, setPassword] = useState('Agent@12345');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setLoading(true);
    await login(email, 'collection_agent');
    setLoading(false);
    router.replace('/(tabs)/dashboard');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoText}>₹</Text>
        </View>
        <Text style={styles.title}>Agent Collection Portal</Text>
        <Text style={styles.subtitle}>Daily Route Authentication</Text>
      </View>

      <View style={styles.card}>
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Text style={styles.label}>Employee / Agent Email</Text>
        <TextInput
          style={styles.input}
          placeholder="agent.kumar@smartfinance.com"
          placeholderTextColor={colors.slate400}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Security Password</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor={colors.slate400}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          onPress={() => router.push('/forgot-password')}
          style={styles.forgotBtn}
        >
          <Text style={styles.forgotText}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.loginBtn}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginBtnText}>{loading ? 'Verifying...' : 'Sign In to Collection Route'}</Text>
        </TouchableOpacity>

        <View style={styles.demoBox}>
          <Text style={styles.demoTitle}>Quick Fill Demo Agent:</Text>
          <TouchableOpacity
            style={styles.demoPill}
            onPress={() => {
              setEmail('agent.kumar@smartfinance.com');
              setPassword('Agent@12345');
              setError(null);
            }}
          >
            <Text style={styles.demoPillText}>Field Agent Kumar (AGT-001)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: colors.navy950,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: colors.teal600,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.white,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.white,
  },
  subtitle: {
    fontSize: 11,
    color: colors.slate400,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: colors.navy900,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.navy800,
  },
  errorBox: {
    backgroundColor: 'rgba(225, 29, 72, 0.15)',
    borderWidth: 1,
    borderColor: colors.rose600,
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorText: {
    color: colors.rose600,
    fontSize: 12,
    fontWeight: '500',
  },
  label: {
    color: colors.slate300,
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: colors.navy950,
    borderWidth: 1,
    borderColor: colors.navy700,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.white,
    fontSize: 14,
    marginBottom: 14,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotText: {
    color: colors.teal500,
    fontSize: 12,
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: colors.teal600,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  loginBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  demoBox: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.navy800,
  },
  demoTitle: {
    color: colors.slate400,
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  demoPill: {
    backgroundColor: colors.navy800,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  demoPillText: {
    color: colors.slate200,
    fontSize: 11,
    fontWeight: '500',
  },
});

