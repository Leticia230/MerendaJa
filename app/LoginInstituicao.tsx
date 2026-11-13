import React, { useMemo, useRef, useState } from 'react';

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
import ResponsiveContainer from '../components/ResponsiveContainer';
import { useResponsive } from '../hooks/useResponsive';
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
    titulo: 'Conta de estudante',
    mensagem: 'Esta conta foi cadastrada como estudante. Use a tela de login de estudante.',
  },
  'app/sem-perfil': {
    titulo: 'Perfil incompleto',
    mensagem: 'Não encontramos os dados desta conta. Fale com o suporte.',
  },
};

export default function LoginInstitution() {
  const router = useRouter();
  const { theme } = useAccessibility();

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

  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [carregando, setCarregando] = useState(false);

  const passInputRef = useRef<TextInput>(null);

  async function realizarLogin() {
    const emailNormalizado = email.trim().toLowerCase();

    if (!emailNormalizado || !pass) {
      Alert.alert(
        'Campos obrigatórios',
        'Digite seu e-mail e sua senha.'
      );
      return;
    }

    if (carregando) return;

    setCarregando(true);

    try {
      await login(emailNormalizado, pass, 'instituicao');

      router.replace('/(tabs-instituicao)/Home');

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
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ResponsiveContainer
            style={[
              styles.body,
              { paddingHorizontal: horizontalPadding },
            ]}
          >
            <View style={styles.iconWrap}>
              <Ionicons
                name="business"
                size={compacto ? 34 : 38}
                color="#fff"
              />
            </View>

            <Text style={styles.title}>
              Login da Instituição
            </Text>

            <LabeledInput
              testID="loginst-email-input"
              label="E-mail institucional"
              placeholder="seu@email.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="username"
              returnKeyType="next"
              onSubmitEditing={() => passInputRef.current?.focus()}
              blurOnSubmit={false}
              editable={!carregando}
              value={email}
              onChangeText={setEmail}
              containerStyle={styles.firstInput}
            />

            <LabeledInput
              ref={passInputRef}
              testID="loginst-pass-input"
              label="Senha"
              placeholder="Digite sua senha"
              isPassword
              autoComplete="password"
              textContentType="password"
              returnKeyType="done"
              onSubmitEditing={realizarLogin}
              editable={!carregando}
              value={pass}
              onChangeText={setPass}
            />

            <Pressable
              onPress={() => router.push('/RecuperarSenha')}
              accessibilityRole="link"
              accessibilityLabel="Esqueceu a senha?"
              style={styles.linkContainer}
            >
              <Text style={styles.link}>
                Esqueceu a senha?
              </Text>
            </Pressable>

            <BotaoPrimario
              testID="loginst-submit-button"
              title={carregando ? 'Entrando...' : 'Entrar'}
              onPress={realizarLogin}
              disabled={carregando}
              style={styles.button}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Não tem uma conta?{' '}
              </Text>

              <Pressable
                onPress={() =>
                  router.push('/CadastroInstituicao')
                }
                accessibilityRole="link"
                accessibilityLabel="Criar conta"
                disabled={carregando}
              >
                <Text
                  style={[
                    styles.footerText,
                    styles.footerLink,
                  ]}
                >
                  Criar conta
                </Text>
              </Pressable>
            </View>
          </ResponsiveContainer>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any, compacto: boolean) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.background,
    },

    keyboardView: {
      flex: 1,
    },

    scroll: {
      flex: 1,
    },

    scrollContent: {
      flexGrow: 1,
      paddingBottom: 24,
    },

    body: {
      flex: 0,
      paddingTop: compacto ? 4 : 8,
      paddingBottom: 30,
    },

    iconWrap: {
      width: compacto ? 68 : 78,
      height: compacto ? 68 : 78,
      borderRadius: compacto ? 34 : 39,
      backgroundColor: theme.primary,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: compacto ? 8 : 10,
    },

    title: {
      fontSize: compacto ? 18 : 20,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'center',
      marginBottom: compacto ? 2 : 4,
    },

    firstInput: {
      marginTop: compacto ? 16 : 20,
    },

    linkContainer: {
      alignSelf: 'flex-end',
      paddingVertical: 4,
      paddingLeft: 12,
    },

    link: {
      color: theme.primary,
      fontWeight: '600',
      fontSize: compacto ? 12 : 13,
      textAlign: 'right',
      textDecorationLine: 'underline',
      marginTop: 2,
      marginBottom: 6,
    },

    button: {
      marginTop: compacto ? 12 : 16,
    },

    footer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: compacto ? 16 : 18,
    },

    footerText: {
      fontSize: compacto ? 12 : 13,
      color: theme.textMuted,
    },

    footerLink: {
      color: theme.primary,
      fontWeight: '700',
    },
  });
