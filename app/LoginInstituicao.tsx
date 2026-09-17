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
import { colors } from '../constants/theme';

import { login } from '../components/auth';

// Mapa de erros do Firebase Auth (e da checagem de tipo) para mensagens amigáveis
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

  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [carregando, setCarregando] = useState(false);

  // Ref para permitir que o "próximo" do teclado pule do e-mail pra senha.
  // Só funciona se LabeledInput encaminhar a ref para o TextInput interno
  // (React.forwardRef). Se não encaminhar, isso é ignorado sem quebrar nada.
  const passInputRef = useRef<TextInput>(null);

  async function realizarLogin() {
    const emailNormalizado = email.trim().toLowerCase();

    // Verifica se os campos estão preenchidos
    if (!emailNormalizado || !pass) {
      Alert.alert(
        'Campos obrigatórios',
        'Digite seu e-mail e sua senha.'
      );
      return;
    }

    if (carregando) return; // evita múltiplos toques/envios simultâneos

    setCarregando(true);

    try {
      // Firebase verifica o e-mail e a senha, e confirma que a conta
      // é do tipo 'instituicao' — senão lança 'app/tipo-incorreto'.
      await login(emailNormalizado, pass, 'instituicao');

      // Navega imediatamente após o sucesso — não depende do onPress
      // do Alert, que não dispara de forma confiável no Expo Web.
      router.replace('/(tabs-instituicao)/Home');

      // Alert é só feedback visual, sem lógica de navegação dentro dele
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
              name="business"
              size={38}
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
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.cream,
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
    backgroundColor: colors.primary,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textDark,
    textAlign: 'center',
  },

  firstInput: {
    marginTop: 20,
  },

  link: {
    color: colors.primary,
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