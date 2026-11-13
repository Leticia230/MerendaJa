import React, { useMemo, useState } from 'react';

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

import ResponsiveContainer from '../components/ResponsiveContainer';
import { useResponsive } from '../hooks/useResponsive';

import { useAccessibility } from '../components/AccessibilityContext';
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

  const { theme } = useAccessibility();

  const {
    width,
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
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const logoSize = Math.min(
    width * (compacto ? 0.58 : 0.65),
    compacto ? 190 : 220
  );

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

      Alert.alert(
        'E-mail enviado',
        'Se existir uma conta com esse e-mail, você receberá um link para redefinir a senha. Confira também a caixa de spam.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
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
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
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
            <View style={styles.logoWrap}>
              <ChefLogo size={logoSize} />
            </View>

            <Text style={styles.title}>
              Recuperar senha
            </Text>

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

                if (erro) {
                  setErro('');
                }
              }}
              containerStyle={styles.input}
            />

            {!!erro && (
              <Text style={styles.erro}>
                {erro}
              </Text>
            )}

            <BotaoPrimario
              testID="forgot-send-button"
              title={loading ? 'Enviando...' : 'Enviar link'}
              onPress={handleEnviar}
              disabled={loading}
              style={styles.botao}
            />
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

    keyboard: {
      flex: 1,
    },

    scrollContent: {
      flexGrow: 1,
      paddingBottom: compacto ? 20 : 30,
    },

    body: {
      flex: 0,
      paddingTop: compacto ? 4 : 8,
      paddingBottom: compacto ? 20 : 28,
      justifyContent: 'center',
    },

    logoWrap: {
      alignItems: 'center',
      marginBottom: compacto ? 4 : 8,
    },

    title: {
      fontSize: compacto ? 20 : 22,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'center',
      marginTop: compacto ? 8 : 10,
    },

    desc: {
      fontSize: compacto ? 12 : 13,
      color: theme.textMuted,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: compacto ? 17 : 18,
    },

    input: {
      marginTop: compacto ? 18 : 24,
    },

    erro: {
      color: theme.error,
      fontSize: compacto ? 12 : 13,
      marginTop: 10,
      lineHeight: compacto ? 17 : 19,
    },

    botao: {
      marginTop: compacto ? 14 : 16,
    },
  });
