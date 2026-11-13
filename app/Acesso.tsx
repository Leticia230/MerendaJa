import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

import ChefLogo from '../components/ChefLogo';
import { useAccessibility } from '../components/AccessibilityContext';
import ResponsiveContainer from '../components/ResponsiveContainer';
import { useResponsive } from '../hooks/useResponsive';

export default function AccessScreen() {
  const router = useRouter();
  const { theme } = useAccessibility();

  const {
    width,
    isSmallScreen,
    fontScale,
  } = useResponsive();

  const compacto = isSmallScreen || fontScale >= 1.2;

  const styles = useMemo(
    () => createStyles(theme, compacto),
    [theme, compacto]
  );

  const logoSize = Math.min(
    width * (compacto ? 0.55 : 0.7),
    compacto ? 230 : 320
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <ChefLogo size={logoSize} />

          <Text style={styles.title}>
            Merenda Já
          </Text>

          <Text style={styles.desc}>
            Como você deseja acessar?
          </Text>
        </View>

        <ResponsiveContainer style={styles.body}>
          <Pressable
            testID="access-student-card"
            style={styles.card}
            onPress={() => router.push('/Login')}
            accessibilityRole="button"
            accessibilityLabel="Sou Estudante. Acesse seu cardápio e informações."
          >
            <View style={styles.iconWrap}>
              <FontAwesome5
                name="user-graduate"
                size={22}
                color="#fff"
              />
            </View>

            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>
                Sou Estudante
              </Text>

              <Text style={styles.cardDesc}>
                Acesse seu cardápio e informações
              </Text>
            </View>
          </Pressable>

          <Pressable
            testID="access-institution-card"
            style={styles.card}
            onPress={() => router.push('/LoginInstituicao')}
            accessibilityRole="button"
            accessibilityLabel="Sou Instituição. Gerencie cardápios, alunos e refeições."
          >
            <View style={styles.iconWrap}>
              <Ionicons
                name="business"
                size={24}
                color="#fff"
              />
            </View>

            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>
                Sou Instituição
              </Text>

              <Text style={styles.cardDesc}>
                Gerencie cardápios, alunos e refeições
              </Text>
            </View>
          </Pressable>
        </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any, compacto: boolean) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.background,
    },

    scrollContent: {
      flexGrow: 1,
      paddingBottom: compacto ? 20 : 28,
    },

    hero: {
      width: '100%',
      backgroundColor: theme.header,
      borderBottomLeftRadius: compacto ? 28 : 40,
      borderBottomRightRadius: compacto ? 28 : 40,
      alignItems: 'center',
      paddingTop: compacto ? 20 : 32,
      paddingBottom: compacto ? 24 : 32,
      paddingHorizontal: 16,
      gap: compacto ? 6 : 8,
    },

    title: {
      fontSize: compacto ? 25 : 28,
      fontWeight: '800',
      color: theme.primaryDark,
      marginTop: 6,
      textAlign: 'center',
    },

    desc: {
      fontSize: compacto ? 13 : 14,
      color: theme.text,
      fontWeight: '600',
      textAlign: 'center',
    },

    body: {
      flex: 0,
      paddingTop: compacto ? 18 : 24,
      gap: compacto ? 12 : 16,
    },

    card: {
      width: '100%',
      backgroundColor: theme.card,
      borderRadius: 18,
      padding: compacto ? 13 : 18,
      flexDirection: 'row',
      alignItems: 'center',
      gap: compacto ? 10 : 14,
      minHeight: compacto ? 76 : 88,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
      borderWidth: theme.borderWidth,
      borderColor: theme.border,
    },

    iconWrap: {
      width: compacto ? 44 : 52,
      height: compacto ? 44 : 52,
      borderRadius: compacto ? 22 : 26,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    cardText: {
      flex: 1,
      flexShrink: 1,
    },

    cardTitle: {
      fontSize: compacto ? 15 : 16,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 3,
      flexShrink: 1,
    },

    cardDesc: {
      fontSize: compacto ? 11 : 12,
      color: theme.textMuted,
      lineHeight: compacto ? 16 : 18,
      flexShrink: 1,
    },
  });
