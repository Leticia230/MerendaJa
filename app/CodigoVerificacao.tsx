import React, { useMemo, useRef, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import ScreenHeader from '../components/ScreenHeader';
import ChefLogo from '../components/ChefLogo';
import BotaoPrimario from '../components/BotaoPrimario';
import ResponsiveContainer from '../components/ResponsiveContainer';
import { useResponsive } from '../hooks/useResponsive';
import { useAccessibility } from '../components/AccessibilityContext';

export default function VerifyCodeScreen() {
  const router = useRouter();
  const { theme } = useAccessibility();

  const {
    width,
    isSmallScreen,
    fontScale,
    horizontalPadding,
  } = useResponsive();

  const compacto = isSmallScreen || fontScale >= 1.2;

  const styles = useMemo(
    () => createStyles(theme, compacto),
    [theme, compacto]
  );

  const [code, setCode] = useState(['1', '2', '3', '4']);
  const inputs = useRef<Array<TextInput | null>>([]);

  const larguraLogo = Math.min(
    width * (compacto ? 0.72 : 0.82),
    compacto ? 250 : 350
  );

  const setDigit = (i: number, v: string) => {
    const digit = v.replace(/[^0-9]/g, '').slice(-1);
    const next = [...code];

    next[i] = digit;
    setCode(next);

    if (digit && i < 3) {
      inputs.current[i + 1]?.focus();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ResponsiveContainer
          style={[
            styles.body,
            { paddingHorizontal: horizontalPadding },
          ]}
        >
          <View style={styles.logoWrap}>
            <ChefLogo size={larguraLogo} />
          </View>

          <Text style={styles.title}>
            Código de verificação
          </Text>

          <Text style={styles.desc}>
            Enviamos um código para{'\n'}
            seu e-mail institucional
          </Text>

          <View style={styles.otpRow}>
            {code.map((d, i) => (
              <TextInput
                key={i}
                testID={`otp-input-${i}`}
                ref={(r) => {
                  inputs.current[i] = r;
                }}
                value={d}
                onChangeText={(v) => setDigit(i, v)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
                style={styles.otpInput}
                textAlignVertical="center"
                accessibilityLabel={`Dígito ${i + 1} do código`}
              />
            ))}
          </View>

          <Text style={styles.hint}>
            Não recebeu o código?
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Reenviar código"
          >
            <Text style={styles.resend}>
              Reenviar código (00:30)
            </Text>
          </Pressable>

          <BotaoPrimario
            testID="otp-verify-button"
            title="Verificar"
            onPress={() =>
              router.replace('/(tabs-instituicao)/Home')
            }
            style={styles.button}
          />
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

    scroll: {
      flex: 1,
    },

    scrollContent: {
      flexGrow: 1,
      paddingBottom: 24,
    },

    body: {
      flex: 0,
      paddingTop: compacto ? 4 : 8,
      paddingBottom: 24,
      alignItems: 'center',
    },

    logoWrap: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },

    title: {
      fontSize: compacto ? 19 : 22,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'center',
      marginTop: compacto ? 6 : 10,
      flexShrink: 1,
    },

    desc: {
      fontSize: compacto ? 12 : 13,
      color: theme.textMuted,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: compacto ? 17 : 18,
      flexShrink: 1,
    },

    otpRow: {
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: compacto ? 8 : 12,
      marginTop: compacto ? 20 : 24,
    },

    otpInput: {
      width: compacto ? 52 : 60,
      height: compacto ? 60 : 68,
      borderRadius: 14,
      backgroundColor: theme.card,
      borderWidth: theme.borderWidth || 1,
      borderColor: theme.inputBorder,
      textAlign: 'center',
      fontSize: compacto ? 21 : 24,
      fontWeight: '700',
      color: theme.text,
      padding: 0,
    },

    hint: {
      textAlign: 'center',
      marginTop: compacto ? 16 : 20,
      color: theme.textMuted,
      fontSize: compacto ? 12 : 13,
      flexShrink: 1,
    },

    resend: {
      textAlign: 'center',
      color: theme.primary,
      fontWeight: '700',
      fontSize: compacto ? 12 : 13,
      marginTop: 4,
      textDecorationLine: 'underline',
    },

    button: {
      marginTop: compacto ? 20 : 24,
      width: '100%',
    },
  });
