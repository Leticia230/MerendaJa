import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ScreenHeader from '../components/ScreenHeader';
import LabeledInput from '../components/LabeledInput';
import BotaoPrimario from '../components/BotaoPrimario';
import { colors } from '../constants/theme';
import { cadastrar } from '../components/auth';

// Mapa de erros do Firebase Auth para mensagens amigáveis
const ERROS_CADASTRO: Record<string, { titulo: string; mensagem: string }> = {
  'auth/email-already-in-use': {
    titulo: 'E-mail já cadastrado',
    mensagem: 'Já existe uma conta com este e-mail. Tente fazer login.',
  },
  'auth/invalid-email': {
    titulo: 'E-mail inválido',
    mensagem: 'Digite um endereço de e-mail válido.',
  },
  'auth/weak-password': {
    titulo: 'Senha fraca',
    mensagem: 'A senha precisa ter pelo menos 6 caracteres.',
  },
  'auth/network-request-failed': {
    titulo: 'Sem conexão',
    mensagem: 'Verifique sua internet e tente novamente.',
  },
  'auth/too-many-requests': {
    titulo: 'Muitas tentativas',
    mensagem: 'Aguarde alguns minutos antes de tentar novamente.',
  },
};

// Mesma lógica pros dois casos (Alert.alert não é confiável no Expo Web).
function mostrarAlerta(titulo: string, mensagem: string, aoFechar?: () => void) {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensagem}`);
    aoFechar?.();
  } else {
    Alert.alert(titulo, mensagem, aoFechar ? [{ text: 'OK', onPress: aoFechar }] : undefined);
  }
}

export default function RegisterInstitution() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [inep, setInep] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [carregando, setCarregando] = useState(false); // evita cliques duplicados

  async function realizarCadastro() {
    const emailNormalizado = email.trim().toLowerCase();
    const inepNormalizado = inep.trim();

    if (!emailNormalizado || !inepNormalizado || !pass || !pass2) {
      mostrarAlerta('Campos obrigatórios', 'Preencha todos os campos.');
      return;
    }

    if (pass !== pass2) {
      mostrarAlerta('Senhas diferentes', 'As senhas precisam ser iguais.');
      return;
    }

    if (carregando) return; // evita múltiplos envios simultâneos

    setCarregando(true);
    console.log('[cadastro] iniciando...');

    try {
      console.log('[cadastro] chamando cadastrar()...');

      // 'instituicao' é o tipo do usuário; o INEP vai como dado extra e é
      // salvo junto no mesmo documento em Firestore (coleção "users"),
      // sem precisar de um setDoc manual separado.
      const resultado = await cadastrar(emailNormalizado, pass, 'instituicao', {
        inep: inepNormalizado,
      });

      console.log('[cadastro] auth + firestore OK, uid:', resultado.user.uid);

      // Navega direto após o sucesso — no Android/iOS o Alert some antes
      // de qualquer confirmação atrapalhar; no web o window.alert já
      // bloqueia a tela, então navegamos depois que a pessoa fecha ele.
      if (Platform.OS === 'web') {
        mostrarAlerta(
          'Cadastro realizado!',
          'A instituição foi cadastrada com sucesso.',
          () => router.replace('/(tabs-instituicao)/Home')
        );
      } else {
        router.replace('/(tabs-instituicao)/Home');
        mostrarAlerta('Cadastro realizado!', 'A instituição foi cadastrada com sucesso.');
      }
    } catch (error: any) {
      console.log('[cadastro] ERRO CAPTURADO:', error);

      const erroConhecido = ERROS_CADASTRO[error?.code];

      mostrarAlerta(
        erroConhecido?.titulo ?? 'Erro no cadastro',
        erroConhecido?.mensagem ??
          `Não foi possível cadastrar a instituição. (${error?.code ?? 'erro desconhecido'})`
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
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.iconWrap}>
            <Ionicons name="business" size={38} color="#fff" />
          </View>

          <Text style={styles.title}>Cadastro da Instituição</Text>

          <LabeledInput
            testID="reg-email-input"
            label="E-mail institucional"
            placeholder="seu@email.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="username"
            editable={!carregando}
            value={email}
            onChangeText={setEmail}
            containerStyle={styles.firstInput}
          />

          <LabeledInput
            testID="reg-inep-input"
            label="Código de INEP"
            placeholder="Digite o código do INEP"
            keyboardType="number-pad"
            editable={!carregando}
            value={inep}
            onChangeText={setInep}
          />

          <LabeledInput
            testID="reg-pass-input"
            label="Senha"
            placeholder="Digite sua senha"
            isPassword
            autoComplete="password-new"
            textContentType="newPassword"
            editable={!carregando}
            value={pass}
            onChangeText={setPass}
          />

          <LabeledInput
            testID="reg-pass2-input"
            label="Confirmar senha"
            placeholder="Confirme sua senha"
            isPassword
            autoComplete="password-new"
            textContentType="newPassword"
            editable={!carregando}
            value={pass2}
            onChangeText={setPass2}
          />

          <BotaoPrimario
            testID="reg-submit-button"
            title={carregando ? 'Cadastrando...' : 'Cadastrar'}
            onPress={realizarCadastro}
            style={styles.button}
            disabled={carregando}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  keyboardView: { flex: 1 },
  body: { padding: 22, paddingTop: 4, paddingBottom: 30 },
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
  title: { fontSize: 20, fontWeight: '800', color: colors.textDark, textAlign: 'center' },
  firstInput: { marginTop: 20 },
  button: { marginTop: 16 },
});