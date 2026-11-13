import React, { useEffect, useMemo, useState } from 'react';

import {
  View,
  StyleSheet,
  Pressable,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenHeader from '../components/ScreenHeader';
import ResponsiveContainer from '../components/ResponsiveContainer';
import { useResponsive } from '../hooks/useResponsive';
import { useAccessibility } from '../components/AccessibilityContext';

import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';

import Text from '../components/AppText';

function Toggle({
  value,
  onChange,
  testID,
  theme,
  compacto,
}: any) {
  const styles = createStyles(theme, compacto);

  return (
    <Pressable
      testID={testID}
      onPress={() => onChange(!value)}
      style={[
        styles.toggle,
        value ? styles.toggleOn : styles.toggleOff,
      ]}
      accessibilityRole="switch"
      accessibilityLabel={
        testID === 'toggle-notifications'
          ? 'Acesso a notificações'
          : 'Acesso à localização'
      }
      accessibilityState={{ checked: value }}
    >
      <View
        style={[
          styles.thumb,
          value ? styles.thumbOn : styles.thumbOff,
        ]}
      />
    </Pressable>
  );
}

export default function PermissoesScreen() {
  const { theme } = useAccessibility();

  const {
    isSmallScreen,
    fontScale,
    horizontalPadding,
  } = useResponsive();

  const compacto = isSmallScreen || fontScale >= 1.2;

  const styles = useMemo(
    () => createStyles(theme, compacto),
    [theme, compacto]
  );

  const [notif, setNotif] = useState(true);
  const [loc, setLoc] = useState(false);

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

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Permissões" />

      <ResponsiveContainer
        style={[
          styles.body,
          { paddingHorizontal: horizontalPadding },
        ]}
      >
        <View style={styles.card}>
          <Text style={styles.label}>
            Acesso a notificações
          </Text>

          <Toggle
            testID="toggle-notifications"
            value={notif}
            theme={theme}
            compacto={compacto}
            onChange={async (value: boolean) => {
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
            }}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>
            Acesso à localização
          </Text>

          <Toggle
            testID="toggle-location"
            value={loc}
            theme={theme}
            compacto={compacto}
            onChange={async (value: boolean) => {
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
            }}
          />
        </View>
      </ResponsiveContainer>
    </SafeAreaView>
  );
}

const createStyles = (theme: any, compacto: boolean) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.background,
    },

    body: {
      flex: 1,
      paddingTop: compacto ? 12 : 18,
      paddingBottom: 24,
      gap: compacto ? 10 : 12,
    },

    card: {
      width: '100%',
      minHeight: compacto ? 58 : 64,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 14,
      padding: compacto ? 12 : 14,
      borderWidth: theme.borderWidth,
      borderColor: theme.border,
      gap: 10,
    },

    label: {
      flex: 1,
      flexShrink: 1,
      fontSize: compacto ? 13 : 14,
      fontWeight: '600',
      color: theme.text,
    },

    toggle: {
      width: 44,
      height: 26,
      borderRadius: 13,
      padding: 3,
      justifyContent: 'center',
      flexShrink: 0,
    },

    toggleOn: {
      backgroundColor: theme.primary,
    },

    toggleOff: {
      backgroundColor: theme.divider,
    },

    thumb: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#fff',
    },

    thumbOn: {
      alignSelf: 'flex-end',
    },

    thumbOff: {
      alignSelf: 'flex-start',
    },
  });
