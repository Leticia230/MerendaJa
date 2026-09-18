import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import ChefLogo from '../components/ChefLogo';
import LabeledInput from '../components/LabeledInput';
import BotaoPrimario from '../components/BotaoPrimario';
import { colors } from '../constants/theme';

import { login } from '../components/auth';

const ERROS_LOGIN: Record<string, { titulo: string; mensagem: string }> = {
  'auth/user-not-found': {
    titulo: 'Conta não encontrada',
    mensagem: 'Não existe uma conta cadastrada com este e-mail.',
  },
  'auth/wrong-password': {
    titulo: 'Senha incorreta',
    mensagem: 'A senha informada está incorreta.',
  },
  'auth/invalid-credential': {
    titulo: 'Login inválido',
    mensagem: 'E-mail ou senha incorretos.',
  },
  'auth/invalid-email': {
    titulo: 'E-mail inválido',
    mensagem: 'Digite um endereço de e-mail válido.',
  },
  'auth/network-request-failed': {
    titulo: 'Sem conexão',
    mensagem: 'Verifique sua internet e tente novamente.',
  },
  'auth/too-many-requests': {
    titulo: 'Muitas tentativas',
    mensagem: 'Aguarde alguns minutos antes de tentar novamente.',
  },
  'app/tipo-incorreto': {
    titulo: 'Conta de instituição',
    mensagem: 'Esta conta foi cadastrada como instituição. Use a tela de login de instituição.',
  },
  'app/sem-perfil': {
    titulo: 'Perfil incompleto',
    mensagem: 'Não encontramos os dados desta conta. Fale com o suporte.',
  },
};

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function realizarLogin() {
    const emailNormalizado = email.trim().toLowerCase();

    if (!emailNormalizado || !password) {
      Alert.alert('Campos obrigatórios', 'Digite seu e-mail e sua senha.');
      return;
    }

    if (carregando) return;

    setCarregando(true);

    try {
      await login(emailNormalizado, password, 'aluno');

      router.replace('/(tabs-aluno)/Home');
    } catch (error: any) {
      console.error('Erro no login:', error);

      const erroConhecido = ERROS_LOGIN[error?.code];

      Alert.alert(
        erroConhecido?.titulo ?? 'Erro no login',
        erroConhecido?.mensagem ?? 'Não foi possível realizar o login. Tente novamente.'
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >        
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View style={styles.hero}>
            <ChefLogo size={350} />
            <Text style={styles.title}>Merenda Já</Text>
            <Text style={styles.subtitle}>Entrar na sua conta</Text>
          </View>

          <View style={styles.body}>
            <LabeledInput
              testID="login-email-input"
              label="E-mail institucional"
              placeholder="seu@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!carregando}
              value={email}
              onChangeText={setEmail}
            />
            <LabeledInput
              testID="login-password-input"
              label="Senha"
              placeholder="Digite sua senha"
              isPassword
              editable={!carregando}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable onPress={() => router.push('/RecuperarSenha')}>
              <Text style={styles.link}>Esqueceu a senha?</Text>
            </Pressable>

            <BotaoPrimario
              testID="login-submit-button"
              title={carregando ? 'Entrando...' : 'Entrar'}
              onPress={realizarLogin}
              disabled={carregando}
              style={{ marginTop: 16 }}
            />

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  hero: {
    backgroundColor: colors.yellow,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 30,
    gap: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primaryDark,
    marginTop: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textDark,
    fontWeight: '600',
  },
  body: {
    padding: 22,
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'right',
    marginTop: 2,
    marginBottom: 8,
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 18,
  },
  footerText: {
    fontSize: 13,
    color: colors.textMuted,
  },
  footerLink: {
    color: colors.primary,
    fontWeight: '700',
  },
});