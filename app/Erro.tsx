import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BotaoPrimario from '../components/BotaoPrimario';
import { colors } from '../constants/theme';

export default function Erro() {
  const router = useRouter();
  const { mensagem } = useLocalSearchParams<{ mensagem?: string }>();

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.body}>
        <Ionicons name="alert-circle" size={64} color={colors.primary} />
        <Text style={styles.title}>Ops, algo deu errado</Text>
        <Text style={styles.subtitle}>
          {mensagem ?? 'Não conseguimos completar essa ação. Tente novamente.'}
        </Text>
        <BotaoPrimario
          title="Voltar"
          onPress={() => router.back()}
          style={{ marginTop: 22 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 20, fontWeight: '800', color: colors.textDark, marginTop: 16 },
  subtitle: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 8 },
});