import { router } from 'expo-router';
import { useState } from 'react';

import { useAppState } from '@/context/app-state';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAppState();

  const handleSignIn = () => {
    const trimmed = email.trim();
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) return setError('Enter a valid email address.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    setError('');
    // Frontend only: derive a display name from the email until the backend is ready.
    const local = trimmed.split('@')[0].split(/[._-]/)[0];
    signIn(local.charAt(0).toUpperCase() + local.slice(1), trimmed);
    router.replace('/dashboard');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          backgroundColor: '#F8FAFF',
          paddingHorizontal: 20,
          paddingVertical: 30,
          justifyContent: 'center',
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* Logo & Branding */}
        <View
          style={{
            alignItems: 'center',
            marginBottom: 38,
          }}
        >
          {/* Logo */}
          <View
            style={{
              width: 78,
              height: 78,
              borderRadius: 24,
              backgroundColor: '#2563EB',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,

              shadowColor: '#2563EB',
              shadowOffset: {
                width: 0,
                height: 6,
              },
              shadowOpacity: 0.25,
              shadowRadius: 10,
              elevation: 6,
            }}
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 38,
                fontWeight: '800',
              }}
            >
              I
            </Text>
          </View>

          {/* App Name */}
          <Text
            style={{
              fontSize: 30,
              fontWeight: '800',
              color: '#1E3A8A',
              letterSpacing: -0.5,
            }}
          >
            IskolarNa
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: '#64748B',
              marginTop: 6,
            }}
          >
            Find your path. Shape your future.
          </Text>
        </View>

        {/* Login Card */}
        <View
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 24,
            padding: 24,

            shadowColor: '#0F172A',
            shadowOffset: {
              width: 0,
              height: 4,
            },
            shadowOpacity: 0.08,
            shadowRadius: 15,
            elevation: 4,
          }}
        >
          {/* Heading */}
          <Text
            style={{
              fontSize: 25,
              fontWeight: '700',
              color: '#0F172A',
              marginBottom: 6,
            }}
          >
            Welcome back!
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: '#64748B',
              marginBottom: 25,
              lineHeight: 20,
            }}
          >
            Sign in to continue your college journey.
          </Text>

          {/* Email Label */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: '#334155',
              marginBottom: 8,
            }}
          >
            Email Address
          </Text>

          {/* Email Input */}
          <View
            style={{
              height: 54,
              borderWidth: 1,
              borderColor: '#DBE3F0',
              borderRadius: 14,
              backgroundColor: '#F8FAFC',
              justifyContent: 'center',
              paddingHorizontal: 16,
              marginBottom: 18,
            }}
          >
            <TextInput
              style={{
                fontSize: 15,
                color: '#0F172A',
              }}
              placeholder="Enter your email"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Password Label */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: '#334155',
              marginBottom: 8,
            }}
          >
            Password
          </Text>

          {/* Password Input */}
          <View
            style={{
              height: 54,
              borderWidth: 1,
              borderColor: '#DBE3F0',
              borderRadius: 14,
              backgroundColor: '#F8FAFC',
              flexDirection: 'row',
              alignItems: 'center',
              paddingLeft: 16,
              paddingRight: 12,
              marginBottom: 10,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                fontSize: 15,
                color: '#0F172A',
              }}
              placeholder="Enter your password"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />

            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text
                style={{
                  color: '#2563EB',
                  fontSize: 13,
                  fontWeight: '600',
                }}
              >
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            onPress={() => router.push('/forgot-password')}
            style={{
              alignSelf: 'flex-end',
              marginBottom: 24,
            }}
          >
            <Text
              style={{
                color: '#2563EB',
                fontSize: 13,
                fontWeight: '600',
              }}
            >
              Forgot Password?
            </Text>
          </TouchableOpacity>

          {/* Sign In Button */}
          {error ? (
            <Text style={{ color: '#B91C1C', fontSize: 13, fontWeight: '600', marginBottom: 12, textAlign: 'center' }}>
              {error}
            </Text>
          ) : null}
          <TouchableOpacity
            activeOpacity={0.8}
            style={{
              height: 54,
              backgroundColor: '#2563EB',
              borderRadius: 14,
              justifyContent: 'center',
              alignItems: 'center',

              shadowColor: '#2563EB',
              shadowOffset: {
                width: 0,
                height: 5,
              },
              shadowOpacity: 0.25,
              shadowRadius: 8,
              elevation: 4,
            }}
            onPress={handleSignIn}
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: '700',
              }}
            >
              Sign In
            </Text>
          </TouchableOpacity>
        </View>

        {/* Sign Up */}
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            marginTop: 24,
          }}
        >
          <Text
            style={{
              color: '#64748B',
              fontSize: 14,
            }}
          >
            Don't have an account?{' '}
          </Text>

          <TouchableOpacity
            onPress={() => router.push('/signup')}
          >
            <Text
              style={{
                color: '#2563EB',
                fontSize: 14,
                fontWeight: '700',
              }}
            >
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Text */}
        <Text
          style={{
            textAlign: 'center',
            color: '#94A3B8',
            fontSize: 11,
            marginTop: 30,
          }}
        >
          Your future starts with the right choice.
        </Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}