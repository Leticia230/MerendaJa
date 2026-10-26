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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../../constants/theme';
import { assinarCardapioDia, Refeicao } from '../services/cardapio';
import { diaAbreviadoDeHoje, nomeDiaSemanaPtBR, dataPorExtensoPtBR } from '../services/data';
import { useInstituicaoId } from '../services/useInstituicaoId';
import Text from '../../components/AppText';  

function MealRow({ titulo, horario, color, icon }: Refeicao) {
  return (
    <View style={styles.mealRow} testID={`meal-${titulo}`}>
      <View style={{ flex: 1 }}>
        <Text style={styles.mealTitle}>{titulo}</Text>
        <Text style={styles.mealTime}>{horario}</Text>
      </View>
      <View style={[styles.mealIcon, { backgroundColor: color }]}>
        <MaterialCommunityIcons name={icon as any} size={24} color="#ffffff" />
      </View>
    </View>
  );
}

type MarcarCardProps = {
  refeicoes: Refeicao[];
  carregando: boolean;
  onPress: () => void;
};

function MarcarRefeicoesCard({ refeicoes, carregando, onPress }: MarcarCardProps) {
  const pulse = useRef(new Animated.Value(0)).current;
  const press = useRef(new Animated.Value(1)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

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
        Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduceMotion]);

  const animaPress = (to: number) =>
    Animated.spring(press, { toValue: to, useNativeDriver: true, speed: 30 }).start();

  const ringScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.7] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });

  const subtitulo = carregando
    ? 'Carregando as refeições de hoje...'
    : refeicoes.length === 0
    ? 'Sem cardápio hoje, mas você pode conferir as opções'
    : `${refeicoes.length} ${
        refeicoes.length === 1 ? 'refeição' : 'refeições'
      } hoje · escolha as que você vai comer`;

  return (
    <Animated.View style={{ transform: [{ scale: press }], marginTop: 18 }}>
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
                  { opacity: ringOpacity, transform: [{ scale: ringScale }] },
                ]}
              />
            )}
            <View style={styles.marcarIconBubble}>
              <MaterialCommunityIcons
                name="clipboard-check-outline"
                size={26}
                color={colors.primaryDark}
              />
            </View>
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.marcarRefeicoesTitle}>Marcar refeições</Text>
            <Text style={styles.marcarRefeicoesSubtitle}>{subtitulo}</Text>
          </View>

          <View style={styles.marcarCta}>
            <Text style={styles.marcarCtaText}>Marcar</Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color={colors.splashBg} />
          </View>
        </View>

        {!carregando && refeicoes.length > 0 && (
          <View style={styles.chipsRow}>
            {refeicoes.map((r, i) => (
              <View key={i} style={styles.chip}>
                <View style={[styles.chipDot, { backgroundColor: r.color }]}>
                  <MaterialCommunityIcons name={r.icon as any} size={12} color="#ffffff" />
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
  const router = useRouter();

  const [refeicoesHoje, setRefeicoesHoje] = useState<Refeicao[]>([]);
  const [carregando, setCarregando] = useState(true);

  const diaHoje = diaAbreviadoDeHoje(); // null se for fim de semana

  const { instituicaoId, carregando: carregandoInstituicao } = useInstituicaoId();

  useEffect(() => {
    if (carregandoInstituicao) return;

    if (!diaHoje || !instituicaoId) {
      setCarregando(false);
      return;
    }

    const unsubscribe = assinarCardapioDia(
      diaHoje,
      (refeicoes) => {
        setRefeicoesHoje(refeicoes);
        setCarregando(false);
      },
      () => setCarregando(false),
      instituicaoId
    );

    return unsubscribe;
  }, [diaHoje, instituicaoId, carregandoInstituicao]);

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
        <Pressable testID="day-banner" style={styles.dayBanner}>
          <View style={{ flex: 1 }}>
            <Text style={styles.dayTitle}>{nomeDiaSemanaPtBR()}</Text>
            <Text style={styles.dayDate}>{dataPorExtensoPtBR()}</Text>
          </View>
          <MaterialCommunityIcons name="food-apple" size={44} color="#fff" />
        </Pressable>

        <MarcarRefeicoesCard
          refeicoes={refeicoesHoje}
          carregando={carregando}
          onPress={() => router.push('/RefeicoesDia')}
        />

        <Text style={styles.section}>Próximas refeições</Text>
        <View style={styles.mealsCard}>
          {carregando ? (
            <ActivityIndicator color={colors.primary} style={{ padding: 20 }} />
          ) : !diaHoje ? (
            <Text style={styles.emptyText}>
              Hoje é fim de semana — sem cardápio cadastrado.
            </Text>
          ) : refeicoesHoje.length === 0 ? (
            <Text style={styles.emptyText}>
              A instituição ainda não cadastrou o cardápio de hoje.
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

  // Card "Marcar refeições"
  
  marcarTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  marcarIconWrap: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  marcarCard: {
  backgroundColor: '#fff',
  borderRadius: 18,
  padding: 16,
  borderWidth: 1,
  borderColor: '#FFE0CE',
  elevation: 4,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 3 },
},
marcarRing: {
  position: 'absolute',
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: colors.primary,   // anel pulsante laranja
},
marcarIconBubble: {
  width: 48,
  height: 48,
  borderRadius: 24,
  backgroundColor: '#FFE0CE',        // laranja bem claro atrás do ícone
  alignItems: 'center',
  justifyContent: 'center',
},
marcarRefeicoesTitle: { color: colors.textDark, fontSize: 16, fontWeight: '800' },
marcarRefeicoesSubtitle: { color: colors.textMuted, fontSize: 11, marginTop: 3 },
marcarCta: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: colors.primary,   // botão laranja
  borderRadius: 20,
  paddingVertical: 6,
  paddingLeft: 12,
  paddingRight: 6,
},
marcarCtaText: { color: '#fff', fontWeight: '800', fontSize: 12 },
chipsRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 8,
  marginTop: 14,
  paddingTop: 12,
  borderTopWidth: 1,
  borderTopColor: colors.divider,
},
chip: {
  flexDirection: 'row',
  alignItems: 'center',
  backgroundColor: '#FFF3EB',        // fundo laranja bem suave
  borderRadius: 14,
  paddingVertical: 4,
  paddingRight: 10,
  paddingLeft: 4,
  gap: 6,
},
chipDot: {
  width: 20,
  height: 20,
  borderRadius: 10,
  backgroundColor: '#FFE0CE',
  alignItems: 'center',
  justifyContent: 'center',
},
chipText: { color: colors.textDark, fontSize: 11, fontWeight: '600' },

  section: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textDark,
    marginTop: 18,
    marginBottom: 10,
  },
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