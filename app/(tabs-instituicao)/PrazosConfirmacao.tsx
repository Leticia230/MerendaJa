import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Switch,
  Alert,
  Platform,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';

import Text from '../../components/AppText';
import { useResponsive } from '../../hooks/useResponsive';
import ResponsiveContainer from '../../components/ResponsiveContainer';

import {
  DiaSemana,
  TipoRefeicao,
  PrazosPorDia,
  buscarPrazosConfirmacao,
  salvarPrazosConfirmacao,
} from '../services/prazosConfirmacao';

const DIAS: { id: DiaSemana; nome: string }[] = [
  { id: 'segunda', nome: 'Segunda-feira' },
  { id: 'terca', nome: 'Terça-feira' },
  { id: 'quarta', nome: 'Quarta-feira' },
  { id: 'quinta', nome: 'Quinta-feira' },
  { id: 'sexta', nome: 'Sexta-feira' },
  { id: 'sabado', nome: 'Sábado' },
  { id: 'domingo', nome: 'Domingo' },
];

const REFEICOES: {
  id: TipoRefeicao;
  nome: string;
  icone: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: 'cafe', nome: 'Café da manhã', icone: 'sunny-outline' },
  { id: 'almoco', nome: 'Almoço', icone: 'restaurant-outline' },
  { id: 'jantar', nome: 'Jantar', icone: 'moon-outline' },
];

export default function PrazosConfirmacao() {
  const router = useRouter();

  const { isSmallScreen, fontScale } = useResponsive();
  const compacto = isSmallScreen || fontScale >= 1.2;

  const styles = useMemo(
    () => createStyles(compacto),
    [compacto]
  );

  const [diaSelecionado, setDiaSelecionado] =
    useState<DiaSemana>('segunda');

  const [prazos, setPrazos] = useState<PrazosPorDia | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [seletorAberto, setSeletorAberto] = useState(false);
  const [refeicaoEditando, setRefeicaoEditando] =
    useState<TipoRefeicao | null>(null);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const dados = await buscarPrazosConfirmacao();

        if (ativo) {
          setPrazos(dados);
          setErroCarregamento(false);
        }
      } catch (erro) {
        console.error('Erro ao carregar prazos:', erro);

        if (ativo) {
          setErroCarregamento(true);
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, []);

  function atualizarPrazo(
    tipo: TipoRefeicao,
    campo: 'ativo' | 'horario',
    valor: boolean | string
  ) {
    setPrazos((atual) => {
      if (!atual) return atual;

      return {
        ...atual,
        [diaSelecionado]: {
          ...atual[diaSelecionado],
          [tipo]: {
            ...atual[diaSelecionado][tipo],
            [campo]: valor,
          },
        },
      };
    });
  }

  function abrirSeletorHorario(tipo: TipoRefeicao) {
    if (!prazos?.[diaSelecionado][tipo].ativo) return;

    setRefeicaoEditando(tipo);
    setSeletorAberto(true);
  }

  function fecharSeletorHorario() {
    setSeletorAberto(false);
    setRefeicaoEditando(null);
  }

  function alterarHorarioSelecionado(data: Date) {
    if (!refeicaoEditando) return;

    const horas = String(data.getHours()).padStart(2, '0');
    const minutos = String(data.getMinutes()).padStart(2, '0');

    atualizarPrazo(
      refeicaoEditando,
      'horario',
      `${horas}:${minutos}`
    );

    fecharSeletorHorario();
  }

  function aoAlterarHorario(
    event: DateTimePickerEvent,
    dataSelecionada?: Date
  ) {
    if (event.type === 'dismissed') {
      fecharSeletorHorario();
      return;
    }

    if (dataSelecionada) {
      alterarHorarioSelecionado(dataSelecionada);
    }
  }

  async function salvar() {
    if (!prazos) return;

    for (const dia of DIAS) {
      for (const refeicao of REFEICOES) {
        const prazo = prazos[dia.id][refeicao.id];

        if (!/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(prazo.horario)) {
          Alert.alert(
            'Horário inválido',
            `Confira o horário de ${refeicao.nome} em ${dia.nome}. Use o formato HH:MM.`
          );
          return;
        }
      }
    }

    try {
      setSalvando(true);

      await salvarPrazosConfirmacao(prazos);

      Alert.alert('Sucesso', 'Prazos salvos com sucesso!');
    } catch (erro) {
      console.error('Erro ao salvar prazos:', erro);

      Alert.alert(
        'Erro',
        'Não foi possível salvar os prazos. Tente novamente.'
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <SafeAreaView style={styles.centralizado}>
        <ResponsiveContainer style={styles.estadoConteudo}>
          <ActivityIndicator size="large" color="#fcac00" />

          <Text style={styles.textoCarregando}>
            Carregando prazos...
          </Text>
        </ResponsiveContainer>
      </SafeAreaView>
    );
  }

  if (erroCarregamento || !prazos) {
    return (
      <SafeAreaView style={styles.centralizado}>
        <ResponsiveContainer style={styles.estadoConteudo}>
          <Ionicons
            name="alert-circle-outline"
            size={42}
            color="#fcac00"
          />

          <Text style={styles.tituloErro}>
            Não foi possível carregar os prazos.
          </Text>

          <Text style={styles.textoErro}>
            Verifique sua conexão e tente novamente.
          </Text>

          <Pressable
            onPress={() => router.back()}
            style={styles.botaoVoltarErro}
            accessibilityRole="button"
          >
            <Text style={styles.textoBotaoVoltarErro}>
              Voltar
            </Text>
          </Pressable>
        </ResponsiveContainer>
      </SafeAreaView>
    );
  }

  const horarioAtual =
    refeicaoEditando &&
    prazos[diaSelecionado][refeicaoEditando].horario;

  const dataInicial = (() => {
    const [hora, minuto] = (horarioAtual || '09:00')
      .split(':')
      .map(Number);

    const data = new Date();
    data.setHours(hora, minuto, 0, 0);

    return data;
  })();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <ResponsiveContainer style={styles.headerContent}>
          <Pressable
            onPress={() => router.back()}
            style={styles.botaoVoltar}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
          >
            <Ionicons name="arrow-back" size={24} color="#222" />
          </Pressable>

          <View style={styles.headerTexto}>
            <Text style={styles.titulo}>
              Prazos de confirmação
            </Text>

            <Text style={styles.subtitulo}>
              Defina até quando os alunos podem responder.
            </Text>
          </View>
        </ResponsiveContainer>
      </View>

      <ScrollView
        contentContainerStyle={styles.conteudo}
        showsVerticalScrollIndicator={false}
      >
        <ResponsiveContainer style={styles.scrollContent}>
          <Text style={styles.labelSecao}>
            Dia da semana
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.listaDias}
          >
            {DIAS.map((dia) => {
              const selecionado = diaSelecionado === dia.id;

              return (
                <Pressable
                  key={dia.id}
                  onPress={() => setDiaSelecionado(dia.id)}
                  style={[
                    styles.botaoDia,
                    selecionado && styles.botaoDiaSelecionado,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: selecionado }}
                  accessibilityLabel={dia.nome}
                >
                  <Text
                    style={[
                      styles.textoDia,
                      selecionado && styles.textoDiaSelecionado,
                    ]}
                  >
                    {dia.nome.slice(0, 3)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text style={styles.diaAtual}>
            {DIAS.find((dia) => dia.id === diaSelecionado)?.nome}
          </Text>

          {REFEICOES.map((refeicao) => {
            const prazo = prazos[diaSelecionado][refeicao.id];

            return (
              <View key={refeicao.id} style={styles.card}>
                <View style={styles.cardTopo}>
                  <View style={styles.refeicaoTitulo}>
                    <Ionicons
                      name={refeicao.icone}
                      size={23}
                      color="#fcac00"
                    />

                    <Text style={styles.nomeRefeicao}>
                      {refeicao.nome}
                    </Text>
                  </View>

                  <Switch
                    value={prazo.ativo}
                    onValueChange={(valor) =>
                      atualizarPrazo(refeicao.id, 'ativo', valor)
                    }
                    trackColor={{
                      false: '#ccc',
                      true: '#e2d9c7',
                    }}
                    thumbColor={prazo.ativo ? '#fcac00' : '#f4f3f4'}
                    accessibilityLabel={`Ativar prazo de ${refeicao.nome}`}
                  />
                </View>

                <Text style={styles.descricao}>
                  {prazo.ativo
                    ? 'Horário limite para o aluno confirmar:'
                    : 'Esta refeição está desativada neste dia.'}
                </Text>

                <View style={styles.horarioLinha}>
                  <Ionicons
                    name="time-outline"
                    size={21}
                    color="#666"
                  />

                  <Text style={styles.horarioLabel}>
                    Horário limite
                  </Text>

                  <View style={styles.inputHorario}>
                    <Text
                      style={[
                        styles.horarioValor,
                        !prazo.ativo && styles.horarioDesativado,
                      ]}
                    >
                      {prazo.horario}
                    </Text>
                  </View>
                </View>

                <Pressable
                  onPress={() => abrirSeletorHorario(refeicao.id)}
                  disabled={!prazo.ativo}
                  style={[
                    styles.botaoEditarHorario,
                    !prazo.ativo && styles.botaoEditarDesabilitado,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !prazo.ativo }}
                >
                  <Text
                    style={[
                      styles.textoEditarHorario,
                      !prazo.ativo && styles.textoEditarDesabilitado,
                    ]}
                  >
                    Alterar horário
                  </Text>
                </Pressable>
              </View>
            );
          })}

          <Pressable
            onPress={salvar}
            disabled={salvando}
            style={[
              styles.botaoSalvar,
              salvando && styles.botaoSalvarDesabilitado,
            ]}
            accessibilityRole="button"
            accessibilityState={{ disabled: salvando }}
          >
            {salvando ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons
                  name="save-outline"
                  size={21}
                  color="#fff"
                />

                <Text style={styles.textoSalvar}>
                  Salvar prazos
                </Text>
              </>
            )}
          </Pressable>
        </ResponsiveContainer>
      </ScrollView>

      {seletorAberto && refeicaoEditando && (
        <DateTimePicker
          value={dataInicial}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          is24Hour
          onChange={aoAlterarHorario}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (compacto = false) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F5F7F5',
    },

    centralizado: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      backgroundColor: '#F5F7F5',
    },

    estadoConteudo: {
      flex: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },

    textoCarregando: {
      marginTop: 12,
      color: '#555',
      fontSize: 15,
      textAlign: 'center',
    },

    tituloErro: {
      fontSize: 17,
      fontWeight: 'bold',
      color: '#222',
      textAlign: 'center',
      marginTop: 14,
    },

    textoErro: {
      fontSize: 14,
      color: '#777',
      textAlign: 'center',
      marginTop: 8,
    },

    botaoVoltarErro: {
      backgroundColor: '#2E7D32',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 10,
      marginTop: 20,
    },

    textoBotaoVoltarErro: {
      color: '#fff',
      fontWeight: 'bold',
    },

    header: {
      backgroundColor: '#fff',
      paddingVertical: compacto ? 12 : 16,
    },

    headerContent: {
      flex: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    botaoVoltar: {
      width: 42,
      height: 42,
      flexShrink: 0,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F0F2F0',
    },

    headerTexto: {
      flex: 1,
      minWidth: 0,
    },

    titulo: {
      fontSize: compacto ? 18 : 20,
      fontWeight: 'bold',
      color: '#222',
      flexShrink: 1,
    },

    subtitulo: {
      fontSize: 12,
      color: '#777',
      marginTop: 3,
      flexShrink: 1,
    },

    conteudo: {
      paddingTop: 18,
      paddingBottom: 35,
    },

    scrollContent: {
      flex: 0,
    },

    labelSecao: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#444',
      marginBottom: 10,
    },

    listaDias: {
      gap: 9,
      paddingBottom: 8,
    },

    botaoDia: {
      minWidth: compacto ? 46 : 48,
      minHeight: 42,
      paddingVertical: 10,
      paddingHorizontal: compacto ? 10 : 12,
      borderRadius: 12,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },

    botaoDiaSelecionado: {
      backgroundColor: '#ee932b',
    },

    textoDia: {
      color: '#555',
      fontWeight: '600',
      fontSize: 13,
    },

    textoDiaSelecionado: {
      color: '#fff',
    },

    diaAtual: {
      fontSize: 17,
      fontWeight: 'bold',
      color: '#222',
      marginTop: 16,
      marginBottom: 12,
    },

    card: {
      backgroundColor: '#fff',
      borderRadius: 16,
      padding: compacto ? 13 : 16,
      marginBottom: 13,
      borderWidth: 1,
      borderColor: '#E8ECE8',
    },

    cardTopo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },

    refeicaoTitulo: {
      flex: 1,
      minWidth: 0,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    nomeRefeicao: {
      flex: 1,
      flexShrink: 1,
      fontSize: 16,
      fontWeight: 'bold',
      color: '#252525',
    },

    descricao: {
      color: '#777',
      fontSize: 13,
      lineHeight: 19,
      marginTop: 12,
    },

    horarioLinha: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 14,
      gap: 9,
      flexWrap: 'wrap',
    },

    horarioLabel: {
      color: '#555',
      fontSize: 14,
      flex: 1,
      minWidth: 90,
    },

    inputHorario: {
      backgroundColor: '#F0F5F0',
      paddingHorizontal: 16,
      paddingVertical: 9,
      borderRadius: 10,
    },

    horarioValor: {
      fontSize: 17,
      fontWeight: 'bold',
      color: '#f09936',
    },

    horarioDesativado: {
      color: '#999',
    },

    botaoEditarHorario: {
      alignSelf: 'flex-end',
      marginTop: 8,
      paddingVertical: 10,
      paddingHorizontal: 10,
      minHeight: 40,
      justifyContent: 'center',
    },

    botaoEditarDesabilitado: {
      opacity: 0.45,
    },

    textoEditarHorario: {
      color: '#705722',
      fontSize: 13,
      fontWeight: 'bold',
    },

    textoEditarDesabilitado: {
      color: '#999',
    },

    botaoSalvar: {
      backgroundColor: '#f09936',
      borderRadius: 14,
      minHeight: 52,
      paddingVertical: 15,
      paddingHorizontal: 18,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 9,
      marginTop: 10,
    },

    botaoSalvarDesabilitado: {
      opacity: 0.7,
    },

    textoSalvar: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });
