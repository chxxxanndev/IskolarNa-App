import { router } from 'expo-router';
import { useState } from 'react';

import { useAppState, type StudentInfo } from '@/context/app-state';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const LEVELS = ['Grade 11', 'Grade 12', 'Graduated'] as const;
const STRANDS = ['STEM', 'ABM', 'HUMSS', 'GAS', 'TVL', 'Other'] as const;
const SCHOLARSHIP_NEEDS = [
  { label: 'Yes', value: 'yes' },
  { label: 'Not sure', value: 'maybe' },
  { label: 'No', value: 'no' },
] as const;

/** Wrapping single-select chips. Tapping the selected chip again clears it (all of these questions are optional). */
function Choice({
  options,
  value,
  onChange,
}: {
  options: readonly { label: string; value: string }[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <TouchableOpacity
            key={o.value}
            activeOpacity={0.8}
            onPress={() => onChange(active ? '' : o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 9,
              borderRadius: 20,
              backgroundColor: active ? '#2563EB' : '#F8FAFC',
              borderWidth: 1,
              borderColor: active ? '#2563EB' : '#DBE3F0',
            }}
          >
            <Text style={{ fontSize: 13, fontWeight: '600', color: active ? '#FFFFFF' : '#475569' }}>{o.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const asOptions = (list: readonly string[]) => list.map((v) => ({ label: v, value: v }));

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Optional "about you" answers
  const [level, setLevel] = useState('');
  const [strand, setStrand] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [needsScholarship, setNeedsScholarship] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const { signIn } = useAppState();

  const handleSignUp = () => {
    const trimmed = email.trim();
    if (name.trim().length < 2) return setError('Enter your full name.');
    if (!/^\S+@\S+\.\S+$/.test(trimmed)) return setError('Enter a valid email address.');
    if (password.length < 8) return setError('Password must be at least 8 characters.');
    if (password !== confirmPassword) return setError('Passwords do not match.');
    setError('');
    const info: StudentInfo = { level, strand, municipality: municipality.trim(), needsScholarship };
    signIn(name.trim().split(' ')[0], trimmed, info);
    // New accounts get the optional "Take Match now" screen before Home.
    router.replace('/welcome');
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
          paddingHorizontal: 24,
          paddingVertical: 40,
          justifyContent: 'center',
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* Logo & Branding */}
        <View
          style={{
            alignItems: 'center',
            marginBottom: 30,
          }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 22,
              backgroundColor: '#2563EB',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 14,

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
                fontSize: 36,
                fontWeight: '800',
              }}
            >
              I
            </Text>
          </View>

          <Text
            style={{
              fontSize: 28,
              fontWeight: '800',
              color: '#1E3A8A',
            }}
          >
            IskolarNa
          </Text>

          <Text
            style={{
              fontSize: 13,
              color: '#64748B',
              marginTop: 5,
            }}
          >
            Start your college journey with us.
          </Text>
        </View>

        {/* Sign Up Card */}
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
            Create your account
          </Text>

          <Text
            style={{
              fontSize: 14,
              color: '#64748B',
              marginBottom: 24,
              lineHeight: 20,
            }}
          >
            Join IskolarNa and start exploring your options.
          </Text>

          {/* Full Name */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: '#334155',
              marginBottom: 8,
            }}
          >
            Full Name
          </Text>

          <TextInput
            style={{
              height: 54,
              borderWidth: 1,
              borderColor: '#DBE3F0',
              borderRadius: 14,
              backgroundColor: '#F8FAFC',
              paddingHorizontal: 16,
              fontSize: 15,
              color: '#0F172A',
              marginBottom: 18,
            }}
            placeholder="Enter your full name"
            placeholderTextColor="#94A3B8"
            value={name}
            onChangeText={setName}
          />

          {/* Email */}
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

          <TextInput
            style={{
              height: 54,
              borderWidth: 1,
              borderColor: '#DBE3F0',
              borderRadius: 14,
              backgroundColor: '#F8FAFC',
              paddingHorizontal: 16,
              fontSize: 15,
              color: '#0F172A',
              marginBottom: 18,
            }}
            placeholder="Enter your email"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {/* Password */}
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
              marginBottom: 18,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                fontSize: 15,
                color: '#0F172A',
              }}
              placeholder="Create a password"
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

          {/* Confirm Password */}
          <Text
            style={{
              fontSize: 13,
              fontWeight: '600',
              color: '#334155',
              marginBottom: 8,
            }}
          >
            Confirm Password
          </Text>

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
              marginBottom: 24,
            }}
          >
            <TextInput
              style={{
                flex: 1,
                fontSize: 15,
                color: '#0F172A',
              }}
              placeholder="Re-enter your password"
              placeholderTextColor="#94A3B8"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />

            <TouchableOpacity
              onPress={() =>
                setShowConfirmPassword(!showConfirmPassword)
              }
            >
              <Text
                style={{
                  color: '#2563EB',
                  fontSize: 13,
                  fontWeight: '600',
                }}
              >
                {showConfirmPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* About you (all optional) */}
          <View style={{ height: 1, backgroundColor: '#EEF2F7', marginBottom: 20 }} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 4 }}>About you</Text>
          <Text style={{ fontSize: 13, color: '#64748B', marginBottom: 18, lineHeight: 18 }}>
            Optional. Helps us tailor colleges and scholarships for you.
          </Text>

          <Text style={{ fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 8 }}>Current level</Text>
          <Choice options={asOptions(LEVELS)} value={level} onChange={setLevel} />

          <Text style={{ fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 8 }}>SHS strand</Text>
          <Choice options={asOptions(STRANDS)} value={strand} onChange={setStrand} />

          <Text style={{ fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 8 }}>Municipality / city</Text>
          <TextInput
            style={{
              height: 54,
              borderWidth: 1,
              borderColor: '#DBE3F0',
              borderRadius: 14,
              backgroundColor: '#F8FAFC',
              paddingHorizontal: 16,
              fontSize: 15,
              color: '#0F172A',
              marginBottom: 18,
            }}
            placeholder="e.g. Dipolog City"
            placeholderTextColor="#94A3B8"
            value={municipality}
            onChangeText={setMunicipality}
          />

          <Text style={{ fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 8 }}>Do you need a scholarship?</Text>
          <Choice options={SCHOLARSHIP_NEEDS} value={needsScholarship} onChange={setNeedsScholarship} />

          {/* Create Account */}
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
            onPress={handleSignUp}
          >
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 16,
                fontWeight: '700',
              }}
            >
              Create Account
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login */}
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
            Already have an account?{' '}
          </Text>

          <TouchableOpacity onPress={() => router.back()}>
            <Text
              style={{
                color: '#2563EB',
                fontSize: 14,
                fontWeight: '700',
              }}
            >
              Log In
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Text */}
        <Text
          style={{
            textAlign: 'center',
            color: '#94A3B8',
            fontSize: 11,
            marginTop: 28,
          }}
        >
          Your future starts with the right choice.
        </Text>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}