import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../../constants/theme';
import { listarAlunos } from '../services/alunos';
import { listarTurmas } from '../services/turmas';
import { assinarCardapioDia, Refeicao } from '../services/cardapio';
import { diaAbreviadoDeHoje, nomeDiaSemanaPtBR, dataPorExtensoPtBR } from '../services/data';

function MealRow({ titulo, horario, color, icon }: Refeicao) {
  return (
    <View style={styles.mealRow} testID={`meal-${titulo}`}>
      <View style={{ flex: 1 }}>
        <Text style={styles.mealTitle}>{titulo}</Text>
        <Text style={styles.mealTime}>{horario}</Text>
      </View>
      <View style={[styles.mealIcon, { backgroundColor: color }]}>
        <MaterialCommunityIcons name={icon as any} size={24} color="#fff" />
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();

  const [totalAlunos, setTotalAlunos] = useState<number | null>(null);
  const [totalTurmas, setTotalTurmas] = useState<number | null>(null);
  const [refeicoesHoje, setRefeicoesHoje] = useState<Refeicao[]>([]);
  const [carregandoRefeicoes, setCarregandoRefeicoes] = useState(true);

  const diaHoje = diaAbreviadoDeHoje(); // null se for fim de semana

  useEffect(() => {
    listarAlunos()
      .then((alunos) => setTotalAlunos(alunos.length))
      .catch((e) => {
        console.error('Erro ao carregar total de alunos:', e);
        setTotalAlunos(0);
      });

    listarTurmas()
      .then((turmas) => setTotalTurmas(turmas.length))
      .catch((e) => {
        console.error('Erro ao carregar total de turmas:', e);
        setTotalTurmas(0);
      });
  }, []);

  useEffect(() => {
    if (!diaHoje) {
      // Fim de semana — não há cardápio cadastrado pra hoje.
      setCarregandoRefeicoes(false);
      return;
    }

    const unsubscribe = assinarCardapioDia(
      diaHoje,
      (refeicoes) => {
        setRefeicoesHoje(refeicoes);
        setCarregandoRefeicoes(false);
      },
      () => setCarregandoRefeicoes(false)
    );

    return unsubscribe;
  }, [diaHoje]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.hello}>Olá, Admin!</Text>
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
            <Text style={styles.dayTitle}>{nomeDiaSemanaPtBR()}</Text>
            <Text style={styles.dayDate}>{dataPorExtensoPtBR()}</Text>
          </View>
          <MaterialCommunityIcons name="food-apple" size={44} color="#fff" />
        </Pressable>

        <Text style={styles.section}>Ações rápidas</Text>
        <Pressable
          testID="cadastrar-aluno-button"
          style={styles.quickAction}
          onPress={() => router.push('/CadastroAluno')}
        >
          <View style={styles.quickActionIcon}>
            <Ionicons name="person-add" size={22} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.quickActionTitle}>Cadastrar aluno</Text>
            <Text style={styles.quickActionSubtitle}>
              Adicione um novo aluno à instituição
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
        </Pressable>

        <Text style={styles.section}>Resumo do dia</Text>
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            {totalAlunos === null ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.summaryValue}>{totalAlunos}</Text>
            )}
            <Text style={styles.summaryLabel}>Alunos</Text>
          </View>
          <View style={styles.summaryCard}>
            {carregandoRefeicoes ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.summaryValue}>{refeicoesHoje.length}</Text>
            )}
            <Text style={styles.summaryLabel}>Refeições</Text>
          </View>
          <View style={styles.summaryCard}>
            {totalTurmas === null ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Text style={styles.summaryValue}>{totalTurmas}</Text>
            )}
            <Text style={styles.summaryLabel}>Turmas</Text>
          </View>
        </View>

        <Text style={styles.section}>Próximas refeições</Text>
        <View style={styles.mealsCard}>
          {carregandoRefeicoes ? (
            <ActivityIndicator color={colors.primary} style={{ padding: 20 }} />
          ) : !diaHoje ? (
            <Text style={styles.emptyText}>
              Hoje é fim de semana — sem cardápio cadastrado.
            </Text>
          ) : refeicoesHoje.length === 0 ? (
            <Text style={styles.emptyText}>
              Nenhuma refeição cadastrada para hoje ainda.
            </Text>
          ) : (
            refeicoesHoje.map((refeicao, i) => (
              <React.Fragment key={i}>
                <MealRow {...refeicao} />
                {i < refeicoesHoje.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))
          )}
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
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionTitle: { fontSize: 14, fontWeight: '700', color: colors.textDark },
  quickActionSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 74,
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
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    fontSize: 13,
    padding: 20,
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