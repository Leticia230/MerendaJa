import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import ScreenHeader from '../components/ScreenHeader';
import ChefLogo from '../components/ChefLogo';
import LabeledInput from '../components/LabeledInput';
import BotaoPrimario from '../components/BotaoPrimario';
import { colors } from '../constants/theme';
import { recuperarSenha } from '../components/auth'; 

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function mensagemDeErro(code?: string) {
  switch (code) {
    case 'auth/invalid-email':
      return 'E-mail inválido. Verifique e tente novamente.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Aguarde alguns minutos e tente de novo.';
    case 'auth/network-request-failed':
      return 'Sem conexão. Verifique sua internet e tente novamente.';
    default:
      return 'Não foi possível enviar o e-mail agora. Tente novamente.';
  }
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleEnviar() {
    if (loading) return;

    const emailLimpo = email.trim();
    if (!EMAIL_REGEX.test(emailLimpo)) {
      setErro('Digite um e-mail válido.');
      return;
    }

    setErro('');
    setLoading(true);
    try {
      await recuperarSenha(emailLimpo);
      // Por segurança, o Firebase pode não avisar se o e-mail não existe;
      // a mensagem é a mesma nos dois casos.
      Alert.alert(
        'E-mail enviado',
        'Se existir uma conta com esse e-mail, você receberá um link para redefinir a senha. Confira também a caixa de spam.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (e: any) {
      setErro(mensagemDeErro(e?.code));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoWrap}>
            <ChefLogo size={220} />
          </View>
          <Text style={styles.title}>Recuperar senha</Text>
          <Text style={styles.desc}>
            Digite seu e-mail institucional e enviaremos um link para você criar uma nova senha.
          </Text>

          <LabeledInput
            testID="forgot-email-input"
            label="E-mail institucional"
            placeholder="seu@email.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            returnKeyType="send"
            onSubmitEditing={handleEnviar}
            value={email}
            onChangeText={(t: string) => {
              setEmail(t);
              if (erro) setErro('');
            }}
            containerStyle={{ marginTop: 24 }}
          />

          {!!erro && <Text style={styles.erro}>{erro}</Text>}

          <BotaoPrimario
            testID="forgot-send-button"
            title={loading ? 'Enviando...' : 'Enviar link'}
            onPress={handleEnviar}
            disabled={loading}
            style={{ marginTop: 16 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  body: {
    padding: 22,
    paddingTop: 8,
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textDark,
    textAlign: 'center',
    marginTop: 10,
  },
  desc: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  erro: {
    color: '#C0392B',
    fontSize: 13,
    marginTop: 10,
  },
});