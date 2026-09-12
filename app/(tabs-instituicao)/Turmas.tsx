import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';

import { colors } from '../../constants/theme';
import { db } from '../../components/firebaseConfig';

type Turma = {
  id: string;
  name: string;
  students: number;
  instituicaoId: string;
};

export default function TurmasScreen() {
  const router = useRouter();

  const [q, setQ] = useState('');
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ID da instituição atualmente logada
    // Depois podemos pegar esse ID diretamente do Firebase Auth.
    const instituicaoId = 'ID_DA_INSTITUICAO';

    const turmasRef = collection(db, 'turmas');

    const turmasQuery = query(
      turmasRef,
      where('instituicaoId', '==', instituicaoId)
    );

    const unsubscribe = onSnapshot(
      turmasQuery,
      (snapshot) => {
        const lista: Turma[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Turma[];

        setTurmas(lista);
        setLoading(false);
      },
      (error) => {
        console.error('Erro ao carregar turmas:', error);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const filtered = turmas.filter((turma) =>
    turma.name.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerWrap}>
        <Text style={styles.headerTitle}>Turmas</Text>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons
          name="search"
          size={16}
          color={colors.textMuted}
        />

        <TextInput
          testID="turmas-search-input"
          value={q}
          onChangeText={setQ}
          placeholder="Buscar turma"
          placeholderTextColor={colors.textLight}
          style={styles.searchInput}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={{ marginTop: 30 }}
          />
        ) : filtered.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons
              name="school-outline"
              size={42}
              color={colors.textMuted}
            />

            <Text style={styles.emptyTitle}>
              Nenhuma turma cadastrada
            </Text>

            <Text style={styles.emptyText}>
              As turmas cadastradas pela instituição aparecerão aqui.
            </Text>
          </View>
        ) : (
          filtered.map((turma) => (
            <Pressable
              key={turma.id}
              style={styles.card}
              testID={`turma-${turma.name}`}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{turma.name}</Text>

                <Text style={styles.count}>
                  {turma.students ?? 0} alunos
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.textMuted}
              />
            </Pressable>
          ))
        )}

        <Pressable
          testID="add-turma-button"
          style={styles.addBtn}
          onPress={() => router.push('/NovaTurma')}
        >
          <Text style={styles.addBtnText}>
            + Adicionar turma
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },

  headerWrap: {
    backgroundColor: colors.yellow,
    paddingTop: 20,
    paddingBottom: 18,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textDark,
  },

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

  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textDark,
    padding: 0,
  },

  body: {
    padding: 16,
    paddingTop: 12,
    gap: 10,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textDark,
  },

  count: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },

  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 45,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textDark,
    marginTop: 12,
  },

  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },

  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
    marginTop: 8,
  },

  addBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});