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

import ScreenHeader from '../components/ScreenHeader';
import ResponsiveContainer from '../components/ResponsiveContainer';
import { useResponsive } from '../hooks/useResponsive';

import { auth } from '../components/firebaseConfig';
import { useAccessibility } from '../components/AccessibilityContext';

import {
  assinarCardapioData,
  Refeicao,
} from './services/cardapio';

import {
  assinarConfirmacaoAlunoData,
  definirConfirmacao,
  RespostasAluno,
} from './services/confirmacoes';

import {
  assinarPrazosConfirmacao,
  PrazosPorDia,
  DiaSemana as DiaPrazo,
  TipoRefeicao,
} from './services/prazosConfirmacao';

import {
  dataISO,
  nomeTipoRefeicao,
  intervaloDoPeriodo,
} from './services/refeicaoUtils';

import { NOME_COMPLETO_DIA } from './services/data';
import { useInstituicaoId } from './services/useInstituicaoId';
import Text from '../components/AppText';

type DiaSemana = 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex';

type DiaCardapio = {
  codigo: DiaSemana;
  data: Date;
  refeicoes: Refeicao[];
  respostas: RespostasAluno;
};

type StatusPrazo = {
  disponivel: boolean;
  horario: string;
  mensagem: string;
};

const DIAS_UTEIS: DiaSemana[] = [
  'Seg',
  'Ter',
  'Qua',
  'Qui',
  'Sex',
];

const DIAS_PRAZO: DiaPrazo[] = [
  'domingo',
  'segunda',
  'terca',
  'quarta',
  'quinta',
  'sexta',
  'sabado',
];

function obterSegundaDaSemana(): Date {
  const [segundaISO] = intervaloDoPeriodo('semana');
  const [ano, mes, dia] = segundaISO.split('-').map(Number);

  return new Date(ano, mes - 1, dia);
}

function obterSemana(): DiaCardapio[] {
  const segunda = obterSegundaDaSemana();

  return DIAS_UTEIS.map((codigo, indice) => {
    const data = new Date(segunda);
    data.setDate(segunda.getDate() + indice);

    return {
      codigo,
      data,
      refeicoes: [],
      respostas: {},
    };
  });
}

function formatarData(data: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: 'numeric',
    month: 'long',
  }).format(data);
}

function respostaDe(
  dia: DiaCardapio,
  indice: number
): boolean | undefined {
  const refeicao = dia.refeicoes[indice];

  if (!refeicao) return undefined;

  return dia.respostas[nomeTipoRefeicao(refeicao.titulo)];
}

function obterTipoPrazo(titulo: string): TipoRefeicao | null {
  const texto = titulo
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (texto.includes('cafe') || texto.includes('manha')) {
    return 'cafe';
  }

  if (texto.includes('almoco')) {
    return 'almoco';
  }

  if (texto.includes('jantar') || texto.includes('janta')) {
    return 'jantar';
  }

  return null;
}

function verificarStatusPrazo(
  data: Date,
  tituloRefeicao: string,
  prazos: PrazosPorDia | null,
  agora: Date
): StatusPrazo {
  if (!prazos) {
    return {
      disponivel: false,
      horario: '',
      mensagem: 'Não foi possível carregar o prazo desta refeição.',
    };
  }

  const tipoRefeicao = obterTipoPrazo(tituloRefeicao);

  if (!tipoRefeicao) {
    return {
      disponivel: false,
      horario: '',
      mensagem: 'Não foi possível identificar esta refeição.',
    };
  }

  const diaSemana = DIAS_PRAZO[data.getDay()];
  const prazo = prazos[diaSemana]?.[tipoRefeicao];

  if (!prazo) {
    return {
      disponivel: false,
      horario: '',
      mensagem: 'Prazo não configurado para esta refeição.',
    };
  }

  if (!prazo.ativo) {
    return {
      disponivel: false,
      horario: prazo.horario,
      mensagem: 'Esta refeição não está disponível neste dia.',
    };
  }

  const dataRefeicao = dataISO(data);
  const dataHoje = dataISO(agora);

  if (dataRefeicao < dataHoje) {
    return {
      disponivel: false,
      horario: prazo.horario,
      mensagem: 'Prazo encerrado. Esta data já passou.',
    };
  }

  if (dataRefeicao > dataHoje) {
    return {
      disponivel: true,
      horario: prazo.horario,
      mensagem: `Você pode responder até ${prazo.horario}.`,
    };
  }

  const partesHorario = prazo.horario.split(':').map(Number);
  const horaLimite = partesHorario[0];
  const minutoLimite = partesHorario[1];

  if (
    partesHorario.length !== 2 ||
    !Number.isInteger(horaLimite) ||
    !Number.isInteger(minutoLimite) ||
    horaLimite < 0 ||
    horaLimite > 23 ||
    minutoLimite < 0 ||
    minutoLimite > 59
  ) {
    return {
      disponivel: false,
      horario: '',
      mensagem: 'O horário limite desta refeição está inválido.',
    };
  }

  const minutosAtuais = agora.getHours() * 60 + agora.getMinutes();
  const minutosLimite = horaLimite * 60 + minutoLimite;

  if (minutosAtuais >= minutosLimite) {
    return {
      disponivel: false,
      horario: prazo.horario,
      mensagem: `Prazo encerrado às ${prazo.horario}.`,
    };
  }

  return {
    disponivel: true,
    horario: prazo.horario,
    mensagem: `Você pode responder até ${prazo.horario}.`,
  };
}

export default function RefeicoesDia() {
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

  const alunoId = auth.currentUser?.uid;

  const {
    instituicaoId,
    carregando: carregandoInstituicao,
  } = useInstituicaoId();

  const [dias, setDias] = useState<DiaCardapio[]>(obterSemana());

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const [prazos, setPrazos] = useState<PrazosPorDia | null>(null);
  const [carregandoPrazos, setCarregandoPrazos] = useState(true);
  const [agora, setAgora] = useState(new Date());

  useEffect(() => {
    const intervalo = setInterval(() => {
      setAgora(new Date());
    }, 15000);

    return () => clearInterval(intervalo);
  }, []);

  useEffect(() => {
    if (carregandoInstituicao) return;

    if (!instituicaoId) {
      setPrazos(null);
      setCarregandoPrazos(false);
      return;
    }

    setPrazos(null);
    setCarregandoPrazos(true);

    const unsubscribe = assinarPrazosConfirmacao(
      (novosPrazos) => {
        setPrazos(novosPrazos);
        setCarregandoPrazos(false);
      },
      (erro) => {
        console.error('Erro ao carregar prazos:', erro);
        setPrazos(null);
        setCarregandoPrazos(false);
        setErro('Não foi possível carregar os prazos de confirmação.');
      },
      instituicaoId
    );

    return unsubscribe;
  }, [instituicaoId, carregandoInstituicao]);

  useEffect(() => {
    if (carregandoInstituicao) return;

    if (!instituicaoId) {
      setCarregando(false);
      return;
    }

    setCarregando(true);

    const semana = obterSemana();

    setDias(semana);

    const unsubscribeList: (() => void)[] = [];

    let pendentes = semana.length;

    semana.forEach(({ codigo, data }) => {
      const dataSelecionada = dataISO(data);
      let primeiraResposta = true;

      const finalizarPrimeiroCarregamento = () => {
        if (!primeiraResposta) return;

        primeiraResposta = false;
        pendentes--;

        if (pendentes === 0) {
          setCarregando(false);
        }
      };

      const unsubscribe = assinarCardapioData(
        dataSelecionada,
        (refeicoes) => {
          setDias((atual) =>
            atual.map((dia) =>
              dia.codigo === codigo
                ? { ...dia, refeicoes }
                : dia
            )
          );

          finalizarPrimeiroCarregamento();
        },
        (erro) => {
          console.error(
            `Erro ao carregar cardápio de ${dataSelecionada}:`,
            erro
          );

          finalizarPrimeiroCarregamento();
        },
        instituicaoId
      );

      unsubscribeList.push(unsubscribe);
    });

    return () => {
      unsubscribeList.forEach((unsubscribe) => unsubscribe());
    };
  }, [instituicaoId, carregandoInstituicao]);

  useEffect(() => {
    if (!alunoId || !instituicaoId) return;

    const unsubscribeList = obterSemana().map(({ codigo, data }) =>
      assinarConfirmacaoAlunoData(
        dataISO(data),
        alunoId,
        (respostas) => {
          setDias((atual) =>
            atual.map((dia) =>
              dia.codigo === codigo
                ? { ...dia, respostas }
                : dia
            )
          );
        },
        (erro) => {
          console.error(
            `Erro ao carregar respostas de ${codigo}:`,
            erro
          );
        },
        instituicaoId
      )
    );

    return () => {
      unsubscribeList.forEach((unsubscribe) => unsubscribe());
    };
  }, [alunoId, instituicaoId]);

  async function escolher(
    dia: DiaCardapio,
    indice: number,
    vaiComer: boolean
  ) {
    if (!alunoId || !instituicaoId) {
      setErro(
        'Não foi possível identificar seu usuário. Faça login novamente.'
      );
      return;
    }

    const refeicao = dia.refeicoes[indice];

    if (!refeicao) return;

    const status = verificarStatusPrazo(
      dia.data,
      refeicao.titulo,
      prazos,
      new Date()
    );

    if (!status.disponivel) {
      setErro(status.mensagem);
      return;
    }

    const chave = `${dia.codigo}-${indice}`;

    setErro(null);
    setSalvando(chave);

    try {
      await definirConfirmacao(
        dataISO(dia.data),
        alunoId,
        nomeTipoRefeicao(refeicao.titulo),
        vaiComer,
        instituicaoId
      );
    } catch (e) {
      console.error('Erro ao salvar confirmação:', e);

      setErro(
        e instanceof Error
          ? e.message
          : 'Não foi possível salvar sua escolha. Tente novamente.'
      );
    } finally {
      setSalvando(null);
    }
  }

  const totalRefeicoes = dias.reduce(
    (total, dia) => total + dia.refeicoes.length,
    0
  );

  const refeicoesRespondidas = dias.reduce(
    (total, dia) =>
      total +
      dia.refeicoes.filter(
        (_, indice) => respostaDe(dia, indice) !== undefined
      ).length,
    0
  );

  const refeicoesPendentes =
    totalRefeicoes - refeicoesRespondidas;

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Planeje suas refeições" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ResponsiveContainer
          style={[
            styles.body,
            { paddingHorizontal: horizontalPadding },
          ]}
        >
          <View style={styles.introducao}>
            <View style={styles.introducaoIcone}>
              <MaterialCommunityIcons
                name="calendar-check-outline"
                size={compacto ? 22 : 25}
                color={theme.primary}
              />
            </View>

            <Text style={styles.introducaoTitulo}>
              Organize sua semana
            </Text>

            <Text style={styles.introducaoTexto}>
              Confira o cardápio e escolha em cada refeição se você vai comer ou não.
            </Text>
          </View>

          {!carregando && totalRefeicoes > 0 && (
            <View style={styles.resumo}>
              <View style={styles.resumoItem}>
                <Text style={styles.resumoNumero}>
                  {totalRefeicoes}
                </Text>
                <Text style={styles.resumoLegenda}>
                  Refeições
                </Text>
              </View>

              <View style={styles.resumoDivisor} />

              <View style={styles.resumoItem}>
                <Text
                  style={[
                    styles.resumoNumero,
                    { color: theme.success },
                  ]}
                >
                  {refeicoesRespondidas}
                </Text>
                <Text style={styles.resumoLegenda}>
                  Respondidas
                </Text>
              </View>

              <View style={styles.resumoDivisor} />

              <View style={styles.resumoItem}>
                <Text
                  style={[
                    styles.resumoNumero,
                    {
                      color:
                        refeicoesPendentes > 0
                          ? theme.warning
                          : theme.success,
                    },
                  ]}
                >
                  {refeicoesPendentes}
                </Text>
                <Text style={styles.resumoLegenda}>
                  Pendentes
                </Text>
              </View>
            </View>
          )}

          {erro && (
            <View
              style={styles.bannerErro}
              testID="refeicoesdia-erro"
            >
              <MaterialCommunityIcons
                name="alert-circle"
                size={18}
                color={theme.error}
              />

              <Text style={styles.bannerErroText}>
                {erro}
              </Text>
            </View>
          )}

          {carregando ? (
            <ActivityIndicator
              color={theme.primary}
              style={styles.carregando}
            />
          ) : (
            dias.map((dia) => (
              <View
                key={dia.codigo}
                style={styles.diaContainer}
              >
                <View style={styles.dateWrap}>
                  <View style={styles.dateTextos}>
                    <Text style={styles.dateTitle}>
                      {NOME_COMPLETO_DIA[dia.codigo]}
                    </Text>

                    <Text style={styles.dateSub}>
                      {formatarData(dia.data)}
                    </Text>
                  </View>

                  <View style={styles.contagemDia}>
                    <Text style={styles.contagemDiaTexto}>
                      {dia.refeicoes.filter(
                        (_, indice) =>
                          respostaDe(dia, indice) !== undefined
                      ).length}/{dia.refeicoes.length}
                    </Text>

                    <Text style={styles.contagemDiaLegenda}>
                      feitas
                    </Text>
                  </View>
                </View>

                {dia.refeicoes.length === 0 ? (
                  <View style={styles.semRefeicao}>
                    <MaterialCommunityIcons
                      name="calendar-blank-outline"
                      size={22}
                      color={theme.textMuted}
                    />

                    <Text style={styles.semRefeicaoTexto}>
                      Nenhuma refeição cadastrada para este dia.
                    </Text>
                  </View>
                ) : (
                  dia.refeicoes.map((refeicao, i) => {
                    const resposta = respostaDe(dia, i);
                    const chave = `${dia.codigo}-${i}`;
                    const estaSalvando = salvando === chave;

                    const statusPrazo = verificarStatusPrazo(
                      dia.data,
                      refeicao.titulo,
                      prazos,
                      agora
                    );

                    const podeResponder =
                      !carregandoPrazos &&
                      statusPrazo.disponivel;

                    const botoesDesabilitados =
                      estaSalvando || !podeResponder;

                    return (
                      <View
                        key={i}
                        style={styles.card}
                        testID={`refeicao-${dia.codigo}-${i}`}
                      >
                        <View style={styles.cardHeader}>
                          <View
                            style={[
                              styles.icon,
                              { backgroundColor: refeicao.color },
                            ]}
                          >
                            <MaterialCommunityIcons
                              name={refeicao.icon as any}
                              size={compacto ? 20 : 22}
                              color="#fff"
                            />
                          </View>

                          <View style={styles.cardHeaderTexto}>
                            <Text style={styles.titulo}>
                              {refeicao.titulo}
                            </Text>

                            <Text style={styles.horario}>
                              {refeicao.horario}
                            </Text>
                          </View>
                        </View>

                        <Text style={styles.desc}>
                          {refeicao.desc}
                        </Text>

                        <View
                          style={[
                            styles.statusPrazo,
                            !podeResponder &&
                              styles.statusPrazoFechado,
                          ]}
                        >
                          <MaterialCommunityIcons
                            name={
                              carregandoPrazos
                                ? 'clock-outline'
                                : podeResponder
                                  ? 'timer-outline'
                                  : 'lock-outline'
                            }
                            size={15}
                            color={
                              carregandoPrazos
                                ? theme.textMuted
                                : podeResponder
                                  ? theme.success
                                  : theme.error
                            }
                          />

                          <Text
                            style={[
                              styles.statusPrazoTexto,
                              {
                                color: carregandoPrazos
                                  ? theme.textMuted
                                  : podeResponder
                                    ? theme.success
                                    : theme.error,
                              },
                            ]}
                          >
                            {carregandoPrazos
                              ? 'Carregando prazo de confirmação...'
                              : statusPrazo.mensagem}
                          </Text>
                        </View>

                        <View style={styles.pergunta}>
                          <MaterialCommunityIcons
                            name="help-circle-outline"
                            size={16}
                            color={theme.textMuted}
                          />

                          <Text style={styles.perguntaTexto}>
                            Você vai consumir esta refeição?
                          </Text>
                        </View>

                        <View style={styles.opcoes}>
                          <Pressable
                            testID={`refeicao-${dia.codigo}-${i}-sim`}
                            style={[
                              styles.opcaoBtn,
                              resposta === true &&
                                styles.opcaoBtnSimAtivo,
                              botoesDesabilitados &&
                                styles.opcaoBtnDesabilitado,
                            ]}
                            onPress={() => escolher(dia, i, true)}
                            disabled={botoesDesabilitados}
                            accessibilityRole="button"
                            accessibilityState={{
                              disabled: botoesDesabilitados,
                              selected: resposta === true,
                            }}
                          >
                            <MaterialCommunityIcons
                              name="check-circle"
                              size={16}
                              color={
                                resposta === true
                                  ? '#fff'
                                  : theme.success
                              }
                            />

                            <Text
                              style={[
                                styles.opcaoText,
                                resposta === true &&
                                  styles.opcaoTextAtivo,
                              ]}
                            >
                              Vou comer
                            </Text>
                          </Pressable>

                          <Pressable
                            testID={`refeicao-${dia.codigo}-${i}-nao`}
                            style={[
                              styles.opcaoBtn,
                              resposta === false &&
                                styles.opcaoBtnNaoAtivo,
                              botoesDesabilitados &&
                                styles.opcaoBtnDesabilitado,
                            ]}
                            onPress={() => escolher(dia, i, false)}
                            disabled={botoesDesabilitados}
                            accessibilityRole="button"
                            accessibilityState={{
                              disabled: botoesDesabilitados,
                              selected: resposta === false,
                            }}
                          >
                            <MaterialCommunityIcons
                              name="close-circle"
                              size={16}
                              color={
                                resposta === false
                                  ? '#fff'
                                  : theme.error
                              }
                            />

                            <Text
                              style={[
                                styles.opcaoText,
                                resposta === false &&
                                  styles.opcaoTextAtivo,
                              ]}
                            >
                              Não vou
                            </Text>
                          </Pressable>
                        </View>

                        {resposta === undefined ? (
                          <View style={styles.statusPendente}>
                            <MaterialCommunityIcons
                              name="clock-outline"
                              size={14}
                              color={theme.warning}
                            />

                            <Text style={styles.pendenteText}>
                              {podeResponder
                                ? 'Aguardando sua resposta'
                                : 'Nenhuma resposta registrada'}
                            </Text>
                          </View>
                        ) : (
                          <View style={styles.statusRespondido}>
                            <MaterialCommunityIcons
                              name="check-circle-outline"
                              size={14}
                              color={
                                resposta
                                  ? theme.success
                                  : theme.error
                              }
                            />

                            <Text
                              style={[
                                styles.respondidoText,
                                {
                                  color: resposta
                                    ? theme.success
                                    : theme.error,
                                },
                              ]}
                            >
                              {resposta
                                ? 'Você confirmou que vai comer'
                                : 'Você informou que não vai comer'}
                            </Text>
                          </View>
                        )}

                        {estaSalvando && (
                          <ActivityIndicator
                            size="small"
                            color={theme.primary}
                            style={styles.salvando}
                          />
                        )}
                      </View>
                    );
                  })
                )}
              </View>
            ))
          )}
        </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any, compacto: boolean) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.background,
    },

    scrollContent: {
      flexGrow: 1,
      paddingBottom: compacto ? 24 : 40,
    },

    body: {
      flex: 0,
      paddingTop: compacto ? 12 : 16,
      paddingBottom: compacto ? 24 : 40,
    },

    introducao: {
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 20,
      paddingHorizontal: compacto ? 14 : 20,
      paddingVertical: compacto ? 17 : 22,
      marginBottom: compacto ? 12 : 14,
      borderWidth: theme.borderWidth,
      borderColor: theme.border,
    },

    introducaoIcone: {
      width: compacto ? 44 : 48,
      height: compacto ? 44 : 48,
      borderRadius: 16,
      backgroundColor: theme.warningBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },

    introducaoTitulo: {
      fontSize: compacto ? 18 : 20,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'center',
    },

    introducaoTexto: {
      fontSize: compacto ? 12 : 13,
      color: theme.textMuted,
      marginTop: 7,
      lineHeight: compacto ? 18 : 19,
      textAlign: 'center',
    },

    resumo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      backgroundColor: theme.card,
      borderRadius: 16,
      paddingVertical: compacto ? 11 : 14,
      paddingHorizontal: 6,
      marginBottom: compacto ? 18 : 22,
      borderWidth: theme.borderWidth,
      borderColor: theme.border,
    },

    resumoItem: {
      flex: 1,
      alignItems: 'center',
      minWidth: 0,
    },

    resumoNumero: {
      fontSize: compacto ? 18 : 20,
      fontWeight: '800',
      color: theme.text,
    },

    resumoLegenda: {
      fontSize: compacto ? 10 : 11,
      color: theme.textMuted,
      marginTop: 3,
      textAlign: 'center',
    },

    resumoDivisor: {
      width: 1,
      height: 34,
      backgroundColor: theme.divider,
    },

    diaContainer: {
      marginBottom: compacto ? 18 : 22,
    },

    dateWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
      paddingHorizontal: 2,
      gap: 10,
    },

    dateTextos: {
      flex: 1,
      minWidth: 0,
    },

    dateTitle: {
      fontSize: compacto ? 17 : 19,
      fontWeight: '800',
      color: theme.text,
    },

    dateSub: {
      fontSize: compacto ? 12 : 13,
      color: theme.textMuted,
      marginTop: 3,
    },

    contagemDia: {
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 54,
      paddingHorizontal: 9,
      paddingVertical: 7,
      borderRadius: 12,
      backgroundColor: theme.warningBg,
    },

    contagemDiaTexto: {
      color: theme.text,
      fontSize: compacto ? 13 : 14,
      fontWeight: '800',
    },

    contagemDiaLegenda: {
      color: theme.textMuted,
      fontSize: 10,
      marginTop: 1,
    },

    semRefeicao: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: compacto ? 16 : 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
      borderWidth: theme.borderWidth,
      borderColor: theme.border,
    },

    semRefeicaoTexto: {
      textAlign: 'center',
      color: theme.textMuted,
      fontSize: compacto ? 12 : 13,
      lineHeight: compacto ? 18 : 19,
      marginTop: 8,
    },

    card: {
      width: '100%',
      backgroundColor: theme.card,
      borderRadius: 18,
      padding: compacto ? 12 : 15,
      marginBottom: 12,
      borderWidth: theme.borderWidth,
      borderColor: theme.border,
    },

    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: compacto ? 9 : 12,
    },

    cardHeaderTexto: {
      flex: 1,
      minWidth: 0,
    },

    icon: {
      width: compacto ? 44 : 48,
      height: compacto ? 44 : 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    titulo: {
      fontSize: compacto ? 14 : 15,
      fontWeight: '800',
      color: theme.text,
    },

    horario: {
      fontSize: compacto ? 11 : 12,
      color: theme.primary,
      fontWeight: '700',
      marginTop: 4,
    },

    desc: {
      fontSize: compacto ? 12 : 13,
      color: theme.textMuted,
      marginTop: 12,
      lineHeight: compacto ? 18 : 19,
    },

    statusPrazo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      marginTop: 13,
      paddingHorizontal: 10,
      paddingVertical: 9,
      borderRadius: 9,
      backgroundColor: theme.successBg,
    },

    statusPrazoFechado: {
      backgroundColor: theme.errorBg,
    },

    statusPrazoTexto: {
      flex: 1,
      minWidth: 0,
      fontSize: compacto ? 11 : 12,
      fontWeight: '700',
      lineHeight: compacto ? 16 : 17,
    },

    pergunta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 16,
      marginBottom: 9,
    },

    perguntaTexto: {
      flex: 1,
      minWidth: 0,
      color: theme.text,
      fontSize: compacto ? 11 : 12,
      fontWeight: '700',
    },

    opcoes: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },

    opcaoBtn: {
      flex: 1,
      minWidth: compacto ? 105 : 120,
      minHeight: compacto ? 43 : 46,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      backgroundColor: theme.card,
      paddingVertical: 10,
      paddingHorizontal: 6,
    },

    opcaoBtnSimAtivo: {
      backgroundColor: theme.success,
      borderColor: theme.success,
    },

    opcaoBtnNaoAtivo: {
      backgroundColor: theme.error,
      borderColor: theme.error,
    },

    opcaoBtnDesabilitado: {
      opacity: 0.45,
    },

    opcaoText: {
      flexShrink: 1,
      fontSize: compacto ? 11 : 13,
      fontWeight: '700',
      color: theme.text,
      textAlign: 'center',
    },

    opcaoTextAtivo: {
      color: '#FFFFFF',
    },

    statusPendente: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      alignSelf: 'flex-start',
      marginTop: 11,
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: theme.warningBg,
      maxWidth: '100%',
    },

    pendenteText: {
      flexShrink: 1,
      fontSize: compacto ? 10 : 11,
      color: theme.warning,
      fontWeight: '600',
    },

    statusRespondido: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      alignSelf: 'flex-start',
      marginTop: 11,
      paddingHorizontal: 9,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: theme.successBg,
      maxWidth: '100%',
    },

    respondidoText: {
      flexShrink: 1,
      fontSize: compacto ? 10 : 11,
      fontWeight: '600',
    },

    bannerErro: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: theme.errorBg,
      borderRadius: 12,
      padding: 12,
      marginBottom: 14,
    },

    bannerErroText: {
      flex: 1,
      minWidth: 0,
      color: theme.error,
      fontSize: compacto ? 12 : 13,
      fontWeight: '600',
      lineHeight: compacto ? 17 : 19,
    },

    carregando: {
      marginTop: 24,
    },

    salvando: {
      marginTop: 8,
    },
  });
