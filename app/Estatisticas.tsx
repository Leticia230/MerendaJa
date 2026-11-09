
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
import Text from '../components/AppText';
import { useAccessibility } from '../components/AccessibilityContext';

import {
  assinarConfirmacoesPeriodo,
  ConfirmacaoDatada,
} from './services/confirmacoes';

import {
  Period,
  TIPOS,
  dataISO,
  nomeTipoRefeicao,
} from './services/refeicaoUtils';

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

const DIAS_CALENDARIO = [
  'Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb',
];

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril',
  'Maio', 'Junho', 'Julho', 'Agosto',
  'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

const MESES_CURTOS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

const SEMANAS = [
  'Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5',
];

const screenWidth = Dimensions.get('window').width;

const TEXTO_PERIODO: Record<
  Period,
  { titulo: string; lista: string }
> = {
  semana: {
    titulo: 'Demanda da semana',
    lista: 'Demanda por dia',
  },
  mes: {
    titulo: 'Demanda do mês',
    lista: 'Demanda por semana',
  },
  ano: {
    titulo: 'Demanda do ano',
    lista: 'Demanda por mês',
  },
};

// Converte uma data para YYYY-MM-DD sem utilizar UTC.
function formatarData(data: Date) {
  return dataISO(data);
}

// Calcula o intervalo do período selecionado.
function calcularIntervalo(
  period: Period,
  dataSelecionada: Date
): [string, string] {
  const ano = dataSelecionada.getFullYear();
  const mes = dataSelecionada.getMonth();
  const dia = dataSelecionada.getDate();

  if (period === 'semana') {
    const segunda = new Date(ano, mes, dia);
    const diaSemana = segunda.getDay();

    const deslocamento = diaSemana === 0 ? -6 : 1 - diaSemana;

    segunda.setDate(segunda.getDate() + deslocamento);

    const sexta = new Date(segunda);
    sexta.setDate(segunda.getDate() + 4);

    return [formatarData(segunda), formatarData(sexta)];
  }

  if (period === 'mes') {
    const inicio = new Date(ano, mes, 1);
    const fim = new Date(ano, mes + 1, 0);

    return [formatarData(inicio), formatarData(fim)];
  }

  return [
    `${ano}-01-01`,
    `${ano}-12-31`,
  ];
}

// Formata o intervalo para exibição.
function formatarIntervalo(
  period: Period,
  dataSelecionada: Date
) {
  const [inicio, fim] = calcularIntervalo(
    period,
    dataSelecionada
  );

  if (period === 'ano') {
    return `${dataSelecionada.getFullYear()}`;
  }

  if (period === 'mes') {
    return `${MESES[dataSelecionada.getMonth()]} de ${dataSelecionada.getFullYear()}`;
  }

  const [ano1, mes1, dia1] = inicio.split('-');
  const [ano2, mes2, dia2] = fim.split('-');

  return `${dia1}/${mes1}/${ano1} a ${dia2}/${mes2}/${ano2}`;
}

// Identifica o grupo ao qual cada confirmação pertence.
function rotuloGrupo(
  period: Period,
  dataStr: string
): string | undefined {
  const [ano, mes, dia] = dataStr.split('-').map(Number);

  if (period === 'ano') {
    return MESES_CURTOS[mes - 1];
  }

  if (period === 'mes') {
    return SEMANAS[Math.ceil(dia / 7) - 1];
  }

  const dow = new Date(ano, mes - 1, dia).getDay();

  return dow >= 1 && dow <= 5
    ? DIAS[dow - 1]
    : undefined;
}

// Define a cor da barra de acordo com a demanda.
function barColor(valor: number, maior: number) {
  const proporcao = maior > 0 ? valor / maior : 0;

  if (proporcao >= 0.66) return '#2e7d32';
  if (proporcao >= 0.33) return '#f9a825';

  return '#c62828';
}

// Seleciona o ícone correspondente à refeição.
function iconeRefeicao(titulo: string) {
  const tipo = nomeTipoRefeicao(titulo);

  if (tipo === 'Café') return 'coffee-outline';
  if (tipo === 'Almoço') return 'food';
  if (tipo === 'Jantar') return 'food-variant';

  return 'silverware-fork-knife';
}

export default function StatisticsScreen() {
  const { theme } = useAccessibility();
  const styles = createStyles(theme);

  const hoje = new Date();

  const [period, setPeriod] = useState<Period>('semana');

  const [dataSelecionada, setDataSelecionada] = useState(
    new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate())
  );

  // Mês que está sendo exibido no calendário.
  const [mesCalendario, setMesCalendario] = useState(
    new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  );

  const [confirmacoes, setConfirmacoes] = useState<
    ConfirmacaoDatada[]
  >([]);

  const [carregando, setCarregando] = useState(true);

  // Consulta o Firebase de acordo com a data e o período escolhidos.
  useEffect(() => {
    setCarregando(true);
    setConfirmacoes([]);

    const [inicio, fim] = calcularIntervalo(
      period,
      dataSelecionada
    );

    const cancelar = assinarConfirmacoesPeriodo(
      inicio,
      fim,
      (lista) => {
        setConfirmacoes(lista);
        setCarregando(false);
      },
      (erro) => {
        console.error('Erro ao carregar estatísticas:', erro);
        setCarregando(false);
      }
    );

    return cancelar;
  }, [period, dataSelecionada]);

  // Navegação do calendário.
  function mudarCalendario(direcao: number) {
    setMesCalendario((anterior) => {
      if (period === 'ano') {
        return new Date(
          anterior.getFullYear() + direcao,
          anterior.getMonth(),
          1
        );
      }

      return new Date(
        anterior.getFullYear(),
        anterior.getMonth() + direcao,
        1
      );
    });
  }

  // Seleciona uma data no calendário.
  function selecionarData(dia: number) {
    const novaData = new Date(
      mesCalendario.getFullYear(),
      mesCalendario.getMonth(),
      dia
    );

    setDataSelecionada(novaData);
  }

  // Calendário mensal com 42 posições.
  const diasCalendario = useMemo(() => {
    const ano = mesCalendario.getFullYear();
    const mes = mesCalendario.getMonth();

    const primeiroDia = new Date(ano, mes, 1).getDay();
    const quantidadeDias = new Date(ano, mes + 1, 0).getDate();

    return Array.from({ length: 42 }, (_, indice) => {
      const dia = indice - primeiroDia + 1;

      return dia >= 1 && dia <= quantidadeDias
        ? dia
        : null;
    });
  }, [mesCalendario]);

  const intervaloSelecionado = calcularIntervalo(
    period,
    dataSelecionada
  );

  const dataSelecionadaISO = formatarData(dataSelecionada);

  // Calcula as quantidades de respostas positivas e negativas.
  const {
    totais,
    recusas,
    grupos,
    gruposRecusas,
  } = useMemo(() => {
    const totais: Record<string, number> = {
      Café: 0,
      Almoço: 0,
      Jantar: 0,
    };

    const recusas: Record<string, number> = {
      Café: 0,
      Almoço: 0,
      Jantar: 0,
    };

    const grupos: Record<string, number> = {};
    const gruposRecusas: Record<string, number> = {};

    confirmacoes.forEach((c) => {
      const rotulo = rotuloGrupo(period, c.data);

      Object.entries(c.respostas ?? {}).forEach(
        ([tipo, vaiComer]) => {
          const tipoNormalizado = nomeTipoRefeicao(tipo);

          if (!TIPOS.includes(tipoNormalizado as any)) {
            return;
          }

          if (vaiComer === true) {
            totais[tipoNormalizado] =
              (totais[tipoNormalizado] ?? 0) + 1;

            if (rotulo) {
              grupos[rotulo] =
                (grupos[rotulo] ?? 0) + 1;
            }
          } else if (vaiComer === false) {
            recusas[tipoNormalizado] =
              (recusas[tipoNormalizado] ?? 0) + 1;

            if (rotulo) {
              gruposRecusas[rotulo] =
                (gruposRecusas[rotulo] ?? 0) + 1;
            }
          }
        }
      );
    });

    return {
      totais,
      recusas,
      grupos,
      gruposRecusas,
    };
  }, [confirmacoes, period]);

  const totalGeral = Object.values(totais).reduce(
    (total, valor) => total + valor,
    0
  );

  const ordenadas = useMemo(
    () => Object.entries(totais).sort((a, b) => b[1] - a[1]),
    [totais]
  );

  const maiorDemanda = ordenadas[0] ?? null;
  const menorDemanda = ordenadas[ordenadas.length - 1] ?? null;

  const chartData = useMemo(
    () => ({
      labels: [...TIPOS],
      datasets: [
        {
          data: TIPOS.map((tipo) => totais[tipo] ?? 0),
        },
      ],
    }),
    [totais]
  );

  const ordemGrupos =
    period === 'semana'
      ? DIAS
      : period === 'mes'
        ? SEMANAS
        : MESES_CURTOS;

  const texto = TEXTO_PERIODO[period];

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

        {/* Seleção do período */}
        <View style={styles.periodSelector}>
          <PeriodButton
            label="Semana"
            active={period === 'semana'}
            onPress={() => setPeriod('semana')}
            theme={theme}
          />

          <PeriodButton
            label="Mês"
            active={period === 'mes'}
            onPress={() => setPeriod('mes')}
            theme={theme}
          />

          <PeriodButton
            label="Ano"
            active={period === 'ano'}
            onPress={() => setPeriod('ano')}
            theme={theme}
          />
        </View>

        {/* Calendário */}
        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <View style={styles.calendarHeading}>
              <Ionicons
                name="calendar-outline"
                size={21}
                color={theme.primary}
              />

              <Text style={styles.calendarTitle}>
                Escolher período
              </Text>
            </View>

            <Text style={styles.calendarMode}>
              {period === 'semana'
                ? 'Selecione um dia'
                : period === 'mes'
                  ? 'Selecione um mês'
                  : 'Selecione um ano'}
            </Text>
          </View>

          <View style={styles.calendarNavigation}>
            <TouchableOpacity
              style={styles.calendarArrow}
              onPress={() => mudarCalendario(-1)}
              accessibilityRole="button"
              accessibilityLabel="Período anterior"
            >
              <Ionicons
                name="chevron-back"
                size={21}
                color={theme.primary}
              />
            </TouchableOpacity>

            <Text style={styles.calendarMonthTitle}>
              {period === 'ano'
                ? mesCalendario.getFullYear()
                : `${MESES[mesCalendario.getMonth()]} ${mesCalendario.getFullYear()}`}
            </Text>

            <TouchableOpacity
              style={styles.calendarArrow}
              onPress={() => mudarCalendario(1)}
              accessibilityRole="button"
              accessibilityLabel="Próximo período"
            >
              <Ionicons
                name="chevron-forward"
                size={21}
                color={theme.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Dias da semana */}
          <View style={styles.calendarGrid}>
            {DIAS_CALENDARIO.map((dia, index) => (
              <View key={index} style={styles.calendarCell}>
                <Text style={styles.calendarDayHeader}>
                  {dia}
                </Text>
              </View>
            ))}
          </View>

          {/* Dias do mês */}
          <View style={styles.calendarGrid}>
            {diasCalendario.map((dia, index) => {
              if (dia === null) {
                return (
                  <View
                    key={`vazio-${index}`}
                    style={styles.calendarCell}
                  />
                );
              }

              const dataAtual = new Date(
                mesCalendario.getFullYear(),
                mesCalendario.getMonth(),
                dia
              );

              const selecionado =
                formatarData(dataAtual) === dataSelecionadaISO;

              const hojeAtual =
                formatarData(dataAtual) === formatarData(hoje);

              return (
                <View
                  key={`${mesCalendario.getMonth()}-${dia}`}
                  style={styles.calendarCell}
                >
                  <TouchableOpacity
                    style={[
                      styles.calendarDay,
                      selecionado && styles.calendarDaySelected,
                      !selecionado && hojeAtual && styles.calendarDayToday,
                    ]}
                    onPress={() => selecionarData(dia)}
                    accessibilityRole="button"
                    accessibilityLabel={`Selecionar dia ${dia}`}
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        selecionado && styles.calendarDayTextSelected,
                        !selecionado && hojeAtual && styles.calendarDayTextToday,
                      ]}
                    >
                      {dia}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          <View style={styles.calendarDivider} />

          {/* Período selecionado */}
          <View style={styles.selectedPeriod}>
            <View style={styles.selectedPeriodIcon}>
              <Ionicons
                name="calendar"
                size={18}
                color={theme.primary}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.selectedPeriodLabel}>
                Período selecionado
              </Text>

              <Text style={styles.selectedPeriodValue}>
                {formatarIntervalo(period, dataSelecionada)}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                const agora = new Date();

                const hojeAtual = new Date(
                  agora.getFullYear(),
                  agora.getMonth(),
                  agora.getDate()
                );

                setDataSelecionada(hojeAtual);

                setMesCalendario(
                  new Date(agora.getFullYear(), agora.getMonth(), 1)
                );
              }}
              style={styles.todayButton}
            >
              <Text style={styles.todayButtonText}>
                Hoje
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {carregando ? (
          <ActivityIndicator
            color={theme.primary}
            size="large"
            style={{ marginTop: 30 }}
          />
        ) : (
          <>
            {/* Gráfico principal */}
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>
                {texto.titulo}
              </Text>

              <Text style={styles.chartSubtitle}>
                Alunos que marcaram "Vou comer"
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
                  backgroundColor: theme.card,
                  backgroundGradientFrom: theme.card,
                  backgroundGradientTo: theme.card,
                  decimalPlaces: 0,
                  color: (opacity = 1) =>
                    `rgba(90, 150, 90, ${opacity})`,
                  labelColor: (opacity = 1) =>
                    theme.textSecondary,
                  barPercentage: 0.6,
                  propsForLabels: {
                    fontSize: 11,
                  },
                }}
                style={styles.chart}
              />
            </View>

            {/* Demanda total */}
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
                  Total de confirmações positivas no período
                </Text>
              </View>
            </View>

            {/* Maior e menor demanda */}
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
                  color={theme.success}
                />

                <Text style={styles.highlightLabel}>
                  Maior demanda
                </Text>

                <Text style={styles.highlightTurma}>
                  {maiorDemanda ? maiorDemanda[0] : '—'}
                </Text>

                <Text style={styles.highlightValue}>
                  {maiorDemanda ? maiorDemanda[1] : 0}
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
                  color={theme.error}
                />

                <Text style={styles.highlightLabel}>
                  Menor demanda
                </Text>

                <Text style={styles.highlightTurma}>
                  {menorDemanda ? menorDemanda[0] : '—'}
                </Text>

                <Text style={styles.highlightValue}>
                  {menorDemanda ? menorDemanda[1] : 0}
                </Text>
              </View>
            </View>

            {/* Demanda por refeição */}
            <Text style={styles.sectionTitle}>
              Demanda por refeição
            </Text>

            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={styles.legendGreen} />
                <Text style={styles.legendText}>
                  Querem
                </Text>
              </View>

              <View style={styles.legendItem}>
                <View style={styles.legendGray} />
                <Text style={styles.legendText}>
                  Não querem
                </Text>
              </View>
            </View>

            {TIPOS.map((tipo) => {
              const quantidade = totais[tipo] ?? 0;
              const quantidadeRecusa = recusas[tipo] ?? 0;

              const maior = Math.max(
                ...TIPOS.map((t) => totais[t] ?? 0)
              );

              const largura =
                maior > 0
                  ? Math.min(100, (quantidade / maior) * 100)
                  : 0;

              return (
                <View key={tipo} style={styles.rankRow}>
                  <View style={styles.rankIcon}>
                    <MaterialCommunityIcons
                      name={iconeRefeicao(tipo) as any}
                      size={21}
                      color={theme.primary}
                    />
                  </View>

                  <View style={styles.rankInfo}>
                    <Text style={styles.rankTurma}>
                      {tipo}
                    </Text>

                    <View style={styles.rankNumbers}>
                      <Text style={styles.rankWant}>
                        {quantidade} querem
                      </Text>

                      <Text style={styles.rankSeparator}>
                        ·
                      </Text>

                      <Text style={styles.rankRefuse}>
                        {quantidadeRecusa} não querem
                      </Text>
                    </View>

                    <View style={styles.rankBarBackground}>
                      <View
                        style={[
                          styles.rankBarFill,
                          {
                            width: `${largura}%`,
                            backgroundColor: barColor(
                              quantidade,
                              maior
                            ),
                          },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              );
            })}

            {/* Detalhamento do período */}
            <Text style={styles.sectionTitle}>
              {texto.lista}
            </Text>

            {ordemGrupos.map((rotulo) => {
              const quantidade = grupos[rotulo] ?? 0;
              const quantidadeRecusa =
                gruposRecusas[rotulo] ?? 0;

              return (
                <View key={rotulo} style={styles.dayRow}>
                  <Text style={styles.dayName}>
                    {rotulo}
                  </Text>

                  <View style={{ flex: 1 }}>
                    <View style={styles.dayNumbers}>
                      <Text style={styles.dayValue}>
                        {quantidade} querem
                      </Text>

                      <Text style={styles.daySeparator}>
                        ·
                      </Text>

                      <Text style={styles.dayRefusal}>
                        {quantidadeRecusa} não querem
                      </Text>
                    </View>

                    <Text style={styles.dayDescription}>
                      Respostas registradas
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

type PeriodButtonProps = {
  label: string;
  active: boolean;
  onPress: () => void;
  theme: any;
};

function PeriodButton({
  label,
  active,
  onPress,
  theme,
}: PeriodButtonProps) {
  const styles = createStyles(theme);

  return (
    <TouchableOpacity
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

const createStyles = (theme: any) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.background,
  },

  body: {
    padding: 22,
    paddingBottom: 40,
  },

  subtitle: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 16,
  },

  periodSelector: {
    flexDirection: 'row',
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
    borderWidth: theme.borderWidth,
    borderColor: theme.border,
  },

  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },

  periodButtonActive: {
    backgroundColor: theme.primary,
  },

  periodButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.textSecondary,
  },

  periodButtonTextActive: {
    color: theme.onPrimary,
  },

  // Calendário

  calendarCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: theme.borderWidth,
    borderColor: theme.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  calendarHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  calendarTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.text,
  },

  calendarMode: {
    fontSize: 10,
    color: theme.textMuted,
  },

  calendarNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  calendarArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  calendarMonthTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: theme.text,
  },

  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  calendarCell: {
    width: '14.2857%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  calendarDayHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.textMuted,
  },

  calendarDay: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  calendarDaySelected: {
    backgroundColor: theme.primary,
  },

  calendarDayToday: {
    borderWidth: 1.5,
    borderColor: theme.primary,
  },

  calendarDayText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.text,
  },

  calendarDayTextSelected: {
    color: theme.onPrimary,
    fontWeight: '800',
  },

  calendarDayTextToday: {
    color: theme.primaryDark,
    fontWeight: '800',
  },

  calendarDivider: {
    height: 1,
    backgroundColor: theme.divider,
    marginVertical: 14,
  },

  selectedPeriod: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  selectedPeriodIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },

  selectedPeriodLabel: {
    fontSize: 10,
    color: theme.textMuted,
  },

  selectedPeriodValue: {
    fontSize: 13,
    fontWeight: '800',
    color: theme.text,
    marginTop: 3,
  },

  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9,
    backgroundColor: theme.soft,
  },

  todayButtonText: {
    color: theme.primaryDark,
    fontSize: 11,
    fontWeight: '800',
  },

  // Gráfico

  chartCard: {
    backgroundColor: theme.card,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: theme.borderWidth,
    borderColor: theme.border,
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
    marginBottom: 4,
    fontSize: 15,
    fontWeight: '700',
    color: theme.text,
  },

  chartSubtitle: {
    alignSelf: 'flex-start',
    marginLeft: 18,
    marginBottom: 8,
    fontSize: 11,
    color: theme.textMuted,
  },

  chart: {
    borderRadius: 16,
  },

  // Total

  totalCard: {
    backgroundColor: theme.primary,
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

  // Destaques

  highlightsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },

  highlightCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    backgroundColor: theme.card,
    borderWidth: theme.borderWidth,
    borderColor: theme.border,
  },

  highlightGood: {
    borderLeftWidth: 4,
    borderLeftColor: theme.success,
  },

  highlightBad: {
    borderLeftWidth: 4,
    borderLeftColor: theme.error,
  },

  highlightLabel: {
    fontSize: 11,
    color: theme.textMuted,
    marginTop: 6,
  },

  highlightTurma: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.text,
    marginTop: 2,
  },

  highlightValue: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.text,
    marginTop: 4,
  },

  // Demanda por refeição

  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textMuted,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 4,
  },

  legendRow: {
    flexDirection: 'row',
    gap: 18,
    marginBottom: 12,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  legendGreen: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: theme.success,
  },

  legendGray: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: theme.textMuted,
  },

  legendText: {
    fontSize: 11,
    color: theme.textSecondary,
  },

  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 13,
    marginBottom: 10,
    borderWidth: theme.borderWidth,
    borderColor: theme.border,
  },

  rankIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.soft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  rankInfo: {
    flex: 1,
  },

  rankTurma: {
    fontSize: 13,
    color: theme.text,
    fontWeight: '700',
    marginBottom: 5,
  },

  rankNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
  },

  rankWant: {
    fontSize: 11,
    color: theme.success,
    fontWeight: '700',
  },

  rankSeparator: {
    fontSize: 11,
    color: theme.textMuted,
  },

  rankRefuse: {
    fontSize: 11,
    color: theme.textSecondary,
    fontWeight: '500',
  },

  rankBarBackground: {
    height: 6,
    borderRadius: 4,
    backgroundColor: theme.divider,
    marginTop: 9,
    overflow: 'hidden',
  },

  rankBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Detalhamento por período

  dayRow: {
    backgroundColor: theme.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: theme.borderWidth,
    borderColor: theme.border,
  },

  dayName: {
    width: 55,
    fontSize: 15,
    fontWeight: '800',
    color: theme.primaryDark,
  },

  dayNumbers: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 5,
  },

  dayValue: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.success,
  },

  daySeparator: {
    fontSize: 11,
    color: theme.textMuted,
  },

  dayRefusal: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.textSecondary,
  },

  dayDescription: {
    fontSize: 10,
    color: theme.textMuted,
    marginTop: 4,
  },
});
