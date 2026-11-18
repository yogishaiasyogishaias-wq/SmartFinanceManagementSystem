import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { useSync } from '../../src/context/SyncContext';
import { localDb } from '../../src/services/localDatabase';
import { paymentRecordSchema } from '@smart-finance/validation';
import { formatINR, rupeesToPaise, paiseToRupees } from '@smart-finance/shared';
import { colors } from '../../src/theme/colors';

export default function RecordPaymentScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { isOnline } = useSync();

  const params = useLocalSearchParams<{
    customerId?: string;
    customerName?: string;
    planId?: string;
    installmentId?: string;
    expectedPaise?: string;
  }>();

  const [customerName] = useState(params.customerName || 'Murugan Chettiar');
  const [customerId] = useState(params.customerId || '20000000-0000-0000-0000-000000000001');
  const [planId] = useState(params.planId || '30000000-0000-0000-0000-000000000001');
  const [installmentId] = useState(params.installmentId || 'inst-101');
  const [expectedPaise] = useState(Number(params.expectedPaise) || 10000);

  const [amountRupees, setAmountRupees] = useState((expectedPaise / 100).toString());
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'upi' | 'bank_transfer'>('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRecord = async () => {
    setError(null);
    const amountNum = parseFloat(amountRupees);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid positive payment amount');
      return;
    }

    const paidPaise = rupeesToPaise(amountNum);
    const idempotencyKey = crypto.randomUUID();
    const paymentId = crypto.randomUUID();
    const scheduledDate = '2026-11-07';

    const validation = paymentRecordSchema.safeParse({
      financePlanId: planId,
      customerId,
      agentId: user?.id || '00000000-0000-0000-0000-000000000003',
      installmentId,
      scheduledDate,
      expectedAmountPaise: expectedPaise,
      amountPaidPaise: paidPaise,
      paymentMethod,
      referenceNumber: referenceNumber || null,
      idempotencyKey,
      notes: notes || null,
    });

    if (!validation.success) {
      setError(validation.error.issues[0].message);
      return;
    }

    setIsSubmitting(true);

    // Save to durable SQLite outbox
    await localDb.enqueueOutbox(
      'CREATE_PAYMENT',
      paymentId,
      {
        id: paymentId,
        financePlanId: planId,
        customerId,
        customerName,
        agentId: user?.id,
        installmentId,
        scheduledDate,
        expectedAmountPaise: expectedPaise,
        amountPaidPaise: paidPaise,
        paymentMethod,
        referenceNumber,
        idempotencyKey,
        notes,
        recordedAt: new Date().toISOString(),
      },
      idempotencyKey
    );

    setIsSubmitting(false);

    // Navigate directly to Receipt screen
    router.replace({
      pathname: `/payments/receipt/${paymentId}`,
      params: {
        customerName,
        amountPaise: paidPaise.toString(),
        method: paymentMethod,
        referenceNumber,
        idempotencyKey,
        isOfflineRecord: (!isOnline).toString(),
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <Text style={styles.title}>Record Daily Collection</Text>
          <Text style={styles.customer}>{customerName}</Text>
          <Text style={styles.scheduledInfo}>
            Scheduled Expected: <Text style={{ fontWeight: 'bold' }}>{formatINR(expectedPaise)}</Text>
          </Text>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Amount Input */}
        <Text style={styles.label}>Collected Amount (₹) *</Text>
        <TextInput
          style={styles.amountInput}
          value={amountRupees}
          onChangeText={setAmountRupees}
          keyboardType="numeric"
          placeholder="0.00"
          placeholderTextColor={colors.slate400}
        />

        {/* Quick Amount Pills */}
        <View style={styles.quickPillRow}>
          <TouchableOpacity
            style={styles.quickPill}
            onPress={() => setAmountRupees((expectedPaise / 100).toString())}
          >
            <Text style={styles.quickPillText}>Full: {formatINR(expectedPaise)}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickPill}
            onPress={() => setAmountRupees((expectedPaise / 200).toString())}
          >
            <Text style={styles.quickPillText}>50% Partial</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickPill}
            onPress={() => setAmountRupees(((expectedPaise * 2) / 100).toString())}
          >
            <Text style={styles.quickPillText}>Double (Advance)</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Method Selector */}
        <Text style={styles.label}>Payment Method *</Text>
        <View style={styles.methodRow}>
          <TouchableOpacity
            style={[styles.methodBtn, paymentMethod === 'cash' && styles.methodBtnActive]}
            onPress={() => setPaymentMethod('cash')}
          >
            <Text style={styles.methodIcon}>💵</Text>
            <Text style={[styles.methodText, paymentMethod === 'cash' && styles.methodTextActive]}>Cash</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.methodBtn, paymentMethod === 'upi' && styles.methodBtnActive]}
            onPress={() => setPaymentMethod('upi')}
          >
            <Text style={styles.methodIcon}>📱</Text>
            <Text style={[styles.methodText, paymentMethod === 'upi' && styles.methodTextActive]}>UPI</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.methodBtn, paymentMethod === 'bank_transfer' && styles.methodBtnActive]}
            onPress={() => setPaymentMethod('bank_transfer')}
          >
            <Text style={styles.methodIcon}>🏦</Text>
            <Text style={[styles.methodText, paymentMethod === 'bank_transfer' && styles.methodTextActive]}>Bank</Text>
          </TouchableOpacity>
        </View>

        {paymentMethod !== 'cash' && (
          <>
            <Text style={styles.label}>Transaction Reference / UTR Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. UPI-98371982 or Cheque #"
              placeholderTextColor={colors.slate400}
              value={referenceNumber}
              onChangeText={setReferenceNumber}
            />
          </>
        )}

        <Text style={styles.label}>Collection Notes</Text>
        <TextInput
          style={styles.input}
          placeholder="Optional remarks (e.g. paid at shop counter)"
          placeholderTextColor={colors.slate400}
          value={notes}
          onChangeText={setNotes}
        />

        {/* Offline Disclaimer Banner */}
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerText}>
            🔒 Protected by UUIDv4 Idempotency. Recorded locally to SQLite and will sync seamlessly when connection is available.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleRecord}
          disabled={isSubmitting}
        >
          <Text style={styles.submitBtnText}>
            {isSubmitting ? 'Recording...' : `Confirm & Issue Receipt (${formatINR(rupeesToPaise(parseFloat(amountRupees) || 0))})`}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: colors.slate50, padding: 16 },
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: colors.slate200, elevation: 2 },
  header: { marginBottom: 16, borderBottomWidth: 1, borderBottomColor: colors.slate100, pb: 12 },
  title: { fontSize: 13, fontWeight: '700', color: colors.teal600, textTransform: 'uppercase' },
  customer: { fontSize: 18, fontWeight: 'bold', color: colors.slate900, marginTop: 4 },
  scheduledInfo: { fontSize: 12, color: colors.slate500, marginTop: 4, marginBottom: 12 },
  errorBox: { backgroundColor: 'rgba(225, 29, 72, 0.1)', borderWidth: 1, borderColor: colors.rose600, padding: 10, borderRadius: 8, marginBottom: 12 },
  errorText: { color: colors.rose600, fontSize: 11, fontWeight: '500' },
  label: { fontSize: 11, fontWeight: 'bold', color: colors.slate700, textTransform: 'uppercase', marginBottom: 6 },
  amountInput: {
    backgroundColor: colors.slate100,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 24,
    fontWeight: '900',
    color: colors.slate900,
    borderWidth: 1,
    borderColor: colors.slate300,
    marginBottom: 8,
  },
  quickPillRow: { flexDirection: 'row', gap: 6, marginBottom: 16 },
  quickPill: { backgroundColor: colors.slate100, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  quickPillText: { fontSize: 10, fontWeight: 'bold', color: colors.slate600 },
  methodRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  methodBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: colors.slate100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  methodBtnActive: { backgroundColor: colors.teal100, borderColor: colors.teal600 },
  methodIcon: { fontSize: 18, marginBottom: 2 },
  methodText: { fontSize: 11, fontWeight: '600', color: colors.slate600 },
  methodTextActive: { color: colors.teal600, fontWeight: 'bold' },
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
  disclaimerBox: { backgroundColor: colors.slate50, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.slate200, marginBottom: 16 },
  disclaimerText: { fontSize: 10, color: colors.slate500, lineHeight: 14 },
  submitBtn: { backgroundColor: colors.teal600, paddingVertical: 14, borderRadius: 10, alignItems: 'center' },
  submitBtnText: { color: colors.white, fontSize: 13, fontWeight: 'bold' },
});

