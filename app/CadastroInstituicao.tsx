import React, { useMemo, useState } from 'react';

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

import ScreenHeader from '../components/ScreenHeader';
import ResponsiveContainer from '../components/ResponsiveContainer';
import { useResponsive } from '../hooks/useResponsive';
import LabeledInput from '../components/LabeledInput';
import BotaoPrimario from '../components/BotaoPrimario';

import { useAccessibility } from '../components/AccessibilityContext';
import { cadastrar } from '../components/auth';

const ERROS_CADASTRO: Record<
  string,
  { titulo: string; mensagem: string }
> = {
  'auth/email-already-in-use': {
    titulo: 'E-mail já cadastrado',
    mensagem:
      'Já existe uma conta com este e-mail. Tente fazer login.',
  },

  'auth/invalid-email': {
    titulo: 'E-mail inválido',
    mensagem:
      'Digite um endereço de e-mail válido.',
  },

  'auth/weak-password': {
    titulo: 'Senha fraca',
    mensagem:
      'A senha precisa ter pelo menos 6 caracteres.',
  },

  'auth/network-request-failed': {
    titulo: 'Sem conexão',
    mensagem:
      'Verifique sua internet e tente novamente.',
  },

  'auth/too-many-requests': {
    titulo: 'Muitas tentativas',
    mensagem:
      'Aguarde alguns minutos antes de tentar novamente.',
  },
};

function mostrarAlerta(
  titulo: string,
  mensagem: string,
  aoFechar?: () => void
) {
  if (Platform.OS === 'web') {
    window.alert(`${titulo}\n\n${mensagem}`);
    aoFechar?.();
  } else {
    Alert.alert(
      titulo,
      mensagem,
      aoFechar
        ? [
            {
              text: 'OK',
              onPress: aoFechar,
            },
          ]
        : undefined
    );
  }
}

export default function RegisterInstitution() {
  const router = useRouter();
  const { theme } = useAccessibility();

  const { isSmallScreen, fontScale, horizontalPadding } =
    useResponsive();

  const compacto = isSmallScreen || fontScale >= 1.2;

  const styles = useMemo(
    () => createStyles(theme, compacto),
    [theme, compacto]
  );

  const [email, setEmail] = useState('');
  const [inep, setInep] = useState('');
  const [pass, setPass] = useState('');
  const [pass2, setPass2] = useState('');

  const [carregando, setCarregando] = useState(false);
  const [erroSenha, setErroSenha] = useState(false);

  async function realizarCadastro() {
    const emailNormalizado = email.trim().toLowerCase();
    const inepNormalizado = inep.trim();

    if (
      !emailNormalizado ||
      !inepNormalizado ||
      !pass ||
      !pass2
    ) {
      mostrarAlerta(
        'Campos obrigatórios',
        'Preencha todos os campos.'
      );

      return;
    }

    if (pass.length < 6) {
      setErroSenha(true);
      return;
    }

    setErroSenha(false);

    if (pass !== pass2) {
      mostrarAlerta(
        'Senhas diferentes',
        'As senhas precisam ser iguais.'
      );

      return;
    }

    if (carregando) return;

    setCarregando(true);

    console.log('[cadastro] iniciando...');

    try {
      console.log('[cadastro] chamando cadastrar()...');

      const resultado = await cadastrar(
        emailNormalizado,
        pass,
        'instituicao',
        {
          inep: inepNormalizado,
        }
      );

      console.log(
        '[cadastro] auth + firestore OK, uid:',
        resultado.user.uid
      );

      if (Platform.OS === 'web') {
        mostrarAlerta(
          'Cadastro realizado!',
          'A instituição foi cadastrada com sucesso.',
          () => router.replace('./PlanosAssinaturas')
        );
      } else {
        router.replace('./PlanosAssinaturas');

        mostrarAlerta(
          'Cadastro realizado!',
          'A instituição foi cadastrada com sucesso.'
        );
      }
    } catch (error: any) {
      console.log('[cadastro] ERRO CAPTURADO:', error);

      const erroConhecido = ERROS_CADASTRO[error?.code];

      mostrarAlerta(
        erroConhecido?.titulo ?? 'Erro no cadastro',
        erroConhecido?.mensagem ??
          `Não foi possível cadastrar a instituição. (${
            error?.code ?? 'erro desconhecido'
          })`
      );
    } finally {
      setCarregando(false);
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
          style={styles.scroll}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={
            Platform.OS === 'ios' ? 'interactive' : 'on-drag'
          }
          showsVerticalScrollIndicator={false}
          automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
        >
          <ResponsiveContainer
            style={[
              styles.formulario,
              { paddingHorizontal: horizontalPadding },
            ]}
          >
            <View style={styles.iconWrap}>
              <Ionicons
                name="business"
                size={compacto ? 34 : 38}
                color="#fff"
              />
            </View>

            <Text style={styles.title}>
              Cadastro da Instituição
            </Text>

            <LabeledInput
              testID="reg-email-input"
              label="E-mail institucional"
              placeholder="seu@email.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="username"
              editable={!carregando}
              value={email}
              onChangeText={setEmail}
              containerStyle={styles.firstInput}
            />

            <LabeledInput
              testID="reg-inep-input"
              label="Código de INEP"
              placeholder="Digite o código do INEP"
              keyboardType="number-pad"
              maxLength={8}
              editable={!carregando}
              value={inep}
              onChangeText={(texto) =>
                setInep(
                  texto.replace(/[^0-9]/g, '').slice(0, 8)
                )
              }
            />

            <LabeledInput
              testID="reg-pass-input"
              label="Senha"
              placeholder="Digite sua senha"
              isPassword
              autoComplete="password-new"
              textContentType="newPassword"
              editable={!carregando}
              value={pass}
              onChangeText={(texto) => {
                setPass(texto);

                if (texto.length >= 6) {
                  setErroSenha(false);
                }
              }}
            />

            {pass.length > 0 && pass.length < 6 && (
              <View style={styles.avisoSenha}>
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={theme.error}
                />

                <Text style={styles.avisoSenhaTexto}>
                  A senha deve ter pelo menos 6 caracteres.
                </Text>
              </View>
            )}

            <LabeledInput
              testID="reg-pass2-input"
              label="Confirmar senha"
              placeholder="Confirme sua senha"
              isPassword
              autoComplete="password-new"
              textContentType="newPassword"
              editable={!carregando}
              value={pass2}
              onChangeText={setPass2}
            />

            <BotaoPrimario
              testID="reg-submit-button"
              title={
                carregando ? 'Cadastrando...' : 'Cadastrar'
              }
              onPress={realizarCadastro}
              style={styles.button}
              disabled={carregando}
            />

            <View style={styles.bottomSpace} />
          </ResponsiveContainer>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any, compacto: boolean) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.background,
    },

    keyboardView: {
      flex: 1,
    },

    scroll: {
      flex: 1,
    },

    body: {
      flexGrow: 1,
      paddingTop: 4,
      paddingBottom: 24,
    },

    formulario: {
      flex: 0,
      paddingTop: 0,
      paddingBottom: 0,
    },

    iconWrap: {
      width: compacto ? 68 : 78,
      height: compacto ? 68 : 78,
      borderRadius: compacto ? 34 : 39,
      backgroundColor: theme.primary,
      alignSelf: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 10,
    },

    title: {
      fontSize: compacto ? 18 : 20,
      fontWeight: '800',
      color: theme.text,
      textAlign: 'center',
      flexShrink: 1,
      marginBottom: 4,
    },

    firstInput: {
      marginTop: compacto ? 16 : 20,
    },

    button: {
      marginTop: compacto ? 14 : 16,
    },

    avisoSenha: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      backgroundColor: theme.errorBg,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 9,
      marginTop: 7,
    },

    avisoSenhaTexto: {
      flex: 1,
      color: theme.error,
      fontSize: compacto ? 11 : 12,
      fontWeight: '600',
      flexShrink: 1,
    },

    bottomSpace: {
      height: compacto ? 100 : 140,
    },
  });
