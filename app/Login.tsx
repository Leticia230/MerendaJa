
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import ScreenHeader from '../components/ScreenHeader';
import LabeledInput from '../components/LabeledInput';
import BotaoPrimario from '../components/BotaoPrimario';
import { useAccessibility } from '../components/AccessibilityContext';

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
  const { theme } = useAccessibility();
  const styles = createStyles(theme);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [carregando, setCarregando] = useState(false);

  const passwordInputRef = useRef<TextInput>(null);

  async function realizarLogin() {
    const emailNormalizado = email.trim().toLowerCase();

    if (!emailNormalizado || !password) {
      Alert.alert(
        'Campos obrigatórios',
        'Digite seu e-mail e sua senha.'
      );
      return;
    }

    if (carregando) return;

    setCarregando(true);

    try {
      await login(emailNormalizado, password, 'aluno');

      router.replace('/(tabs-aluno)/Home');

      if (Platform.OS !== 'web') {
        Alert.alert('Login realizado!', 'Bem-vindo ao Merenda Já.');
      }

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
      <ScreenHeader title="" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.iconWrap}>
            <Ionicons
              name="school"
              size={38}
              color="#fff"
            />
          </View>

          <Text style={styles.title}>
            Login do Aluno
          </Text>

          <LabeledInput
            testID="login-email-input"
            label="E-mail institucional"
            placeholder="seu@email.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="username"
            returnKeyType="next"
            onSubmitEditing={() => passwordInputRef.current?.focus()}
            blurOnSubmit={false}
            editable={!carregando}
            value={email}
            onChangeText={setEmail}
            containerStyle={styles.firstInput}
          />

          <LabeledInput
            ref={passwordInputRef}
            testID="login-password-input"
            label="Senha"
            placeholder="Digite sua senha"
            isPassword
            autoComplete="password"
            textContentType="password"
            returnKeyType="done"
            onSubmitEditing={realizarLogin}
            editable={!carregando}
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            onPress={() => router.push('/RecuperarSenha')}
            accessibilityRole="link"
            accessibilityLabel="Esqueceu a senha?"
          >
            <Text style={styles.link}>
              Esqueceu a senha?
            </Text>
          </Pressable>

          <BotaoPrimario
            testID="login-submit-button"
            title={carregando ? 'Entrando...' : 'Entrar'}
            onPress={realizarLogin}
            disabled={carregando}
            style={styles.button}
          />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.background,
    },

    keyboardView: {
      flex: 1,
    },

    body: {
      padding: 22,
      paddingTop: 4,
      paddingBottom: 30,
    },

    iconWrap: {
      width: 78,
      height: 78,
      borderRadius: 39,
      backgroundColor: theme.primary,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },

    title: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'center',
    },

    firstInput: {
      marginTop: 20,
    },

    link: {
      color: theme.primary,
      fontWeight: '600',
      fontSize: 13,
      textAlign: 'right',
      textDecorationLine: 'underline',
      marginTop: 2,
      marginBottom: 6,
    },

    button: {
      marginTop: 16,
    },
  });
