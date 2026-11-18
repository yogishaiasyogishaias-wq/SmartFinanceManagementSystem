import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { AuthProvider } from '../src/context/AuthContext';
import { SyncProvider, useSync } from '../src/context/SyncContext';
import { colors } from '../src/theme/colors';

const customTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.teal600,
    background: colors.slate50,
  },
};

function OfflineStatusBarBanner() {
  const router = useRouter();
  const { isOnline, pendingCount, lastSyncTime, toggleNetwork } = useSync();

  return (
    <View style={styles.statusBarContainer}>
      <View style={[styles.networkBanner, isOnline ? styles.onlineBanner : styles.offlineBanner]}>
        <View style={styles.bannerLeft}>
          <View style={[styles.statusDot, isOnline ? styles.onlineDot : styles.offlineDot]} />
          <Text style={styles.bannerText}>
            {!isOnline
              ? `Offline Mode • ${pendingCount} Pending`
              : pendingCount > 0
              ? `${pendingCount} Pending Upload`
              : `Connected • Synced ${lastSyncTime}`}
          </Text>
        </View>

        <View style={styles.bannerRight}>
          <TouchableOpacity
            onPress={toggleNetwork}
            style={styles.toggleBtn}
            accessibilityLabel="Toggle Network Simulation"
          >
            <Text style={styles.toggleBtnText}>
              {isOnline ? 'Go Offline' : 'Go Online'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/sync-status')}
            style={styles.syncBtn}
            accessibilityLabel="View Sync Manager"
          >
            <Text style={styles.syncBtnText}>Sync Status</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

export default function RootLayout() {
  return (
    <PaperProvider theme={customTheme}>
      <AuthProvider>
        <SyncProvider>
          <View style={styles.root}>
            <StatusBar barStyle="light-content" backgroundColor={colors.navy950} />
            <OfflineStatusBarBanner />
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: colors.navy900 },
                headerTintColor: colors.white,
                headerTitleStyle: { fontWeight: '700', fontSize: 16 },
                contentStyle: { backgroundColor: colors.slate50 },
              }}
            >
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="forgot-password" options={{ title: 'Reset Password' }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="customers/[id]" options={{ title: 'Customer Profile' }} />
              <Stack.Screen name="customers/add" options={{ title: 'New Customer' }} />
              <Stack.Screen name="customers/edit/[id]" options={{ title: 'Edit Customer' }} />
              <Stack.Screen name="finance-plans/index" options={{ title: 'Finance Plans' }} />
              <Stack.Screen name="finance-plans/[id]" options={{ title: 'Plan Details' }} />
              <Stack.Screen name="payments/record" options={{ title: 'Record Collection' }} />
              <Stack.Screen name="payments/receipt/[id]" options={{ title: 'Collection Receipt' }} />
              <Stack.Screen name="installments/pending" options={{ title: 'Pending Installments' }} />
              <Stack.Screen name="installments/overdue" options={{ title: 'Overdue Installments' }} />
              <Stack.Screen name="agent/performance" options={{ title: 'Agent Performance' }} />
              <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
              <Stack.Screen name="sync-status" options={{ title: 'Offline Sync Center' }} />
            </Stack>
          </View>
        </SyncProvider>
      </AuthProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.navy950 },
  statusBarContainer: { backgroundColor: colors.navy900 },
  networkBanner: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  onlineBanner: { backgroundColor: colors.navy800 },
  offlineBanner: { backgroundColor: '#7F1D1D' }, // Amber/Rose dark alert
  bannerLeft: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  onlineDot: { backgroundColor: colors.emerald500 },
  offlineDot: { backgroundColor: colors.amber600 },
  bannerText: { color: colors.white, fontSize: 11, fontWeight: '600' },
  bannerRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  toggleBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  toggleBtnText: { color: colors.white, fontSize: 10, fontWeight: '600' },
  syncBtn: {
    backgroundColor: colors.teal600,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  syncBtnText: { color: colors.white, fontSize: 10, fontWeight: '700' },
});

