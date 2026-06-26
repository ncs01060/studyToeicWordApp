import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, ScrollView,
  Alert, Dimensions,
} from 'react-native';
import * as Speech from 'expo-speech';
import { Word } from '../App';

const TOTAL = 50;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

type QType = 0 | 1 | 2 | 3;
// 0: 영어 텍스트 → 한글 뜻
// 1: 한글 뜻 → 영어 단어
// 2: 듣기 → 영단어
// 3: 듣기 → 한글 뜻

interface Question {
  type: QType;
  word: Word;
  correct: string;
  options: string[];
}

interface Props {
  words: Word[];
}

const TYPE_LABELS: Record<QType, string> = {
  0: '영어 → 한글',
  1: '한글 → 영어',
  2: '듣기 → 영단어',
  3: '듣기 → 한글 뜻',
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getMean(word: Word): string {
  return word.means[0] ?? '';
}

function buildQuestion(word: Word, allWords: Word[], type: QType): Question {
  const others = allWords.filter(w => w.id !== word.id);

  let correct: string;
  let wrongPool: string[];

  if (type === 0 || type === 3) {
    correct = getMean(word);
    wrongPool = others.map(getMean);
  } else {
    correct = word.word;
    wrongPool = others.map(w => w.word);
  }

  const wrongs = shuffle(wrongPool).slice(0, 3);
  const options = shuffle([correct, ...wrongs]);
  return { type, word, correct, options };
}

function generateExam(words: Word[]): Question[] {
  return Array.from({ length: TOTAL }, () => {
    const word = words[Math.floor(Math.random() * words.length)];
    const type = Math.floor(Math.random() * 4) as QType;
    return buildQuestion(word, words, type);
  });
}

export default function Exam({ words }: Props) {
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);

  function startExam() {
    if (words.length < 4) {
      Alert.alert('알림', '시험을 보려면 4개 이상의 단어가 필요합니다.');
      return;
    }
    setQuestions(generateExam(words));
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setAnswers([]);
    setStarted(true);
  }

  useEffect(() => {
    if (!started || finished || questions.length === 0) return;
    const q = questions[current];
    if (q.type === 2 || q.type === 3) {
      Speech.speak(q.word.word, { language: 'en-US' });
    }
  }, [current, started, finished, questions]);

  function handleSelect(option: string) {
    if (selected !== null) return;
    setSelected(option);
    const isCorrect = option === questions[current].correct;
    if (isCorrect) setScore(s => s + 1);
    setAnswers(prev => [...prev, isCorrect]);
  }

  function handleNext() {
    if (current + 1 >= TOTAL) {
      setFinished(true);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
    }
  }

  if (!started) {
    return (
      <View style={styles.center}>
        <Text style={styles.startTitle}>영어 시험</Text>
        <Text style={styles.startSub}>4가지 유형이 랜덤으로 50문제 출제됩니다</Text>
        <View style={styles.typeList}>
          {(['영어 → 한글', '한글 → 영어', '듣기 → 영단어', '듣기 → 한글 뜻'] as const).map(label => (
            <Text key={label} style={styles.typeItem}>• {label}</Text>
          ))}
        </View>
        <Text style={styles.wordCount}>현재 단어 수: {words.length}개</Text>
        <TouchableOpacity style={styles.startBtn} onPress={startExam}>
          <Text style={styles.startBtnText}>시험 시작</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (finished) {
    const pct = Math.round((score / TOTAL) * 100);
    const grade =
      pct >= 90 ? '우수' : pct >= 70 ? '양호' : pct >= 50 ? '보통' : '분발 필요';
    return (
      <ScrollView contentContainerStyle={styles.resultContainer}>
        <Text style={styles.resultTitle}>시험 결과</Text>
        <Text style={styles.resultScore}>{score} / {TOTAL}</Text>
        <Text style={styles.resultPct}>{pct}점</Text>
        <Text style={styles.resultGrade}>{grade}</Text>
        <View style={styles.resultList}>
          {answers.map((ok, i) => (
            <View key={i} style={styles.resultRow}>
              <Text style={[styles.resultMark, { color: ok ? '#4CAF50' : '#f44336' }]}>
                {ok ? '✓' : '✗'}
              </Text>
              <Text style={styles.resultWordText}>
                {questions[i].word.word}
                <Text style={styles.resultTypeText}>  [{TYPE_LABELS[questions[i].type]}]</Text>
              </Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.startBtn} onPress={() => setStarted(false)}>
          <Text style={styles.startBtnText}>다시 시작</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  const q = questions[current];
  const fillWidth = ((current + 1) / TOTAL) * SCREEN_WIDTH;

  return (
    <View style={styles.examContainer}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: fillWidth }]} />
      </View>
      <Text style={styles.progressText}>
        {current + 1} / {TOTAL}　　점수: {score}
      </Text>

      <View style={styles.typeBadge}>
        <Text style={styles.typeBadgeText}>{TYPE_LABELS[q.type]}</Text>
      </View>

      <View style={styles.questionBox}>
        {q.type === 0 && (
          <Text style={styles.questionWord}>{q.word.word}</Text>
        )}
        {q.type === 1 && (
          <Text style={styles.questionMean}>{getMean(q.word)}</Text>
        )}
        {(q.type === 2 || q.type === 3) && (
          <TouchableOpacity
            style={styles.speakerBtn}
            onPress={() => Speech.speak(q.word.word, { language: 'en-US' })}
          >
            <Text style={styles.speakerIcon}>🔊</Text>
            <Text style={styles.speakerLabel}>눌러서 다시 듣기</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.options}>
        {q.options.map((opt, i) => {
          let borderColor = '#ddd';
          let bg = '#fff';
          if (selected !== null) {
            if (opt === q.correct) { bg = '#e8f5e9'; borderColor = '#4CAF50'; }
            else if (opt === selected) { bg = '#ffebee'; borderColor = '#f44336'; }
          }
          return (
            <TouchableOpacity
              key={i}
              style={[styles.option, { backgroundColor: bg, borderColor }]}
              onPress={() => handleSelect(opt)}
              activeOpacity={selected !== null ? 1 : 0.75}
            >
              <Text style={styles.optionLetter}>{['①', '②', '③', '④'][i]}</Text>
              <Text style={styles.optionText}>{opt}</Text>
              {selected !== null && opt === q.correct && (
                <Text style={styles.markCorrect}>✓</Text>
              )}
              {selected !== null && opt === selected && opt !== q.correct && (
                <Text style={styles.markWrong}>✗</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {selected !== null && (
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
          <Text style={styles.nextBtnText}>
            {current + 1 >= TOTAL ? '결과 보기' : '다음 문제 →'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  startTitle: { fontSize: 26, fontWeight: '800', color: '#222', marginBottom: 12 },
  startSub: { fontSize: 15, color: '#666', textAlign: 'center', marginBottom: 24 },
  typeList: { marginBottom: 28, alignSelf: 'flex-start' },
  typeItem: { fontSize: 15, color: '#444', lineHeight: 30 },
  wordCount: { fontSize: 14, color: '#999', marginBottom: 32 },
  startBtn: {
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    paddingHorizontal: 48,
    borderRadius: 12,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  startBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },

  resultContainer: { padding: 24, alignItems: 'center' },
  resultTitle: { fontSize: 22, fontWeight: '800', color: '#222', marginBottom: 16 },
  resultScore: { fontSize: 48, fontWeight: '800', color: '#4A90E2' },
  resultPct: { fontSize: 22, color: '#444', marginTop: 4, marginBottom: 8 },
  resultGrade: { fontSize: 18, fontWeight: '700', color: '#555', marginBottom: 24 },
  resultList: { width: '100%', marginBottom: 32 },
  resultRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6 },
  resultMark: { fontSize: 16, fontWeight: '700', width: 28 },
  resultWordText: { fontSize: 15, color: '#333' },
  resultTypeText: { fontSize: 12, color: '#999' },

  examContainer: { flex: 1 },
  progressTrack: { height: 4, backgroundColor: '#eee' },
  progressFill: { height: 4, backgroundColor: '#4A90E2' },
  progressText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#888',
    marginTop: 8,
    marginBottom: 4,
  },
  typeBadge: {
    alignSelf: 'center',
    backgroundColor: '#EBF3FF',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },
  typeBadgeText: { fontSize: 13, color: '#4A90E2', fontWeight: '600' },
  questionBox: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 28,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 20,
  },
  questionWord: { fontSize: 28, fontWeight: '700', color: '#222', textAlign: 'center' },
  questionMean: { fontSize: 22, fontWeight: '600', color: '#333', textAlign: 'center' },
  speakerBtn: { alignItems: 'center', padding: 8 },
  speakerIcon: { fontSize: 52, marginBottom: 8 },
  speakerLabel: { fontSize: 14, color: '#888' },
  options: { paddingHorizontal: 16 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  optionLetter: { fontSize: 16, color: '#aaa', marginRight: 10, width: 24 },
  optionText: { flex: 1, fontSize: 16, color: '#333' },
  markCorrect: { fontSize: 18, color: '#4CAF50', fontWeight: '700' },
  markWrong: { fontSize: 18, color: '#f44336', fontWeight: '700' },
  nextBtn: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
