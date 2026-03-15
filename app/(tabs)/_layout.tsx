import { Tabs } from 'expo-router';
import React from 'react';
import { Colors } from '../../constants/Colors';
import { Icons } from '../../constants/Icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.light.primary,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.light.cardBackground,
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          height: 90,
          // paddingBottom: 8,
          // paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOME',
          tabBarIcon: ({ color }) => <Icons.Ionicons name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="prayers"
        options={{
          title: 'PRAYERS',
          tabBarIcon: ({ color }) => <Icons.Ionicons name="time" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'COMMUNITY',
          tabBarIcon: ({ color }) => <Icons.Ionicons name="people" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="donation"
        options={{
          title: 'DONATION',
          tabBarIcon: ({ color }) => <Icons.MaterialIcons name="volunteer-activism" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="qibla"
        options={{
          title: 'QIBLA',
          tabBarIcon: ({ color }) => <Icons.MaterialIcons name="mosque" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'SETTINGS',
          tabBarIcon: ({ color }) => <Icons.Ionicons name="settings" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
