// screens/StatisticsScreen.tsx

import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

import ScreenHeader from '../components/ScreenHeader';
import Text from '../components/AppText';
import ResponsiveContainer from '../components/ResponsiveContainer';
import { useResponsive } from '../hooks/useResponsive';
import { useAccessibility } from '../components/AccessibilityContext';

import {
  assinarConfirmacoesPeriodo,
  ConfirmacaoDatada,
} from './services/confirmacoes';

import {
  Period,
  CATALOGO_REFEICOES,
  DIAS_UTEIS,
  dataISO,
  nomeTipoRefeicao,
  iconeRefeicao,
  intervaloDoPeriodo,
} from './services/refeicaoUtils';

import { listarAlunos, Aluno } from './services/alunos';
import { listarTurmas, Turma } from './services/turmas';
import {
  assinarOfertasPeriodo,
  OfertaRefeicao,
} from './services/ofertas';

// ---------------------------------------------------------------
// constantes locais
// ---------------------------------------------------------------

const DIAS_CALENDARIO = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril',
  'Maio', 'Junho', 'Julho', 'Agosto',
  'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const MESES_CURTOS = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];
const SEMANAS = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4', 'Sem 5'];

const COR_QUEREM = '#2e7d32';
const COR_RECUSAM = '#c62828';
const COR_SEM_RESPOSTA = '#9e9e9e';

const SEM_RESTRICAO = [
  '', 'nenhuma', 'nenhum', 'não', 'nao', '-', 'n/a',
  'sem restrição', 'sem restricao',
];

const TEXTO_PERIODO: Record<Period, { titulo: string; lista: string }> = {
  semana: { titulo: 'Demanda da semana', lista: 'Demanda por dia' },
  mes: { titulo: 'Demanda do mês', lista: 'Demanda por semana' },
  ano: { titulo: 'Demanda do ano', lista: 'Demanda por mês' },
};

// ---------------------------------------------------------------
// helpers
// ---------------------------------------------------------------

function temRestricao(texto?: string) {
  const t = (texto ?? '').trim().toLowerCase();
  return t.length > 0 && !SEM_RESTRICAO.includes(t);
}

function formatarIntervalo(period: Period, dataSelecionada: Date): string {
  const [inicio, fim] = intervaloDoPeriodo(period, dataSelecionada);
  if (period === 'ano') return `${dataSelecionada.getFullYear()}`;
  if (period === 'mes') {
    return `${MESES[dataSelecionada.getMonth()]} de ${dataSelecionada.getFullYear()}`;
  }
  const [a1, m1, d1] = inicio.split('-');
  const [a2, m2, d2] = fim.split('-');
  return `${d1}/${m1}/${a1} a ${d2}/${m2}/${a2}`;
}

function rotuloGrupo(period: Period, dataStr: string): string | undefined {
  const [ano, mes, dia] = dataStr.split('-').map(Number);
  if (period === 'ano') return MESES_CURTOS[mes - 1];
  if (period === 'mes') return SEMANAS[Math.ceil(dia / 7) - 1];

  const dow = new Date(ano, mes - 1, dia).getDay();
  if (dow === 0) return 'Dom';
  if (dow === 6) return 'Sáb';
  return DIAS_UTEIS[dow - 1];
}

// ---------------------------------------------------------------
// gráfico empilhado
// ---------------------------------------------------------------

type ColunaProps = {
  label: string;
  querem: number;
  recusam: number;
  semResposta: number;
  altura: number;
  theme: any;
  mostrarSemResposta: boolean;
};

function ColunaEmpilhada({
  label, querem, recusam, semResposta, altura, theme, mostrarSemResposta,
}: ColunaProps) {
  const total = querem + recusam + (mostrarSemResposta ? semResposta : 0);
  const h = (v: number) => (total > 0 ? (v / total) * altura : 0);

  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ fontSize: 11, color: theme.textMuted, marginBottom: 6 }}>
        {total} resp. possíveis
      </Text>

      <View
        style={{
          width: 40,
          height: altura,
          borderRadius: 8,
          overflow: 'hidden',
          backgroundColor: theme.divider,
          justifyContent: 'flex-end',
        }}
      >
        {mostrarSemResposta && (
          <View style={{ height: h(semResposta), backgroundColor: COR_SEM_RESPOSTA }} />
        )}
        <View style={{ height: h(recusam), backgroundColor: COR_RECUSAM }} />
        <View style={{ height: h(querem), backgroundColor: COR_QUEREM }} />
      </View>

      <Text style={{ fontSize: 12, fontWeight: '700', color: theme.text, marginTop: 8 }}>
        {label}
      </Text>
      <Text style={{ fontSize: 10, color: COR_QUEREM, fontWeight: '700' }}>{querem}</Text>
      <Text style={{ fontSize: 10, color: COR_RECUSAM, fontWeight: '700' }}>{recusam}</Text>
      {mostrarSemResposta && (
        <Text style={{ fontSize: 10, color: COR_SEM_RESPOSTA, fontWeight: '700' }}>
          {semResposta}
        </Text>
      )}
    </View>
  );
}

// ---------------------------------------------------------------
// tela
// ---------------------------------------------------------------

export default function StatisticsScreen() {
  const { theme } = useAccessibility();
  const { isSmallScreen, fontScale, horizontalPadding } = useResponsive();
  const compacto = isSmallScreen || fontScale >= 1.2;

  const styles = useMemo(() => createStyles(theme, compacto), [theme, compacto]);

  const hoje = useMemo(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }, []);

  const [period, setPeriod] = useState<Period>('semana');
  const [dataSelecionada, setDataSelecionada] = useState(hoje);
  const [mesCalendario, setMesCalendario] = useState(
    new Date(hoje.getFullYear(), hoje.getMonth(), 1),
  );

  const [confirmacoes, setConfirmacoes] = useState<ConfirmacaoDatada[]>([]);
  const [ofertas, setOfertas] = useState<OfertaRefeicao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);

  // feriados (integração futura com calendário escolar)
  const feriados = useMemo(() => new Set<string>(), []);

  // ---- carregar alunos e turmas (com cleanup) ----
  useEffect(() => {
    let ativo = true;
    Promise.all([listarAlunos(), listarTurmas()])
      .then(([la, lt]) => {
        if (!ativo) return;
        setAlunos(la);
        setTurmas(lt);
      })
      .catch((e) => console.error('Erro ao carregar alunos e turmas:', e));
    return () => {
      ativo = false;
    };
  }, []);

  // ---- intervalo do período ----
  const [inicio, fim] = useMemo(
    () => intervaloDoPeriodo(period, dataSelecionada),
    [period, dataSelecionada],
  );

  const periodoFuturo = useMemo(
    () => inicio > dataISO(hoje),
    [inicio, hoje],
  );

  // ---- confirmacoes ----
  useEffect(() => {
    setCarregando(true);
    setConfirmacoes([]);

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
      },
    );
    return cancelar;
  }, [inicio, fim]);

  // ---- ofertas (Opção A) ----
  useEffect(() => {
    setOfertas([]);
    const cancelar = assinarOfertasPeriodo(
      inicio,
      fim,
      (lista) => setOfertas(lista),
      (e) => console.error('Erro ao carregar ofertas:', e),
    );
    return cancelar;
  }, [inicio, fim]);

  // ---- navegação calendário ----
  function mudarCalendario(direcao: number) {
    setMesCalendario((anterior) => {
      if (period === 'ano') {
        return new Date(anterior.getFullYear() + direcao, anterior.getMonth(), 1);
      }
      return new Date(anterior.getFullYear(), anterior.getMonth() + direcao, 1);
    });
  }

  function selecionarData(dia: number) {
    setDataSelecionada(
      new Date(mesCalendario.getFullYear(), mesCalendario.getMonth(), dia),
    );
  }

  const diasCalendario = useMemo(() => {
    const ano = mesCalendario.getFullYear();
    const mes = mesCalendario.getMonth();
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const quantidadeDias = new Date(ano, mes + 1, 0).getDate();
    return Array.from({ length: 42 }, (_, i) => {
      const dia = i - primeiroDia + 1;
      return dia >= 1 && dia <= quantidadeDias ? dia : null;
    });
  }, [mesCalendario]);

  const dataSelecionadaISO = dataISO(dataSelecionada);

  // ---- mapas aluno ↔ turma ----
  const turmaDoAluno = useMemo(() => {
    const mapa: Record<string, { id: string; nome: string }> = {};
    turmas.forEach((t) => {
      t.alunosIds.forEach((id) => {
        if (!mapa[id]) mapa[id] = { id: t.id, nome: t.nome };
      });
    });
    return mapa;
  }, [turmas]);

  const alunosPorTurma = useMemo(() => {
    const mapa: Record<string, string[]> = {};
    turmas.forEach((t) => {
      mapa[t.id] = t.alunosIds;
    });
    return mapa;
  }, [turmas]);

  // ---- tipos visíveis: catálogo + extras presentes ----
  const tiposVisiveis = useMemo(() => {
    const presentes = new Set<string>();
    confirmacoes.forEach((c) =>
      Object.keys(c.respostas ?? {}).forEach((t) =>
        presentes.add(nomeTipoRefeicao(t)),
      ),
    );
    ofertas.forEach((o) => presentes.add(nomeTipoRefeicao(o.tipo)));

    const doCatalogo = CATALOGO_REFEICOES
      .map((r) => r.chave as string)
      .filter((t) => presentes.has(t));
    const extras = [...presentes].filter(
      (t) => !CATALOGO_REFEICOES.some((r) => r.chave === t),
    );
    return [...doCatalogo, ...extras];
  }, [confirmacoes, ofertas]);

  // ---- totais / recusas / grupos ----
  const { totais, recusas, grupos, gruposRecusas } = useMemo(() => {
    const totais: Record<string, number> = {};
    const recusas: Record<string, number> = {};
    const grupos: Record<string, number> = {};
    const gruposRecusas: Record<string, number> = {};

    confirmacoes.forEach((c) => {
      const rotulo = rotuloGrupo(period, c.data);
      Object.entries(c.respostas ?? {}).forEach(([tipo, vaiComer]) => {
        const t = nomeTipoRefeicao(tipo);
        if (!tiposVisiveis.includes(t)) return;

        if (vaiComer === true) {
          totais[t] = (totais[t] ?? 0) + 1;
          if (rotulo) grupos[rotulo] = (grupos[rotulo] ?? 0) + 1;
        } else if (vaiComer === false) {
          recusas[t] = (recusas[t] ?? 0) + 1;
          if (rotulo) gruposRecusas[rotulo] = (gruposRecusas[rotulo] ?? 0) + 1;
        }
      });
    });

    return { totais, recusas, grupos, gruposRecusas };
  }, [confirmacoes, period, tiposVisiveis]);

  // ---- esperado por tipo (Opção A + fallback) ----
  const esperadoPorTipo = useMemo(() => {
    const resultado: Record<string, number> = {};

    if (ofertas.length > 0) {
      // Fonte 1: ofertas explícitas
      ofertas.forEach((o) => {
        const tipo = nomeTipoRefeicao(o.tipo);
        if (!tiposVisiveis.includes(tipo)) return;

        let qtd = 0;
        if (o.alunosIds && o.alunosIds.length > 0) {
          qtd = o.alunosIds.length;
        } else if (o.turmaId) {
          qtd = alunosPorTurma[o.turmaId]?.length ?? 0;
        } else {
          qtd = alunos.length;
        }
        resultado[tipo] = (resultado[tipo] ?? 0) + qtd;
      });
      return resultado;
    }

    // Fonte 2 (fallback): dias reais de oferta deduzidos das respostas
    const diasComResposta: Record<string, Set<string>> = {};
    confirmacoes.forEach((c) => {
      Object.keys(c.respostas ?? {}).forEach((tipo) => {
        const t = nomeTipoRefeicao(tipo);
        (diasComResposta[t] ??= new Set()).add(c.data);
      });
    });

    tiposVisiveis.forEach((tipo) => {
      const dias = diasComResposta[tipo]?.size ?? 0;
      resultado[tipo] = alunos.length * dias;
    });

    return resultado;
  }, [ofertas, alunos, alunosPorTurma, confirmacoes, tiposVisiveis]);

  // ---- semResposta por tipo ----
  const semResposta = useMemo(() => {
    const resultado: Record<string, number> = {};
    tiposVisiveis.forEach((tipo) => {
      const esperado = esperadoPorTipo[tipo] ?? 0;
      const respondidos = (totais[tipo] ?? 0) + (recusas[tipo] ?? 0);
      resultado[tipo] = Math.max(0, esperado - respondidos);
    });
    return resultado;
  }, [esperadoPorTipo, totais, recusas, tiposVisiveis]);

  // ---- restrições alimentares ----
  const restricoesResumo = useMemo(() => {
    const comRestricao = alunos.filter((a) =>
      temRestricao(a.restricoesAlimentares),
    );
    const porTurma: Record<string, number> = {};
    comRestricao.forEach((a) => {
      const nome = turmaDoAluno[a.id]?.nome ?? a.turmaNome ?? 'Sem turma';
      porTurma[nome] = (porTurma[nome] ?? 0) + 1;
    });
    return {
      total: comRestricao.length,
      turmas: Object.entries(porTurma).sort((a, b) => b[1] - a[1]),
    };
  }, [alunos, turmaDoAluno]);

  // ---- agregações finais ----
  const totalGeral = useMemo(
    () => Object.values(totais).reduce((s, v) => s + v, 0),
    [totais],
  );

  const ordenadas = useMemo(
    () => Object.entries(totais).sort((a, b) => b[1] - a[1]),
    [totais],
  );
  const maiorDemanda = ordenadas[0] ?? null;
  const menorDemanda = ordenadas[ordenadas.length - 1] ?? null;

  const ordemGrupos =
    period === 'semana' ? DIAS_UTEIS : period === 'mes' ? SEMANAS : MESES_CURTOS;

  const texto = TEXTO_PERIODO[period];
  const alunosProntos = alunos.length > 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Estatísticas" />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ResponsiveContainer
          style={[styles.body, { paddingHorizontal: horizontalPadding }]}
        >
          <Text style={styles.subtitle}>Demanda de refeições dos alunos</Text>

          <View style={styles.periodSelector}>
            <PeriodButton
              label="Semana"
              active={period === 'semana'}
              onPress={() => setPeriod('semana')}
              theme={theme}
              compacto={compacto}
            />
            <PeriodButton
              label="Mês"
              active={period === 'mes'}
              onPress={() => setPeriod('mes')}
              theme={theme}
              compacto={compacto}
            />
            <PeriodButton
              label="Ano"
              active={period === 'ano'}
              onPress={() => setPeriod('ano')}
              theme={theme}
              compacto={compacto}
            />
          </View>

          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <View style={styles.calendarHeading}>
                <Ionicons name="calendar-outline" size={21} color={theme.primary} />
                <Text style={styles.calendarTitle}>Escolher período</Text>
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
                <Ionicons name="chevron-back" size={21} color={theme.primary} />
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
                <Ionicons name="chevron-forward" size={21} color={theme.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarGrid}>
              {DIAS_CALENDARIO.map((dia, index) => (
                <View key={index} style={styles.calendarCell}>
                  <Text style={styles.calendarDayHeader}>{dia}</Text>
                </View>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {diasCalendario.map((dia, index) => {
                if (dia === null) {
                  return <View key={`vazio-${index}`} style={styles.calendarCell} />;
                }
                const dataAtual = new Date(
                  mesCalendario.getFullYear(),
                  mesCalendario.getMonth(),
                  dia,
                );
                const selecionado = dataISO(dataAtual) === dataSelecionadaISO;
                const hojeAtual = dataISO(dataAtual) === dataISO(hoje);

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

            <View style={styles.selectedPeriod}>
              <View style={styles.selectedPeriodIcon}>
                <Ionicons name="calendar" size={18} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.selectedPeriodLabel}>Período selecionado</Text>
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
                    agora.getDate(),
                  );
                  setDataSelecionada(hojeAtual);
                  setMesCalendario(
                    new Date(agora.getFullYear(), agora.getMonth(), 1),
                  );
                }}
                style={styles.todayButton}
              >
                <Text style={styles.todayButtonText}>Hoje</Text>
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
              {periodoFuturo && (
                <View style={styles.noticeCard}>
                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color={theme.primary}
                  />
                  <Text style={styles.noticeText}>
                    Período futuro: ainda não há respostas nem "não responderam".
                  </Text>
                </View>
              )}

              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>{texto.titulo}</Text>
                <Text style={styles.chartSubtitle}>
                  Verde: querem · Vermelho: não querem
                  {!periodoFuturo ? ' · Cinza: não responderam' : ''}
                </Text>
                <View style={styles.chartColumns}>
                  {tiposVisiveis.map((tipo) => (
                    <ColunaEmpilhada
                      key={tipo}
                      label={tipo}
                      querem={totais[tipo] ?? 0}
                      recusam={recusas[tipo] ?? 0}
                      semResposta={semResposta[tipo] ?? 0}
                      altura={compacto ? 150 : 180}
                      theme={theme}
                      mostrarSemResposta={!periodoFuturo}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.totalCard}>
                <View style={styles.totalIcon}>
                  <MaterialCommunityIcons name="account-group" size={25} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.totalLabel}>Demanda total</Text>
                  <Text style={styles.totalValue}>{totalGeral} refeições</Text>
                  <Text style={styles.totalDescription}>
                    Total de confirmações positivas no período
                  </Text>
                </View>
              </View>

              <View style={styles.highlightsRow}>
                <View style={[styles.highlightCard, styles.highlightGood]}>
                  <Ionicons name="trending-up" size={20} color={theme.success} />
                  <Text style={styles.highlightLabel}>Refeição mais pedida</Text>
                  <Text style={styles.highlightTurma}>
                    {maiorDemanda ? maiorDemanda[0] : '—'}
                  </Text>
                  <Text style={styles.highlightValue}>
                    {maiorDemanda ? maiorDemanda[1] : 0}
                  </Text>
                </View>
                <View style={[styles.highlightCard, styles.highlightBad]}>
                  <Ionicons name="trending-down" size={20} color={theme.error} />
                  <Text style={styles.highlightLabel}>Refeição menos pedida</Text>
                  <Text style={styles.highlightTurma}>
                    {menorDemanda ? menorDemanda[0] : '—'}
                  </Text>
                  <Text style={styles.highlightValue}>
                    {menorDemanda ? menorDemanda[1] : 0}
                  </Text>
                </View>
              </View>

              <View style={styles.restrictionCard}>
                <View style={styles.restrictionHeader}>
                  <View style={styles.selectedPeriodIcon}>
                    <MaterialCommunityIcons
                      name="alert-circle-outline"
                      size={20}
                      color={theme.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.selectedPeriodLabel}>
                      Restrições alimentares
                    </Text>
                    <Text style={styles.restrictionValue}>
                      {alunosProntos
                        ? `${restricoesResumo.total} de ${alunos.length} alunos`
                        : 'Carregando alunos…'}
                    </Text>
                  </View>
                </View>
                {restricoesResumo.turmas.map(([turma, qtd]) => (
                  <View key={turma} style={styles.restrictionRow}>
                    <Text style={styles.restrictionTurma}>{turma}</Text>
                    <Text style={styles.restrictionQtd}>{qtd}</Text>
                  </View>
                ))}
              </View>

              <Text style={styles.sectionTitle}>Demanda por refeição</Text>

              <View style={styles.legendRow}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: COR_QUEREM }]} />
                  <Text style={styles.legendText}>Querem</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: COR_RECUSAM }]} />
                  <Text style={styles.legendText}>Não querem</Text>
                </View>
                {!periodoFuturo && (
                  <View style={styles.legendItem}>
                    <View
                      style={[styles.legendDot, { backgroundColor: COR_SEM_RESPOSTA }]}
                    />
                    <Text style={styles.legendText}>Não responderam</Text>
                  </View>
                )}
              </View>

              {tiposVisiveis.map((tipo) => {
                const q = totais[tipo] ?? 0;
                const qRecusa = recusas[tipo] ?? 0;
                const qSem = periodoFuturo ? 0 : semResposta[tipo] ?? 0;

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
                      <Text style={styles.rankTurma}>{tipo}</Text>
                      <View style={styles.rankNumbers}>
                        <Text style={styles.rankWant}>{q} querem</Text>
                        <Text style={styles.rankSeparator}>·</Text>
                        <Text style={styles.rankRefuse}>{qRecusa} não querem</Text>
                        {!periodoFuturo && (
                          <>
                            <Text style={styles.rankSeparator}>·</Text>
                            <Text style={styles.rankNoAnswer}>
                              {qSem} sem resposta
                            </Text>
                          </>
                        )}
                      </View>
                      <View style={styles.rankBarBackground}>
                        <View style={{ flex: q, backgroundColor: COR_QUEREM }} />
                        <View style={{ flex: qRecusa, backgroundColor: COR_RECUSAM }} />
                        {!periodoFuturo && (
                          <View style={{ flex: qSem, backgroundColor: COR_SEM_RESPOSTA }} />
                        )}
                      </View>
                    </View>
                  </View>
                );
              })}

              <Text style={styles.sectionTitle}>{texto.lista}</Text>

              {ordemGrupos.map((rotulo) => {
                const quantidade = grupos[rotulo] ?? 0;
                const quantidadeRecusa = gruposRecusas[rotulo] ?? 0;
                return (
                  <View key={rotulo} style={styles.dayRow}>
                    <Text style={styles.dayName}>{rotulo}</Text>
                    <View style={{ flex: 1 }}>
                      <View style={styles.dayNumbers}>
                        <Text style={styles.dayValue}>{quantidade} querem</Text>
                        <Text style={styles.daySeparator}>·</Text>
                        <Text style={styles.dayRefusal}>
                          {quantidadeRecusa} não querem
                        </Text>
                      </View>
                      <Text style={styles.dayDescription}>Respostas registradas</Text>
                    </View>
                  </View>
                );
              })}
            </>
          )}
        </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------
// botão de período
// ---------------------------------------------------------------

type PeriodButtonProps = {
  label: string;
  active: boolean;
  onPress: () => void;
  theme: any;
  compacto: boolean;
};

function PeriodButton({ label, active, onPress, theme, compacto }: PeriodButtonProps) {
  const styles = createStyles(theme, compacto);
  return (
    <TouchableOpacity
      style={[styles.periodButton, active && styles.periodButtonActive]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text
        style={[styles.periodButtonText, active && styles.periodButtonTextActive]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------
// estilos
// ---------------------------------------------------------------

const createStyles = (theme: any, compacto: boolean = false) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: theme.background },
    scroll: { flex: 1 },
    scrollContent: { flexGrow: 1, paddingBottom: 24 },
    body: {
      flex: 0,
      paddingTop: compacto ? 12 : 16,
      paddingBottom: 40,
    },
    subtitle: {
      fontSize: compacto ? 12 : 14,
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
      paddingVertical: compacto ? 9 : 10,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    periodButtonActive: { backgroundColor: theme.primary },
    periodButtonText: {
      fontSize: compacto ? 12 : 13,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    periodButtonTextActive: { color: theme.onPrimary },
    calendarCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: compacto ? 12 : 16,
      marginBottom: 20,
      borderWidth: theme.borderWidth,
      borderColor: theme.border,
      elevation: 2,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 5,
      shadowOffset: { width: 0, height: 2 },
    },
    calendarHeader: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 6,
      marginBottom: 18,
    },
    calendarHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    calendarTitle: {
      fontSize: compacto ? 13 : 15,
      fontWeight: '800',
      color: theme.text,
    },
    calendarMode: { fontSize: compacto ? 9 : 10, color: theme.textMuted },
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
      fontSize: compacto ? 14 : 17,
      fontWeight: '800',
      color: theme.text,
      flexShrink: 1,
      textAlign: 'center',
    },
    calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    calendarCell: {
      width: '14.2857%',
      height: compacto ? 36 : 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    calendarDayHeader: {
      fontSize: compacto ? 10 : 11,
      fontWeight: '700',
      color: theme.textMuted,
    },
    calendarDay: {
      width: compacto ? 30 : 34,
      height: compacto ? 30 : 34,
      borderRadius: compacto ? 15 : 17,
      alignItems: 'center',
      justifyContent: 'center',
    },
    calendarDaySelected: { backgroundColor: theme.primary },
    calendarDayToday: { borderWidth: 1.5, borderColor: theme.primary },
    calendarDayText: {
      fontSize: compacto ? 12 : 13,
      fontWeight: '500',
      color: theme.text,
    },
    calendarDayTextSelected: { color: theme.onPrimary, fontWeight: '800' },
    calendarDayTextToday: { color: theme.primaryDark, fontWeight: '800' },
    calendarDivider: {
      height: 1,
      backgroundColor: theme.divider,
      marginVertical: 14,
    },
    selectedPeriod: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: compacto ? 7 : 10,
    },
    selectedPeriodIcon: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.soft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectedPeriodLabel: { fontSize: compacto ? 9 : 10, color: theme.textMuted },
    selectedPeriodValue: {
      fontSize: compacto ? 11 : 13,
      fontWeight: '800',
      color: theme.text,
      marginTop: 3,
      flexShrink: 1,
    },
    todayButton: {
      paddingHorizontal: compacto ? 9 : 12,
      paddingVertical: 8,
      borderRadius: 9,
      backgroundColor: theme.soft,
    },
    todayButtonText: {
      color: theme.primaryDark,
      fontSize: compacto ? 10 : 11,
      fontWeight: '800',
    },
    noticeCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: theme.soft,
      borderRadius: 10,
      padding: 10,
      marginBottom: 12,
    },
    noticeText: {
      flex: 1,
      fontSize: compacto ? 11 : 12,
      color: theme.textSecondary,
    },
    chartCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      paddingVertical: 16,
      paddingHorizontal: compacto ? 4 : 8,
      alignItems: 'center',
      marginBottom: 18,
      borderWidth: theme.borderWidth,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    chartTitle: {
      alignSelf: 'flex-start',
      marginLeft: 14,
      marginBottom: 4,
      fontSize: compacto ? 13 : 15,
      fontWeight: '700',
      color: theme.text,
    },
    chartSubtitle: {
      alignSelf: 'flex-start',
      marginLeft: 14,
      marginBottom: 8,
      fontSize: compacto ? 10 : 11,
      color: theme.textMuted,
    },
    chartColumns: {
      flexDirection: 'row',
      width: '100%',
      paddingHorizontal: 8,
      marginTop: 8,
    },
    totalCard: {
      backgroundColor: theme.primary,
      borderRadius: 16,
      padding: compacto ? 13 : 16,
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
    totalLabel: { color: '#E8F5E9', fontSize: compacto ? 11 : 12, fontWeight: '600' },
    totalValue: { color: '#fff', fontSize: compacto ? 19 : 22, fontWeight: '800', marginTop: 2 },
    totalDescription: {
      color: '#E8F5E9',
      fontSize: compacto ? 10 : 11,
      marginTop: 3,
      flexShrink: 1,
    },
    highlightsRow: {
      flexDirection: 'row',
      gap: compacto ? 8 : 12,
      marginBottom: 22,
    },
    highlightCard: {
      flex: 1,
      borderRadius: 14,
      padding: compacto ? 10 : 14,
      backgroundColor: theme.card,
      borderWidth: theme.borderWidth,
      borderColor: theme.border,
      minWidth: 0,
    },
    highlightGood: { borderLeftWidth: 4, borderLeftColor: theme.success },
    highlightBad: { borderLeftWidth: 4, borderLeftColor: theme.error },
    highlightLabel: { fontSize: compacto ? 10 : 11, color: theme.textMuted, marginTop: 6 },
    highlightTurma: {
      fontSize: compacto ? 12 : 14,
      fontWeight: '700',
      color: theme.text,
      marginTop: 2,
    },
    highlightValue: {
      fontSize: compacto ? 16 : 18,
      fontWeight: '700',
      color: theme.text,
      marginTop: 4,
    },
    restrictionCard: {
      backgroundColor: theme.card,
      borderRadius: 14,
      padding: compacto ? 12 : 16,
      marginBottom: 22,
      borderWidth: theme.borderWidth,
      borderColor: theme.border,
    },
    restrictionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 8,
    },
    restrictionValue: {
      fontSize: compacto ? 14 : 16,
      fontWeight: '800',
      color: theme.text,
      marginTop: 2,
    },
    restrictionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
    },
    restrictionTurma: { fontSize: compacto ? 12 : 13, color: theme.textSecondary },
    restrictionQtd: { fontSize: compacto ? 12 : 13, fontWeight: '700', color: theme.text },
    sectionTitle: {
      fontSize: compacto ? 11 : 13,
      fontWeight: '700',
      color: theme.textMuted,
      textTransform: 'uppercase',
      marginBottom: 10,
      marginTop: 4,
    },
    legendRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 18,
      marginBottom: 12,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 9, height: 9, borderRadius: 5 },
    legendText: { fontSize: compacto ? 10 : 11, color: theme.textSecondary },
    rankRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: compacto ? 10 : 13,
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
    rankInfo: { flex: 1, minWidth: 0 },
    rankTurma: {
      fontSize: compacto ? 12 : 13,
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
    rankWant: { fontSize: compacto ? 10 : 11, color: COR_QUEREM, fontWeight: '700' },
    rankSeparator: { fontSize: compacto ? 10 : 11, color: theme.textMuted },
    rankRefuse: { fontSize: compacto ? 10 : 11, color: COR_RECUSAM, fontWeight: '600' },
    rankNoAnswer: {
      fontSize: compacto ? 10 : 11,
      color: theme.textSecondary,
      fontWeight: '500',
    },
    rankBarBackground: {
      flexDirection: 'row',
      height: 6,
      borderRadius: 4,
      backgroundColor: theme.divider,
      marginTop: 9,
      overflow: 'hidden',
    },
    dayRow: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: compacto ? 11 : 14,
      marginBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      gap: compacto ? 9 : 14,
      borderWidth: theme.borderWidth,
      borderColor: theme.border,
    },
    dayName: {
      width: compacto ? 48 : 55,
      fontSize: compacto ? 13 : 15,
      fontWeight: '800',
      color: theme.primaryDark,
    },
    dayNumbers: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 5,
    },
    dayValue: { fontSize: compacto ? 10 : 12, fontWeight: '700', color: theme.success },
    daySeparator: { fontSize: compacto ? 10 : 11, color: theme.textMuted },
    dayRefusal: {
      fontSize: compacto ? 10 : 11,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    dayDescription: {
      fontSize: compacto ? 9 : 10,
      color: theme.textMuted,
      marginTop: 4,
    },
  });