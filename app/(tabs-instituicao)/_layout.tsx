import React, { useMemo } from 'react';
import { Tabs } from 'expo-router';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from '@expo/vector-icons';
import Text from '../../components/AppText';
import { useAccessibility, AccessibilityTheme } from '../../components/AccessibilityContext';

const LABELS: Record<string, string> = {
  Home: 'Início',
  Cardapio: 'Cardápio',
  Turmas: 'Turmas',
  Configuracoes: 'Config.',
};

export default function TabsLayout() {
  const { theme } = useAccessibility();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Ícones ficam dentro do componente para acessar o theme.
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
    Turmas: (f) => (
      <FontAwesome5
        name="university"
        size={20}
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
      screenOptions={{ headerShown: false }}
      tabBar={({ state, navigation }) => (
        <View style={styles.bar} testID="bottom-tab-bar">
          {state.routes
            .filter((route) =>
              ['Home', 'Cardapio', 'Turmas', 'Configuracoes'].includes(route.name)
            )
            .map((route) => {
              const focused = state.routes[state.index]?.key === route.key;
              const label = LABELS[route.name] ?? route.name;

              return (
                <Pressable
                  key={route.key}
                  testID={`tab-${route.name}`}
                  style={styles.tabItem}
                  onPress={() => navigation.navigate(route.name)}
                >
                  <View style={[styles.iconWrap, focused && styles.iconWrapActive]}>
                    {TAB_ICONS[route.name]?.(focused)}
                  </View>
                  <Text style={[styles.label, focused && styles.labelActive]}>
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
      <Tabs.Screen name="Turmas" />
      <Tabs.Screen name="Configuracoes" />
    </Tabs>
  );
}

const createStyles = (theme: AccessibilityTheme) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      backgroundColor: theme.card,
      paddingTop: 10,
      paddingBottom: Platform.OS === 'ios' ? 24 : 12,
      paddingHorizontal: 8,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      gap: 2,
    },
    iconWrap: {
      width: 40,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 12,
    },
    iconWrapActive: {
      backgroundColor: theme.soft,
    },
    label: {
      fontSize: 11,
      color: theme.textMuted,
      fontWeight: '600',
    },
    labelActive: {
      color: theme.primary,
      fontWeight: '700',
    },
  });