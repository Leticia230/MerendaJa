import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import { colors } from '../constants/theme';

export default function AccessibilityScreen() {
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [screenReaderHints, setScreenReaderHints] = useState(true);

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Acessibilidade" />
      <ScrollView contentContainerStyle={styles.body}>
        <AccessibilityOption
          testID="accessibility-high-contrast"
          icon="contrast"
          title="Alto contraste"
          description="Aumenta o contraste de cores para melhor visualização"
          value={highContrast}
          onValueChange={setHighContrast}
        />
        <AccessibilityOption
          testID="accessibility-large-text"
          icon="text"
          title="Texto grande"
          description="Aumenta o tamanho da fonte em todo o app"
          value={largeText}
          onValueChange={setLargeText}
        />
        <AccessibilityOption
          testID="accessibility-reduce-motion"
          icon="pulse"
          title="Reduzir movimento"
          description="Diminui animações e transições"
          value={reduceMotion}
          onValueChange={setReduceMotion}
        />
        <AccessibilityOption
          testID="accessibility-screen-reader"
          icon="volume-high"
          title="Dicas de leitor de tela"
          description="Ativa descrições faladas para elementos da tela"
          value={screenReaderHints}
          onValueChange={setScreenReaderHints}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

type OptionProps = {
  testID: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
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
  return (
    <View style={styles.option}>
      <View style={styles.iconWrapper}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.optionText}>
        <Text style={styles.optionTitle}>{title}</Text>
        <Text style={styles.optionDescription}>{description}</Text>
      </View>
      <Switch
        testID={testID}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#ccc', true: colors.primary }}
        thumbColor="#fff"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  body: { padding: 22 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
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
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionText: { flex: 1, marginRight: 8 },
  optionTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  optionDescription: { fontSize: 12, color: '#777', marginTop: 2 },
});