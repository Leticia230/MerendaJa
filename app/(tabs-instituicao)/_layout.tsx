import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from '@expo/vector-icons';
import { colors } from '../../constants/theme';

const TAB_ICONS: Record<string, (focused: boolean) => React.ReactNode> = {
  Home: (f) => (
    <Ionicons
      name={f ? 'home' : 'home-outline'}
      size={22}
      color={f ? colors.primary : colors.textMuted}
    />
  ),

  Cardapio: (f) => (
    <MaterialCommunityIcons
      name="silverware-fork-knife"
      size={22}
      color={f ? colors.primary : colors.textMuted}
    />
  ),

  Turmas: (f) => (
    <FontAwesome5
      name="university"
      size={20}
      color={f ? colors.primary : colors.textMuted}
    />
  ),

  Configuracoes: (f) => (
    <Ionicons
      name={f ? 'settings' : 'settings-outline'}
      size={22}
      color={f ? colors.primary : colors.textMuted}
    />
  ),
};

const LABELS: Record<string, string> = {
  Home: 'Início',
  Cardapio: 'Cardápio',
  Turmas: 'Turmas',
  Configuracoes: 'Config.',
};

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={({ state, navigation }) => (
        <View style={styles.bar} testID="bottom-tab-bar">
          {state.routes
            .filter((route) =>
              ['Home', 'Cardapio', 'Turmas', 'Configuracoes'].includes(
                route.name
              )
            )
            .map((route) => {
              const focused =
                state.routes[state.index]?.key === route.key;

              const label = LABELS[route.name] ?? route.name;

              return (
                <Pressable
                  key={route.key}
                  testID={`tab-${route.name}`}
                  style={styles.tabItem}
                  onPress={() => navigation.navigate(route.name)}
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
      <Tabs.Screen name="Turmas" />
      <Tabs.Screen name="Configuracoes" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
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
    backgroundColor: '#FFE8DA',
  },
  label: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  labelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});