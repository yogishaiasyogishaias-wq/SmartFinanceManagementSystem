import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useSync } from '../../src/context/SyncContext';
import { colors } from '../../src/theme/colors';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, agentCode, logout } = useAuth();
  const { isOnline, pendingCount, lastSyncTime, toggleNetwork, triggerSync } = useSync();

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      pendingCount > 0
        ? `Warning: You have ${pendingCount} unsynchronized records. Make sure to sync before signing out.`
        : 'Are you sure you want to log out of the collection app?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.fullName?.slice(0, 2).toUpperCase() || 'KV'}</Text>
        </View>
        <Text style={styles.userName}>{user?.fullName || 'Kumar Velu'}</Text>
        <Text style={styles.userRole}>Field Collection Agent &bull; {agentCode}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <Text style={styles.userPhone}>Phone: {user?.phone || '9840334455'}</Text>
      </View>

      {/* Network & Offline Settings Section */}
      <Text style={styles.sectionTitle}>Offline & Storage Settings</Text>
      <View style={styles.settingsGroup}>
        <TouchableOpacity style={styles.settingItem} onPress={toggleNetwork}>
          <View>
            <Text style={styles.settingTitle}>Network Mode</Text>
            <Text style={styles.settingSubtitle}>
              {isOnline ? 'Connected to Cloud Database' : 'Offline Mode (Local SQLite)'}
            </Text>
          </View>
          <View style={[styles.statusBadge, isOnline ? styles.onlineBadge : styles.offlineBadge]}>
            <Text style={[styles.statusBadgeText, isOnline ? styles.onlineText : styles.offlineText]}>
              {isOnline ? 'ONLINE' : 'OFFLINE'}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => router.push('/sync-status')}
        >
          <View>
            <Text style={styles.settingTitle}>Synchronization Outbox</Text>
            <Text style={styles.settingSubtitle}>
              {pendingCount} records waiting &bull; Last sync: {lastSyncTime}
            </Text>
          </View>
          <Text style={styles.arrowText}>Manage &rarr;</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={() => triggerSync()}>
          <View>
            <Text style={styles.settingTitle}>Force Full Sync Now</Text>
            <Text style={styles.settingSubtitle}>Upload pending receipts and refresh plans</Text>
          </View>
          <Text style={[styles.arrowText, { color: colors.teal600 }]}>Sync</Text>
        </TouchableOpacity>
      </View>

      {/* Application Info */}
      <Text style={styles.sectionTitle}>Application Information</Text>
      <View style={styles.settingsGroup}>
        <View style={styles.settingItemStatic}>
          <Text style={styles.settingTitle}>Version</Text>
          <Text style={styles.settingValue}>1.0.0 (Production)</Text>
        </View>
        <View style={styles.settingItemStatic}>
          <Text style={styles.settingTitle}>Currency Engine</Text>
          <Text style={styles.settingValue}>Integer Paise (INR 100x)</Text>
        </View>
        <View style={styles.settingItemStatic}>
          <Text style={styles.settingTitle}>Local Database</Text>
          <Text style={styles.settingValue}>SQLite Durable Storage</Text>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutBtnText}>Sign Out from Device</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate50, padding: 16 },
  profileCard: {
    backgroundColor: colors.navy900,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.teal600,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarText: { fontSize: 22, fontWeight: 'bold', color: colors.white },
  userName: { fontSize: 18, fontWeight: 'bold', color: colors.white },
  userRole: { fontSize: 11, color: colors.teal500, marginTop: 2, fontWeight: '600' },
  userEmail: { fontSize: 11, color: colors.slate400, marginTop: 4 },
  userPhone: { fontSize: 11, color: colors.slate400, marginTop: 2 },

  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: colors.slate500, textTransform: 'uppercase', marginBottom: 8, marginTop: 4 },
  settingsGroup: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.slate200,
    marginBottom: 16,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate100,
  },
  settingItemStatic: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.slate100,
  },
  settingTitle: { fontSize: 12, fontWeight: 'bold', color: colors.slate900 },
  settingSubtitle: { fontSize: 10, color: colors.slate500, marginTop: 2 },
  settingValue: { fontSize: 11, color: colors.slate600, fontWeight: '500' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  onlineBadge: { backgroundColor: colors.emerald100 },
  offlineBadge: { backgroundColor: colors.amber100 },
  statusBadgeText: { fontSize: 9, fontWeight: '900' },
  onlineText: { color: colors.emerald600 },
  offlineText: { color: colors.amber600 },
  arrowText: { fontSize: 11, fontWeight: 'bold', color: colors.slate400 },

  logoutBtn: {
    backgroundColor: '#FFE4E6',
    borderWidth: 1,
    borderColor: '#FECDD3',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 16,
    marginBottom: 32,
  },
  logoutBtnText: { color: colors.rose600, fontSize: 13, fontWeight: 'bold' },
});

