
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import ChefLogo from '../components/ChefLogo';
import { useAccessibility } from '../components/AccessibilityContext';

export default function AccessScreen() {
  const router = useRouter();
  const { theme } = useAccessibility();
  const styles = createStyles(theme);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.hero}>
        <ChefLogo size={400} />
        <Text style={styles.title}>Merenda Já</Text>
        <Text style={styles.desc}>Como você deseja acessar?</Text>
      </View>

      <View style={styles.body}>
        <Pressable
          testID="access-student-card"
          style={styles.card}
          onPress={() => router.push('/Login')}
        >
          <View style={styles.iconWrap}>
            <FontAwesome5 name="user-graduate" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Sou Estudante</Text>
            <Text style={styles.cardDesc}>Acesse seu cardápio e informações</Text>
          </View>
        </Pressable>

        <Pressable
          testID="access-institution-card"
          style={styles.card}
          onPress={() => router.push('/LoginInstituicao')}
        >
          <View style={styles.iconWrap}>
            <Ionicons name="business" size={24} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>Sou Instituição</Text>
            <Text style={styles.cardDesc}>Gerencie cardápios, alunos e refeições</Text>
          </View>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.background,
  },

  hero: {
    backgroundColor: theme.header,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 40,
    gap: 8,
  },

  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.primaryDark,
    marginTop: 6,
  },

  desc: {
    fontSize: 14,
    color: theme.text,
    fontWeight: '600',
  },

  body: {
    padding: 20,
    gap: 16,
    marginTop: 12,
  },

  card: {
    backgroundColor: theme.card,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    borderWidth: theme.borderWidth,
    borderColor: theme.border,
  },

  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.text,
    marginBottom: 2,
  },

  cardDesc: {
    fontSize: 12,
    color: theme.textMuted,
  },
});
