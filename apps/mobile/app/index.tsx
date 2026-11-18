import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { localDb } from '../src/services/localDatabase';
import { colors } from '../src/theme/colors';

export default function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    async function boot() {
      await localDb.initDatabase();
      setTimeout(() => {
        if (isAuthenticated) {
          router.replace('/(tabs)/dashboard');
        } else {
          router.replace('/login');
        }
      }, 700);
    }
    boot();
  }, [isAuthenticated, router]);

  return (
    <View style={styles.container}>
      <View style={styles.logoBadge}>
        <Text style={styles.logoText}>₹</Text>
      </View>
      <Text style={styles.title}>Smart Finance</Text>
      <Text style={styles.subtitle}>Daily Collection Mobile Agent</Text>
      <ActivityIndicator size="small" color={colors.teal500} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navy950,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  logoBadge: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.teal600,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '900',
    color: colors.white,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    color: colors.slate400,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  loader: {
    marginTop: 32,
  },
});

