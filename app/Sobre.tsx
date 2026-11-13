import React, { useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import ScreenHeader from '../components/ScreenHeader';
import ChefLogo from '../components/ChefLogo';
import { useAccessibility } from '../components/AccessibilityContext';
import Text from '../components/AppText';
import ResponsiveContainer from '../components/ResponsiveContainer';
import { useResponsive } from '../hooks/useResponsive';

export default function SobreScreen() {
  const { theme } = useAccessibility();

  const { isSmallScreen, fontScale } = useResponsive();
  const compacto = isSmallScreen || fontScale >= 1.2;

  const styles = useMemo(
    () => createStyles(theme, compacto),
    [theme, compacto]
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Sobre" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ResponsiveContainer style={styles.body}>
          <View style={styles.logoWrap}>
            <ChefLogo size={compacto ? 76 : 90} />
          </View>

          <Text style={styles.title}>Merenda Já</Text>

          <Text style={styles.version}>Versão 1.0.0</Text>

          <Text style={styles.desc}>
            Sistema de gestão de alimentação escolar, desenvolvido para tornar o
            dia a dia mais prático e saudável.
          </Text>

          <Text style={styles.section}>Equipe:</Text>

          <Text style={styles.names}>
            - Letícia Pires de Almeida{"\n"}
            - Lucas de Jesus Gonçalves{"\n"}
            - Milena de Bastos Miranda{"\n"}
            - Rafael Guerra Lacerda Almeida{"\n"}
            - Thomás da Silva Marques Pereira
          </Text>

          <Text style={styles.section}>Saiba mais em nosso site:</Text>

          <View style={styles.row}>
            <Ionicons
              name="globe-outline"
              size={18}
              color={theme.primary}
            />

            <Text
              style={styles.rowText}
              onPress={() =>
                Linking.openURL(
                  'https://leticia230.github.io/ClubMeal/'
                )
              }
              accessibilityRole="link"
            >
              Merenda Já - Site Oficial
            </Text>
          </View>

          <Text style={styles.section}>Entre em contato:</Text>

          <View style={styles.row}>
            <Ionicons
              name="call-outline"
              size={18}
              color={theme.primary}
            />

            <Text
              style={styles.rowText}
              onPress={() => Linking.openURL('tel:000')}
              accessibilityRole="link"
            >
              {' '}(11) 99999-9999
            </Text>
          </View>

          <View style={styles.row}>
            <Ionicons
              name="mail-outline"
              size={18}
              color={theme.primary}
            />

            <Text
              style={styles.rowText}
              onPress={() =>
                Linking.openURL('mailto:clubmeal74@gmail.com')
              }
              accessibilityRole="link"
            >
              clubmeal74@gmail.com
            </Text>
          </View>
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
      paddingBottom: compacto ? 24 : 36,
    },

    body: {
      flex: 0,
      alignItems: 'center',
      paddingTop: compacto ? 12 : 18,
      paddingBottom: compacto ? 16 : 24,
    },

    logoWrap: {
      marginTop: 8,
      alignItems: 'center',
    },

    title: {
      fontSize: compacto ? 23 : 26,
      fontWeight: '800',
      color: theme.primaryDark,
      marginTop: 10,
      textAlign: 'center',
    },

    version: {
      fontSize: compacto ? 12 : 13,
      color: theme.textMuted,
      marginTop: 4,
      textAlign: 'center',
    },

    desc: {
      width: '100%',
      fontSize: compacto ? 12 : 13,
      color: theme.text,
      textAlign: 'center',
      marginTop: compacto ? 12 : 14,
      lineHeight: compacto ? 19 : 21,
    },

    names: {
      width: '100%',
      fontSize: compacto ? 12 : 13,
      color: theme.text,
      textAlign: 'justify',
      marginTop: compacto ? 12 : 14,
      lineHeight: compacto ? 19 : 21,
    },

    section: {
      alignSelf: 'stretch',
      fontSize: compacto ? 12 : 13,
      color: theme.text,
      fontWeight: '700',
      marginTop: compacto ? 18 : 20,
      marginBottom: 8,
    },

    row: {
      width: '100%',
      alignSelf: 'stretch',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
      paddingVertical: 2,
    },

    rowText: {
      flex: 1,
      flexShrink: 1,
      fontSize: compacto ? 12 : 13,
      color: theme.textSecondary,
    },
  });
