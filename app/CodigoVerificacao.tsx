import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import ScreenHeader from '../components/ScreenHeader';
import ChefLogo from '../components/ChefLogo';
import BotaoPrimario from '../components/BotaoPrimario';
import { colors } from '../constants/theme';

export default function VerifyCodeScreen() {
  const router = useRouter();
  const [code, setCode] = useState(['1', '2', '3', '4']);
  const inputs = useRef<Array<TextInput | null>>([]);

  const setDigit = (i: number, v: string) => {
    const digit = v.replace(/[^0-9]/g, '').slice(-1);
    const next = [...code];
    next[i] = digit;
    setCode(next);
    if (digit && i < 3) inputs.current[i + 1]?.focus();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="" />
      <View style={styles.body}>
        <View style={styles.logoWrap}>
          <ChefLogo size={350} />
        </View>
        <Text style={styles.title}>Código de verificação</Text>
        <Text style={styles.desc}>
          Enviamos um código para{'\n'}seu e-mail institucional
        </Text>

        <View style={styles.otpRow}>
          {code.map((d, i) => (
            <TextInput
              key={i}
              testID={`otp-input-${i}`}
              ref={r => { inputs.current[i] = r; }}
              value={d}
              onChangeText={v => setDigit(i, v)}
              keyboardType="number-pad"
              maxLength={1}
              style={styles.otpInput}
            />
          ))}
        </View>

        <Text style={styles.hint}>Não recebeu o código?</Text>
        <Pressable>
          <Text style={styles.resend}>Reenviar código (00:30)</Text>
        </Pressable>

        <BotaoPrimario
          testID="otp-verify-button"
          title="Verificar"
          onPress={() => router.replace('/(tabs-instituicao)/Home')}
          style={{ marginTop: 24 }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  body: { padding: 22, paddingTop: 8 },
  logoWrap: { alignItems: 'center' },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textDark,
    textAlign: 'center',
    marginTop: 10,
  },
  desc: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 24,
  },
  otpInput: {
    width: 60,
    height: 68,
    borderRadius: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.inputBorder,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: colors.textDark,
  },
  hint: {
    textAlign: 'center',
    marginTop: 20,
    color: colors.textMuted,
    fontSize: 13,
  },
  resend: {
    textAlign: 'center',
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
    marginTop: 4,
    textDecorationLine: 'underline',
  },
});
