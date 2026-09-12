import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../../constants/theme';

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

const MEALS = [
  { title: 'Café da manhã', desc: 'Pão de queijo\nLeite com achocolatado', icon: 'bread-slice', color: '#FFD79A' },
  { title: 'Almoço', desc: 'Arroz, Feijão, Frango grelhado\nSalada de alface e tomate', icon: 'food', color: '#FFB27A' },
  { title: 'Lanche da tarde', desc: 'Fruta da estação', icon: 'fruit-cherries', color: '#FFC845' },
];

export default function CardapioScreen() {
  const [day, setDay] = useState('Seg');
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerWrap}>
        <Text style={styles.headerTitle}>Cardápio</Text>
      </View>

      <View style={styles.daysWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysRow}>
          {DAYS.map(d => {
            const active = d === day;
            return (
              <Pressable
                key={d}
                testID={`day-chip-${d}`}
                onPress={() => setDay(d)}
                style={[styles.dayChip, active && styles.dayChipActive]}
              >
                <Text style={[styles.dayText, active && styles.dayTextActive]}>{d}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {MEALS.map((m, i) => (
          <View key={i} style={styles.mealCard} testID={`cardapio-meal-${i}`}>
            <View style={{ flex: 1 }}>
              <Text style={styles.mealTitle}>{m.title}</Text>
              <Text style={styles.mealDesc}>{m.desc}</Text>
            </View>
            <View style={[styles.mealIcon, { backgroundColor: m.color }]}>
              <MaterialCommunityIcons name={m.icon as any} size={26} color="#fff" />
            </View>
          </View>
        ))}

        <Pressable
          testID="add-refeicao"
          style={styles.addBtn}
          onPress={() => router.push('/AddRefeicao')}
        >
          <Text style={styles.addBtnText}>Adicionar refeição</Text>
        </Pressable>

        <Pressable
          testID="add-refeicao"
          style={styles.addBtn}
          onPress={() => router.push('/Erro')}
        >
          <Text style={styles.addBtnText}>Editar refeição</Text>
        </Pressable>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  headerWrap: {
    backgroundColor: colors.yellow,
    paddingTop: 20,
    paddingBottom: 18,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.textDark },
  daysWrap: { paddingVertical: 12 },
  daysRow: { paddingHorizontal: 16, gap: 8, height: 56, alignItems: 'center' },
  dayChip: {
    height: 36,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  dayChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayText: { color: colors.textDark, fontWeight: '700', fontSize: 13 },
  dayTextActive: { color: '#fff' },
  body: { padding: 16, paddingBottom: 30, gap: 12 },
  mealCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  mealTitle: { fontSize: 15, fontWeight: '700', color: colors.textDark, marginBottom: 4 },
  mealDesc: { fontSize: 12, color: colors.textMuted, lineHeight: 17 },
  mealIcon: {
    width: 54,
    height: 54,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    padding: 15,
    alignItems: 'center',
    marginTop: 6,
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
