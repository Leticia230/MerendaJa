import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../../constants/theme';

const MEAL_COLORS: Record<string, string> = {
  breakfast: '#FFD79A',
  lunch: '#FFB27A',
  snack: '#FFC845',
};

function MealRow({ title, time, color, icon }: any) {
  return (
    <View style={styles.mealRow} testID={`meal-${title}`}>
      <View style={{ flex: 1 }}>
        <Text style={styles.mealTitle}>{title}</Text>
        <Text style={styles.mealTime}>{time}</Text>
      </View>
      <View style={[styles.mealIcon, { backgroundColor: color }]}>
        <MaterialCommunityIcons name={icon} size={24} color="#fff" />
      </View>
    </View>
  );
}

export default function HomeAlunoScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Olá, Aluno!</Text>
          <Text style={styles.brand}>Merenda Já</Text>
        </View>
        <Pressable testID="notifications-button" style={styles.bell}>
          <Ionicons name="notifications-outline" size={22} color={colors.textDark} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Pressable
          testID="day-banner"
          style={styles.dayBanner}
          onPress={() => router.push('/RefeicoesDia')}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.dayTitle}>Segunda-feira</Text>
            <Text style={styles.dayDate}>20 de Maio de 2024</Text>
          </View>
          <MaterialCommunityIcons name="food-apple" size={44} color="#fff" />
        </Pressable>

        <Text style={styles.section}>Próximas refeições</Text>
        <View style={styles.mealsCard}>
          <MealRow title="Café da manhã" time="07:30 - 08:30" color={MEAL_COLORS.breakfast} icon="bread-slice" />
          <View style={styles.divider} />
          <MealRow title="Almoço" time="11:30 - 12:30" color={MEAL_COLORS.lunch} icon="food" />
          <View style={styles.divider} />
          <MealRow title="Lanche da tarde" time="15:30 - 16:00" color={MEAL_COLORS.snack} icon="fruit-cherries" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: colors.yellow,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  hello: { fontSize: 13, color: colors.textDark, fontWeight: '600' },
  brand: { fontSize: 20, fontWeight: '800', color: colors.primaryDark },
  bell: {
    marginLeft: 'auto',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { padding: 18, paddingBottom: 40 },
  dayBanner: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  dayDate: { color: '#FFE0CE', fontSize: 12, marginTop: 4 },
  section: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
    marginTop: 18,
    marginBottom: 10,
  },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  summaryValue: { fontSize: 22, fontWeight: '800', color: colors.primary },
  summaryLabel: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  mealsCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 8,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  mealTitle: { fontSize: 15, fontWeight: '700', color: colors.textDark },
  mealTime: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  mealIcon: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: { height: 1, backgroundColor: colors.divider, marginHorizontal: 12 },
});
