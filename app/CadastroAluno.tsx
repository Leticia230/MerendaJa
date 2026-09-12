import React, { useEffect, useRef, useState } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import ScreenHeader from '../components/ScreenHeader';
import LabeledInput from '../components/LabeledInput';
import BotaoPrimario from '../components/BotaoPrimario';
import { colors } from '../constants/theme';
import { cadastrar } from '../components/auth';
import { listarTurmas, adicionarAlunoATurma, Turma } from './services/turmas';

const PERIODOS = ['Manhã', 'Tarde', 'Integral', 'Noite'];

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

export default function CadastroAluno() {
  const router = useRouter();

  const [nome, setNome] = useState('');
  const [rm, setRm] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);

  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [carregandoTurmas, setCarregandoTurmas] = useState(true);
  const [turmaSelecionada, setTurmaSelecionada] = useState<Turma | null>(null);
  const [turmaAberta, setTurmaAberta] = useState(false);

  const [periodo, setPeriodo] = useState('');
  const [periodoAberto, setPeriodoAberto] = useState(false);

  const [erro, setErro] = useState<string | null>(null);

  // Refs para navegação entre campos pelo teclado.
  // Dependem do LabeledInput encaminhar a ref via forwardRef.
  const rmInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const senhaInputRef = useRef<TextInput>(null);

  useEffect(() => {
    listarTurmas()
      .then(setTurmas)
      .catch((e) => {
        console.error('Erro ao carregar turmas:', e);
        setErro('Não foi possível carregar a lista de turmas.');
      })
      .finally(() => setCarregandoTurmas(false));
  }, []);

  function selecionarTurma(turma: Turma) {
    setTurmaSelecionada(turma);
    setTurmaAberta(false);
    // A turma já tem um período definido — pré-preenche, mas a pessoa
    // ainda pode trocar manualmente se for diferente.
    if (turma.periodo) setPeriodo(turma.periodo);
  }

  async function realizarCadastro() {
    setErro(null);

    const nomeNormalizado = nome.trim();
    const rmNormalizado = rm.trim();
    const emailNormalizado = email.trim().toLowerCase();

    if (!nomeNormalizado || !rmNormalizado || !emailNormalizado || !senha) {
      Alert.alert('Campos obrigatórios', 'Preencha nome, RM, e-mail e senha.');
      return;
    }

    if (carregando) return; // evita múltiplos envios simultâneos

    setCarregando(true);

    try {
      // Turma e período são opcionais — a instituição pode criar a turma
      // antes ou depois de cadastrar o aluno. Só incluímos no Firestore
      // o que foi de fato preenchido (undefined quebraria o setDoc).
      const dadosExtras: Record<string, unknown> = {
        nome: nomeNormalizado,
        rm: rmNormalizado,
      };
      if (turmaSelecionada) {
        dadosExtras.turmaId = turmaSelecionada.id;
        dadosExtras.turmaNome = turmaSelecionada.nome;
      }
      if (periodo) {
        dadosExtras.periodo = periodo;
      }

      const resultado = await cadastrar(emailNormalizado, senha, 'aluno', dadosExtras);

      // Vincula o aluno recém-criado à turma escolhida (se houver), pra
      // ela aparecer também na lista de alunos da turma.
      if (turmaSelecionada) {
        await adicionarAlunoATurma(turmaSelecionada.id, resultado.user.uid);
      }

      // Navega direto pra Home do Aluno — o cadastro já autentica,
      // não faz sentido mandar de volta pro Login.
      // Não depende do onPress do Alert, que não dispara de forma
      // confiável no Expo Web.
      router.replace('/(tabs-aluno)/Home');

      if (Platform.OS !== 'web') {
        Alert.alert('Cadastro realizado!', 'O aluno foi cadastrado com sucesso.');
      }
    } catch (error: any) {
      console.error('Erro ao cadastrar aluno:', error);

      const erroConhecido = ERROS_CADASTRO[error?.code];

      Alert.alert(
        erroConhecido?.titulo ?? 'Erro no cadastro',
        erroConhecido?.mensagem ??
          `Não foi possível cadastrar o aluno. (${error?.code ?? 'erro desconhecido'})`
      );
    } finally {
      setCarregando(false);
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
          <View style={styles.avatar}>
            <Ionicons name="person" size={38} color="#fff" />
          </View>

          <Text style={styles.title}>Cadastro de Aluno</Text>

          {erro && (
            <View style={styles.bannerErro} testID="cadastro-aluno-erro">
              <Ionicons name="alert-circle" size={18} color="#B3261E" />
              <Text style={styles.bannerErroText}>{erro}</Text>
            </View>
          )}

          <LabeledInput
            testID="aluno-nome-input"
            label="Nome do aluno"
            placeholder="Nome completo"
            returnKeyType="next"
            onSubmitEditing={() => rmInputRef.current?.focus()}
            blurOnSubmit={false}
            editable={!carregando}
            value={nome}
            onChangeText={setNome}
            containerStyle={{ marginTop: 16 }}
          />

          <LabeledInput
            ref={rmInputRef}
            testID="aluno-rm-input"
            label="RM"
            placeholder="Número de matrícula"
            keyboardType="number-pad"
            returnKeyType="next"
            onSubmitEditing={() => emailInputRef.current?.focus()}
            blurOnSubmit={false}
            editable={!carregando}
            value={rm}
            onChangeText={setRm}
          />

          {/* Turma */}
          <View style={{ marginTop: 14 }}>
            <Text style={styles.label}>Turma (opcional)</Text>
            <Pressable
              testID="aluno-turma-select"
              style={styles.select}
              onPress={() => setTurmaAberta((v) => !v)}
              disabled={carregando}
            >
              <Text style={[styles.selectText, turmaSelecionada && styles.selectTextPreenchido]}>
                {turmaSelecionada ? turmaSelecionada.nome : 'Selecione a turma'}
              </Text>
              <Ionicons
                name={turmaAberta ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textMuted}
              />
            </Pressable>

            {turmaAberta && (
              <View style={styles.dropdown}>
                {carregandoTurmas ? (
                  <ActivityIndicator color={colors.primary} style={{ padding: 16 }} />
                ) : turmas.length === 0 ? (
                  <Text style={styles.dropdownVazio}>
                    Nenhuma turma cadastrada ainda. Você pode cadastrar o aluno
                    e vincular a uma turma depois.
                  </Text>
                ) : (
                  turmas.map((turma) => (
                    <Pressable
                      key={turma.id}
                      testID={`turma-opcao-${turma.id}`}
                      style={styles.dropdownRow}
                      onPress={() => selecionarTurma(turma)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.dropdownRowText}>{turma.nome}</Text>
                        {turma.periodo ? (
                          <Text style={styles.dropdownRowSub}>{turma.periodo}</Text>
                        ) : null}
                      </View>
                      {turmaSelecionada?.id === turma.id && (
                        <Ionicons name="checkmark" size={18} color={colors.primary} />
                      )}
                    </Pressable>
                  ))
                )}
              </View>
            )}
          </View>

          {/* Período */}
          <View style={{ marginTop: 14 }}>
            <Text style={styles.label}>Período (opcional)</Text>
            <Pressable
              testID="aluno-periodo-select"
              style={styles.select}
              onPress={() => setPeriodoAberto((v) => !v)}
              disabled={carregando}
            >
              <Text style={[styles.selectText, periodo && styles.selectTextPreenchido]}>
                {periodo || 'Selecione o período'}
              </Text>
              <Ionicons
                name={periodoAberto ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={colors.textMuted}
              />
            </Pressable>

            {periodoAberto && (
              <View style={styles.dropdown}>
                {PERIODOS.map((p) => (
                  <Pressable
                    key={p}
                    testID={`periodo-opcao-${p}`}
                    style={styles.dropdownRow}
                    onPress={() => {
                      setPeriodo(p);
                      setPeriodoAberto(false);
                    }}
                  >
                    <Text style={styles.dropdownRowText}>{p}</Text>
                    {periodo === p && (
                      <Ionicons name="checkmark" size={18} color={colors.primary} />
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>

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
            onSubmitEditing={() => senhaInputRef.current?.focus()}
            blurOnSubmit={false}
            editable={!carregando}
            value={email}
            onChangeText={setEmail}
            containerStyle={{ marginTop: 14 }}
          />

          <LabeledInput
            ref={senhaInputRef}
            testID="aluno-senha-input"
            label="Senha"
            placeholder="Digite uma senha"
            isPassword
            autoCapitalize="none"
            autoComplete="password-new"
            textContentType="newPassword"
            returnKeyType="done"
            onSubmitEditing={realizarCadastro}
            editable={!carregando}
            value={senha}
            onChangeText={setSenha}
            containerStyle={{ marginTop: 14 }}
          />

          <BotaoPrimario
            testID="aluno-submit-button"
            title={carregando ? 'Cadastrando...' : 'Cadastrar aluno'}
            onPress={realizarCadastro}
            disabled={carregando}
            style={{ marginTop: 12 }}
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

  selectTextPreenchido: {
    color: colors.textDark,
    fontWeight: '600',
  },

  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    marginTop: 8,
    overflow: 'hidden',
  },

  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
    gap: 10,
  },

  dropdownRowText: { fontSize: 14, color: colors.textDark, fontWeight: '600' },
  dropdownRowSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

  dropdownVazio: {
    padding: 16,
    textAlign: 'center',
    fontSize: 13,
    color: colors.textMuted,
  },

  bannerErro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FDECEA',
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  bannerErroText: { flex: 1, color: '#B3261E', fontSize: 13, fontWeight: '600' },
});