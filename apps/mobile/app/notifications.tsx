import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors } from '../src/theme/colors';

interface NotificationItem {
  id: string;
  type: 'SCHEDULE' | 'OVERDUE' | 'SYNC_SUCCESS' | 'SYNC_FAILED';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 'n-1',
    type: 'SYNC_SUCCESS',
    title: 'Cloud Synchronization Completed',
    message: 'All 3 pending offline collections were acknowledged by PostgreSQL server.',
    time: '10 mins ago',
    isRead: false,
  },
  {
    id: 'n-2',
    type: 'OVERDUE',
    title: 'Overdue Collection Reminder',
    message: 'Anandhi Selvam has missed 3 installments on Flower Bazaar route. Follow-up advised.',
    time: '1 hour ago',
    isRead: false,
  },
  {
    id: 'n-3',
    type: 'SCHEDULE',
    title: 'Today Route Activated',
    message: 'Route "Central Market & Bazaar Road" loaded with 42 assigned shop visits.',
    time: '08:00 AM',
    isRead: true,
  },
  {
    id: 'n-4',
    type: 'SYNC_FAILED',
    title: 'Network Interrupted During Sync',
    message: 'Sync safely preserved in local SQLite outbox. Retrying when signal is restored.',
    time: 'Yesterday',
    isRead: true,
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SYNC_SUCCESS':
        return '☁️';
      case 'SYNC_FAILED':
        return '⚠️';
      case 'OVERDUE':
        return '🚨';
      default:
        return '📅';
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>System & Route Reminders</Text>
        <TouchableOpacity onPress={markAllRead}>
          <Text style={styles.markReadText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={[styles.card, !item.isRead && styles.unreadCard]}>
            <Text style={styles.icon}>{getIcon(item.type)}</Text>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.time}>{item.time}</Text>
              </View>
              <Text style={styles.message}>{item.message}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.slate50 },
  header: {
    backgroundColor: colors.white,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colors.slate200,
  },
  headerTitle: { fontSize: 13, fontWeight: 'bold', color: colors.slate900 },
  markReadText: { fontSize: 11, fontWeight: 'bold', color: colors.teal600 },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.slate200,
  },
  unreadCard: {
    backgroundColor: '#F0FDFA', // Light teal
    borderColor: colors.teal100,
    borderLeftWidth: 4,
    borderLeftColor: colors.teal600,
  },
  icon: { fontSize: 20 },
  title: { fontSize: 12, fontWeight: 'bold', color: colors.slate900 },
  time: { fontSize: 9, color: colors.slate400 },
  message: { fontSize: 11, color: colors.slate600, marginTop: 3, lineHeight: 16 },
});

