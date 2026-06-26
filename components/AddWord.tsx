import React, { useState } from 'react';
import {
  StyleSheet, Text, View, TextInput, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';

interface Props {
  onAddWord: (word: string, means: string[]) => void;
}

export default function AddWord({ onAddWord }: Props) {
  const [word, setWord] = useState('');
  const [means, setMeans] = useState<string[]>(['']);

  function updateMean(index: number, value: string) {
    setMeans(prev => prev.map((m, i) => (i === index ? value : m)));
  }

  function addMean() {
    setMeans(prev => [...prev, '']);
  }

  function removeMean(index: number) {
    if (means.length === 1) return;
    setMeans(prev => prev.filter((_, i) => i !== index));
  }

  function handleSave() {
    const w = word.trim();
    const ms = means.map(m => m.trim()).filter(Boolean);
    if (!w) {
      Alert.alert('알림', '영어 단어를 입력해주세요.');
      return;
    }
    if (ms.length === 0) {
      Alert.alert('알림', '뜻을 하나 이상 입력해주세요.');
      return;
    }
    onAddWord(w, ms);
    setWord('');
    setMeans(['']);
    Alert.alert('완료', `"${w}" 단어가 추가되었습니다.`);
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.label}>영어 단어</Text>
        <TextInput
          style={styles.input}
          value={word}
          onChangeText={setWord}
          placeholder="예: abandon"
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor="#aaa"
        />

        <Text style={styles.label}>뜻 (여러 개 추가 가능)</Text>
        {means.map((m, i) => (
          <View key={i} style={styles.meanRow}>
            <TextInput
              style={[styles.input, styles.meanInput]}
              value={m}
              onChangeText={v => updateMean(i, v)}
              placeholder={`뜻 ${i + 1}번`}
              placeholderTextColor="#aaa"
            />
            {means.length > 1 && (
              <TouchableOpacity onPress={() => removeMean(i)} style={styles.removeBtn}>
                <Text style={styles.removeBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.addMeanBtn} onPress={addMean}>
          <Text style={styles.addMeanText}>+ 뜻 추가</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveBtnText}>저장</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { padding: 20, paddingBottom: 40 },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
    marginTop: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16,
    color: '#222',
  },
  meanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  meanInput: { flex: 1 },
  removeBtn: {
    marginLeft: 8,
    paddingHorizontal: 12,
    paddingVertical: 13,
    backgroundColor: '#ff5f5f',
    borderRadius: 10,
  },
  removeBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  addMeanBtn: {
    marginTop: 6,
    paddingVertical: 13,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#4A90E2',
    alignItems: 'center',
  },
  addMeanText: { color: '#4A90E2', fontSize: 15, fontWeight: '600' },
  saveBtn: {
    marginTop: 28,
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  saveBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
