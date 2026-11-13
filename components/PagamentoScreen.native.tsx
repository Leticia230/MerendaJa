import React, { useState, useCallback, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
import { useAccessibility } from '../components/AccessibilityContext';
import { getPlanoPago } from '../components/planos';
import { ativarPlano } from '../app/services/assinatura';

const BACKEND_URL = `${process.env.EXPO_PUBLIC_BACKEND_URL}/create-payment-intent`;

export default function PaymentScreen() {
  const router = useRouter();
  const { theme } = useAccessibility();
  const styles = createStyles(theme);

  const { plano: planoParam } = useLocalSearchParams<{ plano?: string }>();
  const PLANO = getPlanoPago(planoParam);
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
  }, [PLANO.valorEmCentavos]);

  const iniciarPaymentSheet = useCallback(async () => {
    try {
      setLoading(true);
      setErroInicial(null);
      const clientSecret = await buscarPaymentIntent();

      const { error } = await initPaymentSheet({
        merchantDisplayName: 'Sua Empresa',
        paymentIntentClientSecret: clientSecret,
        defaultBillingDetails: {},
        style: 'alwaysLight',
        appearance: {
          colors: {
            primary: '#F5893C',             
            background: '#FFFFFF',           
            componentBackground: '#FFFFFF',  
            componentBorder: '#DDDDDD',     
            componentDivider: '#DDDDDD',    
            componentText: '#000000',       
            primaryText: '#000000',         
            secondaryText: '#555555',      
            placeholderText: '#888888',      
            icon: '#000000',                
          },
          primaryButton: {
            colors: {
              background: '#F5893C',
              text: '#FFFFFF',
            },
          },
        },
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
      return;
    }

    try {
      await ativarPlano(PLANO);
    } catch {
      Alert.alert(
        'Pagamento confirmado',
        'Recebemos seu pagamento, mas houve um problema ao ativar o plano. Entre em contato com o suporte.'
      );
      return;
    }

    Alert.alert('Pagamento confirmado', 'Seu plano foi ativado com sucesso.', [
      { text: 'OK', onPress: () => router.replace('/(tabs-instituicao)/Home') },
    ]);
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

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
      justifyContent: 'center',
    },

    titulo: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 16,
      textAlign: 'center',
      color: theme.text,
    },

    card: {
      backgroundColor: theme.card,
      borderRadius: 20,
      padding: 24,
      borderWidth: theme.borderWidth,
      borderColor: theme.border,
    },

    marca: {
      fontSize: 20,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: 20,
      color: theme.text,
    },

    seletor: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: theme.inputBorder,
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
      backgroundColor: theme.soft,
    },

    opcaoTexto: {
      color: theme.textMuted,
      fontWeight: '600',
    },

    opcaoTextoAtivo: {
      color: theme.primaryDark,
    },

    descricao: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 16,
    },

    linhaValor: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },

    merchant: {
      color: theme.textMuted,
      fontSize: 13,
    },

    valor: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
    },

    erro: {
      color: theme.error,
      fontSize: 13,
      marginBottom: 16,
      textAlign: 'center',
    },

    botaoPagar: {
      backgroundColor: theme.primary,
      borderRadius: 30,
      paddingVertical: 16,
      alignItems: 'center',
    },

    botaoDesabilitado: {
      opacity: 0.5,
    },

    botaoTexto: {
      color: theme.onPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
  });
