import React, { useEffect, useMemo, useState } from 'react';

import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import ScreenHeader from '../components/ScreenHeader';
import LabeledInput from '../components/LabeledInput';
import BotaoPrimario from '../components/BotaoPrimario';
import ResponsiveContainer from '../components/ResponsiveContainer';
import { useResponsive } from '../hooks/useResponsive';
import { useAccessibility } from '../components/AccessibilityContext';

import {
  buscarPerfilAluno,
  salvarRestricoesAlimentares,
} from './services/alunos';

import { auth } from '../components/firebaseConfig';
import Text from '../components/AppText';

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

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [rm, setRm] = useState('');
  const [turma, setTurma] = useState('');
  const [periodo, setPeriodo] = useState('');
  const [password, setPassword] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarPerfil();
  }, []);

  async function carregarPerfil() {
    try {
      const alunoId = auth.currentUser?.uid;

      if (!alunoId) {
        Alert.alert(
          'Erro',
          'Não foi possível identificar o aluno.'
        );
        return;
      }

      const perfil = await buscarPerfilAluno(alunoId);

      if (!perfil) {
        Alert.alert(
          'Erro',
          'Perfil do aluno não encontrado.'
        );
        return;
      }

      setNome(perfil.nome ?? '');
      setEmail(perfil.email ?? '');
      setRm(perfil.rm ?? '');
      setTurma(perfil.turmaNome ?? '');
      setPeriodo(perfil.periodo ?? '');

      setDietaryRestrictions(
        perfil.restricoesAlimentares ?? ''
      );
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);

      Alert.alert(
        'Erro',
        'Não foi possível carregar os dados do perfil.'
      );
    } finally {
      setCarregando(false);
    }
  }

  async function salvarPerfil() {
    if (salvando) return;

    try {
      const alunoId = auth.currentUser?.uid;

      if (!alunoId) {
        Alert.alert(
          'Erro',
          'Não foi possível identificar o aluno.'
        );
        return;
      }

      setSalvando(true);

      await salvarRestricoesAlimentares(
        alunoId,
        dietaryRestrictions
      );

      Alert.alert(
        'Perfil atualizado',
        'Suas restrições alimentares foram salvas.'
      );
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);

      Alert.alert(
        'Erro',
        'Não foi possível salvar as alterações.'
      );
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Meu perfil" />

        <View style={styles.loading}>
          <ActivityIndicator
            size="large"
            color={theme.primary}
          />

          <Text style={styles.loadingText}>
            Carregando perfil...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Meu perfil" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
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
              testID="profile-name-input"
              label="Nome"
              placeholder="Nome completo"
              value={nome}
              onChangeText={setNome}
            />

            <LabeledInput
              testID="profile-email-input"
              label="E-mail"
              placeholder="seu@email.com"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />

            <LabeledInput
              testID="profile-rm-input"
              label="RM"
              placeholder="Registro do aluno"
              value={rm}
              onChangeText={setRm}
            />

            <LabeledInput
              testID="profile-dietary-restrictions-input"
              label="Restrições alimentares"
              placeholder="Ex.: Sem glúten, sem lactose"
              autoCapitalize="sentences"
              keyboardType="default"
              value={dietaryRestrictions}
              onChangeText={setDietaryRestrictions}
            />

            <Text style={styles.helperText}>
              Informe alergias, intolerâncias ou outras
              restrições alimentares importantes.
            </Text>

            <BotaoPrimario
              testID="profile-save-button"
              title={
                salvando
                  ? 'Salvando...'
                  : 'Salvar alterações'
              }
              onPress={salvarPerfil}
              disabled={salvando}
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

    helperText: {
      fontSize: compacto ? 10 : 11,
      color: theme.textMuted,
      marginTop: -8,
      marginBottom: 12,
      lineHeight: compacto ? 15 : 16,
    },

    button: {
      marginTop: compacto ? 12 : 16,
    },

    loading: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },

    loadingText: {
      marginTop: 12,
      fontSize: compacto ? 13 : 14,
      color: theme.textMuted,
      textAlign: 'center',
    },
  });
