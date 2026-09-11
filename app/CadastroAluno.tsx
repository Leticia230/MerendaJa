
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
import { cadastrar } from '../components/auth';

function Select({
  placeholder,
  testID,
}: {
  placeholder: string;
  testID?: string;
}) {
  return (
    <Pressable testID={testID} style={styles.select}>
      <Text style={styles.selectText}>{placeholder}</Text>

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

  const [nome, setNome] = useState('');
  const [rm, setRm] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  async function realizarCadastro() {
    if (!nome || !rm || !email || !senha) {
      Alert.alert(
        'Campos obrigatórios',
        'Preencha nome, RM, e-mail e senha.'
      );
      return;
    }

    try {
      await cadastrar(email, senha);

      Alert.alert(
        'Cadastro realizado!',
        'O aluno foi cadastrado com sucesso.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/Login'),
          },
        ]
      );
    } catch (error) {
      console.error('Erro ao cadastrar aluno:', error);

      Alert.alert(
        'Erro no cadastro',
        'Não foi possível cadastrar o aluno. Verifique os dados e tente novamente.'
      );
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
            <Ionicons
              name="person"
              size={38}
              color="#fff"
            />
          </View>

          <Text style={styles.title}>
            Cadastro de Aluno
          </Text>

          <LabeledInput
            testID="aluno-nome-input"
            label="Nome do aluno"
            placeholder="Nome completo"
            value={nome}
            onChangeText={setNome}
            containerStyle={{ marginTop: 16 }}
          />

          <LabeledInput
            testID="aluno-rm-input"
            label="RM"
            placeholder="Número de matrícula"
            keyboardType="number-pad"
            value={rm}
            onChangeText={setRm}
          />

          <View>
            <Text style={styles.label}>
              Turma
            </Text>

            <Select
              placeholder="Selecione a turma"
              testID="aluno-turma-select"
            />
          </View>

          <View style={{ marginTop: 14 }}>
            <Text style={styles.label}>
              Período
            </Text>

            <Select
              placeholder="Selecione o período"
              testID="aluno-periodo-select"
            />
          </View>

          <LabeledInput
            testID="aluno-email-input"
            label="E-mail institucional"
            placeholder="aluno@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            containerStyle={{ marginTop: 14 }}
          />

          <LabeledInput
            testID="aluno-senha-input"
            label="Senha"
            placeholder="Digite uma senha"
            secureTextEntry
            autoCapitalize="none"
            value={senha}
            onChangeText={setSenha}
            containerStyle={{ marginTop: 14 }}
          />

          <BotaoPrimario
            testID="aluno-submit-button"
            title="Cadastrar aluno"
            onPress={realizarCadastro}
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
});

