import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';

import { Button, card } from '@/components/list-ui';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const submit = () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError('Enter a valid email address.');
    setError('');
    setSent(true); // Frontend only: no email is actually sent yet.
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, padding: 20, justifyContent: 'center' }}
      >
        <View style={{ ...card, padding: 24 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              backgroundColor: '#EFF6FF',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
              alignSelf: 'center',
            }}
          >
            <Ionicons name={sent ? 'mail-open-outline' : 'lock-closed-outline'} size={30} color="#2563EB" />
          </View>

          {sent ? (
            <>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#0F172A', textAlign: 'center' }}>
                Check your email
              </Text>
              <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20, marginTop: 8, marginBottom: 24 }}>
                If an account exists for {email.trim()}, a reset link will arrive shortly.
              </Text>
              <Button label="Back to sign in" onPress={() => router.replace('/login')} />
            </>
          ) : (
            <>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#0F172A', textAlign: 'center' }}>
                Forgot your password?
              </Text>
              <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 20, marginTop: 8, marginBottom: 20 }}>
                Enter your email and we'll send you a link to reset it.
              </Text>
              <View
                style={{
                  height: 54,
                  borderWidth: 1,
                  borderColor: '#DBE3F0',
                  borderRadius: 14,
                  backgroundColor: '#F8FAFC',
                  justifyContent: 'center',
                  paddingHorizontal: 16,
                  marginBottom: 12,
                }}
              >
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={{ fontSize: 15, color: '#0F172A' }}
                />
              </View>
              {error ? (
                <Text style={{ color: '#B91C1C', fontSize: 13, fontWeight: '600', marginBottom: 12, textAlign: 'center' }}>
                  {error}
                </Text>
              ) : null}
              <Button label="Send reset link" onPress={submit} />
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
