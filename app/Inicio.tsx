import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, NativeSyntheticEvent, NativeScrollEvent, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ChefLogo from '../components/ChefLogo';
import BotaoPrimario from '../components/BotaoPrimario';
import { colors } from '../constants/theme';

export default function InicioScreen() {
  const router = useRouter();

  const [agreed, setAgreed] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;

    const page = Math.round(
      contentOffset.x / layoutMeasurement.width
    );

    setCurrentPage(page);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container} testID="inicio-screen">

        {/* LOGO E TÍTULO */}
        <View style={styles.top}>
          <ChefLogo size={400} />

          <Text style={styles.title}>
            Merenda Já
          </Text>

          <Text style={styles.subtitle}>
            GESTÃO DE ALIMENTAÇÃO
          </Text>
        </View>

        {/* CARROSSEL */}
        <View style={styles.card}>

          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleScroll}
            bounces={false}
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
          >

            {/* PÁGINA 1 */}
            <View style={styles.cardPage}>
              <Text style={styles.welcome}>
                Bem-vindo!
              </Text>

              <Text style={styles.desc}>
                Gerencie seu cardápio, alunos, turmas e
                refeições de forma simples, rápida e
                eficiente.
              </Text>
            </View>

            {/* PÁGINA 2 */}
            <View style={styles.cardPage}>
              <Text style={styles.welcome}>
                Organize suas refeições
              </Text>

              <Text style={styles.desc}>
                Consulte o cardápio escolar e acompanhe
                quais refeições serão oferecidas aos
                alunos.
              </Text>
            </View>

            {/* PÁGINA 3 */}
            <View style={styles.cardPage}>
              <Text style={styles.welcome}>
                Gerencie seus alunos 👩‍🎓
              </Text>

              <Text style={styles.desc}>
                Organize alunos e turmas de maneira
                prática, facilitando o gerenciamento da
                alimentação escolar.
              </Text>
            </View>

            {/* PÁGINA 4 */}
            <View style={styles.cardPage}>
              <Text style={styles.welcome}>
                Tudo em um só lugar!
              </Text>

              <Text style={styles.desc}>
                O Merenda Já facilita a gestão da
                alimentação escolar de forma rápida,
                simples e eficiente.
              </Text>
            </View>

          </ScrollView>

          {/* INDICADORES */}
          <View style={styles.dots}>
            {[0, 1, 2, 3].map((index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  currentPage === index && styles.dotActive,
                ]}
              />
            ))}
          </View>

        </View>

        {/* TERMOS DE USO */}
        <Pressable
          testID="terms-checkbox"
          style={styles.termsRow}
          onPress={() => setAgreed((a) => !a)}
        >
          <View
            style={[
              styles.checkbox,
              agreed && styles.checkboxChecked,
            ]}
          >
            {agreed && (
              <Ionicons
                name="checkmark"
                size={14}
                color="#fff"
              />
            )}
          </View>

          <Text style={styles.termsText}>
            Li e concordo com os termos de uso
          </Text>
        </Pressable>

        {/* BOTÃO */}
        <BotaoPrimario
          testID="splash-start-button"
          title="Começar"
          onPress={() => router.push('/Acesso')}
          style={{ marginTop: 12, }}
        />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.yellow,
  },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },

  /* LOGO */
  top: {
    alignItems: 'center',
    marginTop: -10,
    gap: 10,
  },

  title: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.primaryDark,
    marginTop: 8,
  },

  subtitle: {
    fontSize: 12,
    color: colors.primary,
    letterSpacing: 2,
    fontWeight: '600',
  },

  /* CARTÃO */
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,

    marginTop: 12,

    /*
     * Define uma altura confortável para o cartão,
     * sem deixar ele ocupar a tela inteira.
     */
    minHeight: 170,
    maxHeight: 200,

    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: {
      width: 0,
      height: 4,
    },

    elevation: 3,

    overflow: 'hidden',
  },

  /* SCROLL HORIZONTAL */
  scroll: {
    width: '100%',
  },

  scrollContent: {
    alignItems: 'stretch',
  },

  /* CADA PÁGINA */
  cardPage: {
    width: '100%',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,

    justifyContent: 'center',
    alignItems: 'center',
  },

  welcome: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 8,
  },

  desc: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 300,
  },

  /* PONTINHOS */
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,

    paddingBottom: 14,
    paddingTop: 6,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F2C97B',
  },

  dotActive: {
    backgroundColor: colors.primary,
    width: 18,
  },

  /* TERMOS */
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,

    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  checkbox: {
    width: 20,
    height: 20,

    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: colors.primary,

    backgroundColor: '#fff',

    alignItems: 'center',
    justifyContent: 'center',
  },

  checkboxChecked: {
    backgroundColor: colors.primary,
  },

  termsText: {
    fontSize: 13,
    color: colors.textDark,
    flex: 1,
  },
});