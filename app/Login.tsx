import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import ChefLogo from '../components/ChefLogo';
import LabeledInput from '../components/LabeledInput';
import BotaoPrimario from '../components/BotaoPrimario';
import { colors } from '../constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
              value={email}
              onChangeText={setEmail}
            />
            <LabeledInput
              testID="login-password-input"
              label="Senha"
              placeholder="Digite sua senha"
              isPassword
              value={password}
              onChangeText={setPassword}
            />
            <Pressable onPress={() => router.push('/RecuperarSenha')}>
              <Text style={styles.link}>Esqueceu a senha?</Text>
            </Pressable>

            <BotaoPrimario
              testID="login-submit-button"
              title="Entrar"
              onPress={() => router.replace('/(tabs-aluno)/Home')}
              style={{ marginTop: 16 }}
            />

            <View style={styles.footer}>
              <Text style={styles.footerText}>Não tem uma conta? </Text>
              <Pressable onPress={() => router.push('/CadastroInstituicao')}>
                <Text style={[styles.footerText, styles.footerLink]}>Criar conta</Text>
              </Pressable>
            </View>
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
