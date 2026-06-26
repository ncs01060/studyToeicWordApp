import { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Word } from '../App';

interface Props {
  words: Word[];
  onDeleteWord: (id: string) => void;
}

export default function ShowWords({ words, onDeleteWord }: Props) {
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  function toggle(id: string) {
    setRevealed(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function confirmDelete(id: string, word: string) {
    Alert.alert('단어 삭제', `"${word}"를 삭제하시겠습니까?`, [
      { text: '취소', style: 'cancel' },
      { text: '삭제', style: 'destructive', onPress: () => onDeleteWord(id) },
    ]);
  }

  if (words.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>단어가 없습니다{'\n'}단어 추가 탭에서 추가해주세요</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={words}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item, index }) => {
        const isRevealed = revealed.has(item.id);
        return (
          <TouchableOpacity
            style={[styles.card, isRevealed && styles.cardRevealed]}
            onPress={() => toggle(item.id)}
            activeOpacity={0.85}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.indexText}>{index + 1}</Text>
              <Text style={styles.wordText}>{item.word}</Text>
              <Text style={styles.arrowText}>{isRevealed ? '▲' : '▼'}</Text>
              <TouchableOpacity
                onPress={() => confirmDelete(item.id, item.word)}
                style={styles.deleteBtn}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.deleteBtnText}>🗑</Text>
              </TouchableOpacity>
            </View>
            {isRevealed && (
              <View style={styles.meansBox}>
                {item.means.map((m, i) => (
                  <Text key={i} style={styles.meanText}>
                    {item.means.length > 1 ? `${i + 1}. ` : ''}{m}
                  </Text>
                ))}
              </View>
            )}
          </TouchableOpacity>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    lineHeight: 28,
  },
  list: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardRevealed: { backgroundColor: '#f0f7ff', borderWidth: 1, borderColor: '#c8dff7' },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  indexText: { color: '#bbb', fontSize: 13, marginRight: 10, minWidth: 24 },
  wordText: { flex: 1, fontSize: 18, fontWeight: '600', color: '#222' },
  arrowText: { color: '#bbb', fontSize: 13 },
  meansBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#d0e4ff',
  },
  meanText: { fontSize: 15, color: '#2979c8', lineHeight: 26 },
  deleteBtn: { marginLeft: 8, padding: 2 },
  deleteBtnText: { fontSize: 16 },
});
