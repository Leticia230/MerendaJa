import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../../components/firebaseConfig';
import Text from '../../components/AppText';
import { useAccessibility } from '../../components/AccessibilityContext';
import { useResponsive } from '../../hooks/useResponsive';
import ResponsiveContainer from '../../components/ResponsiveContainer';

const ITEMS = [
  { icon: 'person', label: 'Perfil', route: '/PerfilAluno', color: '#FFB27A' },
  { icon: 'information-circle', label: 'Sobre', route: '/Sobre', color: '#FFC845' },
  { icon: 'lock-closed', label: 'Permissões', route: '/Permissoes', color: '#FFB27A' },
  { icon: 'accessibility', label: 'Acessibilidade', route: '/Acessibilidade', color: '#FFC845' },
  { icon: 'document-text', label: 'Termos de uso', route: '/TermosUso', color: '#FFB27A' },
  { icon: 'shield-checkmark', label: 'Segurança e Privacidade', route: '/SegurancaPrivacidade', color: '#FFC845' },
];

export default function ConfigScreen() {
  const router = useRouter();
  const { theme } = useAccessibility();
  const { isSmallScreen, fontScale } = useResponsive();

  const compacto = isSmallScreen || fontScale >= 1.2;
  const styles = createStyles(theme, compacto);

  async function sair() {
    try {
      await signOut(auth);
    } finally {
      router.replace('/');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerWrap}>
        <ResponsiveContainer style={styles.headerContent}>
          <Text style={styles.headerTitle}>Configurações</Text>

          <Ionicons
            name="settings-outline"
            size={20}
            color={theme.text}
          />
        </ResponsiveContainer>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <ResponsiveContainer>
          <View style={styles.card}>
            {ITEMS.map((it, i) => (
              <Pressable
                key={it.label}
                testID={`config-${it.label}`}
                onPress={() => it.route && router.push(it.route as any)}
                style={[
                  styles.row,
                  i < ITEMS.length - 1 && styles.rowBorder,
                ]}
              >
                <View style={[styles.iconWrap, { backgroundColor: it.color }]}>
                  <Ionicons
                    name={it.icon as any}
                    size={18}
                    color="#fff"
                  />
                </View>

                <Text style={styles.label}>{it.label}</Text>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={theme.textMuted}
                  style={styles.chevron}
                />
              </Pressable>
            ))}
          </View>

              <Pressable
                testID="logout-button"
                style={styles.logout}
                onPress={() => router.replace('/Acesso')}
                accessibilityRole="button"
                accessibilityLabel="Sair da conta"
                  >
                <Text style={styles.logoutText}>Sair da conta</Text>
              </Pressable>

        </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any, compacto = false) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.background,
    },

    headerWrap: {
      backgroundColor: theme.header,
      paddingTop: 20,
      paddingBottom: 18,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },

    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },

    headerTitle: {
      flex: 1,
      fontSize: 20,
      fontWeight: '800',
      color: theme.text,
    },

    body: {
      paddingTop: 16,
      paddingBottom: 40,
    },

    card: {
      backgroundColor: theme.card,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: theme.borderWidth,
      borderColor: theme.border,
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: compacto ? 14 : 15,
      paddingHorizontal: compacto ? 12 : 14,
      gap: compacto ? 10 : 12,
      minHeight: 62,
    },

    rowBorder: {
      borderBottomWidth: 1,
      borderBottomColor: theme.divider,
    },

    iconWrap: {
      width: 36,
      height: 36,
      flexShrink: 0,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },

    label: {
      flex: 1,
      minWidth: 0,
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      flexShrink: 1,
    },

    chevron: {
      flexShrink: 0,
    },

    logout: {
      backgroundColor: theme.primary,
      borderRadius: 14,
      paddingVertical: 15,
      paddingHorizontal: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 20,
      minHeight: 50,
    },

    logoutText: {
      color: theme.onPrimary,
      fontWeight: '700',
      fontSize: 15,
      textAlign: 'center',
    },
  });
