import React, { useEffect, useMemo, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import Text from '../../components/AppText';
import {
  useAccessibility,
  AccessibilityTheme,
} from '../../components/AccessibilityContext';
import { useResponsive } from '../../hooks/useResponsive';
import ResponsiveContainer from '../../components/ResponsiveContainer';
import { listarAlunos } from '../services/alunos';
import { listarTurmas } from '../services/turmas';
import { assinarCardapioData, Refeicao } from '../services/cardapio';
import {
  assinarConfirmacoesPeriodo,
  ConfirmacaoDatada,
} from '../services/confirmacoes';
import {
  nomeTipoRefeicao,
  dataISO,
  intervaloDoPeriodo,
} from '../services/refeicaoUtils';
import {
  diaAbreviadoDeHoje,
  nomeDiaSemanaPtBR,
  dataPorExtensoPtBR,
  NOME_COMPLETO_DIA,
} from '../services/data';
import { assinaturaAtiva } from '../services/assinatura';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];

type ContagemRefeicao = {
  sim: number;
  nao: number;
};

function contarPorTipo(
  lista: ConfirmacaoDatada[]
): Record<string, ContagemRefeicao> {
  const contagem: Record<string, ContagemRefeicao> = {};

  lista.forEach((confirmacao) => {
    Object.entries(confirmacao.respostas ?? {}).forEach(
      ([tipo, vaiComer]) => {
        const tipoNormalizado = nomeTipoRefeicao(tipo);

        if (!contagem[tipoNormalizado]) {
          contagem[tipoNormalizado] = { sim: 0, nao: 0 };
        }

        if (vaiComer) {
          contagem[tipoNormalizado].sim += 1;
        } else {
          contagem[tipoNormalizado].nao += 1;
        }
      }
    );
  });

  return contagem;
}

function obterDataSelecionada(diaSelecionado: string): string {
  const [inicio] = intervaloDoPeriodo('semana');
  const [ano, mes, dia] = inicio.split('-').map(Number);
  const indice = DIAS.indexOf(diaSelecionado);

  if (indice === -1) {
    return inicio;
  }

  const data = new Date(ano, mes - 1, dia + indice);
  return dataISO(data);
}

function MealRow({
  refeicao,
  contagem,
}: {
  refeicao: Refeicao;
  contagem: ContagemRefeicao;
}) {
  const { theme } = useAccessibility();
  const { isSmallScreen, fontScale } = useResponsive();

  const compacto = isSmallScreen || fontScale >= 1.2;

  const styles = useMemo(
    () => createStyles(theme, compacto),
    [theme, compacto]
  );

  return (
    <View style={styles.mealRow} testID={`meal-${refeicao.titulo}`}>
      <View style={[styles.mealIcon, { backgroundColor: refeicao.color }]}>
        <MaterialCommunityIcons
          name={refeicao.icon as any}
          size={22}
          color="#fff"
        />
      </View>

      <View style={styles.mealInfo}>
        <Text style={styles.mealTitle}>{refeicao.titulo}</Text>
        <Text style={styles.mealTime}>{refeicao.horario}</Text>
      </View>

      <View style={styles.contagens}>
        <View style={[styles.badge, styles.badgeSim]}>
          <Ionicons name="checkmark-circle" size={13} color="#2E7D32" />
          <Text style={[styles.badgeText, styles.badgeTextSim]}>
            {contagem.sim}
          </Text>
        </View>

        <View style={[styles.badge, styles.badgeNao]}>
          <Ionicons name="close-circle" size={13} color="#B3261E" />
          <Text style={[styles.badgeText, styles.badgeTextNao]}>
            {contagem.nao}
          </Text>
        </View>
      </View>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const { theme } = useAccessibility();
  const { isSmallScreen, fontScale } = useResponsive();

  const compacto = isSmallScreen || fontScale >= 1.2;

  const styles = useMemo(
    () => createStyles(theme, compacto),
    [theme, compacto]
  );

  const [verificandoAssinatura, setVerificandoAssinatura] = useState(true);

  const diaHoje = diaAbreviadoDeHoje();

  const [diaSelecionado, setDiaSelecionado] = useState(diaHoje ?? 'Seg');
  const [totalAlunos, setTotalAlunos] = useState<number | null>(null);
  const [totalTurmas, setTotalTurmas] = useState<number | null>(null);
  const [refeicoesDoDia, setRefeicoesDoDia] = useState<Refeicao[]>([]);
  const [carregandoRefeicoes, setCarregandoRefeicoes] = useState(true);
  const [contagemPorTipo, setContagemPorTipo] = useState<
    Record<string, ContagemRefeicao>
  >({});

  useEffect(() => {
    async function enviarNotificacao() {
      try {
        if (Platform.OS === 'web') return;

        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'Notificações',
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#F99033',
          });
        }

        const { status: statusAtual } =
          await Notifications.getPermissionsAsync();

        let status = statusAtual;

        if (status !== 'granted') {
          const permissao =
            await Notifications.requestPermissionsAsync();

          status = permissao.status;
        }

        if (status !== 'granted') return;

        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Hora de atualizar o cardápio! 🍲',
            body: 'Que tal cadastrar as refeições de hoje? Mantenha os alunos informados sobre o que será servido!',
            sound: true,
            data: {
              tipo: 'lembrete_cardapio',
            },
          },
          trigger: null,
        });
      } catch (error) {
        console.error('Erro ao enviar notificação:', error);
      }
    }

    enviarNotificacao();
  }, []);

  useEffect(() => {
    let montado = true;

    assinaturaAtiva()
      .then((ativa: boolean) => {
        if (!montado) return;

        if (ativa) {
          setVerificandoAssinatura(false);
        } else {
          router.replace('/PlanosAssinaturas' as any);
        }
      })
      .catch((e) => {
        console.error('Erro ao verificar assinatura:', e);

        if (montado) {
          setVerificandoAssinatura(false);
        }
      });

    return () => {
      montado = false;
    };
  }, [router]);

  useFocusEffect(
    useCallback(() => {
      let ativo = true;

      listarAlunos()
        .then((alunos) => {
          if (ativo) setTotalAlunos(alunos.length);
        })
        .catch((e) => {
          console.error('Erro ao carregar total de alunos:', e);
          if (ativo) setTotalAlunos(0);
        });

      listarTurmas()
        .then((turmas) => {
          if (ativo) setTotalTurmas(turmas.length);
        })
        .catch((e) => {
          console.error('Erro ao carregar total de turmas:', e);
          if (ativo) setTotalTurmas(0);
        });

      return () => {
        ativo = false;
      };
    }, [])
  );

  useEffect(() => {
    setCarregandoRefeicoes(true);
    setRefeicoesDoDia([]);

    const dataSelecionada = obterDataSelecionada(diaSelecionado);

    const unsubscribe = assinarCardapioData(
      dataSelecionada,
      (refeicoes) => {
        setRefeicoesDoDia(refeicoes);
        setCarregandoRefeicoes(false);
      },
      (erro) => {
        console.error('Erro ao carregar refeições:', erro);
        setRefeicoesDoDia([]);
        setCarregandoRefeicoes(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [diaSelecionado]);

  useEffect(() => {
    setContagemPorTipo({});

    const dataSelecionada = obterDataSelecionada(diaSelecionado);

    const unsubscribe = assinarConfirmacoesPeriodo(
      dataSelecionada,
      dataSelecionada,
      (lista) => {
        setContagemPorTipo(contarPorTipo(lista));
      },
      (erro) => {
        console.error('Erro ao carregar confirmações do dia:', erro);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [diaSelecionado]);

  if (verificandoAssinatura) {
    return (
      <SafeAreaView style={styles.loadingSafe}>
        <ActivityIndicator color={theme.primary} />
      </SafeAreaView>
    );
  }

  const vendoHoje = diaSelecionado === diaHoje;

  const tituloSecao = vendoHoje
    ? 'Refeições de hoje'
    : `Refeições de ${NOME_COMPLETO_DIA[diaSelecionado]}`;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <ResponsiveContainer style={styles.headerContent}>
          <View style={styles.headerTexts}>
            <Text style={styles.hello}>Olá, Admin!</Text>
            <Text style={styles.brand}>Merenda Já</Text>
          </View>

          <Pressable
            testID="notifications-button"
            style={styles.bell}
            accessibilityRole="button"
            accessibilityLabel="Notificações"
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={theme.text}
            />
          </Pressable>
        </ResponsiveContainer>
      </View>

      <ScrollView
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
        <ResponsiveContainer style={styles.scrollContent}>
          <View style={styles.dayBanner} testID="day-banner">
            <View style={styles.bannerText}>
              <Text style={styles.dayTitle}>{nomeDiaSemanaPtBR()}</Text>
              <Text style={styles.dayDate}>{dataPorExtensoPtBR()}</Text>
            </View>

            <MaterialCommunityIcons
              name="food-apple"
              size={44}
              color="#fff"
            />
          </View>

          {!diaHoje && (
            <View style={styles.avisoFimDeSemana}>
              <Ionicons
                name="calendar-outline"
                size={16}
                color={theme.primary}
              />
              <Text style={styles.avisoFimDeSemanaText}>
                Hoje é fim de semana: mostrando os dados da próxima semana.
              </Text>
            </View>
          )}

          <Pressable
            testID="estatisticas-button"
            style={[styles.quickAction, { marginTop: 10 }]}
            onPress={() => router.push('/Estatisticas')}
            accessibilityRole="button"
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="stats-chart" size={22} color="#fff" />
            </View>

            <View style={styles.quickActionInfo}>
              <Text style={styles.quickActionTitle}>Estatísticas</Text>
              <Text style={styles.quickActionSubtitle}>
                Veja a demanda de refeições dos alunos
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.textMuted}
            />
          </Pressable>

          <Text style={styles.section}>Ações rápidas</Text>

          <Pressable
            testID="cadastrar-aluno-button"
            style={styles.quickAction}
            onPress={() => router.push('/CadastroAluno')}
            accessibilityRole="button"
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="person-add" size={22} color="#fff" />
            </View>

            <View style={styles.quickActionInfo}>
              <Text style={styles.quickActionTitle}>Cadastrar aluno</Text>
              <Text style={styles.quickActionSubtitle}>
                Adicione um novo aluno à instituição
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.textMuted}
            />
          </Pressable>

          <Pressable
            testID="restricoes-alimentares-button"
            style={[styles.quickAction, { marginTop: 10 }]}
            onPress={() => router.push('../RestricoesAlimentares')}
            accessibilityRole="button"
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="warning-outline" size={22} color="#fff" />
            </View>

            <View style={styles.quickActionInfo}>
              <Text style={styles.quickActionTitle}>
                Restrições alimentares
              </Text>
              <Text style={styles.quickActionSubtitle}>
                Consulte as restrições informadas pelos alunos
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.textMuted}
            />
          </Pressable>

          <Pressable
            testID="prazos-confirmacao-button"
            style={[styles.quickAction, { marginTop: 10 }]}
            onPress={() => router.push('./PrazosConfirmacao')}
            accessibilityRole="button"
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="time-outline" size={22} color="#fff" />
            </View>

            <View style={styles.quickActionInfo}>
              <Text style={styles.quickActionTitle}>
                Prazos de confirmação
              </Text>
              <Text style={styles.quickActionSubtitle}>
                Defina até quando os alunos podem confirmar as refeições
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={20}
              color={theme.textMuted}
            />
          </Pressable>

          <Text style={styles.section}>Resumo do dia</Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              {totalAlunos === null ? (
                <ActivityIndicator color={theme.primary} />
              ) : (
                <Text style={styles.summaryValue}>{totalAlunos}</Text>
              )}
              <Text style={styles.summaryLabel}>Alunos</Text>
            </View>

            <View style={styles.summaryCard}>
              {carregandoRefeicoes ? (
                <ActivityIndicator color={theme.primary} />
              ) : (
                <Text style={styles.summaryValue}>
                  {refeicoesDoDia.length}
                </Text>
              )}
              <Text style={styles.summaryLabel}>Refeições</Text>
            </View>

            <View style={styles.summaryCard}>
              {totalTurmas === null ? (
                <ActivityIndicator color={theme.primary} />
              ) : (
                <Text style={styles.summaryValue}>{totalTurmas}</Text>
              )}
              <Text style={styles.summaryLabel}>Turmas</Text>
            </View>
          </View>

          <Text style={styles.section}>{tituloSecao}</Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.diasRow}
          >
            {DIAS.map((d) => {
              const ativo = d === diaSelecionado;
              const ehHoje = d === diaHoje;

              return (
                <Pressable
                  key={d}
                  testID={`home-dia-${d}`}
                  onPress={() => setDiaSelecionado(d)}
                  style={[styles.diaChip, ativo && styles.diaChipAtivo]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: ativo }}
                  accessibilityLabel={
                    ehHoje ? `${d}, hoje` : d
                  }
                >
                  <Text
                    style={[
                      styles.diaChipText,
                      ativo && styles.diaChipTextAtivo,
                    ]}
                  >
                    {d}
                  </Text>

                  {ehHoje && (
                    <View
                      style={[
                        styles.pontoHoje,
                        ativo && styles.pontoHojeAtivo,
                      ]}
                    />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.mealsCard}>
            {carregandoRefeicoes ? (
              <ActivityIndicator
                color={theme.primary}
                style={styles.loadingMeals}
              />
            ) : refeicoesDoDia.length === 0 ? (
              <Text style={styles.emptyText}>
                Nenhuma refeição cadastrada para{' '}
                {NOME_COMPLETO_DIA[diaSelecionado].toLowerCase()} ainda.
              </Text>
            ) : (
              <>
                <View style={styles.legenda}>
                  <View style={styles.legendaItem}>
                    <Ionicons
                      name="checkmark-circle"
                      size={13}
                      color="#2E7D32"
                    />
                    <Text style={styles.legendaText}>Vão comer</Text>
                  </View>

                  <View style={styles.legendaItem}>
                    <Ionicons
                      name="close-circle"
                      size={13}
                      color="#B3261E"
                    />
                    <Text style={styles.legendaText}>Não vão</Text>
                  </View>
                </View>

                {refeicoesDoDia.map((refeicao, i) => (
                  <React.Fragment key={i}>
                    <MealRow
                      refeicao={refeicao}
                      contagem={
                        contagemPorTipo[
                          nomeTipoRefeicao(refeicao.titulo)
                        ] ?? {
                          sim: 0,
                          nao: 0,
                        }
                      }
                    />

                    {i < refeicoesDoDia.length - 1 && (
                      <View style={styles.divider} />
                    )}
                  </React.Fragment>
                ))}
              </>
            )}
          </View>
        </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (
  theme: AccessibilityTheme,
  compacto = false
) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.background,
    },

    loadingSafe: {
      flex: 1,
      backgroundColor: theme.background,
      alignItems: 'center',
      justifyContent: 'center',
    },

    header: {
      backgroundColor: theme.header,
      paddingVertical: 12,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },

    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },

    headerTexts: {
      flex: 1,
      minWidth: 0,
    },

    hello: {
      fontSize: 13,
      color: theme.text,
      fontWeight: '600',
    },

    brand: {
      fontSize: 20,
      fontWeight: '800',
      color: theme.primaryDark,
    },

    bell: {
      width: 40,
      height: 40,
      flexShrink: 0,
      borderRadius: 20,
      backgroundColor: theme.card,
      alignItems: 'center',
      justifyContent: 'center',
    },

    body: {
      paddingTop: 18,
      paddingBottom: 40,
    },

    scrollContent: {
      flex: 0,
    },

    dayBanner: {
      backgroundColor: theme.primary,
      borderRadius: 16,
      padding: compacto ? 14 : 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    bannerText: {
      flex: 1,
      minWidth: 0,
    },

    dayTitle: {
      color: '#fff',
      fontSize: 18,
      fontWeight: '800',
    },

    dayDate: {
      color: '#FFE0CE',
      fontSize: 12,
      marginTop: 4,
    },

    avisoFimDeSemana: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 10,
      paddingHorizontal: 4,
    },

    avisoFimDeSemanaText: {
      fontSize: 12,
      color: theme.textMuted,
      flex: 1,
      flexShrink: 1,
    },

    section: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text,
      marginTop: 18,
      marginBottom: 10,
    },

    quickAction: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 14,
      padding: compacto ? 10 : 12,
      gap: compacto ? 9 : 12,
      minHeight: 68,
      borderWidth: theme.borderWidth,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },

    quickActionIcon: {
      width: 44,
      height: 44,
      flexShrink: 0,
      borderRadius: 12,
      backgroundColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },

    quickActionInfo: {
      flex: 1,
      minWidth: 0,
    },

    quickActionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text,
      flexShrink: 1,
    },

    quickActionSubtitle: {
      fontSize: 12,
      color: theme.textMuted,
      marginTop: 2,
      flexShrink: 1,
    },

    summaryRow: {
      flexDirection: 'row',
      flexWrap: compacto ? 'wrap' : 'nowrap',
      gap: 10,
    },

    summaryCard: {
      flex: 1,
      minWidth: compacto ? 90 : 0,
      backgroundColor: theme.card,
      borderRadius: 14,
      padding: compacto ? 11 : 14,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 74,
      borderWidth: theme.borderWidth,
      borderColor: theme.border,
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },

    summaryValue: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.primary,
    },

    summaryLabel: {
      fontSize: 12,
      color: theme.textMuted,
      marginTop: 2,
      textAlign: 'center',
    },

    diasRow: {
      gap: 8,
      paddingBottom: 10,
    },

    diaChip: {
      minHeight: 36,
      paddingHorizontal: compacto ? 14 : 16,
      borderRadius: 18,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 5,
    },

    diaChipAtivo: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },

    diaChipText: {
      color: theme.text,
      fontWeight: '700',
      fontSize: 13,
    },

    diaChipTextAtivo: {
      color: '#fff',
    },

    pontoHoje: {
      width: 5,
      height: 5,
      borderRadius: 3,
      backgroundColor: theme.primary,
    },

    pontoHojeAtivo: {
      backgroundColor: '#fff',
    },

    mealsCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: compacto ? 6 : 8,
      borderWidth: theme.borderWidth,
      borderColor: theme.border,
    },

    loadingMeals: {
      padding: 20,
    },

    emptyText: {
      textAlign: 'center',
      color: theme.textMuted,
      fontSize: 13,
      padding: 20,
    },

    legenda: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom: 4,
    },

    legendaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },

    legendaText: {
      fontSize: 11,
      color: theme.textMuted,
      fontWeight: '600',
    },

    mealRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: compacto ? 9 : 12,
      gap: compacto ? 8 : 12,
    },

    mealIcon: {
      width: 44,
      height: 44,
      flexShrink: 0,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },

    mealInfo: {
      flex: 1,
      minWidth: 0,
    },

    mealTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
      flexShrink: 1,
    },

    mealTime: {
      fontSize: 12,
      color: theme.textMuted,
      marginTop: 2,
    },

    contagens: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
      gap: 6,
      flexShrink: 0,
    },

    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      borderRadius: 10,
      paddingHorizontal: 7,
      paddingVertical: 4,
    },

    badgeSim: {
      backgroundColor: 'rgba(46, 125, 50, 0.18)',
    },

    badgeNao: {
      backgroundColor: 'rgba(179, 38, 30, 0.18)',
    },

    badgeText: {
      fontSize: 12,
      fontWeight: '800',
    },

    badgeTextSim: {
      color: '#2E7D32',
    },

    badgeTextNao: {
      color: '#B3261E',
    },

    divider: {
      height: 1,
      backgroundColor: theme.divider,
      marginHorizontal: 12,
    },
  });
