import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import ScreenHeader from '../components/ScreenHeader';
import {
  useAccessibility,
  AccessibilitySettings,
} from '../components/AccessibilityContext';
import ResponsiveContainer from '../components/ResponsiveContainer';
import { useResponsive } from '../hooks/useResponsive';

type OptionConfig = {
  setting: keyof AccessibilitySettings;
  testID: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
};

const OPTIONS: OptionConfig[] = [
  {
    setting: 'darkMode',
    testID: 'accessibility-dark-mode',
    icon: 'moon',
    title: 'Tema escuro',
    description: 'Usa cores escuras em todo o app',
  },
  {
    setting: 'largeText',
    testID: 'accessibility-large-text',
    icon: 'text',
    title: 'Texto grande',
    description: 'Aumenta o tamanho da fonte em todo o app',
  },
];

export default function AccessibilityScreen() {
  const { settings, setSetting, theme } = useAccessibility();

  const { isSmallScreen, fontScale } = useResponsive();
  const compacto = isSmallScreen || fontScale >= 1.2;

  const styles = useMemo(
    () => createStyles(compacto),
    [compacto]
  );

  return (
    <SafeAreaView
      style={[
        styles.safe,
        { backgroundColor: theme.background },
      ]}
    >
      <ScreenHeader title="Acessibilidade" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ResponsiveContainer style={styles.body}>
          {OPTIONS.map((opt) => (
            <AccessibilityOption
              key={opt.testID}
              testID={opt.testID}
              icon={opt.icon}
              title={opt.title}
              description={opt.description}
              value={settings[opt.setting]}
              onValueChange={(v) => setSetting(opt.setting, v)}
              compacto={compacto}
            />
          ))}
        </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

type OptionProps = Omit<OptionConfig, 'setting'> & {
  value: boolean;
  onValueChange: (value: boolean) => void;
  compacto: boolean;
};

function AccessibilityOption({
  testID,
  icon,
  title,
  description,
  value,
  onValueChange,
  compacto,
}: OptionProps) {
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

      <Switch
        testID={testID}
        value={value}
        onValueChange={onValueChange}
        trackColor={{
          false: '#999',
          true: theme.primary,
        }}
        thumbColor="#fff"
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
      shadowOffset: { width: 0, height: 2 },
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
      fontWeight: '600',
      flexShrink: 1,
    },

    optionDescription: {
      marginTop: 3,
      lineHeight: compacto ? 16 : 18,
      flexShrink: 1,
    },
  });
