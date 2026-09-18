import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
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
  assinarConfirmacaoAluno,
  definirConfirmacao,
  RespostasAluno,
} from './services/confirmacoes';

import {
  NOME_COMPLETO_DIA,
} from './services/data';

type DiaSemana = 'Seg' | 'Ter' | 'Qua' | 'Qui' | 'Sex';

type DiaCardapio = {
  codigo: DiaSemana;
  data: Date;
  refeicoes: Refeicao[];
  respostas: RespostasAluno;
};

const DIAS_UTEIS: DiaSemana[] = [
  'Seg',
  'Ter',
  'Qua',
  'Qui',
  'Sex',
];

function obterProximaSegunda(): Date {
  const hoje = new Date();
  const diaSemana = hoje.getDay();

  const diasAteSegunda =
    diaSemana === 0
      ? 1
      : 8 - diaSemana;

  const segunda = new Date(hoje);

  segunda.setDate(
    hoje.getDate() + diasAteSegunda
  );

  segunda.setHours(0, 0, 0, 0);

  return segunda;
}

function obterProximaSemana(): DiaCardapio[] {
  const segunda = obterProximaSegunda();

  return DIAS_UTEIS.map((codigo, indice) => {
    const data = new Date(segunda);

    data.setDate(
      segunda.getDate() + indice
    );

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

export default function RefeicoesDia() {
  const alunoId = auth.currentUser?.uid;

  const [dias, setDias] = useState<DiaCardapio[]>(
    obterProximaSemana()
  );

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

 
  useEffect(() => {
    setCarregando(true);

    const unsubscribeList: (() => void)[] = [];

    DIAS_UTEIS.forEach((codigo) => {
      const unsubscribe = assinarCardapioDia(
        codigo,
        (refeicoes) => {
          setDias((atual) =>
            atual.map((dia) =>
              dia.codigo === codigo
                ? {
                    ...dia,
                    refeicoes,
                  }
                : dia
            )
          );

          setCarregando(false);
        },
        (erro) => {
          console.error(
            `Erro ao carregar cardápio de ${codigo}:`,
            erro
          );

          setCarregando(false);
        }
      );

      unsubscribeList.push(unsubscribe);
    });

    return () => {
      unsubscribeList.forEach((unsubscribe) =>
        unsubscribe()
      );
    };
  }, []);

 
  useEffect(() => {
    if (!alunoId) return;

    const unsubscribeList: (() => void)[] = [];

    DIAS_UTEIS.forEach((codigo) => {
      const unsubscribe = assinarConfirmacaoAluno(
        codigo,
        alunoId,
        (respostas) => {
          setDias((atual) =>
            atual.map((dia) =>
              dia.codigo === codigo
                ? {
                    ...dia,
                    respostas,
                  }
                : dia
            )
          );
        },
        (erro) => {
          console.error(
            `Erro ao carregar respostas de ${codigo}:`,
            erro
          );
        }
      );

      unsubscribeList.push(unsubscribe);
    });

    return () => {
      unsubscribeList.forEach((unsubscribe) =>
        unsubscribe()
      );
    };
  }, [alunoId]);

  async function escolher(
    dia: DiaSemana,
    indice: number,
    vaiComer: boolean
  ) {
    if (!alunoId) {
      setErro(
        'Não foi possível identificar seu usuário. Faça login novamente.'
      );
      return;
    }

    const chave = `${dia}-${indice}`;

    setErro(null);
    setSalvando(chave);

    try {
      await definirConfirmacao(
        dia,
        alunoId,
        indice,
        vaiComer
      );
    } catch (e) {
      console.error(
        'Erro ao salvar confirmação:',
        e
      );

      setErro(
        'Não foi possível salvar sua escolha. Tente novamente.'
      );
    } finally {
      setSalvando(null);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Refeições da próxima semana" />

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introducao}>
          <Text style={styles.introducaoTitulo}>
            Planeje suas refeições 🍽️
          </Text>

          <Text style={styles.introducaoTexto}>
            Informe quais refeições você pretende
            consumir na próxima semana.
          </Text>
        </View>

        {erro && (
          <View
            style={styles.bannerErro}
            testID="refeicoesdia-erro"
          >
            <MaterialCommunityIcons
              name="alert-circle"
              size={18}
              color="#B3261E"
            />

            <Text style={styles.bannerErroText}>
              {erro}
            </Text>
          </View>
        )}

        {carregando ? (
          <ActivityIndicator
            color={colors.primary}
            style={{ marginTop: 24 }}
          />
        ) : (
          dias.map((dia) => (
            <View
              key={dia.codigo}
              style={styles.diaContainer}
            >
              <View style={styles.dateWrap}>
                <Text style={styles.dateTitle}>
                  {NOME_COMPLETO_DIA[dia.codigo]}
                </Text>

                <Text style={styles.dateSub}>
                  {formatarData(dia.data)}
                </Text>
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
                  const resposta =
                    dia.respostas[i];

                  const chave =
                    `${dia.codigo}-${i}`;

                  const estaSalvando =
                    salvando === chave;

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
                            {
                              backgroundColor:
                                refeicao.color,
                            },
                          ]}
                        >
                          <MaterialCommunityIcons
                            name={
                              refeicao.icon as any
                            }
                            size={22}
                            color="#fff"
                          />
                        </View>

                        <View
                          style={{
                            flex: 1,
                          }}
                        >
                          <Text
                            style={styles.titulo}
                          >
                            {refeicao.titulo}
                          </Text>

                          <Text
                            style={styles.horario}
                          >
                            {refeicao.horario}
                          </Text>
                        </View>
                      </View>

                      <Text style={styles.desc}>
                        {refeicao.desc}
                      </Text>

                      <View style={styles.opcoes}>
                        <Pressable
                          testID={`refeicao-${dia.codigo}-${i}-sim`}
                          style={[
                            styles.opcaoBtn,
                            resposta === true &&
                              styles.opcaoBtnSimAtivo,
                          ]}
                          onPress={() =>
                            escolher(
                              dia.codigo,
                              i,
                              true
                            )
                          }
                          disabled={estaSalvando}
                        >
                          <MaterialCommunityIcons
                            name="check-circle"
                            size={16}
                            color={
                              resposta === true
                                ? '#fff'
                                : '#2E7D32'
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
                          ]}
                          onPress={() =>
                            escolher(
                              dia.codigo,
                              i,
                              false
                            )
                          }
                          disabled={estaSalvando}
                        >
                          <MaterialCommunityIcons
                            name="close-circle"
                            size={16}
                            color={
                              resposta === false
                                ? '#fff'
                                : '#B3261E'
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

                      {resposta === undefined && (
                        <Text
                          style={
                            styles.pendenteText
                          }
                        >
                          Você ainda não respondeu
                          essa refeição.
                        </Text>
                      )}

                      {estaSalvando && (
                        <ActivityIndicator
                          size="small"
                          color={colors.primary}
                          style={{
                            marginTop: 8,
                          }}
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
    padding: 18,
    paddingBottom: 40,
  },

  introducao: {
    marginBottom: 20,
  },

  introducaoTitulo: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textDark,
  },

  introducaoTexto: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 5,
    lineHeight: 18,
  },

  diaContainer: {
    marginBottom: 18,
  },

  dateWrap: {
    marginBottom: 10,
  },

  dateTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textDark,
  },

  dateSub: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 2,
  },

  semRefeicao: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },

  semRefeicaoTexto: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 7,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  titulo: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textDark,
  },

  horario: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },

  desc: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 10,
    lineHeight: 17,
  },

  opcoes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
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
    paddingVertical: 10,
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
    color: '#fff',
  },

  pendenteText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 8,
    fontStyle: 'italic',
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
