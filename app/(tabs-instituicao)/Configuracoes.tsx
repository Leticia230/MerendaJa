import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../../constants/theme';


const ITEMS = [
  { icon: 'person', label: 'Perfil', route: '/PerfilInstituicao', color: '#FFB27A' },  { icon: 'information-circle', label: 'Sobre', route: '/Sobre', color: '#FFB27A' },
  { icon: 'accessibility', label: 'Acessibilidade', route: '/Acessibilidade', color: '#FFC845' },
  { icon: 'document-text', label: 'Termos de uso', route: '/TermosUso', color: '#FFB27A' },
  { icon: 'shield-checkmark', label: 'Segurança e Privacidade', route: '/SegurancaPrivacidade', color: '#FFB27A' },
];

export default function ConfigScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerWrap}>
        <Text style={styles.headerTitle}>Configurações</Text>
        <Ionicons name="settings-outline" size={20} color={colors.textDark} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {ITEMS.map((it, i) => (
            <Pressable
              key={it.label}
              testID={`config-${it.label}`}
              onPress={() => it.route && router.push(it.route as any)}
              style={[styles.row, i < ITEMS.length - 1 && styles.rowBorder]}
            >
              <View style={[styles.iconWrap, { backgroundColor: it.color }]}>
                <Ionicons name={it.icon as any} size={18} color="#fff" />
              </View>
              <Text style={styles.label}>{it.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>

        <Pressable
          testID="logout-button"
          style={styles.logout}
          onPress={() => router.replace('/')}
        >
          <Text style={styles.logoutText}>Sair da conta</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  headerWrap: {
    backgroundColor: colors.yellow,
    paddingTop: 20,
    paddingBottom: 18,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '800', color: colors.textDark },
  body: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.textDark },
  logout: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
