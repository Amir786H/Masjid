// Example: User Profile Integration with Supabase

import { Colors } from '@/constants/Colors';
import { supabase } from '@/services/supabaseClient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuthContext } from '../../contexts/AuthContext';
import { useTabBarScroll } from '../../hooks/useTabBarVisibility';
import { updateUserProfile } from '../../services/databaseService';
import { useAppStore } from '../../stores/appStore';

export default function ProfileScreen() {
    const { user } = useAuthContext();
    const { user: profile, loadUserProfile } = useAppStore();
    const [fullName, setFullName] = useState('');
    const [location, setLocation] = useState('');
    const [loading, setLoading] = useState(false);
    const [signOutLoading, setSignOutLoading] = useState(false);
    const router = useRouter();
    const onScroll = useTabBarScroll();

    useEffect(() => {
        if (user) {
            loadUserProfile(user.id);
        }
    }, [user]);

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setLocation(profile.location || '');
        }
    }, [profile]);

    const handleSignOut = async () => {
        setSignOutLoading(true);

        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                throw error;
            }

            router.replace('/(auth)/sign-in');
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async () => {
        if (!user) return;

        setLoading(true);
        try {
            await updateUserProfile(user.id, {
                full_name: fullName,
                location: location,
            });
            // Reload profile
            await loadUserProfile(user.id);
            alert('Profile updated successfully!');
        } catch (err) {
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (!profile) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} onScroll={onScroll} scrollEventThrottle={16}>
            <View style={styles.header}>
                {profile.avatar_url ? (
                    <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                            {fullName.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                )}
                <Text style={styles.email}>{profile.email}</Text>
            </View>

            <View style={styles.form}>
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={styles.input}
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Enter your full name"
                        editable={!loading}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Location</Text>
                    <TextInput
                        style={styles.input}
                        value={location}
                        onChangeText={setLocation}
                        placeholder="Enter your location"
                        editable={!loading}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleUpdateProfile}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Update Profile</Text>
                    )}
                </TouchableOpacity>

                {user && profile?.id === user.id && profile.is_admin ? (
                    <TouchableOpacity
                        style={[styles.button, loading && styles.buttonDisabled]}
                        onPress={() => router.push('../admin')}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>Open Admin Dashboard</Text>
                    </TouchableOpacity>
                ) : null}

                {/* SIGN-OUT */}
                <TouchableOpacity
                    style={[styles.button, signOutLoading && styles.buttonDisabled]}
                    onPress={handleSignOut}
                    disabled={signOutLoading}
                >
                    {signOutLoading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <Text style={styles.buttonText}>Sign Out</Text>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        margin: 10,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        paddingVertical: 45,
        backgroundColor: '#fff',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 14,
    },
    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.light.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 14,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: 'white',
    },
    email: {
        fontSize: 14,
        color: '#666',
    },
    form: {
        padding: 20,
        gap: 16,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    button: {
        // marginTop: 20,
        backgroundColor: Colors.light.primary,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
});
