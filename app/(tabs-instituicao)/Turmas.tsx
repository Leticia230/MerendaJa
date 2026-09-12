import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../../constants/theme';

const TURMAS = [
  { name: '1º Ano A', students: 25 },
  { name: '1º Ano B', students: 24 },
  { name: '2º Ano A', students: 26 },
  { name: '2º Ano B', students: 23 },
  { name: '3º Ano A', students: 27 },
];

export default function TurmasScreen() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const filtered = TURMAS.filter(t => t.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerWrap}>
        <Text style={styles.headerTitle}>Turmas</Text>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color={colors.textMuted} />
        <TextInput
          testID="turmas-search-input"
          value={q}
          onChangeText={setQ}
          placeholder="Buscar turma"
          placeholderTextColor={colors.textLight}
          style={styles.searchInput}
        />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {filtered.map((t, i) => (
          <Pressable key={i} style={styles.card} testID={`turma-${t.name}`}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{t.name}</Text>
              <Text style={styles.count}>{t.students} alunos</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))}

        <Pressable
          testID="add-turma-button"
          style={styles.addBtn}
          onPress={() => router.push('/NovaTurma')}
        >
          <Text style={styles.addBtnText}>+ Adicionar turma</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  headerWrap: {
    backgroundColor: colors.yellow,
    paddingTop: 20,
    paddingBottom: 18,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.textDark },
  searchWrap: {
    marginHorizontal: 18,
    marginTop: 14,
    backgroundColor: '#fff',
    borderRadius: 12,
    height: 44,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.inputBorder,
  },
  searchInput: { flex: 1, fontSize: 14, color: colors.textDark, padding: 0 },
  body: { padding: 16, paddingTop: 12, gap: 10 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  name: { fontSize: 15, fontWeight: '700', color: colors.textDark },
  count: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
