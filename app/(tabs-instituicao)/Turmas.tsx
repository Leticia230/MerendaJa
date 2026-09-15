import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../../constants/theme';
import { assinarTurmas, Turma } from '../services/turmas';

export default function TurmasScreen() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const unsubscribe = assinarTurmas(
      (dados) => {
        setTurmas(dados);
        setCarregando(false);
      },
      () => setCarregando(false)
    );

    return unsubscribe;
  }, []);

  const filtered = turmas.filter((t) =>
    t.nome.toLowerCase().includes(q.toLowerCase())
  );

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
        {carregando ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        ) : turmas.length === 0 ? (
          <Text style={styles.emptyText}>
            Nenhuma turma cadastrada ainda. Toque em "Adicionar turma" pra criar a primeira.
          </Text>
        ) : filtered.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma turma encontrada para "{q}".</Text>
        ) : (
          filtered.map((t) => (
            <Pressable
              key={t.id}
              style={styles.card}
              testID={`turma-${t.nome}`}
              onPress={() => router.push({ pathname: '/NovaTurma', params: { id: t.id } })}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{t.nome}</Text>
                <Text style={styles.count}>
                  {t.alunosIds.length} aluno{t.alunosIds.length !== 1 ? 's' : ''}
                  {t.periodo ? ` · ${t.periodo}` : ''}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))
        )}

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
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 24,
    paddingHorizontal: 20,
  },
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