
import React, { useEffect, useMemo, useState } from 'react';

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
import ResponsiveContainer from '../components/ResponsiveContainer';
import { useResponsive } from '../hooks/useResponsive';
import { useAccessibility } from '../components/AccessibilityContext';

import { doc, getDoc, setDoc } from 'firebase/firestore';

import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';

import { auth, db } from '../components/firebaseConfig';
import Text from '../components/AppText';

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
        Alert.alert(
          'Erro',
          'Não foi possível identificar a instituição.'
        );
        return;
      }

      const snap = await getDoc(doc(db, 'users', instituicaoId));

      if (!snap.exists()) {
        Alert.alert(
          'Erro',
          'Perfil da instituição não encontrado.'
        );
        return;
      }

      const dados = snap.data();

      setEmail(
        (dados.email as string) ?? auth.currentUser?.email ?? ''
      );

      setInep((dados.inep as string) ?? '');
      setSchool((dados.escola as string) ?? '');

      setStudentCount(
        dados.quantidadeAlunos != null
          ? String(dados.quantidadeAlunos)
          : ''
      );
    } catch (error) {
      console.error('Erro ao carregar perfil da instituição:', error);

      Alert.alert(
        'Erro',
        'Não foi possível carregar os dados da instituição.'
      );
    }
  }

  async function salvarPerfil() {
    if (saving) return;

    const user = auth.currentUser;

    if (!user) {
      Alert.alert(
        'Erro',
        'Sessão expirada. Entre novamente.'
      );
      return;
    }

    if (!school.trim()) {
      Alert.alert(
        'Atenção',
        'Informe o nome da unidade escolar.'
      );
      return;
    }

    if (!/^\d+$/.test(studentCount.trim())) {
      Alert.alert(
        'Atenção',
        'Informe a quantidade de alunos (apenas números).'
      );
      return;
    }

    if (!/^\d{8}$/.test(inep.trim())) {
      Alert.alert(
        'Atenção',
        'O código INEP deve ter 8 dígitos.'
      );
      return;
    }

    if (novaSenha) {
      if (novaSenha.length < 6) {
        Alert.alert(
          'Atenção',
          'A nova senha deve ter pelo menos 6 caracteres.'
        );
        return;
      }

      if (!senhaAtual) {
        Alert.alert(
          'Atenção',
          'Informe a senha atual para trocar a senha.'
        );
        return;
      }
    }

    setSaving(true);

    try {
      if (novaSenha) {
        const credencial = EmailAuthProvider.credential(
          user.email!,
          senhaAtual
        );

        await reauthenticateWithCredential(user, credencial);
        await updatePassword(user, novaSenha);
      }

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

      Alert.alert(
        'Sucesso',
        'Dados salvos com sucesso!'
      );
    } catch (error: any) {
      console.error('Erro ao salvar perfil:', error);

      Alert.alert(
        'Erro',
        mensagemDeErroAuth(error?.code)
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Perfil" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
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
            <View style={styles.avatar}>
              <Ionicons
                name="person"
                size={compacto ? 38 : 44}
                color="#fff"
              />
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

            {/* E-mail somente para visualização */}
            <View style={styles.emailCard}>
              <View style={styles.emailIcon}>
                <Ionicons
                  name="mail-outline"
                  size={21}
                  color={theme.primary}
                />
              </View>

              <View style={styles.emailContent}>
                <Text style={styles.emailLabel}>
                  E-mail profissional
                </Text>

                <Text style={styles.emailValue}>
                  {email || 'Não informado'}
                </Text>
              </View>

              <Ionicons
                name="lock-closed-outline"
                size={16}
                color={theme.textMuted}
              />
            </View>

            <BotaoPrimario
              testID="profile-save-button"
              title={saving ? 'Salvando...' : 'Salvar alterações'}
              onPress={salvarPerfil}
              disabled={saving}
              style={styles.button}
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
      paddingTop: compacto ? 8 : 12,
      paddingBottom: 40,
    },

    avatar: {
      width: compacto ? 84 : 100,
      height: compacto ? 84 : 100,
      borderRadius: compacto ? 42 : 50,
      alignSelf: 'center',
      marginBottom: compacto ? 16 : 20,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: theme.primary,
      shadowOpacity: 0.25,
      shadowRadius: compacto ? 7 : 10,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 4,
    },

    // Cartão do e-mail não editável
    emailCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 14,
      padding: 15,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.primary + '50',
    },

    emailIcon: {
      width: 42,
      height: 42,
      borderRadius: 12,
      backgroundColor: theme.primary + '25',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 13,
    },

    emailContent: {
      flex: 1,
    },

    emailLabel: {
      fontSize: 12,
      color: theme.textMuted,
      fontWeight: '600',
      marginBottom: 4,
    },

    emailValue: {
      fontSize: 14,
      color: theme.text,
      fontWeight: '700',
    },

    button: {
      marginTop: compacto ? 12 : 16,
    },
  });
