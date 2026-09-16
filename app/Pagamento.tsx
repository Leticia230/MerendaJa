import React, { useState, useCallback, useEffect } from 'react';
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
 
// URL do SEU backend (Cloud Function, Express, etc.) que cria o PaymentIntent
// usando a secret key do Stripe. Troque pelo endereço real quando tiver.
const BACKEND_URL = 'https://SEU-BACKEND-AQUI/create-payment-intent';
 
// Dados do plano - troque pelo plano real que a pessoa está contratando
const PLANO = {
  nome: 'Plano anual',
  descricao: 'Pagamento do plano anual para ter acesso aos serviços',
  valor: 2000.0, // em reais
  valorEmCentavos: 200000, // Stripe trabalha em centavos
};
 
export default function PaymentScreen() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [tipoCartao, setTipoCartao] = useState('credito'); // 'credito' | 'debito'
  const [loading, setLoading] = useState(false);
  const [pronto, setPronto] = useState(false);
 
  // 1. Busca no seu backend o client_secret do PaymentIntent
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
 
  // 2. Inicializa a PaymentSheet do Stripe assim que a tela abre
  const iniciarPaymentSheet = useCallback(async () => {
    try {
      setLoading(true);
      const clientSecret = await buscarPaymentIntent();
 
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'Sua Empresa',
        paymentIntentClientSecret: clientSecret,
        defaultBillingDetails: {},
      });
 
      if (error) {
        Alert.alert('Erro ao preparar pagamento', error.message);
      } else {
        setPronto(true);
      }
    } catch (erro) {
      Alert.alert('Erro', erro.message);
    } finally {
      setLoading(false);
    }
  }, [buscarPaymentIntent, initPaymentSheet]);
 
  useEffect(() => {
    iniciarPaymentSheet();
  }, [iniciarPaymentSheet]);
 
  // 3. Abre a tela de pagamento do Stripe ao tocar em "Pagar"
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
      Alert.alert('Pagamento confirmado', 'Seu plano foi ativado com sucesso.');
      // Aqui você atualiza o status do usuário no seu banco (ex: Firebase)
      // ex: await updateDoc(userRef, { plano: 'premium', status: 'ativo' });
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
            <Text
              style={[
                styles.opcaoTexto,
                tipoCartao === 'credito' && styles.opcaoTextoAtivo,
              ]}
            >
              Crédito
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.opcao, tipoCartao === 'debito' && styles.opcaoAtiva]}
            onPress={() => setTipoCartao('debito')}
          >
            <Text
              style={[
                styles.opcaoTexto,
                tipoCartao === 'debito' && styles.opcaoTextoAtivo,
              ]}
            >
              Débito
            </Text>
          </TouchableOpacity>
        </View>
 
        <Text style={styles.descricao}>{PLANO.descricao}</Text>
 
        <View style={styles.linhaValor}>
          <Text style={styles.merchant}>Sua Empresa</Text>
          <Text style={styles.valor}>
            {PLANO.valor.toLocaleString('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            })}
          </Text>
        </View>
 
        <TouchableOpacity
          style={[styles.botaoPagar, (!pronto || loading) && styles.botaoDesabilitado]}
          onPress={handlePagar}
          disabled={!pronto || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.botaoTexto}>Pagar</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginTop: 260, // espaço reservado pro topo (ex: resumo do pedido, imagem etc.)
  },
  marca: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  seletor: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
  },
  opcao: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  opcaoAtiva: {
    backgroundColor: '#EDEAFB',
  },
  opcaoTexto: {
    color: '#888',
    fontWeight: '600',
  },
  opcaoTextoAtivo: {
    color: '#5B4FE8',
  },
  descricao: {
    fontSize: 14,
    color: '#333',
    marginBottom: 16,
  },
  linhaValor: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  merchant: {
    color: '#888',
    fontSize: 13,
  },
  valor: {
    fontSize: 20,
    fontWeight: '700',
  },
  botaoPagar: {
    backgroundColor: '#F5893C',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  botaoDesabilitado: {
    opacity: 0.5,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
 