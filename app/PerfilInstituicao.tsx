import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import LabeledInput from '../components/LabeledInput';
import BotaoPrimario from '../components/BotaoPrimario';
import { colors } from '../constants/theme';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { auth, db } from '../components/firebaseConfig';

function mensagemDeErroAuth(code?: string) {
  switch (code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'A senha atual está incorreta.';
    case 'auth/weak-password':
      return 'A nova senha é muito fraca. Use pelo menos 6 caracteres.';
    case 'auth/requires-recent-login':
      return 'Por segurança, saia e entre novamente no app antes de trocar a senha.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Aguarde alguns minutos e tente de novo.';
    case 'auth/network-request-failed':
      return 'Sem conexão. Verifique sua internet e tente novamente.';
    default:
      return 'Não foi possível salvar agora. Tente novamente.';
  }
}

export default function ProfileScreen() {
  const [school, setSchool] = useState('');
  const [email, setEmail] = useState('');
  const [studentCount, setStudentCount] = useState('');
  const [inep, setInep] = useState('');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    carregarPerfil();
  }, []);

  async function carregarPerfil() {
    try {
      const instituicaoId = auth.currentUser?.uid;

      if (!instituicaoId) {
        Alert.alert('Erro', 'Não foi possível identificar a instituição.');
        return;
      }

      const snap = await getDoc(doc(db, 'users', instituicaoId));

      if (!snap.exists()) {
        Alert.alert('Erro', 'Perfil da instituição não encontrado.');
        return;
      }

      const dados = snap.data();

      setEmail((dados.email as string) ?? auth.currentUser?.email ?? '');
      setInep((dados.inep as string) ?? '');
      setSchool((dados.escola as string) ?? '');
      setStudentCount(
        dados.quantidadeAlunos != null ? String(dados.quantidadeAlunos) : ''
      );
    } catch (error) {
      console.error('Erro ao carregar perfil da instituição:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados da instituição.');
    }
  }

  async function salvarPerfil() {
    if (saving) return;

    const user = auth.currentUser;
    if (!user) {
      Alert.alert('Erro', 'Sessão expirada. Entre novamente.');
      return;
    }

    // Validações
    if (!school.trim()) {
      Alert.alert('Atenção', 'Informe o nome da unidade escolar.');
      return;
    }
    if (!/^\d+$/.test(studentCount.trim())) {
      Alert.alert('Atenção', 'Informe a quantidade de alunos (apenas números).');
      return;
    }
    if (!/^\d{8}$/.test(inep.trim())) {
      Alert.alert('Atenção', 'O código INEP deve ter 8 dígitos.');
      return;
    }
    if (novaSenha) {
      if (novaSenha.length < 6) {
        Alert.alert('Atenção', 'A nova senha deve ter pelo menos 6 caracteres.');
        return;
      }
      if (!senhaAtual) {
        Alert.alert('Atenção', 'Informe a senha atual para trocar a senha.');
        return;
      }
    }

    setSaving(true);
    try {
      // 1) Troca de senha (se preenchida) — exige reautenticação
      if (novaSenha) {
        const credencial = EmailAuthProvider.credential(user.email!, senhaAtual);
        await reauthenticateWithCredential(user, credencial);
        await updatePassword(user, novaSenha);
      }

      // 2) Dados do perfil
      await setDoc(
        doc(db, 'users', user.uid),
        {
          escola: school.trim(),
          quantidadeAlunos: Number(studentCount),
          inep: inep.trim(),
          atualizadoEm: new Date().toISOString(),
        },
        { merge: true }
      );

      setSenhaAtual('');
      setNovaSenha('');
      Alert.alert('Sucesso', 'Dados salvos com sucesso!');
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);
      Alert.alert('Erro', mensagemDeErroAuth(error?.code));
    } finally {
      setSaving(false);
    }
  }

  function cancelarPlano() {
    Alert.alert('Cancelar plano', 'Tem certeza que deseja cancelar o plano?', [
      { text: 'Não', style: 'cancel' },
      { text: 'Sim', style: 'destructive', onPress: () => {} },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Perfil" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.avatar}>
            <Ionicons name="person" size={44} color="#fff" />
          </View>

          <LabeledInput
            testID="profile-school-input"
            label="Unidade escolar"
            placeholder="Nome da escola"
            value={school}
            onChangeText={setSchool}
          />
          <LabeledInput
            testID="profile-student-count-input"
            label="Quantidade de alunos"
            placeholder="Ex.: 350"
            keyboardType="numeric"
            value={studentCount}
            onChangeText={setStudentCount}
          />
          <LabeledInput
            testID="profile-inep-input"
            label="Código INEP"
            placeholder="Ex.: 35012345"
            keyboardType="numeric"
            maxLength={8}
            value={inep}
            onChangeText={setInep}
          />
          <LabeledInput
            testID="profile-email-input"
            label="E-mail profissional"
            placeholder="seu@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            editable={false}
            value={email}
            onChangeText={setEmail}
          />
          <LabeledInput
            testID="profile-current-password-input"
            label="Senha atual"
            placeholder="Preencha só para trocar a senha"
            isPassword
            value={senhaAtual}
            onChangeText={setSenhaAtual}
          />
          <LabeledInput
            testID="profile-password-input"
            label="Nova senha"
            placeholder="Deixe em branco para manter"
            isPassword
            value={novaSenha}
            onChangeText={setNovaSenha}
          />

          <BotaoPrimario
            testID="profile-cancel-plan-button"
            title="Cancelar plano"
            onPress={cancelarPlano}
            style={{ marginTop: 16, backgroundColor: '#d64545' }}
          />

          <BotaoPrimario
            testID="profile-save-button"
            title={saving ? 'Salvando...' : 'Salvar alterações'}
            onPress={salvarPerfil}
            disabled={saving}
            style={{ marginTop: 16 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  body: { padding: 22 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});