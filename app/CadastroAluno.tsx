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
import { cadastrar } from '../components/auth';

// Mapa de erros do Firebase Authentication
const ERROS_CADASTRO: Record<
  string,
  { titulo: string; mensagem: string }
> = {
  'auth/email-already-in-use': {
    titulo: 'E-mail já cadastrado',
    mensagem:
      'Já existe uma conta com este e-mail. Tente fazer login.',
  },

  'auth/invalid-email': {
    titulo: 'E-mail inválido',
    mensagem:
      'Digite um endereço de e-mail válido.',
  },

  'auth/weak-password': {
    titulo: 'Senha fraca',
    mensagem:
      'A senha precisa ter pelo menos 6 caracteres.',
  },

  'auth/network-request-failed': {
    titulo: 'Sem conexão',
    mensagem:
      'Verifique sua internet e tente novamente.',
  },

  'auth/too-many-requests': {
    titulo: 'Muitas tentativas',
    mensagem:
      'Aguarde alguns minutos antes de tentar novamente.',
  },
};

// Componente de seleção
function Select({
  placeholder,
  testID,
}: {
  placeholder: string;
  testID?: string;
}) {
  return (
    <Pressable
      testID={testID}
      style={styles.select}
    >
      <Text style={styles.selectText}>
        {placeholder}
      </Text>

      <Ionicons
        name="chevron-down"
        size={18}
        color={colors.textMuted}
      />
    </Pressable>
  );
}

export default function CadastroAluno() {
  const router = useRouter();

  // Estados dos campos
  const [nome, setNome] = useState('');
  const [rm, setRm] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Estado de carregamento
  const [carregando, setCarregando] = useState(false);

  // Refs para navegação entre os campos
  const rmInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const senhaInputRef = useRef<TextInput>(null);

  async function realizarCadastro() {
    const nomeNormalizado = nome.trim();
    const rmNormalizado = rm.trim();
    const emailNormalizado = email.trim().toLowerCase();

    // Validação dos campos obrigatórios
    if (
      !nomeNormalizado ||
      !rmNormalizado ||
      !emailNormalizado ||
      !senha
    ) {
      Alert.alert(
        'Campos obrigatórios',
        'Preencha nome, RM, e-mail e senha.'
      );

      return;
    }

    // Validação da senha
    if (senha.length < 6) {
      Alert.alert(
        'Senha fraca',
        'A senha precisa ter pelo menos 6 caracteres.'
      );

      return;
    }

    // Evita múltiplos cadastros simultâneos
    if (carregando) {
      return;
    }

    setCarregando(true);

    try {
      console.log('Iniciando cadastro do aluno...');
      console.log('E-mail:', emailNormalizado);
      console.log('RM:', rmNormalizado);

      // Cria a conta no Firebase Authentication
      // e salva o tipo "aluno" no Firestore.
      await cadastrar(
        emailNormalizado,
        senha,
        'aluno'
      );

      console.log('Aluno cadastrado com sucesso!');

      // Vai para a tela de Login depois do cadastro
      router.replace('/Login');

      // Exibe mensagem apenas no aplicativo nativo.
      // No Expo Web, não dependemos do Alert para continuar o fluxo.
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Cadastro realizado!',
          'O aluno foi cadastrado com sucesso.'
        );
      }
    } catch (error: unknown) {
      console.error(
        'Erro ao cadastrar aluno:',
        error
      );

      // Obtém o código do erro do Firebase
      const codigoErro =
        typeof error === 'object' &&
        error !== null &&
        'code' in error
          ? String(
              (error as { code?: unknown }).code
            )
          : '';

      const erroConhecido =
        ERROS_CADASTRO[codigoErro];

      Alert.alert(
        erroConhecido?.titulo ??
          'Erro no cadastro',
        erroConhecido?.mensagem ??
          'Não foi possível cadastrar o aluno. Verifique os dados e tente novamente.'
      );
    } finally {
      setCarregando(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="" />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Ícone do aluno */}
          <View style={styles.avatar}>
            <Ionicons
              name="person"
              size={38}
              color="#fff"
            />
          </View>

          {/* Título */}
          <Text style={styles.title}>
            Cadastro de Aluno
          </Text>

          {/* Nome */}
          <LabeledInput
            testID="aluno-nome-input"
            label="Nome do aluno"
            placeholder="Nome completo"
            returnKeyType="next"
            onSubmitEditing={() =>
              rmInputRef.current?.focus()
            }
            blurOnSubmit={false}
            editable={!carregando}
            value={nome}
            onChangeText={setNome}
            containerStyle={{
              marginTop: 16,
            }}
          />

          {/* RM */}
          <LabeledInput
            ref={rmInputRef}
            testID="aluno-rm-input"
            label="RM"
            placeholder="Número de matrícula"
            keyboardType="number-pad"
            returnKeyType="next"
            onSubmitEditing={() =>
              emailInputRef.current?.focus()
            }
            blurOnSubmit={false}
            editable={!carregando}
            value={rm}
            onChangeText={setRm}
          />

          {/* Turma */}
          <View>
            <Text style={styles.label}>
              Turma
            </Text>

            <Select
              placeholder="Selecione a turma"
              testID="aluno-turma-select"
            />
          </View>

          {/* Período */}
          <View style={styles.periodoContainer}>
            <Text style={styles.label}>
              Período
            </Text>

            <Select
              placeholder="Selecione o período"
              testID="aluno-periodo-select"
            />
          </View>

          {/* E-mail */}
          <LabeledInput
            ref={emailInputRef}
            testID="aluno-email-input"
            label="E-mail institucional"
            placeholder="aluno@email.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            autoComplete="email"
            textContentType="username"
            returnKeyType="next"
            onSubmitEditing={() =>
              senhaInputRef.current?.focus()
            }
            blurOnSubmit={false}
            editable={!carregando}
            value={email}
            onChangeText={setEmail}
            containerStyle={{
              marginTop: 14,
            }}
          />

          {/* Senha */}
          <LabeledInput
            ref={senhaInputRef}
            testID="aluno-senha-input"
            label="Senha"
            placeholder="Digite uma senha"
            isPassword
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="password-new"
            textContentType="newPassword"
            returnKeyType="done"
            onSubmitEditing={realizarCadastro}
            editable={!carregando}
            value={senha}
            onChangeText={setSenha}
            containerStyle={{
              marginTop: 14,
            }}
          />

          {/* Botão de cadastro */}
          <BotaoPrimario
            testID="aluno-submit-button"
            title={
              carregando
                ? 'Cadastrando...'
                : 'Cadastrar aluno'
            }
            onPress={realizarCadastro}
            disabled={carregando}
            style={{
              marginTop: 12,
            }}
          />
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

  keyboard: {
    flex: 1,
  },

  body: {
    padding: 22,
    paddingTop: 4,
    paddingBottom: 30,
  },

  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: colors.primary,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },

  title: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textDark,
    textAlign: 'center',
  },

  label: {
    fontSize: 13,
    color: colors.textDark,
    fontWeight: '600',
    marginBottom: 6,
  },

  select: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    height: 48,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },

  selectText: {
    flex: 1,
    color: colors.textLight,
    fontSize: 14,
  },

  periodoContainer: {
    marginTop: 14,
  },
});