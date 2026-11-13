import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Refeicao, assinarCardapioData } from '../services/cardapio';
import Text from '../../components/AppText';
import {
  useAccessibility,
  AccessibilityTheme,
} from '../../components/AccessibilityContext';
import { dataISO, intervaloDoPeriodo } from '../services/refeicaoUtils';
import { useResponsive } from '../../hooks/useResponsive';
import ResponsiveContainer from '../../components/ResponsiveContainer';

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

function datasDaSemana(offset: number): string[] {
  const [segundaISO] = intervaloDoPeriodo('semana');
  const [a, m, d] = segundaISO.split('-').map(Number);

  return DAYS.map((_, i) =>
    dataISO(new Date(a, m - 1, d + offset * 7 + i))
  );
}

function formatarCurto(iso: string) {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

export default function CardapioScreen() {
  const { theme } = useAccessibility();
  const { isSmallScreen, fontScale } = useResponsive();

  const compacto = isSmallScreen || fontScale >= 1.2;

  const styles = useMemo(
    () => createStyles(theme, compacto),
    [theme, compacto]
  );

  const hojeISO = dataISO();

  const [semana, setSemana] = useState(0);

  const datas = useMemo(
    () => datasDaSemana(semana),
    [semana]
  );

  const [indiceDia, setIndiceDia] = useState(() =>
    Math.max(datasDaSemana(0).indexOf(hojeISO), 0)
  );

  const dataSelecionada = datas[indiceDia];

  const [refeicoes, setRefeicoes] = useState<Refeicao[]>([]);
  const [carregando, setCarregando] = useState(true);

  const router = useRouter();

  useEffect(() => {
    setCarregando(true);

    const unsubscribe = assinarCardapioData(
      dataSelecionada,
      (dados) => {
        setRefeicoes(dados);
        setCarregando(false);
      }
    );

    return unsubscribe;
  }, [dataSelecionada]);

  function abrirEdicao(refeicao: Refeicao, index: number) {
    router.push({
      pathname: '/AddRefeicao',
      params: {
        data: dataSelecionada,
        index: String(index),
        titulo: refeicao.titulo,
        horario: refeicao.horario,
        desc: refeicao.desc,
        icon: refeicao.icon,
        color: refeicao.color,
        tipo: refeicao.tipo ?? '',
      },
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerWrap}>
        <ResponsiveContainer style={styles.headerContent}>
          <Text style={styles.headerTitle}>Cardápio</Text>
        </ResponsiveContainer>
      </View>

      <View style={styles.semanaNav}>
        <Pressable
          testID="semana-anterior"
          onPress={() => setSemana((s) => Math.max(0, s - 1))}
          disabled={semana === 0}
          style={[
            styles.semanaBtn,
            semana === 0 && styles.semanaBtnDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Semana anterior"
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={22}
            color={theme.text}
          />
        </Pressable>

        <Text style={styles.semanaTexto}>
          {formatarCurto(datas[0])} a {formatarCurto(datas[4])}
        </Text>

        <Pressable
          testID="semana-seguinte"
          onPress={() => setSemana((s) => s + 1)}
          style={styles.semanaBtn}
          accessibilityRole="button"
          accessibilityLabel="Próxima semana"
        >
          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={theme.text}
          />
        </Pressable>
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
                style={[
                  styles.dayChip,
                  active && styles.dayChipActive,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`${d}, ${formatarCurto(datas[i])}`}
              >
                <Text
                  style={[
                    styles.dayText,
                    active && styles.dayTextActive,
                  ]}
                >
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
              Nenhuma refeição cadastrada para esse dia ainda.
            </Text>
          ) : (
            refeicoes.map((m, i) => (
              <Pressable
                key={i}
                style={styles.mealCard}
                testID={`cardapio-meal-${i}`}
                onPress={() => abrirEdicao(m, i)}
                accessibilityRole="button"
                accessibilityLabel={`Editar refeição ${m.titulo}, ${m.horario}`}
              >
                <View style={styles.mealInfo}>
                  <Text style={styles.mealTitle}>{m.titulo}</Text>
                  <Text style={styles.mealHorario}>{m.horario}</Text>
                  <Text style={styles.mealDesc}>{m.desc}</Text>
                </View>

                <View
                  style={[
                    styles.mealIcon,
                    compacto && styles.mealIconCompact,
                    { backgroundColor: m.color },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={m.icon as any}
                    size={26}
                    color="#fff"
                  />
                </View>
              </Pressable>
            ))
          )}

          <Pressable
            testID="add-refeicao"
            style={styles.addBtn}
            onPress={() =>
              router.push({
                pathname: '/AddRefeicao',
                params: {
                  data: dataSelecionada >= hojeISO ? dataSelecionada : '',
                },
              })
            }
            accessibilityRole="button"
          >
            <Text style={styles.addBtnText}>
              Adicionar refeição
            </Text>
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
    },

    headerTitle: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.text,
    },

    semanaNav: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: compacto ? 8 : 12,
      paddingHorizontal: 16,
      marginTop: 12,
    },

    semanaBtn: {
      width: 40,
      height: 40,
      flexShrink: 0,
      borderRadius: 20,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
    },

    semanaBtnDisabled: {
      opacity: 0.3,
    },

    semanaTexto: {
      flex: 1,
      maxWidth: 220,
      fontSize: 14,
      fontWeight: '700',
      color: theme.text,
      textAlign: 'center',
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
      borderWidth: 1,
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
      color: theme.primary,
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

    addBtn: {
      backgroundColor: theme.primary,
      borderRadius: 14,
      paddingVertical: 15,
      paddingHorizontal: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 6,
      minHeight: 50,
    },

    addBtnText: {
      color: theme.onPrimary,
      fontWeight: '700',
      fontSize: 15,
      textAlign: 'center',
    },
  });
