import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ScreenHeader from '../components/ScreenHeader';
import { colors } from '../constants/theme';

export default function SecurityPrivacyScreen() {
  const [twoFactor, setTwoFactor] = useState(false);
  const [shareUsageData, setShareUsageData] = useState(true);
  const [showActivity, setShowActivity] = useState(true);

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Segurança e Privacidade" />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.sectionTitle}>Segurança</Text>

        <SettingsToggle
          testID="security-two-factor"
          icon="shield-checkmark"
          title="Verificação em duas etapas"
          description="Exige um código extra ao entrar na conta"
          value={twoFactor}
          onValueChange={setTwoFactor}
        />

        <SettingsAction
          testID="security-change-password"
          icon="key"
          title="Alterar senha"
          onPress={() => {}}
        />

        <SettingsAction
          testID="security-active-sessions"
          icon="phone-portrait"
          title="Dispositivos conectados"
          onPress={() => {}}
        />

        <Text style={styles.sectionTitle}>Privacidade</Text>

        <SettingsToggle
          testID="privacy-usage-data"
          icon="analytics"
          title="Compartilhar dados de uso"
          description="Ajuda a melhorar o app com dados anônimos"
          value={shareUsageData}
          onValueChange={setShareUsageData}
        />

        <SettingsToggle
          testID="privacy-show-activity"
          icon="eye"
          title="Mostrar minha atividade"
          description="Outros usuários podem ver quando você está ativo"
          value={showActivity}
          onValueChange={setShowActivity}
        />

        <SettingsAction
          testID="privacy-download-data"
          icon="download"
          title="Baixar meus dados"
          onPress={() => {}}
        />

        <SettingsAction
          testID="privacy-delete-account"
          icon="trash"
          title="Excluir conta"
          danger
          onPress={() => {}}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

type ToggleProps = {
  testID: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
};

function SettingsToggle({ testID, icon, title, description, value, onValueChange }: ToggleProps) {
  const { Switch } = require('react-native');
  return (
    <View style={styles.row}>
      <View style={styles.iconWrapper}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
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

type ActionProps = {
  testID: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  onPress: () => void;
  danger?: boolean;
};

function SettingsAction({ testID, icon, title, onPress, danger }: ActionProps) {
  return (
    <TouchableOpacity testID={testID} style={styles.row} onPress={onPress}>
      <View style={styles.iconWrapper}>
        <Ionicons name={icon} size={22} color={danger ? '#d64545' : colors.primary} />
      </View>
      <Text style={[styles.rowTitle, danger && { color: '#d64545' }]}>{title}</Text>
      <Ionicons name="chevron-forward" size={18} color="#999" style={{ marginLeft: 'auto' }} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  body: { padding: 22 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    marginTop: 18,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
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
  rowText: { flex: 1, marginRight: 8 },
  rowTitle: { fontSize: 15, fontWeight: '600', color: '#333' },
  rowDescription: { fontSize: 12, color: '#777', marginTop: 2 },
});