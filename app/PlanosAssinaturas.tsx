import React, { useCallback, useMemo, useState } from 'react';

import {
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  View,
  TouchableOpacity,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';

import ScreenHeader from '../components/ScreenHeader';
import ResponsiveContainer from '../components/ResponsiveContainer';
import { useResponsive } from '../hooks/useResponsive';
import Text from '../components/AppText';
import { useAccessibility } from '../components/AccessibilityContext';

import { PLANOS, PlanoId, formatarValor } from '../components/planos';

import {
  ativarPlano,
  obterAssinatura,
  cancelarAssinatura,
  Assinatura,
} from './services/assinatura';

const formatarData = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR');

const nomeDoPlano = (id: string) =>
  PLANOS.find((p) => p.id === id)?.nome ?? id;

const textoDias = (n: number) =>
  `${n} ${n === 1 ? 'dia restante' : 'dias restantes'}`;

export default function PlanosScreen() {
  const router = useRouter();

  const { theme, fs } = useAccessibility();

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

  const [selecionado, setSelecionado] = useState<PlanoId>('anual');
  const [assinatura, setAssinatura] = useState<Assinatura | null>(null);
  const [mostrarPlanos, setMostrarPlanos] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  const carregar = useCallback(async () => {
    try {
      setAssinatura(await obterAssinatura());
    } catch {
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  const testeIndisponivel = !!assinatura;

  const planoPagoAtivo =
    !!assinatura &&
    assinatura.ativa &&
    assinatura.plano !== 'teste';

  const testeAtivo =
    !!assinatura &&
    assinatura.ativa &&
    assinatura.plano === 'teste';

  const vencida = !!assinatura && !assinatura.ativa;

  const continuar = async () => {
    const plano = PLANOS.find((p) => p.id === selecionado);

    if (!plano) return;

    if (plano.id === 'teste') {
      setEnviando(true);

      try {
        await ativarPlano(plano);
        router.replace('/(tabs-instituicao)/Home' as any);
      } catch {
        Alert.alert(
          'Erro',
          'Não foi possível ativar o teste. Tente novamente.'
        );

        setEnviando(false);
      }

      return;
    }

    router.push({
      pathname: '/Pagamento',
      params: { plano: plano.id },
    } as any);
  };

  const confirmarCancelamento = () => {
    if (!assinatura) return;

    Alert.alert(
      'Cancelar plano',
      `Seu plano não será renovado e você continua com acesso até ${formatarData(
        assinatura.fim
      )}. O valor já pago não é reembolsado automaticamente. Deseja cancelar?`,
      [
        {
          text: 'Manter plano',
          style: 'cancel',
        },
        {
          text: 'Cancelar plano',
          style: 'destructive',
          onPress: async () => {
            setCancelando(true);

            try {
              await cancelarAssinatura();
              await carregar();
            } catch {
              Alert.alert(
                'Erro',
                'Não foi possível cancelar. Tente novamente.'
              );
            } finally {
              setCancelando(false);
            }
          },
        },
      ]
    );
  };

  if (carregando) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ActivityIndicator color={theme.primary} />
      </SafeAreaView>
    );
  }

  if (planoPagoAtivo && assinatura && !mostrarPlanos) {
    const cancelada = assinatura.cancelada;

    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Planos e Assinaturas" />

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
            <View
              style={[
                styles.status,
                {
                  borderColor: cancelada
                    ? theme.error
                    : theme.primary,
                },
              ]}
            >
              <Ionicons
                name={
                  cancelada
                    ? 'close-circle'
                    : 'checkmark-circle'
                }
                size={fs(compacto ? 36 : 40)}
                color={cancelada ? theme.error : theme.primary}
              />

              <Text style={styles.statusTitulo}>
                {cancelada ? 'Plano cancelado' : 'Plano ativo'}
              </Text>

              <Text style={styles.statusPlano}>
                {nomeDoPlano(assinatura.plano)}
              </Text>

              <Text style={styles.statusInfo}>
                {cancelada ? 'Acesso até ' : 'Válido até '}
                {formatarData(assinatura.fim)}
              </Text>

              <Text style={styles.statusInfo}>
                {textoDias(assinatura.diasRestantes)}
              </Text>

              {cancelada && (
                <Text style={styles.statusAviso}>
                  Este plano não será renovado.
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.botao,
                { backgroundColor: theme.primary },
              ]}
              onPress={() => setMostrarPlanos(true)}
              accessibilityRole="button"
            >
              <Text style={styles.botaoTexto}>
                Ver outros planos
              </Text>
            </TouchableOpacity>

            {!cancelada && (
              <TouchableOpacity
                style={[
                  styles.botao,
                  styles.botaoCancelar,
                ]}
                onPress={confirmarCancelamento}
                disabled={cancelando}
                accessibilityRole="button"
              >
                {cancelando ? (
                  <ActivityIndicator color={theme.error} />
                ) : (
                  <Text style={styles.botaoCancelarTexto}>
                    Cancelar plano
                  </Text>
                )}
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.link}
              onPress={() => router.back()}
              accessibilityRole="button"
            >
              <Text style={styles.linkTexto}>
                Voltar
              </Text>
            </TouchableOpacity>
          </ResponsiveContainer>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Escolha seu plano" />

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
          {planoPagoAtivo && assinatura && (
            <View
              style={[
                styles.aviso,
                { borderColor: theme.primary },
              ]}
            >
              <Ionicons
                name="information-circle"
                size={fs(compacto ? 20 : 22)}
                color={theme.primary}
              />

              <Text style={styles.avisoTexto}>
                Seu {nomeDoPlano(assinatura.plano).toLowerCase()} está
                ativo até {formatarData(assinatura.fim)}. Ao contratar
                outro plano, o tempo que resta é somado ao novo.
              </Text>
            </View>
          )}

          {testeAtivo && assinatura && (
            <View
              style={[
                styles.aviso,
                { borderColor: theme.primary },
              ]}
            >
              <Ionicons
                name="time"
                size={fs(compacto ? 20 : 22)}
                color={theme.primary}
              />

              <Text style={styles.avisoTexto}>
                Teste grátis ativo até {formatarData(assinatura.fim)} (
                {textoDias(assinatura.diasRestantes)}). Escolha um plano
                para continuar depois.
              </Text>
            </View>
          )}

          {vencida && assinatura && (
            <View
              style={[
                styles.aviso,
                { borderColor: theme.error },
              ]}
            >
              <Ionicons
                name="alert-circle"
                size={fs(compacto ? 20 : 22)}
                color={theme.error}
              />

              <Text style={styles.avisoTexto}>
                Seu {nomeDoPlano(assinatura.plano).toLowerCase()} venceu
                em {formatarData(assinatura.fim)}. Escolha um plano para
                continuar.
              </Text>
            </View>
          )}

          {!assinatura && (
            <Text style={styles.intro}>
              Comece testando de graça ou escolha um plano para ter
              acesso a todos os serviços.
            </Text>
          )}

          {PLANOS.map((plano) => {
            const isTeste = plano.id === 'teste';
            const desabilitado = isTeste && testeIndisponivel;
            const ativo =
              selecionado === plano.id && !desabilitado;

            const eAtual =
              planoPagoAtivo &&
              assinatura?.plano === plano.id;

            return (
              <TouchableOpacity
                key={plano.id}
                activeOpacity={0.8}
                disabled={desabilitado}
                onPress={() => setSelecionado(plano.id)}
                accessibilityRole="radio"
                accessibilityState={{
                  selected: ativo,
                  disabled: desabilitado,
                }}
                accessibilityLabel={plano.nome}
                style={[
                  styles.card,
                  {
                    borderColor: ativo
                      ? theme.primary
                      : theme.border,
                  },
                  desabilitado && styles.cardDesabilitado,
                ]}
              >
                <View style={styles.cardTopo}>
                  <Ionicons
                    name={
                      ativo
                        ? 'radio-button-on'
                        : 'radio-button-off'
                    }
                    size={fs(compacto ? 20 : 22)}
                    color={
                      ativo
                        ? theme.primary
                        : theme.textSecondary
                    }
                  />

                  <Text style={styles.nome}>
                    {plano.nome}
                  </Text>

                  {eAtual ? (
                    <View
                      style={[
                        styles.selo,
                        { backgroundColor: theme.primary },
                      ]}
                    >
                      <Text style={styles.seloTexto}>
                        Plano atual
                      </Text>
                    </View>
                  ) : plano.destaque && !desabilitado ? (
                    <View
                      style={[
                        styles.selo,
                        { backgroundColor: theme.primary },
                      ]}
                    >
                      <Text style={styles.seloTexto}>
                        {plano.destaque}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <Text style={styles.descricao}>
                  {desabilitado
                    ? 'O teste grátis só pode ser usado uma vez'
                    : plano.descricao}
                </Text>

                <View style={styles.precoLinha}>
                  {isTeste ? (
                    <Text style={styles.preco}>
                      Grátis
                    </Text>
                  ) : (
                    <>
                      <Text style={styles.preco}>
                        {formatarValor(plano.valor)}
                      </Text>

                      <Text style={styles.porMes}>
                        {' '}
                        ≈ {formatarValor(plano.valor / plano.meses)}
                        /mês
                      </Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={[
              styles.botao,
              { backgroundColor: theme.primary },
              enviando && { opacity: 0.6 },
            ]}
            onPress={continuar}
            disabled={enviando}
            accessibilityRole="button"
          >
            {enviando ? (
              <ActivityIndicator color={theme.onPrimary} />
            ) : (
              <Text style={styles.botaoTexto}>
                {selecionado === 'teste'
                  ? 'Começar teste grátis'
                  : 'Continuar para o pagamento'}
              </Text>
            )}
          </TouchableOpacity>

          {planoPagoAtivo && (
            <TouchableOpacity
              style={styles.link}
              onPress={() => setMostrarPlanos(false)}
              accessibilityRole="button"
            >
              <Text style={styles.linkTexto}>
                Voltar ao meu plano
              </Text>
            </TouchableOpacity>
          )}

          {!testeIndisponivel && (
            <Text style={styles.rodape}>
              No teste grátis não pedimos cartão e não há cobrança.
            </Text>
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
      top: 50,
    },

    center: {
      alignItems: 'center',
      justifyContent: 'center',
    },

    scrollContent: {
      flexGrow: 1,
      paddingBottom: compacto ? 24 : 40,
    },

    body: {
      flex: 0,
      paddingTop: compacto ? 14 : 22,
      paddingBottom: compacto ? 20 : 30,
    },

    intro: {
      fontSize: compacto ? 13 : 14,
      color: theme.textSecondary,
      lineHeight: compacto ? 19 : 21,
      marginBottom: compacto ? 14 : 18,
    },

    status: {
      backgroundColor: theme.card,
      borderRadius: 16,
      borderWidth: 2,
      padding: compacto ? 18 : 24,
      alignItems: 'center',
      marginBottom: compacto ? 16 : 20,
    },

    statusTitulo: {
      fontSize: compacto ? 12 : 13,
      fontWeight: '700',
      color: theme.textMuted,
      marginTop: 8,
      textTransform: 'uppercase',
      textAlign: 'center',
    },

    statusPlano: {
      fontSize: compacto ? 20 : 22,
      fontWeight: '700',
      color: theme.text,
      marginTop: 4,
      marginBottom: 12,
      textAlign: 'center',
    },

    statusInfo: {
      fontSize: compacto ? 13 : 14,
      color: theme.textSecondary,
      marginTop: 2,
      textAlign: 'center',
    },

    statusAviso: {
      fontSize: compacto ? 12 : 13,
      color: theme.error,
      marginTop: 10,
      fontWeight: '600',
      textAlign: 'center',
    },

    aviso: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 2,
      padding: compacto ? 11 : 14,
      marginBottom: compacto ? 14 : 18,
      gap: 10,
    },

    avisoTexto: {
      flex: 1,
      flexShrink: 1,
      fontSize: compacto ? 12 : 13,
      color: theme.text,
      lineHeight: compacto ? 18 : 19,
    },

    card: {
      width: '100%',
      backgroundColor: theme.card,
      borderRadius: 14,
      borderWidth: 2,
      padding: compacto ? 13 : 16,
      marginBottom: compacto ? 11 : 14,
    },

    cardDesabilitado: {
      opacity: 0.5,
    },

    cardTopo: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 6,
    },

    nome: {
      flex: 1,
      flexShrink: 1,
      fontSize: compacto ? 14 : 16,
      fontWeight: '700',
      color: theme.text,
      marginLeft: 4,
    },

    selo: {
      borderRadius: 10,
      paddingHorizontal: compacto ? 7 : 8,
      paddingVertical: 3,
      maxWidth: '100%',
    },

    seloTexto: {
      fontSize: compacto ? 10 : 11,
      fontWeight: '700',
      color: theme.white,
    },

    descricao: {
      fontSize: compacto ? 12 : 13,
      color: theme.textMuted,
      marginTop: 8,
      marginLeft: compacto ? 28 : 32,
      lineHeight: compacto ? 17 : 19,
    },

    precoLinha: {
      flexDirection: 'row',
      alignItems: 'baseline',
      flexWrap: 'wrap',
      marginTop: 10,
      marginLeft: compacto ? 28 : 32,
    },

    preco: {
      fontSize: compacto ? 18 : 20,
      fontWeight: '700',
      color: theme.text,
    },

    porMes: {
      fontSize: compacto ? 11 : 12,
      color: theme.textMuted,
    },

    botao: {
      width: '100%',
      minHeight: compacto ? 48 : 50,
      borderRadius: 30,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      marginTop: 8,
    },

    botaoTexto: {
      color: theme.onPrimary,
      fontSize: compacto ? 14 : 16,
      fontWeight: '700',
      textAlign: 'center',
    },

    botaoCancelar: {
      backgroundColor: theme.card,
      borderWidth: 2,
      borderColor: theme.error,
      marginTop: 12,
    },

    botaoCancelarTexto: {
      color: theme.error,
      fontSize: compacto ? 14 : 16,
      fontWeight: '700',
      textAlign: 'center',
    },

    link: {
      alignItems: 'center',
      paddingVertical: compacto ? 12 : 14,
      marginTop: 4,
    },

    linkTexto: {
      fontSize: compacto ? 13 : 14,
      fontWeight: '600',
      color: theme.textSecondary,
      textAlign: 'center',
    },

    rodape: {
      fontSize: compacto ? 11 : 12,
      color: theme.textMuted,
      textAlign: 'center',
      lineHeight: compacto ? 16 : 18,
      marginTop: 14,
    },
  });
