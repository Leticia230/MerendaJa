import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import LabeledInput from '../components/LabeledInput';
import BotaoPrimario from '../components/BotaoPrimario';
import { colors } from '../constants/theme';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../components/firebaseConfig';


export default function ProfileScreen() {
  const [school, setSchool] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [studentCount, setStudentCount] = useState('');
  const [inep, setInep] = useState('');

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

      const ref = doc(db, 'users', instituicaoId);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        Alert.alert(
          'Erro',
          'Perfil da instituição não encontrado.'
        );
        return;
      }

      const dados = snap.data();

      setEmail((dados.email as string) ?? '');
      setInep((dados.inep as string) ?? '');
    } catch (error) {
      console.error('Erro ao carregar perfil da instituição:', error);

      Alert.alert(
        'Erro',
        'Não foi possível carregar os dados da instituição.'
      );
    }
  }

  function salvarPerfil() {
    Alert.alert(
      'Salvar alterações',
      'As alterações do perfil serão salvas quando a integração com o Firebase estiver configurada.'
    );
  }

  function cancelarPlano() {
    Alert.alert(
      'Cancelar plano',
      'Tem certeza que deseja cancelar o plano?',
      [
        {
          text: 'Não',
          style: 'cancel',
        },
        {
          text: 'Sim',
          style: 'destructive',
          onPress: () => {
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Perfil" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.body}>
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
          value={inep}
          onChangeText={setInep}
        />
          <LabeledInput
            testID="profile-email-input"
            label="E-mail profissional"
            placeholder="seu@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <LabeledInput
            testID="profile-password-input"
            label="Senha"
            placeholder="Nova senha"
            isPassword
            value={password}
            onChangeText={setPassword}
          />
        <BotaoPrimario
          testID="profile-cancel-plan-button"
          title="Cancelar plano"
          onPress={cancelarPlano}
          style={{
            marginTop: 16,
            backgroundColor: '#d64545',
          }}
        />

        <BotaoPrimario
          testID="profile-save-button"
          title="Salvar alterações"
          onPress={salvarPerfil}
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
    width: 100, height: 100, borderRadius: 50,
    alignSelf: 'center', marginBottom: 20,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
