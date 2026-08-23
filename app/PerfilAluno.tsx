import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import LabeledInput from '../components/LabeledInput';
import BotaoPrimario from '../components/BotaoPrimario';
import { colors } from '../constants/theme';

export default function ProfileScreen() {
  const [school, setSchool] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  function setText(text: string): void {
    throw new Error('Function not implemented.');
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
            testID="profile-email-input"
            label="E-mail profissional"
            placeholder="seu@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <LabeledInput
            testID="profile-dietary-restrictions-input"
            label="Restrições alimentares"
            placeholder="Ex.: Sem glúten, sem lactose"
            autoCapitalize="none"
            keyboardType="default"
            value={dietaryRestrictions}
            onChangeText={setDietaryRestrictions}
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
            testID="profile-save-button"
            title="Salvar alterações"
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
