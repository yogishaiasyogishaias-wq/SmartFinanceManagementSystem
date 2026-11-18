import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSync } from '../src/context/SyncContext';
import { localDb, OutboxRecord } from '../src/services/localDatabase';
import { colors } from '../src/theme/colors';

export default function SyncStatusScreen() {
  const { isOnline, pendingCount, lastSyncTime, isSyncing, toggleNetwork, triggerSync } = useSync();
  const [outboxItems, setOutboxItems] = useState<OutboxRecord[]>([]);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);

  const loadOutbox = async () => {
    const items = await localDb.getAllOutbox();
    setOutboxItems(items);
  };

  useEffect(() => {
    loadOutbox();
  }, [pendingCount]);

  const handleManualSync = async () => {
    setSyncStatusMessage(null);
    const result = await triggerSync();
    if (result.errors.length > 0) {
      setSyncStatusMessage(`Sync completed with ${result.errors.length} error(s). Check error logs below.`);
    } else {
      setSyncStatusMessage(`Successfully uploaded ${result.successCount} record(s) to cloud server.`);
    }
    await loadOutbox();
  };

  return (
    <View style={styles.container}>
      {/* Top Status Card */}
      <View style={styles.card}>
        <View style={styles.statusHeader}>
          <View>
            <Text style={styles.statusTitle}>Network Connectivity</Text>
            <Text style={[styles.statusState, isOnline ? styles.textOnline : styles.textOffline]}>
              {isOnline ? 'Online • Connected to Cloud' : 'Offline Mode Active'}
            </Text>
          </View>

          <TouchableOpacity style={styles.toggleBtn} onPress={toggleNetwork}>
            <Text style={styles.toggleBtnText}>
              {isOnline ? 'Simulate Offline' : 'Simulate Online'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Pending Queue</Text>
            <Text style={[styles.statValue, pendingCount > 0 ? styles.textAlert : styles.textGood]}>
              {pendingCount}
            </Text>
            <Text style={styles.statSub}>unsynced records</Text>
          </View>

          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Last Confirmed Sync</Text>
            <Text style={styles.statValueSmall}>{lastSyncTime}</Text>
            <Text style={styles.statSub}>server acknowledged</Text>
          </View>
        </View>

        {syncStatusMessage && (
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{syncStatusMessage}</Text>
          </View>
        )}

        {/* Sync Trigger Button */}
        <TouchableOpacity
          style={[styles.syncBtn, isSyncing && { opacity: 0.6 }]}
          onPress={handleManualSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.syncBtnText}>
              {isOnline ? 'Retry & Synchronize Outbox Now' : 'Cannot Sync (Device is Offline)'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Outbox List Section */}
      <Text style={styles.sectionHeader}>Durable SQLite Outbox Records ({outboxItems.length})</Text>
      <FlatList
        data={outboxItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>✓</Text>
            <Text style={styles.emptyTitle}>All Records Synchronized</Text>
            <Text style={styles.emptySubtitle}>
              Your local SQLite database is in complete sync with the cloud PostgreSQL database.
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          let payload: any = {};
          try {
            payload = JSON.parse(item.payload_json);
          } catch (e) {}

          return (
            <View style={styles.outboxCard}>
              <View style={styles.outboxHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.outboxType}>{item.operation_type}</Text>
                  <Text style={styles.outboxEntity}>
                    {payload.customerName ? `Customer: ${payload.customerName}` : item.entity_id}
                  </Text>
                  {payload.amountPaidPaise && (
                    <Text style={styles.outboxAmount}>Amount: ₹{(payload.amountPaidPaise / 100).toFixed(2)}</Text>
                  )}
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <View style={[styles.badge, item.status === 'pending' ? styles.badgePending : styles.badgeFailed]}>
                    <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
                  </View>
                  <Text style={styles.retryText}>Retries: {item.retry_count}/5</Text>
                </View>
              </View>

              <View style={styles.outboxFooter}>
                <Text style={styles.idempotencyText}>
                  Idempotency: {item.idempotency_key.slice(0, 16)}...
                </Text>
                <Text style={styles.timestampText}>
                  {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>

              {item.last_error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>Error: {item.last_error}</Text>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate50, padding: 16 },
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 18, borderWidth: 1, borderColor: colors.slate200, marginBottom: 16, elevation: 2 },
  statusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusTitle: { fontSize: 10, fontWeight: '700', color: colors.slate400, textTransform: 'uppercase' },
  statusState: { fontSize: 15, fontWeight: 'bold', marginTop: 2 },
  textOnline: { color: colors.emerald600 },
  textOffline: { color: colors.amber600 },
  toggleBtn: { backgroundColor: colors.slate100, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  toggleBtnText: { fontSize: 10, fontWeight: 'bold', color: colors.slate700 },
  divider: { height: 1, backgroundColor: colors.slate100, marginVertical: 14 },
  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statBox: { flex: 1, backgroundColor: colors.slate50, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.slate200 },
  statLabel: { fontSize: 9, fontWeight: 'bold', color: colors.slate400, textTransform: 'uppercase' },
  statValue: { fontSize: 20, fontWeight: '900', marginTop: 2 },
  statValueSmall: { fontSize: 13, fontWeight: 'bold', color: colors.slate800, marginTop: 4 },
  textAlert: { color: colors.amber600 },
  textGood: { color: colors.emerald600 },
  statSub: { fontSize: 9, color: colors.slate400, marginTop: 2 },
  messageBox: { backgroundColor: colors.teal100, padding: 10, borderRadius: 8, marginBottom: 12 },
  messageText: { color: colors.teal600, fontSize: 11, fontWeight: '600', textAlign: 'center' },
  syncBtn: { backgroundColor: colors.teal600, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  syncBtnText: { color: colors.white, fontSize: 12, fontWeight: 'bold' },

  sectionHeader: { fontSize: 11, fontWeight: 'bold', color: colors.slate500, textTransform: 'uppercase', marginBottom: 10 },
  emptyCard: { backgroundColor: colors.white, borderRadius: 14, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: colors.slate200 },
  emptyIcon: { fontSize: 28, color: colors.emerald600, fontWeight: 'bold', marginBottom: 8 },
  emptyTitle: { fontSize: 14, fontWeight: 'bold', color: colors.slate900 },
  emptySubtitle: { fontSize: 11, color: colors.slate500, textAlign: 'center', marginTop: 4, lineHeight: 16 },

  outboxCard: { backgroundColor: colors.white, borderRadius: 12, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: colors.slate200 },
  outboxHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  outboxType: { fontSize: 10, fontWeight: 'bold', color: colors.teal600, textTransform: 'uppercase' },
  outboxEntity: { fontSize: 12, fontWeight: 'bold', color: colors.slate900, marginTop: 1 },
  outboxAmount: { fontSize: 11, fontWeight: '600', color: colors.emerald600, marginTop: 1 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  badgePending: { backgroundColor: colors.amber100 },
  badgeFailed: { backgroundColor: colors.rose100 },
  badgeText: { fontSize: 8, fontWeight: 'bold', color: colors.slate800 },
  retryText: { fontSize: 9, color: colors.slate400, marginTop: 2 },
  outboxFooter: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 6, borderTopWidth: 1, borderTopColor: colors.slate100 },
  idempotencyText: { fontSize: 9, color: colors.slate400, fontFamily: 'monospace' },
  timestampText: { fontSize: 9, color: colors.slate400 },
  errorBox: { backgroundColor: colors.rose100, padding: 6, borderRadius: 4, marginTop: 6 },
  errorText: { fontSize: 9, color: colors.rose600, fontWeight: '500' },
});

