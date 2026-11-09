import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenHeader from '../components/ScreenHeader';
import {
  Aluno,
  listarAlunos,
} from './services/alunos';
import Text from '../components/AppText';
import { useAccessibility } from '../components/AccessibilityContext';

export default function RestricoesAlimentares() {
  const { theme } = useAccessibility();
  const styles = createStyles(theme);

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarAlunos() {
      try {
        const lista = await listarAlunos();

        const alunosComRestricao = lista.filter(
          (aluno) =>
            aluno.restricoesAlimentares &&
            aluno.restricoesAlimentares.trim().length > 0
        );

        setAlunos(alunosComRestricao);
      } catch (error) {
        console.error(
          'Erro ao carregar restrições alimentares:',
          error
        );
      } finally {
        setCarregando(false);
      }
    }

    carregarAlunos();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Restrições alimentares" />

      {carregando ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color={theme.primary}
          />

          <Text style={styles.loadingText}>
            Carregando restrições...
          </Text>
        </View>
      ) : alunos.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyTitle}>
            Nenhuma restrição cadastrada
          </Text>

          <Text style={styles.emptyText}>
            Os alunos que informarem restrições alimentares
            aparecerão aqui.
          </Text>
        </View>
      ) : (
        <FlatList
          data={alunos}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
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
          )}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.background,
    },

    list: {
      padding: 20,
      paddingBottom: 40,
    },

    card: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'flex-start',
      borderColor: theme.border,
      borderWidth: theme.borderWidth,
    },

    icon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.warningBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    iconText: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.warning,
    },

    info: {
      flex: 1,
    },

    nome: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.text,
    },

    rm: {
      fontSize: 12,
      color: theme.textMuted,
      marginTop: 3,
    },

    label: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.textMuted,
      marginTop: 12,
    },

    restricao: {
      fontSize: 14,
      color: theme.text,
      marginTop: 4,
      lineHeight: 20,
    },

    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 30,
    },

    loadingText: {
      marginTop: 10,
      fontSize: 14,
      color: theme.textMuted,
    },

    emptyTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'center',
    },

    emptyText: {
      marginTop: 8,
      fontSize: 13,
      color: theme.textMuted,
      textAlign: 'center',
      lineHeight: 19,
    },
  });