import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
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
import { colors } from '../constants/theme';

import {
  buscarPerfilAluno,
  salvarRestricoesAlimentares,
} from './services/alunos';

import { auth } from '../components/firebaseConfig';

export default function ProfileScreen() {
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
            color={colors.primary}
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
        style={{ flex: 1 }}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : 'height'
        }
      >
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.avatar}>
            <Ionicons
              name="person"
              size={44}
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
            testID="profile-class-input"
            label="Turma"
            placeholder="Turma"
            value={turma}
            onChangeText={setTurma}
          />

          <LabeledInput
            testID="profile-period-input"
            label="Período"
            placeholder="Período"
            value={periodo}
            onChangeText={setPeriodo}
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

          <LabeledInput
            testID="profile-password-input"
            label="Senha"
            placeholder="Nova senha"
            isPassword
            value={password}
            onChangeText={setPassword}
          />

          <BotaoPrimario
            testID="profile-save-button"
            title={
              salvando
                ? 'Salvando...'
                : 'Salvar alterações'
            }
            onPress={salvarPerfil}
            style={{ marginTop: 16 }}
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
    paddingBottom: 40,
  },

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
    shadowOffset: {
      width: 0,
      height: 4,
    },
    elevation: 4,
  },

  helperText: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: -8,
    marginBottom: 12,
    lineHeight: 16,
  },

  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: colors.textMuted,
  },
});
