// Example: Using Supabase in your components

import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuthContext } from '../contexts/AuthContext';
import { useAppStore } from '../stores/appStore';
import { fetchCommunityPosts, subscribeToCommunityPosts } from '../services/databaseService';

export default function CommunityExample() {
  const { user } = useAuthContext();
  const { communityPosts, loadingCommunity, loadCommunityPosts, addPost } = useAppStore();

  useEffect(() => {
    // Load initial posts
    loadCommunityPosts();

    // Subscribe to real-time updates
    const subscription = subscribeToCommunityPosts((payload) => {
      if (payload.eventType === 'INSERT') {
        addPost(payload.new);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loadingCommunity) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={communityPosts}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.content}>{item.content}</Text>
            <Text style={styles.meta}>
              {item.likes_count} likes • {item.comments_count} comments
            </Text>
          </View>
        )}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  meta: {
    fontSize: 12,
    color: '#999',
  },
});
