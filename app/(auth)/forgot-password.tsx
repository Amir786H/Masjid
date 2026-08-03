import { useColorScheme } from '@/components/useColorScheme';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { useAuthContext } from '../../contexts/AuthContext';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { resetPassword, loading, error } = useAuthContext();
  const [email, setEmail] = useState('');
  const [localError, setLocalError] = useState('');
  const [sent, setSent] = useState(false);

  const handleResetPassword = async () => {
    setLocalError('');

    if (!email.trim()) {
      setLocalError('Please enter your email');
      return;
    }

    try {
      await resetPassword(email);
      setSent(true);
      Alert.alert(
        'Check Your Email',
        'We sent a password reset link to your email address.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/(auth)/sign-in'),
          },
        ]
      );
    } catch (err: any) {
      setLocalError(err.message || 'Failed to send reset email');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.keyboardView, { backgroundColor: colors.background }]}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Reset Password</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Enter your email to receive a reset link</Text>
          </View>

          {(localError || error) && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{localError || error}</Text>
            </View>
          )}

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <TextInput
                style={[styles.input, { borderColor: colors.border, backgroundColor: colors.cardBackground, color: colors.text }]}
                placeholder="Enter your email"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }, loading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Send Reset Link</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
              <Text style={[styles.backLink, { color: colors.primary }]}>Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  formContainer: {
    gap: 18,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '500',
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  backLink: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 12,
  },
});
