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
import { doc, setDoc } from 'firebase/firestore';
import ScreenHeader from '../components/ScreenHeader';
import LabeledInput from '../components/LabeledInput';
import BotaoPrimario from '../components/BotaoPrimario';
import { colors } from '../constants/theme';
import { cadastrar } from '../components/auth';
import { db } from '../components/firebaseConfig';

export default function RegisterInstitution() {

  const router = useRouter();

  const [email, setEmail] = useState('');
  const [inep, setInep] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');
  const [carregando, setCarregando] = useState(false); // evita cliques duplicados


 async function realizarCadastro() {

  if (!email || !inep || !pass || !pass2) {
    Alert.alert('Campos obrigatórios', 'Preencha todos os campos.');
    return;
  }

  if (pass !== pass2) {
    Alert.alert('Senhas diferentes', 'As senhas precisam ser iguais.');
    return;
  }

  setCarregando(true);
  console.log('[cadastro] iniciando...');

  try {
    console.log('[cadastro] chamando cadastrar()...');
    const resultado = await cadastrar(email, pass);
    console.log('[cadastro] auth OK, uid:', resultado.user.uid);

    const uid = resultado.user.uid;

    console.log('[cadastro] salvando no firestore...');
    await setDoc(doc(db, 'usuarios', uid), {
      tipo: 'instituicao',
      email: email,
      inep: inep,
    });
    console.log('[cadastro] firestore OK');

    setCarregando(false);
    // 4. CADASTRO CONCLUÍDO
setCarregando(false);

if (Platform.OS === 'web') {
  window.alert('Cadastro realizado! A instituição foi cadastrada com sucesso.');
  router.replace('/Home');
} else {
  Alert.alert(
    'Cadastro realizado!',
    'A instituição foi cadastrada com sucesso.',
    [
      {
        text: 'OK',
        onPress: () => router.replace('/Home'),
      },
    ]
  );
}

  } catch (error: any) {
    console.log('[cadastro] ERRO CAPTURADO:', error);
    setCarregando(false);
    // ... resto dos ifs de erro
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
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            containerStyle={styles.firstInput}
          />

          <LabeledInput
            testID="reg-inep-input"
            label="Código de INEP"
            placeholder="Digite o código do INEP"
            keyboardType="number-pad"
            value={inep}
            onChangeText={setInep}
          />

          <LabeledInput
            testID="reg-pass-input"
            label="Senha"
            placeholder="Digite sua senha"
            isPassword
            value={pass}
            onChangeText={setPass}
          />

          <LabeledInput
            testID="reg-pass2-input"
            label="Confirmar senha"
            placeholder="Confirme sua senha"
            isPassword
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