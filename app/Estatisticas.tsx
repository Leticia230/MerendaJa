import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';

import ScreenHeader from '../components/ScreenHeader';
import { colors } from '../constants/theme';

import {
  assinarCardapioDia,
  Refeicao,
} from './services/cardapio';

import {
  assinarContagemConfirmacoes,
  ContagemRefeicao,
} from './services/confirmacoes';

type Period = 'semana' | 'mes' | 'ano';

type DiaData = {
  dia: string;
  refeicoes: Refeicao[];
  contagem: Record<number, ContagemRefeicao>;
};

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

const screenWidth = Dimensions.get('window').width;

function nomeTipoRefeicao(titulo: string) {
  const texto = titulo.toLowerCase();

  if (
    texto.includes('café') ||
    texto.includes('cafe') ||
    texto.includes('manhã') ||
    texto.includes('manha')
  ) {
    return 'Café';
  }

  if (
    texto.includes('almoço') ||
    texto.includes('almoco')
  ) {
    return 'Almoço';
  }

  if (
    texto.includes('jantar') ||
    texto.includes('janta')
  ) {
    return 'Jantar';
  }

  return titulo;
}

function iconeRefeicao(titulo: string) {
  const tipo = nomeTipoRefeicao(titulo);

  if (tipo === 'Café') return 'coffee-outline';
  if (tipo === 'Almoço') return 'food';
  if (tipo === 'Jantar') return 'food-variant';

  return 'silverware-fork-knife';
}

export default function StatisticsScreen() {
  const [period, setPeriod] = useState<Period>('semana');

  const [dias, setDias] = useState<DiaData[]>(
    DIAS.map((dia) => ({
      dia,
      refeicoes: [],
      contagem: {},
    }))
  );

  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    setCarregando(true);

    const unsubscribes: (() => void)[] = [];

    DIAS.forEach((dia) => {
      const unsubscribeCardapio = assinarCardapioDia(
        dia,
        (refeicoes) => {
          setDias((atual) =>
            atual.map((item) =>
              item.dia === dia
                ? {
                    ...item,
                    refeicoes,
                  }
                : item
            )
          );

          setCarregando(false);
        },
        (erro) => {
          console.error(
            `Erro ao carregar cardápio de ${dia}:`,
            erro
          );

          setCarregando(false);
        }
      );

      unsubscribes.push(unsubscribeCardapio);

      const unsubscribeConfirmacoes =
        assinarContagemConfirmacoes(
          dia,
          (contagem) => {
            setDias((atual) =>
              atual.map((item) =>
                item.dia === dia
                  ? {
                      ...item,
                      contagem,
                    }
                  : item
              )
            );
          },
          (erro) => {
            console.error(
              `Erro ao carregar confirmações de ${dia}:`,
              erro
            );
          }
        );

      unsubscribes.push(unsubscribeConfirmacoes);
    });

    return () => {
      unsubscribes.forEach((unsubscribe) =>
        unsubscribe()
      );
    };
  }, []);

  const dadosRefeicoes = useMemo(() => {
    const resultado: {
      dia: string;
      refeicao: string;
      tituloOriginal: string;
      quantidade: number;
    }[] = [];

    dias.forEach((dia) => {
      dia.refeicoes.forEach((refeicao, indice) => {
        const contagem = dia.contagem[indice];

        resultado.push({
          dia: dia.dia,
          refeicao: nomeTipoRefeicao(refeicao.titulo),
          tituloOriginal: refeicao.titulo,
          quantidade: contagem?.sim ?? 0,
        });
      });
    });

    return resultado;
  }, [dias]);

  const totais = useMemo(() => {
    const resultado: Record<string, number> = {};

    dadosRefeicoes.forEach((item) => {
      resultado[item.refeicao] =
        (resultado[item.refeicao] ?? 0) +
        item.quantidade;
    });

    return resultado;
  }, [dadosRefeicoes]);

  const totalGeral = Object.values(totais).reduce(
    (total, valor) => total + valor,
    0
  );

  const refeicoesOrdenadas = useMemo(() => {
    return Object.entries(totais).sort(
      (a, b) => b[1] - a[1]
    );
  }, [totais]);

  const maiorDemanda =
    refeicoesOrdenadas.length > 0
      ? refeicoesOrdenadas[0]
      : null;

  const menorDemanda =
    refeicoesOrdenadas.length > 0
      ? refeicoesOrdenadas[
          refeicoesOrdenadas.length - 1
        ]
      : null;

  const chartData = useMemo(() => {
    const tipos = ['Café', 'Almoço', 'Jantar'];

    const valores = tipos.map((tipo) =>
      dias.reduce((total, dia) => {
        return (
          total +
          dia.refeicoes.reduce(
            (subtotal, refeicao, indice) => {
              if (
                nomeTipoRefeicao(refeicao.titulo) !==
                tipo
              ) {
                return subtotal;
              }

              return (
                subtotal +
                (dia.contagem[indice]?.sim ?? 0)
              );
            },
            0
          )
        );
      }, 0)
    );

    return {
      labels: tipos,
      datasets: [
        {
          data: valores,
        },
      ],
    };
  }, [dias]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Estatísticas" />

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>
          Demanda de refeições dos alunos
        </Text>

        <View style={styles.periodSelector}>
          <PeriodButton
            testID="stats-period-semana"
            label="Semana"
            active={period === 'semana'}
            onPress={() => setPeriod('semana')}
          />

          <PeriodButton
            testID="stats-period-mes"
            label="Mês"
            active={period === 'mes'}
            onPress={() => setPeriod('mes')}
          />

          <PeriodButton
            testID="stats-period-ano"
            label="Ano"
            active={period === 'ano'}
            onPress={() => setPeriod('ano')}
          />
        </View>

        {period !== 'semana' ? (
          <View style={styles.avisoPeriodo}>
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color={colors.primary}
            />

            <Text style={styles.avisoPeriodoText}>
              O histórico mensal e anual será
              disponibilizado depois que adicionarmos
              a data às confirmações.
            </Text>
          </View>
        ) : carregando ? (
          <ActivityIndicator
            color={colors.primary}
            style={{ marginTop: 30 }}
          />
        ) : (
          <>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>
                Demanda desta semana
              </Text>

              <BarChart
                data={chartData}
                width={screenWidth - 44}
                height={240}
                fromZero
                yAxisLabel=""
                yAxisSuffix=""
                showValuesOnTopOfBars
                chartConfig={{
                  backgroundColor: '#fff',
                  backgroundGradientFrom: '#fff',
                  backgroundGradientTo: '#fff',
                  decimalPlaces: 0,
                  color: (opacity = 1) =>
                    `rgba(90, 150, 90, ${opacity})`,
                  labelColor: (opacity = 1) =>
                    `rgba(60, 60, 60, ${opacity})`,
                  barPercentage: 0.6,
                  propsForLabels: {
                    fontSize: 11,
                  },
                }}
                style={styles.chart}
              />
            </View>

            <View style={styles.totalCard}>
              <View style={styles.totalIcon}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={25}
                  color="#fff"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.totalLabel}>
                  Demanda total
                </Text>

                <Text style={styles.totalValue}>
                  {totalGeral} refeições
                </Text>

                <Text style={styles.totalDescription}>
                  Total de alunos que marcaram
                  “Vou comer” nesta semana
                </Text>
              </View>
            </View>

            <View style={styles.highlightsRow}>
              <View
                style={[
                  styles.highlightCard,
                  styles.highlightGood,
                ]}
              >
                <Ionicons
                  name="trending-up"
                  size={20}
                  color="#2e7d32"
                />

                <Text style={styles.highlightLabel}>
                  Maior demanda
                </Text>

                <Text style={styles.highlightTurma}>
                  {maiorDemanda
                    ? maiorDemanda[0]
                    : '—'}
                </Text>

                <Text style={styles.highlightValue}>
                  {maiorDemanda
                    ? maiorDemanda[1]
                    : 0}
                </Text>
              </View>

              <View
                style={[
                  styles.highlightCard,
                  styles.highlightBad,
                ]}
              >
                <Ionicons
                  name="trending-down"
                  size={20}
                  color="#c62828"
                />

                <Text style={styles.highlightLabel}>
                  Menor demanda
                </Text>

                <Text style={styles.highlightTurma}>
                  {menorDemanda
                    ? menorDemanda[0]
                    : '—'}
                </Text>

                <Text style={styles.highlightValue}>
                  {menorDemanda
                    ? menorDemanda[1]
                    : 0}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>
              Demanda por refeição
            </Text>

            {['Café', 'Almoço', 'Jantar'].map(
              (tipo) => {
                const quantidade =
                  totais[tipo] ?? 0;

                const maior =
                  maiorDemanda?.[1] ?? 0;

                const largura =
                  maior > 0
                    ? Math.min(
                        100,
                        (quantidade / maior) * 100
                      )
                    : 0;

                return (
                  <View
                    key={tipo}
                    style={styles.rankRow}
                  >
                    <View style={styles.rankIcon}>
                      <MaterialCommunityIcons
                        name={
                          iconeRefeicao(tipo) as any
                        }
                        size={19}
                        color={colors.primary}
                      />
                    </View>

                    <Text style={styles.rankTurma}>
                      {tipo}
                    </Text>

                    <View
                      style={
                        styles.rankBarBackground
                      }
                    >
                      <View
                        style={[
                          styles.rankBarFill,
                          {
                            width: `${largura}%`,
                            backgroundColor:
                              barColor(quantidade),
                          },
                        ]}
                      />
                    </View>

                    <Text style={styles.rankValue}>
                      {quantidade}
                    </Text>
                  </View>
                );
              }
            )}

            <Text style={styles.sectionTitle}>
              Demanda por dia
            </Text>

            {dias.map((dia) => {
              const totalDia =
                dia.refeicoes.reduce(
                  (total, refeicao, indice) => {
                    return (
                      total +
                      (dia.contagem[indice]?.sim ??
                        0)
                    );
                  },
                  0
                );

              return (
                <View
                  key={dia.dia}
                  style={styles.dayRow}
                >
                  <Text style={styles.dayName}>
                    {dia.dia}
                  </Text>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.dayValue}>
                      {totalDia} refeições
                    </Text>

                    <Text style={styles.dayDescription}>
                      confirmações de consumo
                    </Text>
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function barColor(value: number) {
  if (value >= 40) return '#2e7d32';
  if (value >= 20) return '#f9a825';
  return '#c62828';
}

type PeriodButtonProps = {
  testID: string;
  label: string;
  active: boolean;
  onPress: () => void;
};

function PeriodButton({
  testID,
  label,
  active,
  onPress,
}: PeriodButtonProps) {
  return (
    <TouchableOpacity
      testID={testID}
      style={[
        styles.periodButton,
        active && styles.periodButtonActive,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.periodButtonText,
          active && styles.periodButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },

  body: {
    padding: 22,
    paddingBottom: 40,
  },

  subtitle: {
    fontSize: 14,
    color: '#777',
    marginBottom: 16,
  },

  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 18,
  },

  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  periodButtonActive: {
    backgroundColor: colors.primary,
  },

  periodButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#777',
  },

  periodButtonTextActive: {
    color: '#fff',
  },

  avisoPeriodo: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  avisoPeriodoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: '#666',
  },

  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    elevation: 2,
  },

  chartTitle: {
    alignSelf: 'flex-start',
    marginLeft: 18,
    marginBottom: 8,
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },

  chart: {
    borderRadius: 16,
  },

  totalCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 18,
  },

  totalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  totalLabel: {
    color: '#E8F5E9',
    fontSize: 12,
    fontWeight: '600',
  },

  totalValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },

  totalDescription: {
    color: '#E8F5E9',
    fontSize: 11,
    marginTop: 3,
  },

  highlightsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },

  highlightCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#fff',
  },

  highlightGood: {
    borderLeftWidth: 4,
    borderLeftColor: '#2e7d32',
  },

  highlightBad: {
    borderLeftWidth: 4,
    borderLeftColor: '#c62828',
  },

  highlightLabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 6,
  },

  highlightTurma: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginTop: 2,
  },

  highlightValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 4,
  },

  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },

  rankIcon: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rankTurma: {
    width: 70,
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },

  rankBarBackground: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#eee',
    marginHorizontal: 8,
    overflow: 'hidden',
  },

  rankBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  rankValue: {
    width: 40,
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
  },

  dayRow: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  dayName: {
    width: 45,
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },

  dayValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },

  dayDescription: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
});