import React, { useEffect, useState } from 'react';
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
import { colors } from '../constants/theme';
import { auth } from '../components/firebaseConfig';

import {
  assinarCardapioDia,
  Refeicao,
} from './services/cardapio';

import {
  assinarConfirmacaoAlunoData,
  definirConfirmacao,
  RespostasAluno,
} from './services/confirmacoes';

import { dataISO, nomeTipoRefeicao, intervaloDoPeriodo } from './services/refeicaoUtils';
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

const DIAS_UTEIS: DiaSemana[] = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

// Segunda-feira da semana "base" (a mesma usada na Home e nas Estatísticas).
// Dias úteis: semana atual. Fim de semana: a base passa a ser a próxima semana.
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

// Resposta do aluno para a refeição na posição `indice` daquele dia
function respostaDe(dia: DiaCardapio, indice: number): boolean | undefined {
  const refeicao = dia.refeicoes[indice];
  if (!refeicao) return undefined;
  return dia.respostas[nomeTipoRefeicao(refeicao.titulo)];
}

export default function RefeicoesDia() {
  const alunoId = auth.currentUser?.uid;
  const { instituicaoId, carregando: carregandoInstituicao } =
    useInstituicaoId();

  const [dias, setDias] = useState<DiaCardapio[]>(obterSemana());

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Cardápio da instituição do aluno
  useEffect(() => {
    if (carregandoInstituicao) return;

    if (!instituicaoId) {
      setCarregando(false);
      return;
    }

    setCarregando(true);

    const unsubscribeList: (() => void)[] = [];

    DIAS_UTEIS.forEach((codigo) => {
      const unsubscribe = assinarCardapioDia(
        codigo,
        (refeicoes) => {
          setDias((atual) =>
            atual.map((dia) =>
              dia.codigo === codigo ? { ...dia, refeicoes } : dia
            )
          );

          setCarregando(false);
        },
        (erro) => {
          console.error(`Erro ao carregar cardápio de ${codigo}:`, erro);
          setCarregando(false);
        },
        instituicaoId
      );

      unsubscribeList.push(unsubscribe);
    });

    return () => {
      unsubscribeList.forEach((unsubscribe) => unsubscribe());
    };
  }, [instituicaoId, carregandoInstituicao]);

  // Respostas (Vou comer / Não vou) do aluno, uma assinatura por data
  useEffect(() => {
    if (!alunoId || !instituicaoId) return;

    const unsubscribeList = obterSemana().map(({ codigo, data }) =>
      assinarConfirmacaoAlunoData(
        dataISO(data),
        alunoId,
        (respostas) => {
          setDias((atual) =>
            atual.map((dia) =>
              dia.codigo === codigo ? { ...dia, respostas } : dia
            )
          );
        },
        (erro) => {
          console.error(`Erro ao carregar respostas de ${codigo}:`, erro);
        },
        instituicaoId
      )
    );

    return () => {
      unsubscribeList.forEach((unsubscribe) => unsubscribe());
    };
  }, [alunoId, instituicaoId]);

  async function escolher(dia: DiaCardapio, indice: number, vaiComer: boolean) {
    if (!alunoId || !instituicaoId) {
      setErro('Não foi possível identificar seu usuário. Faça login novamente.');
      return;
    }

    const refeicao = dia.refeicoes[indice];
    if (!refeicao) return;

    const chave = `${dia.codigo}-${indice}`;

    setErro(null);
    setSalvando(chave);

    try {
      await definirConfirmacao(
        dataISO(dia.data), // data do dia que está sendo marcado
        alunoId,
        nomeTipoRefeicao(refeicao.titulo),
        vaiComer,
        instituicaoId
      );
    } catch (e) {
      console.error('Erro ao salvar confirmação:', e);
      setErro('Não foi possível salvar sua escolha. Tente novamente.');
    } finally {
      setSalvando(null);
    }
  }

  const totalRefeicoes = dias.reduce((total, dia) => total + dia.refeicoes.length, 0);
  const refeicoesRespondidas = dias.reduce(
    (total, dia) =>
      total + dia.refeicoes.filter((_, indice) => respostaDe(dia, indice) !== undefined).length,
    0
  );
  const refeicoesPendentes = totalRefeicoes - refeicoesRespondidas;

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Planeje suas refeições" />

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introducao}>
          <View style={styles.introducaoIcone}>
            <MaterialCommunityIcons name="calendar-check-outline" size={25} color={colors.primary} />
          </View>
          <Text style={styles.introducaoTitulo}>Organize sua semana</Text>
          <Text style={styles.introducaoTexto}>
            Confira o cardápio e escolha em cada refeição se você vai comer ou não.
          </Text>
        </View>

        {!carregando && totalRefeicoes > 0 && (
          <View style={styles.resumo}>
            <View style={styles.resumoItem}>
              <Text style={styles.resumoNumero}>{totalRefeicoes}</Text>
              <Text style={styles.resumoLegenda}>Refeições</Text>
            </View>
            <View style={styles.resumoDivisor} />
            <View style={styles.resumoItem}>
              <Text style={[styles.resumoNumero, { color: '#2E7D32' }]}>{refeicoesRespondidas}</Text>
              <Text style={styles.resumoLegenda}>Respondidas</Text>
            </View>
            <View style={styles.resumoDivisor} />
            <View style={styles.resumoItem}>
              <Text style={[styles.resumoNumero, { color: refeicoesPendentes > 0 ? '#B26A00' : '#2E7D32' }]}>
                {refeicoesPendentes}
              </Text>
              <Text style={styles.resumoLegenda}>Pendentes</Text>
            </View>
          </View>
        )}

        {erro && (
          <View style={styles.bannerErro} testID="refeicoesdia-erro">
            <MaterialCommunityIcons
              name="alert-circle"
              size={18}
              color="#B3261E"
            />

            <Text style={styles.bannerErroText}>{erro}</Text>
          </View>
        )}

        {carregando ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 24 }} />
        ) : (
          dias.map((dia) => (
            <View key={dia.codigo} style={styles.diaContainer}>
              <View style={styles.dateWrap}>
                <View style={styles.dateTextos}>
                  <Text style={styles.dateTitle}>
                    {NOME_COMPLETO_DIA[dia.codigo]}
                  </Text>
                  <Text style={styles.dateSub}>{formatarData(dia.data)}</Text>
                </View>
                <View style={styles.contagemDia}>
                  <Text style={styles.contagemDiaTexto}>
                    {dia.refeicoes.filter((_, indice) => respostaDe(dia, indice) !== undefined).length}/{dia.refeicoes.length}
                  </Text>
                  <Text style={styles.contagemDiaLegenda}>feitas</Text>
                </View>
              </View>

              {dia.refeicoes.length === 0 ? (
                <View style={styles.semRefeicao}>
                  <MaterialCommunityIcons
                    name="calendar-blank-outline"
                    size={22}
                    color={colors.textMuted}
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
                            size={22}
                            color="#fff"
                          />
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text style={styles.titulo}>{refeicao.titulo}</Text>
                          <Text style={styles.horario}>{refeicao.horario}</Text>
                        </View>
                      </View>

                      <Text style={styles.desc}>{refeicao.desc}</Text>

                      <View style={styles.pergunta}>
                        <MaterialCommunityIcons
                          name="help-circle-outline"
                          size={16}
                          color={colors.textMuted}
                        />
                        <Text style={styles.perguntaTexto}>Você vai consumir esta refeição?</Text>
                      </View>

                      <View style={styles.opcoes}>
                        <Pressable
                          testID={`refeicao-${dia.codigo}-${i}-sim`}
                          style={[
                            styles.opcaoBtn,
                            resposta === true && styles.opcaoBtnSimAtivo,
                          ]}
                          onPress={() => escolher(dia, i, true)}
                          disabled={estaSalvando}
                        >
                          <MaterialCommunityIcons
                            name="check-circle"
                            size={16}
                            color={resposta === true ? '#fff' : '#2E7D32'}
                          />

                          <Text
                            style={[
                              styles.opcaoText,
                              resposta === true && styles.opcaoTextAtivo,
                            ]}
                          >
                            Vou comer
                          </Text>
                        </Pressable>

                        <Pressable
                          testID={`refeicao-${dia.codigo}-${i}-nao`}
                          style={[
                            styles.opcaoBtn,
                            resposta === false && styles.opcaoBtnNaoAtivo,
                          ]}
                          onPress={() => escolher(dia, i, false)}
                          disabled={estaSalvando}
                        >
                          <MaterialCommunityIcons
                            name="close-circle"
                            size={16}
                            color={resposta === false ? '#fff' : '#B3261E'}
                          />

                          <Text
                            style={[
                              styles.opcaoText,
                              resposta === false && styles.opcaoTextAtivo,
                            ]}
                          >
                            Não vou
                          </Text>
                        </Pressable>
                      </View>

                      {resposta === undefined ? (
                        <View style={styles.statusPendente}>
                          <MaterialCommunityIcons name="clock-outline" size={14} color="#9A6700" />
                          <Text style={styles.pendenteText}>Aguardando sua resposta</Text>
                        </View>
                      ) : (
                        <View style={styles.statusRespondido}>
                          <MaterialCommunityIcons
                            name="check-circle-outline"
                            size={14}
                            color={resposta ? '#2E7D32' : '#B3261E'}
                          />
                          <Text style={[styles.respondidoText, { color: resposta ? '#2E7D32' : '#B3261E' }]}>
                            {resposta ? 'Você confirmou que vai comer' : 'Você informou que não vai comer'}
                          </Text>
                        </View>
                      )}

                      {estaSalvando && (
                        <ActivityIndicator
                          size="small"
                          color={colors.primary}
                          style={{ marginTop: 8 }}
                        />
                      )}
                    </View>
                  );
                })
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
  },

  body: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 40,
  },

  introducao: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 22,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1E8D8',
  },

  introducaoIcone: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#FFF4D6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  introducaoTitulo: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textDark,
    textAlign: 'center',
  },

  introducaoTexto: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 7,
    lineHeight: 19,
    textAlign: 'center',
  },

  resumo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: '#F1E8D8',
  },

  resumoItem: {
    flex: 1,
    alignItems: 'center',
  },

  resumoNumero: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textDark,
  },

  resumoLegenda: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 3,
    textAlign: 'center',
  },

  resumoDivisor: {
    width: 1,
    height: 34,
    backgroundColor: '#EEE5D7',
  },

  diaContainer: {
    marginBottom: 22,
  },

  dateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 2,
  },

  dateTextos: {
    flex: 1,
  },

  dateTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: colors.textDark,
  },

  dateSub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 3,
  },

  contagemDia: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 56,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#FFF4D6',
  },

  contagemDiaTexto: {
    color: colors.textDark,
    fontSize: 14,
    fontWeight: '800',
  },

  contagemDiaLegenda: {
    color: colors.textMuted,
    fontSize: 10,
    marginTop: 1,
  },

  semRefeicao: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#F1E8D8',
  },

  semRefeicaoTexto: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1E8D8',
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  icon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  titulo: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textDark,
  },

  horario: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 4,
  },

  desc: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 12,
    lineHeight: 19,
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
    color: colors.textDark,
    fontSize: 12,
    fontWeight: '700',
  },

  opcoes: {
    flexDirection: 'row',
    gap: 10,
  },

  opcaoBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },

  opcaoBtnSimAtivo: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },

  opcaoBtnNaoAtivo: {
    backgroundColor: '#B3261E',
    borderColor: '#B3261E',
  },

  opcaoText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textDark,
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
    backgroundColor: '#FFF4D6',
  },

  pendenteText: {
    fontSize: 11,
    color: '#8A5A00',
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
    backgroundColor: '#F5F7F2',
  },

  respondidoText: {
    fontSize: 11,
    fontWeight: '600',
  },

  bannerErro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FDECEA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },

  bannerErroText: {
    flex: 1,
    color: '#B3261E',
    fontSize: 13,
    fontWeight: '600',
  },
});