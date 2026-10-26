import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import { useAccessibility, AccessibilitySettings } from './AccessibilityContext';

type OptionConfig = {
  setting: keyof AccessibilitySettings;
  testID: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
};

const OPTIONS: OptionConfig[] = [
  {
    setting: 'highContrast',
    testID: 'accessibility-high-contrast',
    icon: 'contrast',
    title: 'Alto contraste',
    description: 'Aumenta o contraste de cores para melhor visualização',
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
  const { settings, setSetting, theme, fs } = useAccessibility();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScreenHeader title="Acessibilidade" />
      <ScrollView contentContainerStyle={styles.body}>

        {OPTIONS.map((opt) => (
          <AccessibilityOption
            key={opt.testID}
            testID={opt.testID}
            icon={opt.icon}
            title={opt.title}
            description={opt.description}
            value={settings[opt.setting]}
            onValueChange={(v) => setSetting(opt.setting, v)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

type OptionProps = Omit<OptionConfig, 'setting'> & {
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function AccessibilityOption({
  testID,
  icon,
  title,
  description,
  value,
  onValueChange,
}: OptionProps) {
  const { theme, fs, hint } = useAccessibility();

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      accessibilityRole="switch"
      accessibilityLabel={title}
      accessibilityState={{ checked: value }}
      accessibilityHint={hint(description)}
      style={[
        styles.option,
        { backgroundColor: theme.card, borderColor: theme.border, borderWidth: theme.borderWidth },
      ]}
    >
      <View style={[styles.iconWrapper, { backgroundColor: theme.background }]}>
        <Ionicons name={icon} size={fs(22)} color={theme.primary} />
      </View>
      <View style={styles.optionText}>
        <Text style={[styles.optionTitle, { color: theme.text, fontSize: fs(15) }]}>{title}</Text>
        <Text style={[styles.optionDescription, { color: theme.textSecondary, fontSize: fs(12) }]}>
          {description}
        </Text>
      </View>
      <Switch
        testID={testID}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#999', true: theme.primary }}
        thumbColor="#fff"
        accessible={false}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  body: { padding: 22 },
  preview: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  previewLabel: { fontWeight: '700', letterSpacing: 0.5, marginBottom: 6 },
  previewTitle: { fontWeight: '700', marginBottom: 4 },
  previewText: { lineHeight: 20 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionText: { flex: 1, marginRight: 8 },
  optionTitle: { fontWeight: '600' },
  optionDescription: { marginTop: 2 },
});