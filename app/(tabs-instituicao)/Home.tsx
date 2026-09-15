import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../../constants/theme';
import { listarAlunos } from '../services/alunos';
import { listarTurmas } from '../services/turmas';
import { assinarCardapioDia, Refeicao } from '../services/cardapio';
import { assinarContagemConfirmacoes, ContagemRefeicao } from '../services/confirmacoes';
import { diaAbreviadoDeHoje, nomeDiaSemanaPtBR, dataPorExtensoPtBR, NOME_COMPLETO_DIA } from '../services/data';

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

function MealRow({ refeicao, contagem }: { refeicao: Refeicao; contagem: ContagemRefeicao }) {
  return (
    <View style={styles.mealRow} testID={`meal-${refeicao.titulo}`}>
      <View style={[styles.mealIcon, { backgroundColor: refeicao.color }]}>
        <MaterialCommunityIcons name={refeicao.icon as any} size={22} color="#fff" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.mealTitle}>{refeicao.titulo}</Text>
        <Text style={styles.mealTime}>{refeicao.horario}</Text>
      </View>

      <View style={styles.contagens}>
        <View style={[styles.badge, styles.badgeSim]}>
          <Ionicons name="checkmark-circle" size={13} color="#2E7D32" />
          <Text style={[styles.badgeText, styles.badgeTextSim]}>{contagem.sim}</Text>
        </View>
        <View style={[styles.badge, styles.badgeNao]}>
          <Ionicons name="close-circle" size={13} color="#B3261E" />
          <Text style={[styles.badgeText, styles.badgeTextNao]}>{contagem.nao}</Text>
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();

  const diaHoje = diaAbreviadoDeHoje(); // null se for fim de semana

  // No fim de semana, já abre mostrando a segunda-feira que vem, pra
  // instituição se programar com antecedência.
  const [diaSelecionado, setDiaSelecionado] = useState(diaHoje ?? 'Seg');

  const [totalAlunos, setTotalAlunos] = useState<number | null>(null);
  const [totalTurmas, setTotalTurmas] = useState<number | null>(null);
  const [refeicoesDoDia, setRefeicoesDoDia] = useState<Refeicao[]>([]);
  const [carregandoRefeicoes, setCarregandoRefeicoes] = useState(true);
  const [contagemPorRefeicao, setContagemPorRefeicao] = useState<Record<number, ContagemRefeicao>>({});

  // Total de alunos e turmas cadastrados — sem relação com o dia selecionado.
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
    setCarregandoRefeicoes(true);

    const unsubscribeCardapio = assinarCardapioDia(
      diaSelecionado,
      (refeicoes) => {
        setRefeicoesDoDia(refeicoes);
        setCarregandoRefeicoes(false);
      },
      () => setCarregandoRefeicoes(false)
    );

    const unsubscribeContagem = assinarContagemConfirmacoes(diaSelecionado, setContagemPorRefeicao);

    return () => {
      unsubscribeCardapio();
      unsubscribeContagem();
    };
  }, [diaSelecionado]);

  const vendoHoje = diaSelecionado === diaHoje;
  const tituloSecao = vendoHoje
    ? 'Refeições de hoje'
    : `Prévia de ${NOME_COMPLETO_DIA[diaSelecionado]}`;

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
        {/* Não é mais tocável — confirmar presença é uma ação do aluno, não da instituição. */}
        <View style={styles.dayBanner} testID="day-banner">
          <View style={{ flex: 1 }}>
            <Text style={styles.dayTitle}>{nomeDiaSemanaPtBR()}</Text>
            <Text style={styles.dayDate}>{dataPorExtensoPtBR()}</Text>
          </View>
          <MaterialCommunityIcons name="food-apple" size={44} color="#fff" />
        </View>

        {!diaHoje && (
          <View style={styles.avisoFimDeSemana}>
            <Ionicons name="calendar-outline" size={16} color={colors.primary} />
            <Text style={styles.avisoFimDeSemanaText}>
              Hoje é fim de semana — mostrando a prévia da próxima semana.
            </Text>
          </View>
        )}

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
              <Text style={styles.summaryValue}>{refeicoesDoDia.length}</Text>
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

        <Text style={styles.section}>{tituloSecao}</Text>

        {/* Seletor de dias — sempre visível, então dá pra planejar qualquer dia da semana, não só hoje/fim de semana. */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.diasRow}>
          {DIAS.map((d) => {
            const ativo = d === diaSelecionado;
            const ehHoje = d === diaHoje;
            return (
              <Pressable
                key={d}
                testID={`home-dia-${d}`}
                onPress={() => setDiaSelecionado(d)}
                style={[styles.diaChip, ativo && styles.diaChipAtivo]}
              >
                <Text style={[styles.diaChipText, ativo && styles.diaChipTextAtivo]}>{d}</Text>
                {ehHoje && <View style={[styles.pontoHoje, ativo && styles.pontoHojeAtivo]} />}
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.mealsCard}>
          {carregandoRefeicoes ? (
            <ActivityIndicator color={colors.primary} style={{ padding: 20 }} />
          ) : refeicoesDoDia.length === 0 ? (
            <Text style={styles.emptyText}>
              Nenhuma refeição cadastrada para {NOME_COMPLETO_DIA[diaSelecionado].toLowerCase()} ainda.
            </Text>
          ) : (
            <>
              <View style={styles.legenda}>
                <View style={styles.legendaItem}>
                  <Ionicons name="checkmark-circle" size={13} color="#2E7D32" />
                  <Text style={styles.legendaText}>Vão comer</Text>
                </View>
                <View style={styles.legendaItem}>
                  <Ionicons name="close-circle" size={13} color="#B3261E" />
                  <Text style={styles.legendaText}>Não vão</Text>
                </View>
              </View>
              {refeicoesDoDia.map((refeicao, i) => (
                <React.Fragment key={i}>
                  <MealRow refeicao={refeicao} contagem={contagemPorRefeicao[i] ?? { sim: 0, nao: 0 }} />
                  {i < refeicoesDoDia.length - 1 && <View style={styles.divider} />}
                </React.Fragment>
              ))}
            </>
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
  avisoFimDeSemana: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
    paddingHorizontal: 4,
  },
  avisoFimDeSemanaText: { fontSize: 12, color: colors.textMuted, flex: 1 },
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
  diasRow: { gap: 8, paddingBottom: 10 },
  diaChip: {
    height: 34,
    paddingHorizontal: 16,
    borderRadius: 17,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 5,
  },
  diaChipAtivo: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  diaChipText: { color: colors.textDark, fontWeight: '700', fontSize: 13 },
  diaChipTextAtivo: { color: '#fff' },
  pontoHoje: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  pontoHojeAtivo: { backgroundColor: '#fff' },
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
  legenda: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 4,
  },
  legendaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendaText: { fontSize: 11, color: colors.textMuted, fontWeight: '600' },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  mealIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealTitle: { fontSize: 15, fontWeight: '700', color: colors.textDark },
  mealTime: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  contagens: { flexDirection: 'row', gap: 6 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  badgeSim: { backgroundColor: '#E8F5E9' },
  badgeNao: { backgroundColor: '#FDECEA' },
  badgeText: { fontSize: 12, fontWeight: '800' },
  badgeTextSim: { color: '#2E7D32' },
  badgeTextNao: { color: '#B3261E' },
  divider: { height: 1, backgroundColor: colors.divider, marginHorizontal: 12 },
});