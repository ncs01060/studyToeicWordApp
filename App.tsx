import React, { useState, useEffect } from 'react';
import {
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AddWord from './components/AddWord';
import ShowWords from './components/ShowWords';
import Exam from './components/Exam';
import initialDb from './db/db.json';

export interface Word {
  id: string;
  word: string;
  means: string[];
}

type Screen = 'addWord' | 'wordBook' | 'exam';

const STORAGE_KEY = 'toeic_words_v2';

const TAB_LABELS: Record<Screen, string> = {
  addWord: '단어 추가',
  wordBook: '단어장',
  exam: '시험',
};

export default function App() {
  const [screen, setScreen] = useState<Screen>('wordBook');
  const [words, setWords] = useState<Word[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          setWords(JSON.parse(raw));
        } else {
          const initial: Word[] = (initialDb as { word: string; mean: string }[]).map(
            (item, i) => ({ id: String(i), word: item.word, means: [item.mean] }),
          );
          setWords(initial);
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
        }
      } catch {
        setWords([]);
      }
    })();
  }, []);

  async function addWord(word: string, means: string[]) {
    const newWord: Word = { id: Date.now().toString(), word, means };
    const updated = [...words, newWord];
    setWords(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
  }

  async function deleteWord(id: string) {
    const updated = words.filter(w => w.id !== id);
    setWords(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>토익 단어장</Text>
      </View>

      <View style={styles.content}>
        {screen === 'addWord' && <AddWord onAddWord={addWord} />}
        {screen === 'wordBook' && <ShowWords words={words} onDeleteWord={deleteWord} />}
        {screen === 'exam' && <Exam words={words} />}
      </View>

      <View style={styles.tabBar}>
        {(['addWord', 'wordBook', 'exam'] as Screen[]).map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.tab, screen === s && styles.tabActive]}
            onPress={() => setScreen(s)}
          >
            <Text style={[styles.tabText, screen === s && styles.tabTextActive]}>
              {TAB_LABELS[s]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f7fa' },
  header: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e8e8e8',
  },
  title: { fontSize: 20, fontWeight: '800', color: '#222' },
  content: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e8e8e8',
    paddingBottom: Platform.OS === 'ios' ? 8 : 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
  },
  tabActive: { borderTopWidth: 2, borderTopColor: '#4A90E2' },
  tabText: { fontSize: 13, color: '#999' },
  tabTextActive: { color: '#4A90E2', fontWeight: '700' },
});
