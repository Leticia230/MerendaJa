import React, { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';


const BACKEND_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}/create-payment-intent`;
const PLANO = {
  nome: 'Plano anual',
  descricao: 'Pagamento do plano anual para ter acesso aos serviços',
  valor: 150.0,
  valorEmCentavos: 15000,
};

export default function PaymentScreen() {
  const router = useRouter();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [tipoCartao, setTipoCartao] = useState('credito');
  const [loading, setLoading] = useState(false);
  const [pronto, setPronto] = useState(false);
  const [erroInicial, setErroInicial] = useState<string | null>(null);

  const buscarPaymentIntent = useCallback(async () => {
    const resposta = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        valor: PLANO.valorEmCentavos,
        moeda: 'brl',
      }),
    });

    if (!resposta.ok) {
      throw new Error('Não foi possível iniciar o pagamento');
    }

    const dados = await resposta.json();
    return dados.clientSecret;
  }, []);

  const iniciarPaymentSheet = useCallback(async () => {
    try {
      setLoading(true);
      setErroInicial(null);
      const clientSecret = await buscarPaymentIntent();

      const { error } = await initPaymentSheet({
        merchantDisplayName: 'Sua Empresa',
        paymentIntentClientSecret: clientSecret,
        defaultBillingDetails: {},
      });

      if (error) {
        setErroInicial(error.message);
      } else {
        setPronto(true);
      }
    } catch (erro) {
      setErroInicial(
        erro instanceof Error ? erro.message : 'Não foi possível iniciar o pagamento',
      );
    } finally {
      setLoading(false);
    }
  }, [buscarPaymentIntent, initPaymentSheet]);

  useEffect(() => {
    iniciarPaymentSheet();
  }, [iniciarPaymentSheet]);

  const handlePagar = async () => {
    if (!pronto) return;

    setLoading(true);
    const { error } = await presentPaymentSheet();
    setLoading(false);

    if (error) {
      if (error.code !== 'Canceled') {
        Alert.alert('Pagamento não concluído', error.message);
      }
    } else {
      Alert.alert(
        'Pagamento confirmado',
        'Seu plano foi ativado com sucesso.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs-instituicao)/Home'),
          },
        ],
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Pagamento</Text>

      <View style={styles.card}>
        <Text style={styles.marca}>Sua Empresa</Text>

        <View style={styles.seletor}>
          <TouchableOpacity
            style={[styles.opcao, tipoCartao === 'credito' && styles.opcaoAtiva]}
            onPress={() => setTipoCartao('credito')}
          >
            <Text style={[styles.opcaoTexto, tipoCartao === 'credito' && styles.opcaoTextoAtivo]}>
              Crédito
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.opcao, tipoCartao === 'debito' && styles.opcaoAtiva]}
            onPress={() => setTipoCartao('debito')}
          >
            <Text style={[styles.opcaoTexto, tipoCartao === 'debito' && styles.opcaoTextoAtivo]}>
              Débito
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.descricao}>{PLANO.descricao}</Text>

        <View style={styles.linhaValor}>
          <Text style={styles.merchant}>Sua Empresa</Text>
          <Text style={styles.valor}>
            {PLANO.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </Text>
        </View>

        {erroInicial && (
          <Text style={styles.erro}>
            {erroInicial === 'Não foi possível iniciar o pagamento'
              ? 'Ainda não conectado ao backend de pagamento. Configure BACKEND_URL para habilitar.'
              : erroInicial}
          </Text>
        )}

        <TouchableOpacity
          style={[styles.botaoPagar, (!pronto || loading) && styles.botaoDesabilitado]}
          onPress={handlePagar}
          disabled={!pronto || loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.botaoTexto}>Pagar</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 20, justifyContent: 'center' },
  titulo: { fontSize: 18, fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24 },
  marca: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 20 },
  seletor: { flexDirection: 'row', borderWidth: 1, borderColor: '#DDD', borderRadius: 24, overflow: 'hidden', marginBottom: 20 },
  opcao: { flex: 1, paddingVertical: 10, alignItems: 'center' },
  opcaoAtiva: { backgroundColor: '#EDEAFB' },
  opcaoTexto: { color: '#888', fontWeight: '600' },
  opcaoTextoAtivo: { color: '#5B4FE8' },
  descricao: { fontSize: 14, color: '#333', marginBottom: 16 },
  linhaValor: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  merchant: { color: '#888', fontSize: 13 },
  valor: { fontSize: 20, fontWeight: '700' },
  erro: { color: '#C0392B', fontSize: 13, marginBottom: 16, textAlign: 'center' },
  botaoPagar: { backgroundColor: '#F5893C', borderRadius: 30, paddingVertical: 16, alignItems: 'center' },
  botaoDesabilitado: { opacity: 0.5 },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
});