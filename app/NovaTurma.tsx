import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import ScreenHeader from '../components/ScreenHeader';
import LabeledInput from '../components/LabeledInput';
import BotaoPrimario from '../components/BotaoPrimario';
import { useAccessibility } from '../components/AccessibilityContext';
import { listarAlunos, Aluno } from './services/alunos';
import { criarTurma, buscarTurma, atualizarTurma, excluirTurma } from './services/turmas';
import Text from '../components/AppText';

const PERIODOS = ['Manhã', 'Tarde', 'Integral','Noite'];

export default function NovaTurma() {
  const { theme } = useAccessibility();
  const styles = createStyles(theme);

  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const modoEdicao = !!params.id;

  const [nome, setNome] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [periodoAberto, setPeriodoAberto] = useState(false);

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [carregandoAlunos, setCarregandoAlunos] = useState(true);
  const [alunosSelecionados, setAlunosSelecionados] = useState<Set<string>>(new Set());
  const [alunosAberto, setAlunosAberto] = useState(false);

  const [carregandoTurma, setCarregandoTurma] = useState(modoEdicao);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    listarAlunos()
      .then(setAlunos)
      .catch((e) => {
        console.error('Erro ao carregar alunos:', e);
        setErro('Não foi possível carregar a lista de alunos.');
      })
      .finally(() => setCarregandoAlunos(false));
  }, []);

  useEffect(() => {
    if (!params.id) return;

    buscarTurma(params.id)
      .then((turma) => {
        if (!turma) {
          setErro('Essa turma não foi encontrada — pode ter sido removida.');
          return;
        }
        setNome(turma.nome);
        setPeriodo(turma.periodo);
        setAlunosSelecionados(new Set(turma.alunosIds));
      })
      .catch((e) => {
        console.error('Erro ao carregar turma:', e);
        setErro('Não foi possível carregar os dados dessa turma.');
      })
      .finally(() => setCarregandoTurma(false));
  }, [params.id]);

  function alternarAluno(id: string) {
    setAlunosSelecionados((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) {
        novo.delete(id);
      } else {
        novo.add(id);
      }
      return novo;
    });
  }

  function textoAlunosSelecionados() {
    if (alunosSelecionados.size === 0) return 'Selecione os alunos';
    if (alunosSelecionados.size === 1) return '1 aluno selecionado';
    return `${alunosSelecionados.size} alunos selecionados`;
  }

  async function salvarTurma() {
    setErro(null);
    setSucesso(false);

    const nomeNormalizado = nome.trim();

    if (!nomeNormalizado) {
      setErro('Digite o nome da turma.');
      return;
    }

    if (!periodo) {
      setErro('Selecione o período da turma.');
      return;
    }

    setSalvando(true);

    try {
      const dados = {
        nome: nomeNormalizado,
        periodo,
        alunosIds: Array.from(alunosSelecionados),
      };

      if (modoEdicao && params.id) {
        await atualizarTurma(params.id, dados);
      } else {
        await criarTurma(dados);
      }

      setSucesso(true);
      setTimeout(() => router.back(), 600);
    } catch (error: any) {
      console.error('Erro ao salvar turma:', error);

      if (error?.code === 'permission-denied') {
        setErro('Permissão negada pelo Firestore ao salvar a turma. Verifique as Security Rules.');
      } else {
        setErro(`Não foi possível salvar a turma. (${error?.code ?? error?.message ?? 'erro desconhecido'})`);
      }
    } finally {
      setSalvando(false);
    }
  }

  async function executarExclusao() {
    if (!params.id) return;

    setErro(null);
    setExcluindo(true);

    try {
      await excluirTurma(params.id);
      router.back();
    } catch (error: any) {
      console.error('Erro ao excluir turma:', error);

      if (error?.code === 'permission-denied') {
        setErro('Permissão negada pelo Firestore ao excluir a turma. Verifique as Security Rules.');
      } else {
        setErro(`Não foi possível excluir a turma. (${error?.code ?? error?.message ?? 'erro desconhecido'})`);
      }
      setExcluindo(false);
    }
  }

  function confirmarExclusao() {
    const mensagem = `Tem certeza que deseja excluir a turma "${nome}"? Essa ação não pode ser desfeita.`;

    // Alert com botões não funciona no web, então usamos confirm()
    if (Platform.OS === 'web') {
      if (window.confirm(mensagem)) executarExclusao();
      return;
    }

    Alert.alert('Excluir turma', mensagem, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: executarExclusao },
    ]);
  }

  if (carregandoTurma) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Editar Turma" />
        <ActivityIndicator color={theme.primary} style={{ marginTop: 40 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title={modoEdicao ? 'Editar Turma' : 'Nova Turma'} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          <View style={styles.avatar}>
            <Ionicons name="people" size={38} color={theme.onPrimary} />
          </View>

          {erro && (
            <View style={styles.bannerErro} testID="nova-turma-erro">
              <Ionicons name="alert-circle" size={18} color={theme.error} />
              <Text style={styles.bannerErroText}>{erro}</Text>
            </View>
          )}

          {sucesso && (
            <View style={styles.bannerSucesso} testID="nova-turma-sucesso">
              <Ionicons name="checkmark-circle" size={18} color={theme.success} />
              <Text style={styles.bannerSucessoText}>
                {modoEdicao ? 'Turma atualizada!' : 'Turma criada!'}
              </Text>
            </View>
          )}

          <LabeledInput
            testID="turma-nome-input"
            label="Nome da turma"
            placeholder="Ex.: 1º Ano A"
            editable={!salvando}
            value={nome}
            onChangeText={setNome}
            containerStyle={{ marginTop: 16 }}
          />

          <View style={{ marginTop: 16 }}>
            <Text style={styles.label}>Período</Text>
            <Pressable
              testID="turma-periodo-select"
              style={styles.select}
              onPress={() => setPeriodoAberto((v) => !v)}
              disabled={salvando}
            >
              <Text style={[styles.selectText, periodo && styles.selectTextPreenchido]}>
                {periodo || 'Selecione o período'}
              </Text>
              <Ionicons
                name={periodoAberto ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={theme.textMuted}
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
                      <Ionicons name="checkmark" size={18} color={theme.primary} />
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={styles.label}>Adicione alunos</Text>
            <Pressable
              testID="turma-alunos-select"
              style={styles.select}
              onPress={() => setAlunosAberto((v) => !v)}
              disabled={salvando}
            >
              <Text style={[styles.selectText, alunosSelecionados.size > 0 && styles.selectTextPreenchido]}>
                {textoAlunosSelecionados()}
              </Text>
              <Ionicons
                name={alunosAberto ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={theme.textMuted}
              />
            </Pressable>

            {alunosAberto && (
              <View style={styles.dropdown}>
                {carregandoAlunos ? (
                  <ActivityIndicator color={theme.primary} style={{ padding: 16 }} />
                ) : alunos.length === 0 ? (
                  <Text style={styles.dropdownVazio}>
                    Nenhum aluno cadastrado ainda.
                  </Text>
                ) : (
                  alunos.map((aluno) => {
                    const selecionado = alunosSelecionados.has(aluno.id);
                    return (
                      <Pressable
                        key={aluno.id}
                        testID={`aluno-opcao-${aluno.id}`}
                        style={styles.dropdownRow}
                        onPress={() => alternarAluno(aluno.id)}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.dropdownRowText}>{aluno.nome}</Text>
                          {aluno.rm ? (
                            <Text style={styles.dropdownRowSub}>RM: {aluno.rm}</Text>
                          ) : null}
                        </View>
                        <Ionicons
                          name={selecionado ? 'checkbox' : 'square-outline'}
                          size={20}
                          color={selecionado ? theme.primary : theme.textMuted}
                        />
                      </Pressable>
                    );
                  })
                )}
              </View>
            )}
          </View>

          <BotaoPrimario
            testID="turma-save-button"
            title={salvando ? 'Salvando...' : modoEdicao ? 'Salvar alterações' : 'Salvar turma'}
            onPress={salvarTurma}
            disabled={salvando || excluindo}
            style={{ marginTop: 22 }}
          />

          {modoEdicao && (
            <Pressable
              testID="turma-delete-button"
              style={[styles.botaoExcluir, (salvando || excluindo) && { opacity: 0.6 }]}
              onPress={confirmarExclusao}
              disabled={salvando || excluindo}
            >
              {excluindo ? (
                <ActivityIndicator color={theme.error} />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={18} color={theme.error} />
                  <Text style={styles.botaoExcluirText}>Excluir turma</Text>
                </>
              )}
            </Pressable>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background },
  body: { padding: 22, paddingTop: 4, paddingBottom: 40 },
  avatar: {
    width: 78, height: 78, borderRadius: 39,
    backgroundColor: theme.primary,
    alignSelf: 'center',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  label: { fontSize: 13, color: theme.text, fontWeight: '600', marginBottom: 6 },
  select: {
    backgroundColor: theme.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.inputBorder,
    height: 48,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectText: { flex: 1, color: theme.placeholder, fontSize: 14 },
  selectTextPreenchido: { color: theme.text, fontWeight: '600' },
  dropdown: {
    backgroundColor: theme.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.inputBorder,
    marginTop: 8,
    overflow: 'hidden',
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.divider,
    gap: 10,
  },
  dropdownRowText: { fontSize: 14, color: theme.text, fontWeight: '600' },
  dropdownRowSub: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
  dropdownVazio: {
    padding: 16,
    textAlign: 'center',
    fontSize: 13,
    color: theme.textMuted,
  },
  bannerErro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.errorBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  bannerErroText: { flex: 1, color: theme.error, fontSize: 13, fontWeight: '600' },
  bannerSucesso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.successBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  botaoExcluir: {
    marginTop: 12,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.error,
    backgroundColor: theme.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  botaoExcluirText: { color: theme.error, fontSize: 15, fontWeight: '600' },
  bannerSucessoText: { flex: 1, color: theme.success, fontSize: 13, fontWeight: '600' },
});