import { useColorScheme } from '@/components/useColorScheme'
import { Colors } from '@/constants/Colors'
import { useAuthContext } from '@/contexts/AuthContext'
import { useRouter } from 'expo-router'
import React, { useRef, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

const SignUpScreen = () => {
  const router = useRouter()
  const colorScheme = useColorScheme()
  const colors = Colors[colorScheme ?? 'light']

  const { signUp, loading, error } = useAuthContext()
  const [Name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState('')
  const submittingRef = useRef(false)

  const formatSignUpError = (err: any) => {
    const message = (err?.message || '').toLowerCase()

    if (message.includes('rate limit') || message.includes('too many')) {
      return 'Too many sign-up requests were sent. Please wait a few minutes before trying again.'
    }

    if (message.includes('already registered') || message.includes('already exists')) {
      return 'This email is already registered. Please sign in instead.'
    }

    return err?.message || 'Failed to sign up. Please try again.'
  }

  const handleSignUp = async () => {
    if (submittingRef.current || loading) {
      return
    }

    setLocalError('')

    if (!Name.trim() || !email.trim() || !password || !confirmPassword) {
      setLocalError('Please fill in all fields')
      return
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match')
      return
    }

    submittingRef.current = true

    try {
      await signUp(email.trim().toLowerCase(), password, Name.trim())
       // HAVE TO ADD THE EXTRA LOGIC FROM CHAT-GPT.
      router.replace('/(tabs)')
    } catch (err: any) {
      setLocalError(formatSignUpError(err))
    } finally {
      submittingRef.current = false
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: colors.background },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sign up to get started
          </Text>
        </View>

        {(localError || error) && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{localError || error}</Text>
          </View>
        )}

        {/* Form Container */}
        <View style={styles.formContainer}>
          {/* Full Name Input */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.cardBackground,
                  color: colors.text,
                },
              ]}
              placeholder="Enter your full name"
              placeholderTextColor={colors.textSecondary}
              value={Name}
              onChangeText={setName}
              editable={!loading}
              autoCapitalize="words"
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: colors.text }]}>Email Address</Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.cardBackground,
                  color: colors.text,
                },
              ]}
              placeholder="Enter your email"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              editable={!loading}
              autoCapitalize="none"
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: colors.text }]}>Password</Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.cardBackground,
                  color: colors.text,
                },
              ]}
              placeholder="Enter your password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputWrapper}>
            <Text style={[styles.label, { color: colors.text }]}>Confirm Password</Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.cardBackground,
                  color: colors.text,
                },
              ]}
              placeholder="Confirm your password"
              placeholderTextColor={colors.textSecondary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.signUpButton,
              {
                backgroundColor: colors.primary,
                opacity: loading ? 0.7 : 1,
              },
            ]}
            onPress={handleSignUp}
            disabled={loading || submittingRef.current}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.signUpButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={[styles.loginText, { color: colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')}>
              <Text
                style={[
                  styles.loginLink,
                  {
                    color: colors.primary,
                  },
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default SignUpScreen

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    marginBottom: 40,
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
  formContainer: {
    gap: 20,
  },
  inputWrapper: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#ffe5e5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#b81c1c',
    fontSize: 14,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: '500',
  },
  signUpButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  signUpButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  loginText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '700',
  },
})