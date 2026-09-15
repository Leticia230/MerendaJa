import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BarChart } from 'react-native-chart-kit';
import ScreenHeader from '../components/ScreenHeader';
import { colors } from '../constants/theme';

type Period = 'semana' | 'mes' | 'ano';

type TurmaData = {
  turma: string;
  semana: number;
  mes: number;
  ano: number;
};

// Substitua pelos dados reais vindos da sua API/store
const mockData: TurmaData[] = [
  { turma: '1º Ano A', semana: 82, mes: 78, ano: 75 },
  { turma: '1º Ano B', semana: 65, mes: 70, ano: 68 },
  { turma: '2º Ano A', semana: 91, mes: 88, ano: 85 },
  { turma: '2º Ano B', semana: 54, mes: 60, ano: 62 },
  { turma: '3º Ano A', semana: 73, mes: 75, ano: 77 },
];

const screenWidth = Dimensions.get('window').width;

export default function StatisticsScreen() {
  const [period, setPeriod] = useState<Period>('semana');

  const chartData = useMemo(() => {
    return {
      labels: mockData.map((item) => item.turma.replace('º Ano ', '° ')),
      datasets: [{ data: mockData.map((item) => item[period]) }],
    };
  }, [period]);

  const sorted = useMemo(
    () => [...mockData].sort((a, b) => b[period] - a[period]),
    [period]
  );

  const best = sorted[0];
  const worst = sorted[sorted.length - 1];

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Estatísticas" />
      <ScrollView contentContainerStyle={styles.body}>
        <Text style={styles.subtitle}>Consumo alimentar por turma</Text>

        <View style={styles.periodSelector}>
          <PeriodButton
            testID="stats-period-semana"
            label="Semana"
            active={period === 'semana'}
            onPress={() => setPeriod('semana')}
          />
          <PeriodButton
            testID="stats-period-mes"
            label="Mês"
            active={period === 'mes'}
            onPress={() => setPeriod('mes')}
          />
          <PeriodButton
            testID="stats-period-ano"
            label="Ano"
            active={period === 'ano'}
            onPress={() => setPeriod('ano')}
          />
        </View>

        <View style={styles.chartCard}>
          <BarChart
            data={chartData}
            width={screenWidth - 44}
            height={240}
            fromZero
            yAxisLabel=""
            yAxisSuffix="%"
            showValuesOnTopOfBars
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(90, 150, 90, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(60, 60, 60, ${opacity})`,
              barPercentage: 0.6,
              propsForLabels: { fontSize: 11 },
            }}
            style={styles.chart}
          />
        </View>

        <View style={styles.highlightsRow}>
          <View style={[styles.highlightCard, styles.highlightGood]}>
            <Ionicons name="trending-up" size={20} color="#2e7d32" />
            <Text style={styles.highlightLabel}>Melhor consumo</Text>
            <Text style={styles.highlightTurma}>{best.turma}</Text>
            <Text style={styles.highlightValue}>{best[period]}%</Text>
          </View>
          <View style={[styles.highlightCard, styles.highlightBad]}>
            <Ionicons name="trending-down" size={20} color="#c62828" />
            <Text style={styles.highlightLabel}>Menor consumo</Text>
            <Text style={styles.highlightTurma}>{worst.turma}</Text>
            <Text style={styles.highlightValue}>{worst[period]}%</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Ranking das turmas</Text>
        {sorted.map((item, index) => (
          <View key={item.turma} style={styles.rankRow}>
            <Text style={styles.rankPosition}>{index + 1}º</Text>
            <Text style={styles.rankTurma}>{item.turma}</Text>
            <View style={styles.rankBarBackground}>
              <View
                style={[
                  styles.rankBarFill,
                  { width: `${item[period]}%`, backgroundColor: barColor(item[period]) },
                ]}
              />
            </View>
            <Text style={styles.rankValue}>{item[period]}%</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function barColor(value: number) {
  if (value >= 80) return '#2e7d32';
  if (value >= 60) return '#f9a825';
  return '#c62828';
}

type PeriodButtonProps = {
  testID: string;
  label: string;
  active: boolean;
  onPress: () => void;
};

function PeriodButton({ testID, label, active, onPress }: PeriodButtonProps) {
  return (
    <TouchableOpacity
      testID={testID}
      style={[styles.periodButton, active && styles.periodButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.periodButtonText, active && styles.periodButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  body: { padding: 22, paddingBottom: 40 },
  subtitle: { fontSize: 14, color: '#777', marginBottom: 16 },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 18,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#777',
  },
  periodButtonTextActive: {
    color: '#fff',
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  chart: { borderRadius: 16 },
  highlightsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 22,
  },
  highlightCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#fff',
  },
  highlightGood: { borderLeftWidth: 4, borderLeftColor: '#2e7d32' },
  highlightBad: { borderLeftWidth: 4, borderLeftColor: '#c62828' },
  highlightLabel: { fontSize: 11, color: '#999', marginTop: 6 },
  highlightTurma: { fontSize: 14, fontWeight: '700', color: '#333', marginTop: 2 },
  highlightValue: { fontSize: 18, fontWeight: '700', color: '#333', marginTop: 4 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  rankPosition: { width: 28, fontSize: 13, fontWeight: '700', color: '#555' },
  rankTurma: { width: 90, fontSize: 12, color: '#333' },
  rankBarBackground: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#eee',
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  rankBarFill: { height: '100%', borderRadius: 4 },
  rankValue: { width: 40, fontSize: 12, fontWeight: '600', color: '#333', textAlign: 'right' },
});