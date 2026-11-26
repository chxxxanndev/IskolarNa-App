import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

import { Button, ProgressBar, card } from '@/components/list-ui';
import { ANSWER_LABELS, QUESTIONS } from '@/data/questions';
import { analyzeAnswers, type MatchResult } from '@/lib/match';

/** 24 short statements, one at a time. Calls `onFinish` with the match once the last one is answered. */
export function InterestQuiz({ onFinish }: { onFinish: (result: MatchResult) => void }) {
  const [answers, setAnswers] = useState<number[]>([]); // answers[i] = 1..5 for QUESTIONS[i]
  const index = answers.length;
  const question = QUESTIONS[index];

  const answer = (value: number) => {
    const next = [...answers, value];
    if (next.length === QUESTIONS.length) {
      onFinish(analyzeAnswers(next));
      setAnswers([]);
    } else setAnswers(next);
  };

  return (
    <View style={card}>
      <Text style={{ fontSize: 12, fontWeight: '700', color: '#64748B', marginBottom: 8 }}>
        Question {index + 1} of {QUESTIONS.length}
      </Text>
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <ProgressBar value={(index / QUESTIONS.length) * 100} />
      </View>

      <Text style={{ fontSize: 13, color: '#64748B' }}>How much would you enjoy this?</Text>
      <Text style={{ fontSize: 18, fontWeight: '800', color: '#0F172A', marginTop: 6, marginBottom: 16, lineHeight: 25 }}>
        {question.text}
      </Text>

      <View style={{ gap: 8 }}>
        {ANSWER_LABELS.map((label, i) => (
          <TouchableOpacity
            key={label}
            activeOpacity={0.7}
            onPress={() => answer(i + 1)}
            style={{ paddingVertical: 13, borderRadius: 12, borderWidth: 1, borderColor: '#BFDBFE', backgroundColor: '#F8FAFF', alignItems: 'center' }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#2563EB' }}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {index > 0 && (
        <View style={{ marginTop: 14 }}>
          <Button variant="secondary" icon="arrow-back" label="Previous question" onPress={() => setAnswers(answers.slice(0, -1))} />
        </View>
      )}
    </View>
  );
}
