
import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { assinarTurmas, Turma } from '../services/turmas';
import Text from '../../components/AppText';
import {
  useAccessibility,
  AccessibilityTheme,
} from '../../components/AccessibilityContext';
import { useResponsive } from '../../hooks/useResponsive';
import ResponsiveContainer from '../../components/ResponsiveContainer';

export default function TurmasScreen() {
  const router = useRouter();
  const { theme } = useAccessibility();
  const { isSmallScreen, fontScale } = useResponsive();

  const compacto = isSmallScreen || fontScale >= 1.2;

  const styles = useMemo(
    () => createStyles(theme, compacto),
    [theme, compacto]
  );

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
    t.nome.toLowerCase().includes(q.trim().toLowerCase())
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerWrap}>
        <ResponsiveContainer style={styles.headerContent}>
          <Text style={styles.headerTitle}>Turmas</Text>
        </ResponsiveContainer>
      </View>

      <ResponsiveContainer style={styles.searchContainer}>
        <View style={styles.searchWrap}>
          <Ionicons
            name="search"
            size={18}
            color={theme.textMuted}
          />

          <TextInput
            testID="turmas-search-input"
            value={q}
            onChangeText={setQ}
            placeholder="Buscar turma"
            placeholderTextColor={theme.placeholder}
            style={styles.searchInput}
            returnKeyType="search"
            accessibilityLabel="Buscar turma"
          />

          {q.length > 0 && (
            <Pressable
              onPress={() => setQ('')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Limpar busca"
            >
              <Ionicons
                name="close-circle"
                size={19}
                color={theme.textMuted}
              />
            </Pressable>
          )}
        </View>
      </ResponsiveContainer>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ResponsiveContainer style={styles.scrollContent}>
          {carregando ? (
            <ActivityIndicator
              color={theme.primary}
              style={styles.loading}
            />
          ) : turmas.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="people-outline"
                size={36}
                color={theme.textMuted}
              />
              <Text style={styles.emptyText}>
                Nenhuma turma cadastrada ainda. Toque em "Adicionar turma"
                para criar a primeira.
              </Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons
                name="search-outline"
                size={32}
                color={theme.textMuted}
              />
              <Text style={styles.emptyText}>
                Nenhuma turma encontrada para "{q}".
              </Text>
            </View>
          ) : (
            filtered.map((t) => (
              <Pressable
                key={t.id}
                style={styles.card}
                testID={`turma-${t.nome}`}
                onPress={() =>
                  router.push({
                    pathname: '/NovaTurma',
                    params: { id: t.id },
                  })
                }
                accessibilityRole="button"
                accessibilityLabel={`Turma ${t.nome}, ${t.alunosIds.length} alunos`}
              >
                <View style={styles.cardInfo}>
                  <Text style={styles.name}>{t.nome}</Text>

                  <Text style={styles.count}>
                    {t.alunosIds.length} aluno
                    {t.alunosIds.length !== 1 ? 's' : ''}
                    {t.periodo ? ` · ${t.periodo}` : ''}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.textMuted}
                />
              </Pressable>
            ))
          )}

          <Pressable
            testID="add-turma-button"
            style={styles.addBtn}
            onPress={() => router.push('/NovaTurma')}
            accessibilityRole="button"
            accessibilityLabel="Adicionar turma"
          >
            <Ionicons
              name="add"
              size={20}
              color={theme.onPrimary}
            />
            <Text style={styles.addBtnText}>Adicionar turma</Text>
          </Pressable>
        </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (
  theme: AccessibilityTheme,
  compacto = false
) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.background,
    },

    headerWrap: {
      backgroundColor: theme.header,
      paddingTop: 20,
      paddingBottom: 18,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },

    headerContent: {
      alignItems: 'center',
      justifyContent: 'center',
    },

    headerTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'center',
    },

    searchContainer: {
      flex: 0,
      marginTop: 14,
      marginBottom: 12,
    },

    searchWrap: {
      backgroundColor: theme.card,
      borderRadius: 12,
      minHeight: 46,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },

    searchInput: {
      flex: 1,
      minWidth: 0,
      fontSize: 14,
      color: theme.text,
      paddingVertical: 8,
      paddingHorizontal: 0,
      textAlignVertical: 'center',
    },

    body: {
      paddingTop: 4,
      paddingBottom: 40,
    },

    scrollContent: {
      flex: 0,
      gap: 10,
    },

    loading: {
      marginTop: 24,
    },

    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: compacto ? 12 : 20,
      paddingVertical: 28,
      gap: 10,
    },

    emptyText: {
      textAlign: 'center',
      color: theme.textMuted,
      fontSize: 13,
      lineHeight: 20,
      maxWidth: 420,
    },

    card: {
      backgroundColor: theme.card,
      borderRadius: 14,
      padding: compacto ? 12 : 14,
      minHeight: 66,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderWidth: theme.borderWidth,
      borderColor: theme.border,
    },

    cardInfo: {
      flex: 1,
      minWidth: 0,
    },

    name: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
      flexShrink: 1,
    },

    count: {
      fontSize: 12,
      color: theme.textMuted,
      marginTop: 3,
      flexShrink: 1,
    },

    addBtn: {
      backgroundColor: theme.primary,
      borderRadius: 14,
      paddingVertical: 15,
      paddingHorizontal: 18,
      minHeight: 50,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: 8,
    },

    addBtnText: {
      color: theme.onPrimary,
      fontWeight: '700',
      fontSize: 15,
      textAlign: 'center',
    },
  });
