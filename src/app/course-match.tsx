import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, ProgressBar, Tag, card } from '@/components/list-ui';
import { useAppState } from '@/context/app-state';
import { collegesOffering } from '@/data/courses';
import { RIASEC_META } from '@/data/riasec';
import { analyzeInterests, INTEREST_SUGGESTIONS, type MatchResult } from '@/lib/match';

export default function CourseMatch() {
  const { setProfile } = useAppState();
  const [text, setText] = useState('');
  const [result, setResult] = useState<MatchResult | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const run = () => {
    const r = analyzeInterests(text);
    setResult(r);
    setSubmitted(true);
    if (r) setProfile(r.profile);
  };

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={{ flex: 1, backgroundColor: '#F8FAFF' }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={card}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: '#0F172A', marginBottom: 4 }}>What do you enjoy?</Text>
            <Text style={{ fontSize: 13, color: '#64748B', lineHeight: 19, marginBottom: 14 }}>
              Describe your hobbies, strengths, and the kind of work you imagine doing.
            </Text>
            <TextInput
              value={text}
              onChangeText={(t) => {
                setText(t);
                setSubmitted(false);
              }}
              multiline
              placeholder="e.g. I love solving problems and working with computers..."
              placeholderTextColor="#94A3B8"
              textAlignVertical="top"
              style={{
                minHeight: 110,
                borderWidth: 1,
                borderColor: '#DBE3F0',
                borderRadius: 14,
                backgroundColor: '#F8FAFC',
                padding: 14,
                fontSize: 14,
                color: '#0F172A',
                marginBottom: 12,
              }}
            />
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ gap: 8, marginBottom: 14 }}
            >
              {INTEREST_SUGGESTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => {
                    setText(s);
                    setSubmitted(false);
                  }}
                  style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 16, backgroundColor: '#EFF6FF' }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#2563EB' }}>{s}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button label="Find my match" icon="sparkles-outline" disabled={text.trim().length < 3} onPress={run} />
          </View>

          {submitted && !result && (
            <View style={{ ...card, alignItems: 'center' }}>
              <Ionicons name="help-circle-outline" size={32} color="#2563EB" />
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#0F172A', marginTop: 8 }}>We need a bit more detail</Text>
              <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 19, marginTop: 4 }}>
                Mention things you enjoy, like building, helping people, numbers, art, or leading a team.
              </Text>
            </View>
          )}

          {submitted && result && (
            <>
              <View>
                <Text style={{ fontSize: 17, fontWeight: '800', color: '#0F172A' }}>Your top matches</Text>
                <Text style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Your interest profile has been updated.</Text>
              </View>

              {result.courses.map((m, index) => {
                const colleges = collegesOffering(m.course);
                return (
                  <View key={m.course.id} style={card}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        {index === 0 && <Tag label="Best match" />}
                        <Text style={{ fontSize: 16, fontWeight: '800', color: '#0F172A', marginTop: index === 0 ? 8 : 0 }}>
                          {m.course.name}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 22, fontWeight: '800', color: '#2563EB' }}>{m.percent}%</Text>
                    </View>

                    <View style={{ flexDirection: 'row', marginTop: 10 }}>
                      <ProgressBar value={m.percent} />
                    </View>

                    <Text style={{ fontSize: 13, color: '#475569', lineHeight: 19, marginTop: 12 }}>{m.course.about}</Text>

                    {m.reasons.length > 0 && (
                      <Text style={{ fontSize: 12, color: '#64748B', marginTop: 10 }}>
                        Fits your {m.reasons.map((c) => RIASEC_META[c].label).join(' and ')} interests.
                      </Text>
                    )}

                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#0F172A', marginTop: 14, marginBottom: 8 }}>
                      Possible careers
                    </Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                      {m.course.careers.map((c) => (
                        <Tag key={c} label={c} tone="slate" />
                      ))}
                    </View>

                    {colleges.length > 0 && (
                      <>
                        <Text style={{ fontSize: 12, fontWeight: '700', color: '#0F172A', marginTop: 14, marginBottom: 8 }}>
                          Offered at
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {colleges.map((c) => (
                            <TouchableOpacity
                              key={c.id}
                              onPress={() => router.push(`/college/${c.id}`)}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 6,
                                paddingHorizontal: 12,
                                paddingVertical: 8,
                                borderRadius: 12,
                                borderWidth: 1,
                                borderColor: '#BFDBFE',
                              }}
                            >
                              <Text style={{ fontSize: 13, fontWeight: '700', color: '#2563EB' }}>{c.short}</Text>
                              <Ionicons name="chevron-forward" size={14} color="#2563EB" />
                            </TouchableOpacity>
                          ))}
                        </View>
                      </>
                    )}
                  </View>
                );
              })}

              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Button flex variant="secondary" label="View profile" icon="person-outline" onPress={() => router.push('/profile')} />
                <Button flex label="Scholarships" icon="ribbon-outline" onPress={() => router.push('/scholarships')} />
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
