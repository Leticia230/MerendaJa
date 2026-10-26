import React from 'react';
import { View, StyleSheet, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import ChefLogo from '../components/ChefLogo';
import { colors } from '../constants/theme';
import Text from '../components/AppText';  

export default function SobreScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Sobre" />
      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.logoWrap}>
          <ChefLogo size={90} />
        </View>
        <Text style={styles.title}>Merenda Já</Text>
        <Text style={styles.version}>Versão 1.0.0</Text>
        <Text style={styles.desc}>
          Sistema de gestão de alimentação escolar, desenvolvido para tornar o
          dia a dia mais prático e saudável.
        </Text>

        <Text style={styles.section}>Saiba mais em nosso site:</Text>
        <View style={styles.row}>
          <Ionicons name="globe-outline" size={16} color={colors.primary} />
          <Text style={styles.rowText} onPress={() => Linking.openURL('https://leticia230.github.io/ClubMeal/')}>Merenda Já - Site Oficial</Text>
        </View>

        <Text style={styles.section}>Entre em contato:</Text>
        <View style={styles.row}>
          <Ionicons name="call-outline" size={16} color={colors.primary} />
          <Text style={styles.rowText} onPress={() => Linking.openURL('tel:000')}> (11) 99999-9999</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="mail-outline" size={16} color={colors.primary} />
          <Text style={styles.rowText} onPress={() => Linking.openURL('mailto:clubmeal74@gmail.com')}>clubmeal74@gmail.com</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  body: { padding: 22, alignItems: 'center' },
  logoWrap: { marginTop: 8 },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.primaryDark,
    marginTop: 10,
  },
  version: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  desc: {
    fontSize: 13, color: colors.textDark,
    textAlign: 'center', marginTop: 14, lineHeight: 19,
  },
  section: {
    alignSelf: 'flex-start',
    fontSize: 13,
    color: colors.textDark,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
  },
  row: {
    alignSelf: 'flex-start',
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginBottom: 6,
  },
  rowText: { fontSize: 13, color: colors.textBody },
});
