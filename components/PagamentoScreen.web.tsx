import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';

const BACKEND_URL = 'https://SEU-BACKEND-AQUI/create-checkout-session';

const PLANO = {
  nome: 'Plano anual',
  descricao: 'Pagamento do plano anual para ter acesso aos serviços',
  valor: 2000.0,
  valorEmCentavos: 200000,
};

export default function PaymentScreenWeb() {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handlePagar() {
    setLoading(true);
    setErro(null);

    try {
      const resposta = await fetch(BACKEND_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          valor: PLANO.valorEmCentavos,
          moeda: 'brl',
          successUrl: `${window.location.origin}/pagamento-confirmado`,
          cancelUrl: window.location.href,
        }),
      });

      if (!resposta.ok) {
        throw new Error('Não foi possível iniciar o pagamento');
      }

      const { url } = await resposta.json();
      window.location.href = url;
    } catch (e) {
      setErro(
        e instanceof Error
          ? 'Ainda não conectado ao backend de pagamento. Configure BACKEND_URL para habilitar.'
          : 'Erro no pagamento',
      );
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Pagamento</Text>

      <View style={styles.card}>
        <Text style={styles.marca}>Sua Empresa</Text>

        <Text style={styles.descricao}>{PLANO.descricao}</Text>

        <View style={styles.linhaValor}>
          <Text style={styles.merchant}>Sua Empresa</Text>
          <Text style={styles.valor}>
            {PLANO.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </Text>
        </View>

        {erro && <Text style={styles.erro}>{erro}</Text>}

        <TouchableOpacity
          style={[styles.botaoPagar, loading && styles.botaoDesabilitado]}
          onPress={handlePagar}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.botaoTexto}>Pagar</Text>}
        </TouchableOpacity>

        <Text style={styles.aviso}>Você será redirecionado para o ambiente seguro do Stripe.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 20, justifyContent: 'center', alignItems: 'center' },
  titulo: { fontSize: 18, fontWeight: '600', marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 420 },
  marca: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 20 },
  descricao: { fontSize: 14, color: '#333', marginBottom: 16 },
  linhaValor: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  merchant: { color: '#888', fontSize: 13 },
  valor: { fontSize: 20, fontWeight: '700' },
  erro: { color: '#C0392B', fontSize: 13, marginBottom: 16, textAlign: 'center' },
  botaoPagar: { backgroundColor: '#F5893C', borderRadius: 30, paddingVertical: 16, alignItems: 'center' },
  botaoDesabilitado: { opacity: 0.5 },
  botaoTexto: { color: '#fff', fontSize: 16, fontWeight: '700' },
  aviso: { fontSize: 12, color: '#999', textAlign: 'center', marginTop: 12 },
});