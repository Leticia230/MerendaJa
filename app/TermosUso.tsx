import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { colors } from '../constants/theme';

export default function TermsOfUseScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Termos de Uso" />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.updatedAt}>Última atualização: 23 de agosto de 2026</Text>

        <Text style={styles.sectionTitle}>1. Aceitação dos termos</Text>
        <Text style={styles.paragraph}>
          Ao acessar e utilizar este aplicativo, você concorda em cumprir estes Termos de Uso.
          Caso não concorde com alguma parte destes termos, pedimos que não utilize o aplicativo.
        </Text>

        <Text style={styles.sectionTitle}>2. Uso do serviço</Text>
        <Text style={styles.paragraph}>
          O aplicativo deve ser utilizado apenas para fins legais e de acordo com estes termos.
          É proibido utilizar o serviço de forma que possa danificar, desabilitar ou sobrecarregar
          a plataforma.
        </Text>

        <Text style={styles.sectionTitle}>3. Conta do usuário</Text>
        <Text style={styles.paragraph}>
          Você é responsável por manter a confidencialidade das informações da sua conta e por
          todas as atividades realizadas nela. Notifique-nos imediatamente sobre qualquer uso não
          autorizado.
        </Text>

        <Text style={styles.sectionTitle}>4. Privacidade</Text>
        <Text style={styles.paragraph}>
          O uso de suas informações pessoais é regido pela nossa Política de Privacidade,
          disponível na seção de Segurança e Privacidade do aplicativo.
        </Text>

        <Text style={styles.sectionTitle}>5. Alterações nos termos</Text>
        <Text style={styles.paragraph}>
          Podemos atualizar estes termos periodicamente. Notificaremos sobre mudanças
          significativas por meio do aplicativo ou e-mail cadastrado.
        </Text>

        <Text style={styles.sectionTitle}>6. Limitação de responsabilidade</Text>
        <Text style={styles.paragraph}>
          O aplicativo é fornecido "como está", sem garantias de qualquer tipo. Não nos
          responsabilizamos por danos indiretos decorrentes do uso do serviço.
        </Text>

        <Text style={styles.sectionTitle}>7. Contato</Text>
        <Text style={styles.paragraph}>
          Em caso de dúvidas sobre estes Termos de Uso, entre em contato através do suporte
          disponível no aplicativo.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  body: { padding: 22, paddingBottom: 40 },
  updatedAt: {
    fontSize: 12,
    color: '#999',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 14,
    color: '#555',
    lineHeight: 21,
  },
});