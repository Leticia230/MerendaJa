
import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useInstituicaoId } from '../services/useInstituicaoId';
import Text from '../../components/AppText';
import { useAccessibility } from '../../components/AccessibilityContext';
import { assinarCardapioData, Refeicao } from '../services/cardapio';
import { dataISO, intervaloDoPeriodo } from '../services/refeicaoUtils';

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
  const styles = createStyles(theme);

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
        <Text style={styles.headerTitle}>Cardápio</Text>
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
              <View style={{ flex: 1 }}>
                <Text style={styles.mealTitle}>{m.titulo}</Text>
                <Text style={styles.mealHorario}>{m.horario}</Text>
                <Text style={styles.mealDesc}>{m.desc}</Text>
              </View>

              <View style={[styles.mealIcon, { backgroundColor: m.color }]}>
                <MaterialCommunityIcons
                  name={m.icon as any}
                  size={26}
                  color="#fff"
                />
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
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
    gap: 8,
    height: 56,
    alignItems: 'center',
  },

  dayChip: {
    height: 36,
    paddingHorizontal: 18,
    borderRadius: 18,
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
    padding: 16,
    paddingBottom: 30,
    gap: 12,
  },

  emptyText: {
    textAlign: 'center',
    color: theme.textMuted,
    fontSize: 13,
    marginTop: 24,
  },

  mealCard: {
    backgroundColor: theme.card,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: theme.borderWidth,
    borderColor: theme.border,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  mealTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 4,
  },

  mealHorario: {
    fontSize: 12,
    color: theme.primaryDark,
    fontWeight: '700',
    marginBottom: 2,
  },

  mealDesc: {
    fontSize: 12,
    color: theme.textMuted,
    lineHeight: 17,
  },

  mealIcon: {
    width: 54,
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
