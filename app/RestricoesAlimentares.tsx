import React, { useEffect, useMemo, useState } from 'react';

import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenHeader from '../components/ScreenHeader';
import ResponsiveContainer from '../components/ResponsiveContainer';
import { useResponsive } from '../hooks/useResponsive';

import {
  Aluno,
  listarAlunos,
} from './services/alunos';

import Text from '../components/AppText';
import { useAccessibility } from '../components/AccessibilityContext';

export default function RestricoesAlimentares() {
  const { theme } = useAccessibility();

  const {
    isSmallScreen,
    fontScale,
    horizontalPadding,
  } = useResponsive();

  const compacto = isSmallScreen || fontScale >= 1.2;

  const styles = useMemo(
    () => createStyles(theme, compacto),
    [theme, compacto]
  );

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function carregarAlunos() {
      try {
        const lista = await listarAlunos();

        const alunosComRestricao = lista.filter(
          (aluno) =>
            aluno.restricoesAlimentares &&
            aluno.restricoesAlimentares.trim().length > 0
        );

        if (ativo) {
          setAlunos(alunosComRestricao);
        }
      } catch (error) {
        console.error(
          'Erro ao carregar restrições alimentares:',
          error
        );
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarAlunos();

    return () => {
      ativo = false;
    };
  }, []);

  const renderItem = ({ item }: { item: Aluno }) => (
    <View style={styles.card}>
      <View style={styles.icon}>
        <Text style={styles.iconText}>!</Text>
      </View>

      <View style={styles.info}>
        <Text style={styles.nome}>
          {item.nome}
        </Text>

        {item.rm ? (
          <Text style={styles.rm}>
            RM: {item.rm}
          </Text>
        ) : null}

        <Text style={styles.label}>
          Restrição alimentar
        </Text>

        <Text style={styles.restricao}>
          {item.restricoesAlimentares}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Restrições alimentares" />

      {carregando ? (
        <ResponsiveContainer
          style={[
            styles.center,
            { paddingHorizontal: horizontalPadding },
          ]}
        >
          <ActivityIndicator
            size="large"
            color={theme.primary}
          />

          <Text style={styles.loadingText}>
            Carregando restrições...
          </Text>
        </ResponsiveContainer>
      ) : alunos.length === 0 ? (
        <ResponsiveContainer
          style={[
            styles.center,
            { paddingHorizontal: horizontalPadding },
          ]}
        >
          <Text style={styles.emptyTitle}>
            Nenhuma restrição cadastrada
          </Text>

          <Text style={styles.emptyText}>
            Os alunos que informarem restrições alimentares
            aparecerão aqui.
          </Text>
        </ResponsiveContainer>
      ) : (
        <FlatList
          data={alunos}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.list,
            { paddingHorizontal: horizontalPadding },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: any, compacto: boolean) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.background,
    },

    list: {
      paddingTop: compacto ? 12 : 20,
      paddingBottom: 40,
      width: '100%',
      alignSelf: 'center',
      maxWidth: 960,
    },

    card: {
      width: '100%',
      backgroundColor: theme.card,
      borderRadius: compacto ? 14 : 16,
      padding: compacto ? 12 : 16,
      marginBottom: compacto ? 10 : 12,
      flexDirection: 'row',
      alignItems: 'flex-start',
      borderColor: theme.border,
      borderWidth: theme.borderWidth,
      gap: compacto ? 9 : 12,
    },

    icon: {
      width: compacto ? 36 : 40,
      height: compacto ? 36 : 40,
      borderRadius: compacto ? 18 : 20,
      backgroundColor: theme.warningBg,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    iconText: {
      fontSize: compacto ? 18 : 20,
      fontWeight: '800',
      color: theme.warning,
    },

    info: {
      flex: 1,
      minWidth: 0,
    },

    nome: {
      fontSize: compacto ? 15 : 16,
      fontWeight: '800',
      color: theme.text,
      flexShrink: 1,
    },

    rm: {
      fontSize: compacto ? 11 : 12,
      color: theme.textMuted,
      marginTop: 3,
    },

    label: {
      fontSize: compacto ? 10 : 11,
      fontWeight: '700',
      color: theme.textMuted,
      marginTop: compacto ? 10 : 12,
    },

    restricao: {
      fontSize: compacto ? 13 : 14,
      color: theme.text,
      marginTop: 4,
      lineHeight: compacto ? 19 : 20,
      flexShrink: 1,
    },

    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: compacto ? 20 : 30,
      width: '100%',
      maxWidth: 600,
      alignSelf: 'center',
    },

    loadingText: {
      marginTop: 10,
      fontSize: compacto ? 13 : 14,
      color: theme.textMuted,
      textAlign: 'center',
    },

    emptyTitle: {
      fontSize: compacto ? 16 : 18,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'center',
    },

    emptyText: {
      marginTop: 8,
      fontSize: compacto ? 12 : 13,
      color: theme.textMuted,
      textAlign: 'center',
      lineHeight: compacto ? 18 : 19,
    },
  });
