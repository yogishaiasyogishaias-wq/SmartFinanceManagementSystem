import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { formatINR } from '@smart-finance/shared';
import { colors } from '../../../src/theme/colors';

export default function PaymentReceiptScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const params = useLocalSearchParams<{
    customerName?: string;
    amountPaise?: string;
    method?: string;
    referenceNumber?: string;
    idempotencyKey?: string;
    isOfflineRecord?: string;
  }>();

  const customerName = params.customerName || 'Murugan Chettiar';
  const amountPaise = Number(params.amountPaise) || 10000;
  const method = (params.method || 'cash').toUpperCase();
  const idempotencyKey = params.idempotencyKey || id || 'N/A';
  const isOffline = params.isOfflineRecord === 'true';

  const receiptDate = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const handleShare = async () => {
    try {
      await Share.share({
        message: `*SMART FINANCE OFFICIAL RECEIPT*\nCustomer: ${customerName}\nAmount Paid: ${formatINR(amountPaise)}\nMode: ${method}\nDate: ${receiptDate}\nTxn ID: ${idempotencyKey.slice(0, 8)}\nStatus: ${isOffline ? 'Pending Cloud Sync' : 'Server Confirmed'}`,
      });
    } catch (e) {
      // ignore
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.receiptCard}>
        {/* Receipt Header */}
        <View style={styles.header}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>₹</Text>
          </View>
          <Text style={styles.companyName}>SMART FINANCE ENTERPRISE</Text>
          <Text style={styles.receiptSubtitle}>Official Daily Collection Receipt</Text>
          <View style={[styles.statusTag, isOffline ? styles.statusOffline : styles.statusOnline]}>
            <Text style={[styles.statusTagText, isOffline ? styles.statusOfflineText : styles.statusOnlineText]}>
              {isOffline ? 'OFFLINE RECORD (PENDING SYNC)' : 'SERVER CONFIRMED'}
            </Text>
          </View>
        </View>

        {/* Amount Display */}
        <View style={styles.amountBox}>
          <Text style={styles.amountLabel}>AMOUNT COLLECTED</Text>
          <Text style={styles.amountValue}>{formatINR(amountPaise)}</Text>
        </View>

        {/* Receipt Details */}
        <View style={styles.detailsList}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Customer Name</Text>
            <Text style={styles.rowVal}>{customerName}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Collection Date & Time</Text>
            <Text style={styles.rowVal}>{receiptDate}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Payment Mode</Text>
            <Text style={styles.rowVal}>{method}</Text>
          </View>

          {params.referenceNumber ? (
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Transaction Ref #</Text>
              <Text style={styles.rowVal}>{params.referenceNumber}</Text>
            </View>
          ) : null}

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Idempotency Key</Text>
            <Text style={[styles.rowVal, styles.monoText]}>{idempotencyKey.slice(0, 18)}...</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Field Agent</Text>
            <Text style={styles.rowVal}>Kumar Velu (AGT-001)</Text>
          </View>
        </View>

        {/* Footer Notice */}
        <Text style={styles.footerNotice}>
          This is a computer-generated digital receipt for microfinance daily collection.
          {isOffline && ' Confirmed on server once device returns to connectivity.'}
        </Text>

        {/* Actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Text style={styles.shareBtnText}>Share Digital Slip</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace('/(tabs)/dashboard')}>
            <Text style={styles.doneBtnText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.slate100, padding: 16, justifyContent: 'center' },
  receiptCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  header: { alignItems: 'center', marginBottom: 16 },
  badge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.teal600,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeText: { color: colors.white, fontSize: 24, fontWeight: 'bold' },
  companyName: { fontSize: 13, fontWeight: 'bold', color: colors.slate900, letterSpacing: 0.5 },
  receiptSubtitle: { fontSize: 11, color: colors.slate400, marginTop: 2, textTransform: 'uppercase' },
  statusTag: { marginTop: 8, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusOnline: { backgroundColor: colors.emerald100 },
  statusOffline: { backgroundColor: colors.amber100 },
  statusTagText: { fontSize: 10, fontWeight: 'bold' },
  statusOnlineText: { color: colors.emerald600 },
  statusOfflineText: { color: colors.amber600 },

  amountBox: {
    backgroundColor: colors.slate50,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  amountLabel: { fontSize: 10, fontWeight: 'bold', color: colors.slate400, letterSpacing: 1 },
  amountValue: { fontSize: 28, fontWeight: '900', color: colors.emerald600, marginTop: 4 },

  detailsList: { borderTopWidth: 1, borderTopColor: colors.slate100, paddingTop: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  rowLabel: { fontSize: 11, color: colors.slate500 },
  rowVal: { fontSize: 11, fontWeight: 'bold', color: colors.slate900 },
  monoText: { fontFamily: 'monospace', fontSize: 10 },

  footerNotice: {
    fontSize: 10,
    color: colors.slate400,
    textAlign: 'center',
    marginVertical: 16,
    lineHeight: 14,
  },

  actionRow: { flexDirection: 'row', gap: 10 },
  shareBtn: {
    flex: 1,
    backgroundColor: colors.navy800,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  shareBtnText: { color: colors.white, fontSize: 12, fontWeight: 'bold' },
  doneBtn: {
    flex: 1,
    backgroundColor: colors.teal600,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  doneBtnText: { color: colors.white, fontSize: 12, fontWeight: 'bold' },
});

