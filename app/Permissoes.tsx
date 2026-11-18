
import React, { useEffect, useMemo, useState } from 'react';

import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import ScreenHeader from '../components/ScreenHeader';
import ResponsiveContainer from '../components/ResponsiveContainer';
import { useResponsive } from '../hooks/useResponsive';
import { useAccessibility } from '../components/AccessibilityContext';

import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';

import Text from '../components/AppText';

type PermissionOptionProps = {
  testID: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  compacto: boolean;
};

export default function PermissoesScreen() {
  const { theme } = useAccessibility();

  const {
    isSmallScreen,
    fontScale,
  } = useResponsive();

  const compacto = isSmallScreen || fontScale >= 1.2;

  const styles = useMemo(
    () => createStyles(compacto),
    [compacto]
  );

  const [notif, setNotif] = useState(false);
  const [loc, setLoc] = useState(false);

  // Verifica a permissão de notificações
  useEffect(() => {
    let ativo = true;

    async function verificarPermissao() {
      try {
        const { status } =
          await Notifications.getPermissionsAsync();

        if (ativo) {
          setNotif(status === 'granted');
        }
      } catch (error) {
        console.warn(
          'Não foi possível verificar a permissão de notificações:',
          error
        );
      }
    }

    verificarPermissao();

    return () => {
      ativo = false;
    };
  }, []);

  // Verifica a permissão de localização
  useEffect(() => {
    let ativo = true;

    async function verificarLocalizacao() {
      try {
        const { status } =
          await Location.getForegroundPermissionsAsync();

        if (ativo) {
          setLoc(status === 'granted');
        }
      } catch (error) {
        console.warn(
          'Não foi possível verificar a permissão de localização:',
          error
        );
      }
    }

    verificarLocalizacao();

    return () => {
      ativo = false;
    };
  }, []);

  // Solicita ou verifica a permissão de notificações
  async function alterarNotificacoes(value: boolean) {
    if (value) {
      try {
        const { status } =
          await Notifications.requestPermissionsAsync();

        setNotif(status === 'granted');
      } catch (error) {
        console.warn(
          'Não foi possível solicitar notificações:',
          error
        );

        setNotif(false);
      }
    } else {
      setNotif(false);
    }
  }

  // Solicita ou verifica a permissão de localização
  async function alterarLocalizacao(value: boolean) {
    if (value) {
      try {
        const { status } =
          await Location.requestForegroundPermissionsAsync();

        setLoc(status === 'granted');
      } catch (error) {
        console.warn(
          'Não foi possível solicitar localização:',
          error
        );

        setLoc(false);
      }
    } else {
      setLoc(false);
    }
  }

  return (
    <SafeAreaView
      style={[
        styles.safe,
        { backgroundColor: theme.background },
      ]}
    >
      <ScreenHeader title="Permissões" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ResponsiveContainer style={styles.body}>

          {/* Notificações */}
          <PermissionOption
            testID="toggle-notifications"
            icon="notifications-outline"
            title="Notificações"
            description="Permite receber avisos e atualizações do aplicativo"
            value={notif}
            onValueChange={alterarNotificacoes}
            compacto={compacto}
          />

          {/* Localização */}
          <PermissionOption
            testID="toggle-location"
            icon="location-outline"
            title="Localização"
            description="Permite que o aplicativo acesse sua localização"
            value={loc}
            onValueChange={alterarLocalizacao}
            compacto={compacto}
          />

        </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

// Componente individual de permissão
function PermissionOption({
  testID,
  icon,
  title,
  description,
  value,
  onValueChange,
  compacto,
}: PermissionOptionProps) {
  const { theme, fs, hint } = useAccessibility();

  const styles = useMemo(
    () => createStyles(compacto),
    [compacto]
  );

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityLabel={title}
      accessibilityState={{ checked: value }}
      accessibilityHint={hint(description)}
      style={[
        styles.option,
        {
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderWidth: theme.borderWidth,
        },
      ]}
    >
      {/* Ícone */}
      <View
        style={[
          styles.iconWrapper,
          { backgroundColor: theme.background },
        ]}
      >
        <Ionicons
          name={icon}
          size={fs(compacto ? 20 : 22)}
          color={theme.primary}
        />
      </View>

      {/* Textos */}
      <View style={styles.optionText}>
        <Text
          style={[
            styles.optionTitle,
            {
              color: theme.text,
              fontSize: fs(compacto ? 14 : 15),
            },
          ]}
        >
          {title}
        </Text>

        <Text
          style={[
            styles.optionDescription,
            {
              color: theme.textSecondary,
              fontSize: fs(compacto ? 11 : 12),
            },
          ]}
        >
          {description}
        </Text>
      </View>

      {/* Interruptor */}
      <Switch
        testID={testID}
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: '#999999',
          true: theme.primary,
        }}
        thumbColor="#FFFFFF"
        accessible={false}
      />
    </Pressable>
  );
}

const createStyles = (compacto: boolean) =>
  StyleSheet.create({
    safe: {
      flex: 1,
    },

    scrollContent: {
      flexGrow: 1,
      paddingBottom: compacto ? 20 : 32,
    },

    body: {
      flex: 0,
      paddingTop: compacto ? 14 : 18,
    },

    option: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 14,
      padding: compacto ? 12 : 16,
      marginBottom: compacto ? 12 : 14,
      minHeight: compacto ? 68 : 76,

      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 6,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      elevation: 2,
    },

    iconWrapper: {
      width: compacto ? 36 : 40,
      height: compacto ? 36 : 40,
      borderRadius: compacto ? 18 : 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: compacto ? 9 : 12,
      flexShrink: 0,
    },

    optionText: {
      flex: 1,
      flexShrink: 1,
      marginRight: compacto ? 4 : 8,
    },

    optionTitle: {
      fontWeight: '700',
      flexShrink: 1,
    },

    optionDescription: {
      marginTop: 3,
      lineHeight: compacto ? 16 : 18,
      flexShrink: 1,
    },
  });
