import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
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
import Text from '../components/AppText';

import {
  assinarConfirmacoesPeriodo,
  ConfirmacaoDatada,
} from './services/confirmacoes';

import {
  Period,
  TIPOS,
  nomeTipoRefeicao,
  intervaloDoPeriodo,
} from './services/refeicaoUtils';

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
const SEMANAS = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5'];

const TEXTO_PERIODO: Record<Period, { titulo: string; quando: string; lista: string }> = {
  semana: {
    titulo: 'Demanda da semana',
    quando: 'nesta semana',
    lista: 'Demanda por dia',
  },
  mes: {
    titulo: 'Demanda do mês',
    quando: 'neste mês',
    lista: 'Demanda por semana',
  },
  ano: {
    titulo: 'Demanda do ano',
    quando: 'neste ano',
    lista: 'Demanda por mês',
  },
};

const screenWidth = Dimensions.get('window').width;

// Em qual "grupo" da lista inferior a data cai
function rotuloGrupo(period: Period, dataStr: string): string | undefined {
  const [ano, mes, dia] = dataStr.split('-').map(Number);

  if (period === 'ano') return MESES[mes - 1];
  if (period === 'mes') return SEMANAS[Math.ceil(dia / 7) - 1];

  const dow = new Date(ano, mes - 1, dia).getDay(); // 1..5 = Seg..Sex
  return DIAS[dow - 1]; // fim de semana → undefined
}

// Proporcional ao maior valor, para servir em semana, mês e ano
function barColor(valor: number, maior: number) {
  const proporcao = maior > 0 ? valor / maior : 0;

  if (proporcao >= 0.66) return '#2e7d32';
  if (proporcao >= 0.33) return '#f9a825';
  return '#c62828';
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
  const [confirmacoes, setConfirmacoes] = useState<ConfirmacaoDatada[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    setCarregando(true);
    setConfirmacoes([]);

    const [inicio, fim] = intervaloDoPeriodo(period);

    return assinarConfirmacoesPeriodo(
      inicio,
      fim,
      (lista) => {
        setConfirmacoes(lista);
        setCarregando(false);
      },
      () => setCarregando(false)
    );
  }, [period]);

  const { totais, grupos } = useMemo(() => {
    const totais: Record<string, number> = { Café: 0, Almoço: 0, Jantar: 0 };
    const grupos: Record<string, number> = {};

    confirmacoes.forEach((c) => {
      const rotulo = rotuloGrupo(period, c.data);

      Object.entries(c.respostas).forEach(([tipo, vaiComer]) => {
        if (!vaiComer) return;

        totais[tipo] = (totais[tipo] ?? 0) + 1;

        if (rotulo) {
          grupos[rotulo] = (grupos[rotulo] ?? 0) + 1;
        }
      });
    });

    return { totais, grupos };
  }, [confirmacoes, period]);

  const totalGeral = Object.values(totais).reduce((t, v) => t + v, 0);

  const ordenadas = useMemo(
    () => Object.entries(totais).sort((a, b) => b[1] - a[1]),
    [totais]
  );

  const maiorDemanda = ordenadas.length > 0 ? ordenadas[0] : null;
  const menorDemanda =
    ordenadas.length > 0 ? ordenadas[ordenadas.length - 1] : null;

  const chartData = useMemo(
    () => ({
      labels: [...TIPOS],
      datasets: [{ data: TIPOS.map((tipo) => totais[tipo] ?? 0) }],
    }),
    [totais]
  );

  const ordemGrupos =
    period === 'semana' ? DIAS : period === 'mes' ? SEMANAS : MESES;

  const texto = TEXTO_PERIODO[period];

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Estatísticas" />

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Demanda de refeições dos alunos</Text>

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

        {carregando ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 30 }} />
        ) : (
          <>
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>{texto.titulo}</Text>

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
                  color: (opacity = 1) => `rgba(90, 150, 90, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(60, 60, 60, ${opacity})`,
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
                <Text style={styles.totalLabel}>Demanda total</Text>

                <Text style={styles.totalValue}>{totalGeral} refeições</Text>

                <Text style={styles.totalDescription}>
                  Total de alunos que marcaram “Vou comer” {texto.quando}
                </Text>
              </View>
            </View>

            <View style={styles.highlightsRow}>
              <View style={[styles.highlightCard, styles.highlightGood]}>
                <Ionicons name="trending-up" size={20} color="#2e7d32" />

                <Text style={styles.highlightLabel}>Maior demanda</Text>

                <Text style={styles.highlightTurma}>
                  {maiorDemanda ? maiorDemanda[0] : '—'}
                </Text>

                <Text style={styles.highlightValue}>
                  {maiorDemanda ? maiorDemanda[1] : 0}
                </Text>
              </View>

              <View style={[styles.highlightCard, styles.highlightBad]}>
                <Ionicons name="trending-down" size={20} color="#c62828" />

                <Text style={styles.highlightLabel}>Menor demanda</Text>

                <Text style={styles.highlightTurma}>
                  {menorDemanda ? menorDemanda[0] : '—'}
                </Text>

                <Text style={styles.highlightValue}>
                  {menorDemanda ? menorDemanda[1] : 0}
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Demanda por refeição</Text>

            {TIPOS.map((tipo) => {
              const quantidade = totais[tipo] ?? 0;
              const maior = maiorDemanda?.[1] ?? 0;

              const largura =
                maior > 0 ? Math.min(100, (quantidade / maior) * 100) : 0;

              return (
                <View key={tipo} style={styles.rankRow}>
                  <View style={styles.rankIcon}>
                    <MaterialCommunityIcons
                      name={iconeRefeicao(tipo) as any}
                      size={19}
                      color={colors.primary}
                    />
                  </View>

                  <Text style={styles.rankTurma}>{tipo}</Text>

                  <View style={styles.rankBarBackground}>
                    <View
                      style={[
                        styles.rankBarFill,
                        {
                          width: `${largura}%`,
                          backgroundColor: barColor(quantidade, maior),
                        },
                      ]}
                    />
                  </View>

                  <Text style={styles.rankValue}>{quantidade}</Text>
                </View>
              );
            })}

            <Text style={styles.sectionTitle}>{texto.lista}</Text>

            {ordemGrupos.map((rotulo) => (
              <View key={rotulo} style={styles.dayRow}>
                <Text style={styles.dayName}>{rotulo}</Text>

                <View style={{ flex: 1 }}>
                  <Text style={styles.dayValue}>
                    {grupos[rotulo] ?? 0} refeições
                  </Text>

                  <Text style={styles.dayDescription}>
                    confirmações de consumo
                  </Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

type PeriodButtonProps = {
  testID: string;
  label: string;
  active: boolean;
  onPress: () => void;
};

function PeriodButton({ testID, label, active, onPress }: PeriodButtonProps) {
  return (
    <TouchableOpacity
      testID={testID}
      style={[styles.periodButton, active && styles.periodButtonActive]}
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
    width: 55,
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