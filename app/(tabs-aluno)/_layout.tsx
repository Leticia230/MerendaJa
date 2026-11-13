import React, { useMemo } from 'react';
import { Tabs } from 'expo-router';
import {
  View,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Text from '../../components/AppText';
import {
  useAccessibility,
  AccessibilityTheme,
} from '../../components/AccessibilityContext';
import { useResponsive } from '../../hooks/useResponsive';

const LABELS: Record<string, string> = {
  Home: 'Início',
  Cardapio: 'Cardápio',
  Configuracoes: 'Config.',
};

const VISIBLE_TABS = ['Home', 'Cardapio', 'Configuracoes'];

export default function TabsAlunoLayout() {
  const { theme } = useAccessibility();
  const { isSmallScreen, fontScale } = useResponsive();
  const insets = useSafeAreaInsets();

  const compacto = isSmallScreen || fontScale >= 1.2;

  const styles = useMemo(
    () => createStyles(theme, compacto),
    [theme, compacto]
  );

  const TAB_ICONS: Record<string, (focused: boolean) => React.ReactNode> = {
    Home: (f) => (
      <Ionicons
        name={f ? 'home' : 'home-outline'}
        size={22}
        color={f ? theme.primary : theme.textMuted}
      />
    ),

    Cardapio: (f) => (
      <MaterialCommunityIcons
        name="silverware-fork-knife"
        size={22}
        color={f ? theme.primary : theme.textMuted}
      />
    ),

    Configuracoes: (f) => (
      <Ionicons
        name={f ? 'settings' : 'settings-outline'}
        size={22}
        color={f ? theme.primary : theme.textMuted}
      />
    ),
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={({ state, navigation }) => (
        <View
          style={[
            styles.bar,
            {
              paddingBottom: Math.max(insets.bottom, 12) + 8,
            },
          ]}
          testID="bottom-tab-bar"
        >
          {state.routes
            .filter((route) => VISIBLE_TABS.includes(route.name))
            .map((route) => {
              const focused = state.routes[state.index]?.key === route.key;
              const label = LABELS[route.name] ?? route.name;

              return (
                <Pressable
                  key={route.key}
                  testID={`tab-${route.name}`}
                  style={styles.tabItem}
                  onPress={() => navigation.navigate(route.name)}
                  accessibilityRole="tab"
                  accessibilityLabel={label}
                  accessibilityState={{ selected: focused }}
                >
                  <View
                    style={[
                      styles.iconWrap,
                      focused && styles.iconWrapActive,
                    ]}
                  >
                    {TAB_ICONS[route.name]?.(focused)}
                  </View>

                  <Text
                    style={[
                      styles.label,
                      focused && styles.labelActive,
                    ]}
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
        </View>
      )}
    >
      <Tabs.Screen name="Home" />
      <Tabs.Screen name="Cardapio" />
      <Tabs.Screen name="Configuracoes" />
    </Tabs>
  );
}

const createStyles = (
  theme: AccessibilityTheme,
  compacto = false
) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      paddingTop: compacto ? 6 : 10,
      paddingHorizontal: compacto ? 4 : 8,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
    },

    tabItem: {
      flex: 1,
      minWidth: 0,
      alignItems: 'center',
      justifyContent: 'center',
      gap: compacto ? 1 : 2,
      paddingVertical: 2,
    },

    iconWrap: {
      width: compacto ? 36 : 40,
      height: compacto ? 30 : 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
    },

    iconWrapActive: {
      backgroundColor: theme.soft,
    },

    label: {
      fontSize: compacto ? 10 : 11,
      color: theme.textMuted,
      fontWeight: '600',
      textAlign: 'center',
      flexShrink: 1,
    },

    labelActive: {
      color: theme.primary,
      fontWeight: '700',
    },
  });
