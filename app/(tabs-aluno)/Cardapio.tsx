import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useInstituicaoId } from '../services/useInstituicaoId';
import Text from '../../components/AppText';
import { useAccessibility } from '../../components/AccessibilityContext';
import { assinarCardapioData, Refeicao } from '../services/cardapio';
import { dataISO, intervaloDoPeriodo } from '../services/refeicaoUtils';
import { useResponsive } from '../../hooks/useResponsive';
import ResponsiveContainer from '../../components/ResponsiveContainer';

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

function datasDaSemana(): string[] {
  const [segundaISO] = intervaloDoPeriodo('semana');
  const [a, m, d] = segundaISO.split('-').map(Number);
  return DAYS.map((_, i) => dataISO(new Date(a, m - 1, d + i)));
}

function formatarCurto(iso: string) {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

export default function CardapioAlunoScreen() {
  const { theme } = useAccessibility();
  const { isSmallScreen, fontScale } = useResponsive();

  const compacto = isSmallScreen || fontScale >= 1.2;
  const styles = createStyles(theme, compacto);

  const datas = useMemo(() => datasDaSemana(), []);

  const [indiceDia, setIndiceDia] = useState(() =>
    Math.max(datas.indexOf(dataISO()), 0)
  );

  const dataSelecionada = datas[indiceDia];

  const [refeicoes, setRefeicoes] = useState<Refeicao[]>([]);
  const [carregando, setCarregando] = useState(true);

  const { instituicaoId, carregando: carregandoInstituicao } = useInstituicaoId();

  useEffect(() => {
    if (carregandoInstituicao) return;

    if (!instituicaoId) {
      setRefeicoes([]);
      setCarregando(false);
      return;
    }

    setCarregando(true);

    const unsubscribe = assinarCardapioData(
      dataSelecionada,
      (dados) => {
        setRefeicoes(dados);
        setCarregando(false);
      },
      () => setCarregando(false),
      instituicaoId
    );

    return unsubscribe;
  }, [dataSelecionada, instituicaoId, carregandoInstituicao]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerWrap}>
        <ResponsiveContainer style={styles.headerContent}>
          <Text style={styles.headerTitle}>Cardápio</Text>
        </ResponsiveContainer>
      </View>

      <View style={styles.daysWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daysRow}
        >
          {DAYS.map((d, i) => {
            const active = i === indiceDia;

            return (
              <Pressable
                key={d}
                testID={`day-chip-${d}`}
                onPress={() => setIndiceDia(i)}
                style={[styles.dayChip, active && styles.dayChipActive]}
              >
                <Text style={[styles.dayText, active && styles.dayTextActive]}>
                  {d} {formatarCurto(datas[i])}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <ResponsiveContainer>
          {carregando ? (
            <ActivityIndicator
              color={theme.primary}
              style={{ marginTop: 20 }}
            />
          ) : refeicoes.length === 0 ? (
            <Text style={styles.emptyText}>
              A instituição ainda não cadastrou o cardápio desse dia.
            </Text>
          ) : (
            refeicoes.map((m, i) => (
              <View
                key={i}
                style={styles.mealCard}
                testID={`cardapio-meal-${i}`}
              >
                <View style={styles.mealInfo}>
                  <Text style={styles.mealTitle}>{m.titulo}</Text>
                  <Text style={styles.mealHorario}>{m.horario}</Text>
                  <Text style={styles.mealDesc}>{m.desc}</Text>
                </View>

                <View style={[styles.mealIcon, compacto && styles.mealIconCompact, { backgroundColor: m.color }]}>
                  <MaterialCommunityIcons
                    name={m.icon as any}
                    size={26}
                    color="#fff"
                  />
                </View>
              </View>
            ))
          )}
        </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any, compacto = false) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.background,
    },

    headerWrap: {
      backgroundColor: theme.header,
      paddingTop: 20,
      paddingBottom: 18,
      alignItems: 'center',
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },

    headerContent: {
      alignItems: 'center',
    },

    headerTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.text,
    },

    daysWrap: {
      paddingVertical: 12,
    },

    daysRow: {
      paddingHorizontal: 16,
      gap: compacto ? 6 : 8,
      minHeight: 56,
      alignItems: 'center',
    },

    dayChip: {
      minHeight: 40,
      paddingHorizontal: compacto ? 14 : 18,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: theme.card,
      borderWidth: theme.borderWidth || 1,
      borderColor: theme.inputBorder,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    dayChipActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },

    dayText: {
      color: theme.text,
      fontWeight: '700',
      fontSize: 13,
    },

    dayTextActive: {
      color: theme.onPrimary,
    },

    body: {
      paddingTop: 4,
      paddingBottom: 30,
    },

    emptyText: {
      textAlign: 'center',
      color: theme.textMuted,
      fontSize: 13,
      marginTop: 24,
      paddingHorizontal: 8,
    },

    mealCard: {
      backgroundColor: theme.card,
      borderRadius: 14,
      padding: compacto ? 12 : 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12,
      borderWidth: theme.borderWidth,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },

    mealInfo: {
      flex: 1,
      minWidth: 0,
    },

    mealTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 4,
      flexShrink: 1,
    },

    mealHorario: {
      fontSize: 12,
      color: theme.primaryDark,
      fontWeight: '700',
      marginBottom: 2,
      flexShrink: 1,
    },

    mealDesc: {
      fontSize: 12,
      color: theme.textMuted,
      lineHeight: 17,
      flexShrink: 1,
    },

    mealIcon: {
      width: 54,
      height: 54,
      flexShrink: 0,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },

    mealIconCompact: {
      width: 46,
      height: 46,
    },
  });
