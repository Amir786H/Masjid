// Example: Using Supabase in your components

import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import { useTabBarScroll } from '../../hooks/useTabBarVisibility';
import { useAuthContext } from '../../contexts/AuthContext';
import {
  fetchLikedPostIds,
  fetchPostLikeCount,
  likePost,
  subscribeToCommunityPosts,
  unlikePost,
} from '../../services/databaseService';
import { useAppStore } from '../../stores/appStore';

export default function CommunityScreen() {
  const { user } = useAuthContext();
  const [likedPostIds, setLikedPostIds] = useState<Set<string>>(new Set());
  const [pendingLikeIds, setPendingLikeIds] = useState<Set<string>>(new Set());
  const { communityPosts, loadingCommunity, loadCommunityPosts, addPost, updateCommunityPostLikes } = useAppStore();

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

  useEffect(() => {
    const loadLikedPosts = async () => {
      if (!user?.id) {
        setLikedPostIds(new Set());
        return;
      }

      try {
        const postIds = await fetchLikedPostIds(user.id);
        setLikedPostIds(new Set(postIds));
      } catch (error) {
        console.error('Failed to load liked posts', error);
      }
    };

    loadLikedPosts();
  }, [user?.id]);

  if (loadingCommunity) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  };

  const onScroll = useTabBarScroll();

  const updatePostLikeCount = (postId: string, likesCount: number) => {
    updateCommunityPostLikes(postId, likesCount);
  };

  const onHandleLike = async (postId: string) => {
    if (!user?.id) {
      Alert.alert('Sign in required', 'Please sign in to like community posts.');
      return;
    }

    if (pendingLikeIds.has(postId)) {
      return;
    }

    const isLiked = likedPostIds.has(postId);

    setPendingLikeIds((current) => new Set(current).add(postId));

    try {
      if (isLiked) {
        await unlikePost(user.id, postId);
        const likesCount = await fetchPostLikeCount(postId);
        setLikedPostIds((current) => {
          const next = new Set(current);
          next.delete(postId);
          return next;
        });
        updatePostLikeCount(postId, likesCount);
      } else {
        await likePost(user.id, postId);
        const likesCount = await fetchPostLikeCount(postId);
        setLikedPostIds((current) => new Set(current).add(postId));
        updatePostLikeCount(postId, likesCount);
      }
    } catch (error) {
      console.error('Failed to update post like', error);
      Alert.alert('Unable to update like', 'Please try again.');
    } finally {
      setPendingLikeIds((current) => {
        const next = new Set(current);
        next.delete(postId);
        return next;
      });
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={communityPosts}
        renderItem={({ item }) => {
          const isLiked = likedPostIds.has(item.id);
          const isPending = pendingLikeIds.has(item.id);

          return (
            <View style={styles.postCard}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.content}>{item.content}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <MaterialCommunityIcons onPress={() => onHandleLike(item.id)}
                  style={{ margin: 5, opacity: isPending ? 0.5 : 1 }}
                  name="thumb-up"
                  size={18}
                  color={isLiked ? '#ffffff' : 'gray'}
                />
                <Text style={styles.meta}>
                  {item.likes_count} likes • {item.comments_count} comments
                </Text>
              </View>
            </View>
          );
        }}
        keyExtractor={(item) => item.id}
        onScroll={onScroll}
        scrollEventThrottle={16}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 18,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 18,
    marginBottom: 12,
    marginVertical: 18,
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
