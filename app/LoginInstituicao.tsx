import React, { useState } from 'react';
import {
  View,
  Text,
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

export default function LoginInstitution() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  async function realizarLogin() {
    // Verifica se os campos estão preenchidos
    if (!email || !pass) {
      Alert.alert(
        'Campos obrigatórios',
        'Digite seu e-mail e sua senha.'
      );
      return;
    }

    try {
      // Firebase verifica o e-mail e a senha
      await login(email, pass);

      // Se chegou aqui, o login foi realizado
      Alert.alert(
        'Login realizado!',
        'Bem-vindo ao Merenda Já.',
        [
          {
            text: 'OK',
            onPress: () => {
              router.replace('/(tabs)/Home');
            },
          },
        ]
      );

    } catch (error: any) {
      console.error('Erro no login:', error);

      if (error.code === 'auth/user-not-found') {
        Alert.alert(
          'Conta não encontrada',
          'Não existe uma conta cadastrada com este e-mail.'
        );
        return;
      }

      if (error.code === 'auth/wrong-password') {
        Alert.alert(
          'Senha incorreta',
          'A senha informada está incorreta.'
        );
        return;
      }

      if (error.code === 'auth/invalid-credential') {
        Alert.alert(
          'Login inválido',
          'E-mail ou senha incorretos.'
        );
        return;
      }

      if (error.code === 'auth/invalid-email') {
        Alert.alert(
          'E-mail inválido',
          'Digite um endereço de e-mail válido.'
        );
        return;
      }

      Alert.alert(
        'Erro no login',
        'Não foi possível realizar o login. Tente novamente.'
      );
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
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            containerStyle={styles.firstInput}
          />

          <LabeledInput
            testID="loginst-pass-input"
            label="Senha"
            placeholder="Digite sua senha"
            isPassword
            value={pass}
            onChangeText={setPass}
          />

          <Pressable
            onPress={() => router.push('/RecuperarSenha')}
          >
            <Text style={styles.link}>
              Esqueceu a senha?
            </Text>
          </Pressable>

          <BotaoPrimario
            testID="loginst-submit-button"
            title="Entrar"
            onPress={realizarLogin}
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
