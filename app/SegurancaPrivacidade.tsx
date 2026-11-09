import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Modal,
  Alert,
  Share,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  deleteUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import ScreenHeader from '../components/ScreenHeader';
import Text from '../components/AppText';
import { useAccessibility } from '../components/AccessibilityContext';
import { auth, db } from '../components/firebaseConfig';

type PrivacyField = 'compartilharDados' | 'mostrarAtividade';
type ModalMode = 'password' | 'delete' | null;

function friendlyError(e: any): string {
  switch (e?.code) {
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Senha atual incorreta.';
    case 'auth/weak-password':
      return 'A nova senha é muito fraca. Use pelo menos 6 caracteres.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Aguarde um pouco e tente de novo.';
    case 'auth/requires-recent-login':
      return 'Por segurança, saia, faça login de novo e tente outra vez.';
    case 'auth/network-request-failed':
      return 'Sem conexão. Verifique sua internet.';
    default:
      return 'Algo deu errado. Tente novamente.';
  }
}

export default function SecurityPrivacyScreen() {
  const router = useRouter();
  const { theme } = useAccessibility();
  const styles = createStyles(theme);

  const [shareUsageData, setShareUsageData] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [exporting, setExporting] = useState(false);

  // Carrega as preferências de privacidade salvas
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;
    getDoc(doc(db, 'users', user.uid))
      .then((snap) => {
        const p = snap.data()?.privacidade;
        if (p) {
          setShareUsageData(p.compartilharDados ?? true);
          setShowActivity(p.mostrarAtividade ?? true);
        }
      })
      .catch(() => {});
  }, []);

  const savePrivacy = async (
    field: PrivacyField,
    value: boolean,
    setter: (v: boolean) => void
  ) => {
    const user = auth.currentUser;
    if (!user) return;
    setter(value); // atualiza na hora
    try {
      await setDoc(doc(db, 'users', user.uid), { privacidade: { [field]: value } }, { merge: true });
    } catch {
      setter(!value); // desfaz se não salvou
      Alert.alert('Erro', 'Não foi possível salvar. Tente novamente.');
    }
  };

  const handleDownload = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setExporting(true);
    try {
      const snap = await getDoc(doc(db, 'users', user.uid));
      const data = {
        exportadoEm: new Date().toISOString(),
        conta: {
          uid: user.uid,
          email: user.email,
          criadaEm: user.metadata.creationTime,
        },
        perfil: snap.exists() ? snap.data() : null,
      };
      await Share.share({
        title: 'Meus dados - MerendaJá',
        message: JSON.stringify(data, null, 2),
      });
    } catch {
      Alert.alert('Erro', 'Não foi possível gerar seus dados. Tente novamente.');
    } finally {
      setExporting(false);
    }
  };

  const handleDeletePress = () => {
    Alert.alert(
      'Excluir conta',
      'Sua conta e seus dados serão apagados e essa ação não pode ser desfeita. Deseja continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Continuar', style: 'destructive', onPress: () => setModalMode('delete') },
      ]
    );
  };

  const handleModalSuccess = () => {
    const wasDelete = modalMode === 'delete';
    setModalMode(null);
    if (wasDelete) {
      Alert.alert('Conta excluída', 'Sua conta foi excluída com sucesso.');
      router.replace('/Acesso' as any);;
    } else {
      Alert.alert('Senha alterada', 'Sua senha foi atualizada com sucesso.');
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Segurança e Privacidade" />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.sectionTitle}>Segurança</Text>

        <SettingsAction
          testID="security-change-password"
          icon="key"
          title="Alterar senha"
          onPress={() => setModalMode('password')}
        />

        <Text style={styles.sectionTitle}>Privacidade</Text>

        <SettingsAction
          testID="privacy-download-data"
          icon="download"
          title="Baixar meus dados"
          loading={exporting}
          onPress={handleDownload}
        />

        <SettingsAction
          testID="privacy-delete-account"
          icon="trash"
          title="Excluir conta"
          danger
          onPress={handleDeletePress}
        />
      </ScrollView>

      {modalMode && (
        <PasswordModal
          mode={modalMode}
          onClose={() => setModalMode(null)}
          onSuccess={handleModalSuccess}
        />
      )}
    </SafeAreaView>
  );
}

/* ---------- Linhas da tela ---------- */

type ToggleProps = {
  testID: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function SettingsToggle({ testID, icon, title, description, value, onValueChange }: ToggleProps) {
  const { theme } = useAccessibility();
  const styles = createStyles(theme);

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.row}
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityLabel={title}
      accessibilityState={{ checked: value }}
    >
      <View style={styles.iconWrapper}>
        <Ionicons name={icon} size={22} color={theme.primary} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <Switch
        testID={testID}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: theme.divider, true: theme.primary }}
        thumbColor={theme.onPrimary}
        accessible={false}
      />
    </TouchableOpacity>
  );
}

type ActionProps = {
  testID: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
  danger?: boolean;
  loading?: boolean;
  large?: boolean;
};

function SettingsAction({ testID, icon, title, onPress, danger, loading, large }: ActionProps) {
  const { theme } = useAccessibility();
  const styles = createStyles(theme);

  return (
    <TouchableOpacity
      testID={testID}
      style={[styles.row, large && styles.rowLarge]}
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={[styles.iconWrapper, large && styles.iconWrapperLarge]}>
        <Ionicons
          name={icon}
          size={large ? 28 : 22}
          color={danger ? theme.error : theme.primary}
        />
      </View>
      <Text
        style={[
          styles.rowTitle,
          large && styles.rowTitleLarge,
          danger && { color: theme.error },
        ]}
      >
        {title}
      </Text>
      {loading ? (
        <ActivityIndicator style={{ marginLeft: 'auto' }} color={theme.primary} />
      ) : (
        <Ionicons
          name="chevron-forward"
          size={large ? 22 : 18}
          color={theme.textSecondary}
          style={{ marginLeft: 'auto' }}
        />
      )}
    </TouchableOpacity>
  );
}

/* ---------- Campo de senha com botão de mostrar/ocultar ---------- */

type PasswordFieldProps = {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
};

function PasswordField({ placeholder, value, onChangeText }: PasswordFieldProps) {
  const { theme, fs } = useAccessibility();
  const styles = createStyles(theme);
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.inputWrapper}>
      <TextInput
        style={[styles.input, { fontSize: fs(16) }]}
        placeholder={placeholder}
        placeholderTextColor={theme.placeholder}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        value={value}
        onChangeText={onChangeText}
      />
      <TouchableOpacity
        style={styles.eyeButton}
        onPress={() => setVisible((v) => !v)}
        accessibilityRole="button"
        accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Ionicons name={visible ? 'eye-off' : 'eye'} size={24} color={theme.textSecondary} />
      </TouchableOpacity>
    </View>
  );
}

/* ---------- Modal de senha (alterar senha e excluir conta) ---------- */

type ModalProps = {
  mode: 'password' | 'delete';
  onClose: () => void;
  onSuccess: () => void;
};

function PasswordModal({ mode, onClose, onSuccess }: ModalProps) {
  const { settings, theme } = useAccessibility();
  const styles = createStyles(theme);
  const isDelete = mode === 'delete';

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    const user = auth.currentUser;
    if (!user || !user.email) {
      setError('Você precisa estar logado.');
      return;
    }
    if (!current) {
      setError('Digite sua senha atual.');
      return;
    }
    if (!isDelete) {
      if (next.length < 6) {
        setError('A nova senha deve ter pelo menos 6 caracteres.');
        return;
      }
      if (next !== confirm) {
        setError('A confirmação não é igual à nova senha.');
        return;
      }
      if (next === current) {
        setError('A nova senha deve ser diferente da atual.');
        return;
      }
    }

    setLoading(true);
    setError('');
    try {
      // O Firebase exige autenticar de novo antes de operações sensíveis
      await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, current));

      if (isDelete) {
        await deleteDoc(doc(db, 'users', user.uid)); // primeiro os dados, enquanto ainda há login
        await deleteUser(user);
      } else {
        await updatePassword(user, next);
      }
      onSuccess();
    } catch (e) {
      setError(friendlyError(e));
      setLoading(false);
    }
  };

  return (
    <Modal
      visible
      transparent
      animationType={settings.reduceMotion ? 'none' : 'fade'}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.overlayContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{isDelete ? 'Excluir conta' : 'Alterar senha'}</Text>
            <Text style={styles.modalSubtitle}>
              {isDelete
                ? 'Digite sua senha para confirmar a exclusão definitiva da conta.'
                : 'Por segurança, confirme sua senha atual antes de definir a nova.'}
            </Text>

            <PasswordField placeholder="Senha atual" value={current} onChangeText={setCurrent} />

            {!isDelete && (
              <>
                <PasswordField placeholder="Nova senha" value={next} onChangeText={setNext} />
                <PasswordField
                  placeholder="Confirmar nova senha"
                  value={confirm}
                  onChangeText={setConfirm}
                />
              </>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={onClose}
                disabled={loading}
              >
                <Text style={styles.buttonSecondaryText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, isDelete ? styles.buttonDanger : styles.buttonPrimary]}
                onPress={submit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={theme.onPrimary} />
                ) : (
                  <Text style={styles.buttonText}>{isDelete ? 'Excluir' : 'Salvar'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.background, top: 50 },
  body: { padding: 22 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.textMuted,
    textTransform: 'uppercase',
    marginTop: 18,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: theme.borderWidth,
    borderColor: theme.border,
  },
  rowLarge: {
    minHeight: 76,
    padding: 20,
    borderRadius: 16,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.soft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconWrapperLarge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
  },
  rowText: { flex: 1, marginRight: 8 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: theme.text },
  rowTitleLarge: { fontSize: 18, fontWeight: '700' },
  rowDescription: { fontSize: 12, color: theme.textSecondary, marginTop: 2 },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: theme.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: theme.borderWidth,
    borderColor: theme.border,
  },
  modalTitle: { fontSize: 22, fontWeight: '700', color: theme.text, marginBottom: 8 },
  modalSubtitle: { fontSize: 15, color: theme.textSecondary, marginBottom: 20, lineHeight: 22 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.inputBorder,
    borderRadius: 12,
    backgroundColor: theme.card,
    minHeight: 56,
    marginBottom: 14,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.text,
  },
  eyeButton: {
    height: 56,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  error: { fontSize: 14, color: theme.error, marginBottom: 10 },
  modalButtons: { flexDirection: 'row', marginTop: 10 },
  button: {
    flex: 1,
    minHeight: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: { backgroundColor: theme.primary, marginLeft: 6 },
  buttonDanger: { backgroundColor: theme.error, marginLeft: 6 },
  buttonSecondary: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.inputBorder,
    marginRight: 6,
  },
  buttonText: { fontSize: 16, fontWeight: '700', color: theme.onPrimary },
  buttonSecondaryText: { fontSize: 16, fontWeight: '600', color: theme.text },
});