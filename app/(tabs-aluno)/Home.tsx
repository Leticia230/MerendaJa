import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Animated,
  Easing,
  AccessibilityInfo,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAccessibility } from '../../components/AccessibilityContext';
import { assinarCardapioData, Refeicao } from '../services/cardapio';
import {
  diaAbreviadoDeHoje,
  nomeDiaSemanaPtBR,
  dataPorExtensoPtBR,
} from '../services/data';
import { useInstituicaoId } from '../services/useInstituicaoId';
import Text from '../../components/AppText';
import { dataISO } from '../services/refeicaoUtils';
import { registrarDispositivoParaNotificacoes } from '../services/notificacoesPush';
import * as Notifications from 'expo-notifications';
import { useResponsive } from '../../hooks/useResponsive';
import ResponsiveContainer from '../../components/ResponsiveContainer';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function MealRow({ titulo, horario, color, icon }: Refeicao) {
  const { theme } = useAccessibility();
  const { isSmallScreen, fontScale } = useResponsive();

  const compacto = isSmallScreen || fontScale >= 1.2;
  const styles = createStyles(theme, compacto);

  return (
    <View style={styles.mealRow} testID={`meal-${titulo}`}>
      <View style={styles.mealInfo}>
        <Text style={styles.mealTitle}>{titulo}</Text>
        <Text style={styles.mealTime}>{horario}</Text>
      </View>

      <View style={[styles.mealIcon, compacto && styles.mealIconCompact, { backgroundColor: color }]}>
        <MaterialCommunityIcons
          name={icon as any}
          size={24}
          color="#ffffff"
        />
      </View>
    </View>
  );
}

type MarcarCardProps = {
  refeicoes: Refeicao[];
  carregando: boolean;
  onPress: () => void;
};

function MarcarRefeicoesCard({
  refeicoes,
  carregando,
  onPress,
}: MarcarCardProps) {
  const { theme } = useAccessibility();
  const { isSmallScreen, fontScale } = useResponsive();

  const compacto = isSmallScreen || fontScale >= 1.2;
  const styles = createStyles(theme, compacto);

  const pulse = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(1)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

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
            title: 'Novo cardápio disponível! 🍝',
            body: 'Confira as refeições preparadas para esta semana e confirme sua participação.',
            sound: true,
            data: {
              tipo: 'novo_cardapio',
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
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();

    return () => loop.stop();
  }, [pulse, reduceMotion]);

  const animaPress = (to: number) =>
    Animated.spring(press, {
      toValue: to,
      useNativeDriver: true,
      speed: 30,
    }).start();

  const ringScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.7],
  });

  const ringOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });

  const subtitulo = carregando
    ? 'Carregando as refeições de hoje...'
    : refeicoes.length === 0
      ? 'Sem cardápio hoje, mas você pode conferir as opções'
      : `${refeicoes.length} ${
          refeicoes.length === 1 ? 'refeição' : 'refeições'
        } hoje · escolha as que você vai comer`;

  return (
    <Animated.View
      style={{
        transform: [{ scale: press }],
        marginTop: 18,
      }}
    >
      <Pressable
        testID="marcar-refeicoes-button"
        style={styles.marcarCard}
        onPress={onPress}
        onPressIn={() => animaPress(0.97)}
        onPressOut={() => animaPress(1)}
        accessibilityRole="button"
        accessibilityLabel="Marcar refeições"
        accessibilityHint="Informe quais refeições você pretende consumir hoje"
      >
        <View style={styles.marcarTop}>
          <View style={styles.marcarIconWrap}>
            {!reduceMotion && (
              <Animated.View
                style={[
                  styles.marcarRing,
                  {
                    opacity: ringOpacity,
                    transform: [{ scale: ringScale }],
                  },
                ]}
              />
            )}

            <View style={styles.marcarIconBubble}>
              <MaterialCommunityIcons
                name="clipboard-check-outline"
                size={26}
                color={theme.primaryDark}
              />
            </View>
          </View>

          <View style={styles.marcarTextContainer}>
            <Text style={styles.marcarRefeicoesTitle}>
              Marcar refeições
            </Text>

            <Text style={styles.marcarRefeicoesSubtitle}>
              {subtitulo}
            </Text>
          </View>

          <View style={styles.marcarCta}>
            <Text style={styles.marcarCtaText}>Marcar</Text>

            <MaterialCommunityIcons
              name="chevron-right"
              size={18}
              color={theme.onPrimary}
            />
          </View>
        </View>

        {!carregando && refeicoes.length > 0 && (
          <View style={styles.chipsRow}>
            {refeicoes.map((r, i) => (
              <View key={i} style={styles.chip}>
                <View
                  style={[
                    styles.chipDot,
                    { backgroundColor: r.color },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={r.icon as any}
                    size={12}
                    color="#ffffff"
                  />
                </View>

                <Text style={styles.chipText}>{r.titulo}</Text>
              </View>
            ))}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function HomeAlunoScreen() {
  const { theme } = useAccessibility();
  const { isSmallScreen, fontScale } = useResponsive();

  const compacto = isSmallScreen || fontScale >= 1.2;
  const styles = createStyles(theme, compacto);

  const router = useRouter();

  const [refeicoesHoje, setRefeicoesHoje] = useState<Refeicao[]>([]);
  const [carregando, setCarregando] = useState(true);

  const diaHoje = diaAbreviadoDeHoje();
  const hojeISO = dataISO();

  const {
    instituicaoId,
    carregando: carregandoInstituicao,
  } = useInstituicaoId();

  useEffect(() => {
    if (carregandoInstituicao || !instituicaoId) return;

    registrarDispositivoParaNotificacoes(instituicaoId);
  }, [carregandoInstituicao, instituicaoId]);

  useEffect(() => {
    if (carregandoInstituicao) return;

    if (!diaHoje || !instituicaoId) {
      setCarregando(false);
      return;
    }

    const unsubscribe = assinarCardapioData(
      hojeISO,
      (refeicoes) => {
        setRefeicoesHoje(refeicoes);
        setCarregando(false);
      },
      () => setCarregando(false),
      instituicaoId
    );

    return unsubscribe;
  }, [diaHoje, hojeISO, instituicaoId, carregandoInstituicao]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <ResponsiveContainer style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.hello}>Olá, Aluno!</Text>
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
        <ResponsiveContainer>
          <Pressable testID="day-banner" style={styles.dayBanner}>
            <View style={styles.dayBannerText}>
              <Text style={styles.dayTitle}>
                {nomeDiaSemanaPtBR()}
              </Text>

              <Text style={styles.dayDate}>
                {dataPorExtensoPtBR()}
              </Text>
            </View>

            <MaterialCommunityIcons
              name="food-apple"
              size={44}
              color="#fff"
            />
          </Pressable>

          <MarcarRefeicoesCard
            refeicoes={refeicoesHoje}
            carregando={carregando}
            onPress={() => router.push('/RefeicoesDia')}
          />

          <Text style={styles.section}>Próximas refeições</Text>

          <View style={styles.mealsCard}>
            {carregando ? (
              <ActivityIndicator
                color={theme.primary}
                style={{ padding: 20 }}
              />
            ) : !diaHoje ? (
              <Text style={styles.emptyText}>
                Hoje é fim de semana, sem cardápio cadastrado.
              </Text>
            ) : refeicoesHoje.length === 0 ? (
              <Text style={styles.emptyText}>
                A instituição ainda não cadastrou o cardápio de hoje.
              </Text>
            ) : (
              refeicoesHoje.map((refeicao, i) => (
                <React.Fragment key={i}>
                  <MealRow {...refeicao} />

                  {i < refeicoesHoje.length - 1 && (
                    <View style={styles.divider} />
                  )}
                </React.Fragment>
              ))
            )}
          </View>
        </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any, compacto = false) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.background,
    },

    header: {
      backgroundColor: theme.header,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
    },

    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
    },

    headerText: {
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
      marginLeft: 12,
      width: 40,
      height: 40,
      flexShrink: 0,
      borderRadius: 20,
      backgroundColor: theme.card,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: theme.borderWidth,
      borderColor: theme.border,
    },

    body: {
      paddingTop: 18,
      paddingBottom: 40,
    },

    dayBanner: {
      backgroundColor: theme.primary,
      borderRadius: 16,
      padding: compacto ? 14 : 16,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    dayBannerText: {
      flex: 1,
      minWidth: 0,
    },

    dayTitle: {
      color: theme.onPrimary,
      fontSize: 18,
      fontWeight: '800',
    },

    dayDate: {
      color: '#FFE0CE',
      fontSize: 12,
      marginTop: 4,
    },

    marcarTop: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 12,
    },

    marcarIconWrap: {
      width: 48,
      height: 48,
      flexShrink: 0,
      alignItems: 'center',
      justifyContent: 'center',
    },

    marcarTextContainer: {
      flex: 1,
      flexShrink: 1,
      minWidth: compacto ? 130 : 110,
    },

    marcarCard: {
      backgroundColor: theme.card,
      borderRadius: 18,
      padding: compacto ? 13 : 16,
      borderWidth: theme.borderWidth || 1,
      borderColor: theme.borderWidth ? theme.border : theme.soft,
      elevation: 4,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowRadius: 8,
      shadowOffset: {
        width: 0,
        height: 3,
      },
    },

    marcarRing: {
      position: 'absolute',
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.primary,
    },

    marcarIconBubble: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.soft,
      alignItems: 'center',
      justifyContent: 'center',
    },

    marcarRefeicoesTitle: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '800',
    },

    marcarRefeicoesSubtitle: {
      color: theme.textMuted,
      fontSize: 11,
      marginTop: 3,
    },

    marcarCta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.primary,
      borderRadius: 20,
      paddingVertical: 8,
      paddingHorizontal: 12,
      minHeight: 36,
      flexShrink: 0,
    },

    marcarCtaText: {
      color: theme.onPrimary,
      fontWeight: '800',
      fontSize: 12,
    },

    chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 14,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
    },

    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.soft,
      borderRadius: 14,
      paddingVertical: 4,
      paddingRight: 10,
      paddingLeft: 4,
      gap: 6,
      maxWidth: '100%',
    },

    chipDot: {
      width: 20,
      height: 20,
      flexShrink: 0,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },

    chipText: {
      color: theme.text,
      fontSize: 11,
      fontWeight: '600',
      flexShrink: 1,
    },

    section: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text,
      marginTop: 18,
      marginBottom: 10,
    },

    mealsCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 8,
      borderWidth: theme.borderWidth,
      borderColor: theme.border,
    },

    emptyText: {
      textAlign: 'center',
      color: theme.textMuted,
      fontSize: 13,
      padding: 20,
    },

    mealRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: compacto ? 10 : 12,
      gap: 12,
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
      flexShrink: 1,
    },

    mealIcon: {
      width: 52,
      height: 52,
      flexShrink: 0,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },

    mealIconCompact: {
      width: 46,
      height: 46,
    },

    divider: {
      height: 1,
      backgroundColor: theme.divider,
      marginHorizontal: 12,
    },
  });
