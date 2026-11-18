import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../src/theme/colors';

function TabIcon({ name, label, focused }: { name: string; label: string; focused: boolean }) {
  return (
    <View style={styles.iconContainer}>
      <Text style={[styles.iconText, focused && styles.iconTextActive]}>{name}</Text>
      <Text style={[styles.label, focused && styles.labelActive]}>{label}</Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.navy900 },
        headerTintColor: colors.white,
        headerTitleStyle: { fontWeight: '700', fontSize: 16 },
        tabBarStyle: {
          backgroundColor: colors.navy900,
          borderTopColor: colors.navy800,
          height: 60,
          paddingBottom: 6,
          paddingTop: 6,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Agent Dashboard',
          tabBarIcon: ({ focused }) => <TabIcon name="📊" label="Overview" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: "Today's Schedule",
          tabBarIcon: ({ focused }) => <TabIcon name="📅" label="Schedule" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="customers/index"
        options={{
          title: 'Assigned Customers',
          tabBarIcon: ({ focused }) => <TabIcon name="👥" label="Customers" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Collection History',
          tabBarIcon: ({ focused }) => <TabIcon name="📜" label="History" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Agent Profile',
          tabBarIcon: ({ focused }) => <TabIcon name="👤" label="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 16,
    opacity: 0.6,
  },
  iconTextActive: {
    opacity: 1,
    transform: [{ scale: 1.15 }],
  },
  label: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.slate400,
    marginTop: 2,
  },
  labelActive: {
    color: colors.teal500,
    fontWeight: '700',
  },
});

