import React, { useCallback, useState } from 'react';
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
import Text from '../components/AppText';
import { useAccessibility } from './AccessibilityContext';
import { PLANOS, PlanoId, formatarValor } from '../components/planos';
import {
  ativarPlano,
  obterAssinatura,
  cancelarAssinatura,
  Assinatura,
} from './services/assinatura';

const formatarData = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');
const nomeDoPlano = (id: string) => PLANOS.find((p) => p.id === id)?.nome ?? id;
const textoDias = (n: number) => `${n} ${n === 1 ? 'dia restante' : 'dias restantes'}`;

export default function PlanosScreen() {
  const router = useRouter();
  const { theme, fs } = useAccessibility();

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
      // mantém o que já estava na tela
    } finally {
      setCarregando(false);
    }
  }, []);

  // Recarrega sempre que a tela ganha foco (por exemplo, ao voltar do pagamento)
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  // Quem já teve qualquer assinatura (inclusive o teste) não pode usar o teste de novo
  const testeIndisponivel = !!assinatura;
  const planoPagoAtivo = !!assinatura && assinatura.ativa && assinatura.plano !== 'teste';
  const testeAtivo = !!assinatura && assinatura.ativa && assinatura.plano === 'teste';
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
        Alert.alert('Erro', 'Não foi possível ativar o teste. Tente novamente.');
        setEnviando(false);
      }
      return;
    }

    router.push({ pathname: '/Pagamento', params: { plano: plano.id } } as any);
  };

  const confirmarCancelamento = () => {
    if (!assinatura) return;
    Alert.alert(
      'Cancelar plano',
      `Seu plano não será renovado e você continua com acesso até ${formatarData(
        assinatura.fim
      )}. O valor já pago não é reembolsado automaticamente. Deseja cancelar?`,
      [
        { text: 'Manter plano', style: 'cancel' },
        {
          text: 'Cancelar plano',
          style: 'destructive',
          onPress: async () => {
            setCancelando(true);
            try {
              await cancelarAssinatura();
              await carregar();
            } catch {
              Alert.alert('Erro', 'Não foi possível cancelar. Tente novamente.');
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

  // Plano pago em vigor: mostra o status com as ações
  if (planoPagoAtivo && assinatura && !mostrarPlanos) {
    const cancelada = assinatura.cancelada;

    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Planos e Assinaturas" />
        <ScrollView contentContainerStyle={styles.body}>
          <View style={[styles.status, { borderColor: cancelada ? '#d64545' : theme.primary }]}>
            <Ionicons
              name={cancelada ? 'close-circle' : 'checkmark-circle'}
              size={fs(40)}
              color={cancelada ? '#d64545' : theme.primary}
            />
            <Text style={styles.statusTitulo}>{cancelada ? 'Plano cancelado' : 'Plano ativo'}</Text>
            <Text style={styles.statusPlano}>{nomeDoPlano(assinatura.plano)}</Text>
            <Text style={styles.statusInfo}>
              {cancelada ? 'Acesso até ' : 'Válido até '}
              {formatarData(assinatura.fim)}
            </Text>
            <Text style={styles.statusInfo}>{textoDias(assinatura.diasRestantes)}</Text>
            {cancelada && (
              <Text style={styles.statusAviso}>Este plano não será renovado.</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.botao, { backgroundColor: theme.primary }]}
            onPress={() => setMostrarPlanos(true)}
            accessibilityRole="button"
          >
            <Text style={styles.botaoTexto}>Ver outros planos</Text>
          </TouchableOpacity>

          {!cancelada && (
            <TouchableOpacity
              style={[styles.botao, styles.botaoCancelar]}
              onPress={confirmarCancelamento}
              disabled={cancelando}
              accessibilityRole="button"
            >
              {cancelando ? (
                <ActivityIndicator color="#d64545" />
              ) : (
                <Text style={styles.botaoCancelarTexto}>Cancelar plano</Text>
              )}
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.link}
            onPress={() => router.back()}
            accessibilityRole="button"
          >
            <Text style={styles.linkTexto}>Voltar</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Lista de planos
  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Escolha seu plano" />
      <ScrollView contentContainerStyle={styles.body}>
        {planoPagoAtivo && assinatura && (
          <View style={[styles.aviso, { borderColor: theme.primary }]}>
            <Ionicons name="information-circle" size={fs(22)} color={theme.primary} />
            <Text style={styles.avisoTexto}>
              Seu {nomeDoPlano(assinatura.plano).toLowerCase()} está ativo até{' '}
              {formatarData(assinatura.fim)}. Ao contratar outro plano, o tempo que resta é somado
              ao novo.
            </Text>
          </View>
        )}

        {testeAtivo && assinatura && (
          <View style={[styles.aviso, { borderColor: theme.primary }]}>
            <Ionicons name="time" size={fs(22)} color={theme.primary} />
            <Text style={styles.avisoTexto}>
              Teste grátis ativo até {formatarData(assinatura.fim)} ({textoDias(assinatura.diasRestantes)}
              ). Escolha um plano para continuar depois.
            </Text>
          </View>
        )}

        {vencida && assinatura && (
          <View style={[styles.aviso, { borderColor: '#d64545' }]}>
            <Ionicons name="alert-circle" size={fs(22)} color="#d64545" />
            <Text style={styles.avisoTexto}>
              Seu {nomeDoPlano(assinatura.plano).toLowerCase()} venceu em{' '}
              {formatarData(assinatura.fim)}. Escolha um plano para continuar.
            </Text>
          </View>
        )}

        {!assinatura && (
          <Text style={styles.intro}>
            Comece testando de graça ou escolha um plano para ter acesso a todos os serviços.
          </Text>
        )}

        {PLANOS.map((plano) => {
          const isTeste = plano.id === 'teste';
          const desabilitado = isTeste && testeIndisponivel;
          const ativo = selecionado === plano.id && !desabilitado;
          const eAtual = planoPagoAtivo && assinatura?.plano === plano.id;

          return (
            <TouchableOpacity
              key={plano.id}
              activeOpacity={0.8}
              disabled={desabilitado}
              onPress={() => setSelecionado(plano.id)}
              accessibilityRole="radio"
              accessibilityState={{ selected: ativo, disabled: desabilitado }}
              accessibilityLabel={plano.nome}
              style={[
                styles.card,
                { borderColor: ativo ? theme.primary : '#E5E5E5' },
                desabilitado && styles.cardDesabilitado,
              ]}
            >
              <View style={styles.cardTopo}>
                <Ionicons
                  name={ativo ? 'radio-button-on' : 'radio-button-off'}
                  size={fs(22)}
                  color={ativo ? theme.primary : theme.textSecondary}
                />
                <Text style={styles.nome}>{plano.nome}</Text>
                {eAtual ? (
                  <View style={[styles.selo, { backgroundColor: '#333' }]}>
                    <Text style={styles.seloTexto}>Plano atual</Text>
                  </View>
                ) : plano.destaque && !desabilitado ? (
                  <View style={[styles.selo, { backgroundColor: theme.primary }]}>
                    <Text style={styles.seloTexto}>{plano.destaque}</Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.descricao}>
                {desabilitado ? 'O teste grátis só pode ser usado uma vez' : plano.descricao}
              </Text>

              <View style={styles.precoLinha}>
                {isTeste ? (
                  <Text style={styles.preco}>Grátis</Text>
                ) : (
                  <>
                    <Text style={styles.preco}>{formatarValor(plano.valor)}</Text>
                    <Text style={styles.porMes}>
                      {' '}
                      ≈ {formatarValor(plano.valor / plano.meses)}/mês
                    </Text>
                  </>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity
          style={[styles.botao, { backgroundColor: theme.primary }, enviando && { opacity: 0.6 }]}
          onPress={continuar}
          disabled={enviando}
          accessibilityRole="button"
        >
          {enviando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoTexto}>
              {selecionado === 'teste' ? 'Começar teste grátis' : 'Continuar para o pagamento'}
            </Text>
          )}
        </TouchableOpacity>

        {planoPagoAtivo && (
          <TouchableOpacity
            style={styles.link}
            onPress={() => setMostrarPlanos(false)}
            accessibilityRole="button"
          >
            <Text style={styles.linkTexto}>Voltar ao meu plano</Text>
          </TouchableOpacity>
        )}

        {!testeIndisponivel && (
          <Text style={styles.rodape}>No teste grátis não pedimos cartão e não há cobrança.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8F0', top: 50 }, // use o mesmo valor de colors.cream
  center: { alignItems: 'center', justifyContent: 'center' },
  body: { padding: 22, paddingBottom: 40 },
  intro: { fontSize: 14, color: '#555', lineHeight: 21, marginBottom: 18 },

  // Status do plano
  status: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  statusTitulo: { fontSize: 13, fontWeight: '700', color: '#777', marginTop: 8, textTransform: 'uppercase' },
  statusPlano: { fontSize: 22, fontWeight: '700', color: '#333', marginTop: 4, marginBottom: 12 },
  statusInfo: { fontSize: 14, color: '#555', marginTop: 2 },
  statusAviso: { fontSize: 13, color: '#d64545', marginTop: 10, fontWeight: '600' },

  // Avisos
  aviso: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    padding: 14,
    marginBottom: 18,
  },
  avisoTexto: { flex: 1, fontSize: 13, color: '#333', lineHeight: 19, marginLeft: 10 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 2,
    padding: 16,
    marginBottom: 14,
  },
  cardDesabilitado: { opacity: 0.5 },
  cardTopo: { flexDirection: 'row', alignItems: 'center' },
  nome: { flex: 1, fontSize: 16, fontWeight: '700', color: '#333', marginLeft: 10 },
  selo: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  seloTexto: { fontSize: 11, fontWeight: '700', color: '#fff' },
  descricao: { fontSize: 13, color: '#777', marginTop: 8, marginLeft: 32 },
  precoLinha: { flexDirection: 'row', alignItems: 'baseline', marginTop: 10, marginLeft: 32 },
  preco: { fontSize: 20, fontWeight: '700', color: '#333' },
  porMes: { fontSize: 12, color: '#777' },

  botao: {
    minHeight: 50,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
  botaoCancelar: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#d64545',
    marginTop: 12,
  },
  botaoCancelarTexto: { color: '#d64545', fontSize: 16, fontWeight: '700' },
  link: { alignItems: 'center', paddingVertical: 14, marginTop: 4 },
  linkTexto: { fontSize: 14, fontWeight: '600', color: '#777' },
  rodape: { fontSize: 12, color: '#777', textAlign: 'center', marginTop: 14 },
});