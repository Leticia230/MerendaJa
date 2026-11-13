import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import ChefLogo from '../components/ChefLogo';
import BotaoPrimario from '../components/BotaoPrimario';
import { useAccessibility } from '../components/AccessibilityContext';
import ResponsiveContainer from '../components/ResponsiveContainer';
import { useResponsive } from '../hooks/useResponsive';

export default function InicioScreen() {
  const router = useRouter();
  const { theme } = useAccessibility();

  const {
    width,
    isSmallScreen,
    fontScale,
  } = useResponsive();

  const compacto = isSmallScreen || fontScale >= 1.2;

  const styles = useMemo(
    () => createStyles(theme, compacto),
    [theme, compacto]
  );

  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);

  const logoSize = Math.min(
    width * (compacto ? 0.48 : 0.62),
    compacto ? 210 : 280
  );

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;

    if (layoutMeasurement.width <= 0) return;

    const page = Math.round(
      contentOffset.x / layoutMeasurement.width
    );

    setCurrentPage(page);
  };

  const acceptTerms = () => {
    setAgreed(true);
    setShowTerms(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.screenScroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ResponsiveContainer style={styles.container}>
          <View style={styles.top}>
            <ChefLogo size={logoSize} />

            <Text style={styles.title}>
              Merenda Já
            </Text>

            <Text style={styles.subtitle}>
              GESTÃO DE ALIMENTAÇÃO
            </Text>
          </View>

          <View
            style={styles.card}
            onLayout={(event) => {
              setCardWidth(event.nativeEvent.layout.width);
            }}
          >
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={handleScroll}
              bounces={false}
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={[styles.cardPage, { width: cardWidth }]}>
                <Text style={styles.welcome}>
                  Bem-vindo!
                </Text>

                <Text style={styles.desc}>
                  Gerencie seu cardápio, alunos, turmas e
                  refeições de forma simples, rápida e
                  eficiente.
                </Text>
              </View>

              <View style={[styles.cardPage, { width: cardWidth }]}>
                <Text style={styles.welcome}>
                  Organize suas refeições
                </Text>

                <Text style={styles.desc}>
                  Consulte o cardápio escolar e acompanhe
                  quais refeições serão oferecidas aos
                  alunos.
                </Text>
              </View>

              <View style={[styles.cardPage, { width: cardWidth }]}>
                <Text style={styles.welcome}>
                  Gerencie seus alunos 👩‍🎓
                </Text>

                <Text style={styles.desc}>
                  Organize alunos e turmas de maneira
                  prática, facilitando o gerenciamento da
                  alimentação escolar.
                </Text>
              </View>

              <View style={[styles.cardPage, { width: cardWidth }]}>
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

          <Pressable
            testID="terms-checkbox"
            style={styles.termsRow}
            onPress={() => setShowTerms(true)}
            accessibilityRole="button"
            accessibilityLabel="Ler e concordar com os termos de uso"
            accessibilityState={{ checked: agreed }}
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

            <Ionicons
              name="document-text-outline"
              size={19}
              color={theme.primary}
            />
          </Pressable>

          <BotaoPrimario
            testID="splash-start-button"
            title="Começar"
            onPress={() => {
              if (agreed) {
                router.push('/Acesso');
              }
            }}
            disabled={!agreed}
            style={{
              marginTop: 12,
              opacity: agreed ? 1 : 0.5,
            }}
          />
        </ResponsiveContainer>
      </ScrollView>

      <Modal
        visible={showTerms}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTerms(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderText}>
                <Text style={styles.modalTitle}>
                  Termos de Uso
                </Text>

                <Text style={styles.modalSubtitle}>
                  Merenda Já
                </Text>
              </View>

              <Pressable
                onPress={() => setShowTerms(false)}
                style={styles.closeButton}
                accessibilityRole="button"
                accessibilityLabel="Fechar termos de uso"
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.text}
                />
              </Pressable>
            </View>

            <ScrollView
              style={styles.termsContent}
              showsVerticalScrollIndicator
              contentContainerStyle={styles.termsContentInner}
            >
              <Text style={styles.termsHeading}>
                1. Aceitação dos termos
              </Text>

              <Text style={styles.termsParagraph}>
                Ao baixar, instalar, acessar ou usar o software
                MerendaJá, você concorda em cumprir e estar
                legalmente vinculado aos seguintes Termos de Uso.
                Se você não concorda com estes termos, não deve
                utilizar o software.
              </Text>

              <Text style={styles.termsHeading}>
                2. Licença de uso
              </Text>

              <Text style={styles.termsSubheading}>
                Concessão de Licença
              </Text>

              <Text style={styles.termsParagraph}>
                Sujeito ao cumprimento destes Termos de Uso,
                a ClubMeal concede a você uma licença limitada,
                não exclusiva, intransferível e revogável para
                usar o software MerendaJá apenas para fins
                pessoais e não comerciais.
              </Text>

              <Text style={styles.termsSubheading}>
                Restrições de Uso
              </Text>

              <Text style={styles.termsParagraph}>
                Você concorda em não (a) copiar, modificar ou
                criar obras derivadas do software; (b) realizar
                engenharia reversa, descompilar, ou tentar
                extrair o código-fonte do software; (c) alugar,
                arrendar, sublicenciar, ou distribuir o software
                para terceiros.
              </Text>

              <Text style={styles.termsHeading}>
                3. Atualizações
              </Text>

              <Text style={styles.termsParagraph}>
                A ClubMeal pode fornecer atualizações, correções
                de bugs ou outras modificações do software
                periodicamente. Essas atualizações podem ser
                instaladas automaticamente, e você concorda
                em receber essas atualizações como parte do seu
                uso contínuo do software.
              </Text>

              <Text style={styles.termsHeading}>
                4. Propriedade intelectual
              </Text>

              <Text style={styles.termsParagraph}>
                Todos os direitos, títulos e interesses
                relacionados ao software, incluindo, sem
                limitação, todos os direitos autorais, patentes,
                segredos comerciais, marcas registradas e outros
                direitos de propriedade intelectual são de
                propriedade exclusiva da ClubMeal. Estes Termos
                de Uso não concedem a você qualquer direito de
                propriedade intelectual sobre o software.
              </Text>

              <Text style={styles.termsHeading}>
                5. Coleta de dados e privacidade
              </Text>

              <Text style={styles.termsParagraph}>
                Referente a como coletaremos e utilizaremos os
                dados coletados no período de experiência do
                usuário dentro do MerendaJá.
              </Text>

              <Text style={styles.termsSubheading}>
                Coleta de dados
              </Text>

              <Text style={styles.termsParagraph}>
                A ClubMeal pode coletar informações sobre o uso
                do software, incluindo dados técnicos e
                informações relacionadas ao desempenho, para
                melhorar a funcionalidade do software.
              </Text>

              <Text style={styles.termsSubheading}>
                Política de privacidade
              </Text>

              <Text style={styles.termsParagraph}>
                O uso do software está sujeito à Política de
                Privacidade da ClubMeal, que pode ser acessada
                em link para a Política de Privacidade.
              </Text>

              <Text style={styles.termsSubheading}>
                Consentimento do usuário
              </Text>

              <Text style={styles.termsParagraph}>
                Antes da coleta de dados pessoais, o MerendaJá
                solicitará o consentimento explícito do usuário,
                informando de forma clara quais dados serão
                coletados, por quanto tempo serão armazenados,
                como poderão ser excluídos e qual finalidade
                serão utilizados. O consentimento será livre,
                informado e inequívoco, podendo ser revogado
                a qualquer momento através das configurações
                do sistema.
              </Text>

              <Text style={styles.termsSubheading}>
                Política de cookies
              </Text>

              <Text style={styles.termsParagraph}>
                O aplicativo MerendaJá poderá se utilizar de
                cookies e de outras ferramentas como o
                armazenamento local para manter o login ativo
                do usuário, lembrar preferências do usuário
                tais como idioma e tema, melhorar a experiência
                do usuário e gerar estatísticas.
              </Text>

              <Text style={styles.termsHeading}>
                6. Limitação de responsabilidade
              </Text>

              <Text style={styles.termsParagraph}>
                Em nenhuma circunstância a ClubMeal será
                responsável por quaisquer danos diretos,
                indiretos, incidentais, especiais, consequenciais
                ou punitivos decorrentes do uso ou da incapacidade
                de usar o software, mesmo que a ClubMeal tenha
                sido avisada da possibilidade de tais danos.
              </Text>

              <Text style={styles.termsHeading}>
                7. Garantia limitada
              </Text>

              <Text style={styles.termsParagraph}>
                O software é fornecido "como está", sem garantias
                de qualquer tipo, expressas ou implícitas,
                incluindo, mas não se limitando a garantias de
                comercialização, adequação a um propósito
                específico ou não violação.
              </Text>

              <Text style={styles.termsHeading}>
                8. Rescisão
              </Text>

              <Text style={styles.termsParagraph}>
                Estes Termos de Uso são efetivos até serem
                rescindidos. A ClubMeal pode rescindir estes
                Termos de Uso a qualquer momento, sem aviso
                prévio, se você violar qualquer uma das
                disposições aqui contidas. Após a rescisão,
                você deve cessar todo o uso do software e
                destruir todas as cópias do software em sua
                posse.
              </Text>

              <Text style={styles.termsHeading}>
                9. Disposições gerais
              </Text>

              <Text style={styles.termsSubheading}>
                Legislação aplicável
              </Text>

              <Text style={styles.termsParagraph}>
                Estes Termos de Uso serão regidos e interpretados
                de acordo com as leis do Brasil, Estado de São
                Paulo, sem consideração aos conflitos de leis.
              </Text>

              <Text style={styles.termsSubheading}>
                Alterações aos termos
              </Text>

              <Text style={styles.termsParagraph}>
                A ClubMeal reserva-se o direito de modificar
                estes Termos de Uso a qualquer momento. As
                modificações serão efetivas quando publicadas
                no site da Club Meal ou quando notificadas a
                você por qualquer outro meio.
              </Text>

              <Text style={styles.termsSubheading}>
                Acordo integral
              </Text>

              <Text style={styles.termsParagraph}>
                Estes Termos de Uso constituem o acordo integral
                entre você e a ClubMeal em relação ao uso do
                software e substituem todos os entendimentos
                ou acordos anteriores, escritos ou orais,
                relativos ao assunto.
              </Text>

              <Text style={styles.termsHeading}>
                10. Contato
              </Text>

              <Text style={styles.termsParagraph}>
                Se você tiver dúvidas sobre estes Termos de Uso,
                entre em contato com a ClubMeal em
                clubmeal74@gmail.com.
              </Text>

              <Text style={styles.lastUpdate}>
                Última atualização: 23 de agosto de 2026.
              </Text>
            </ScrollView>

            <View style={styles.modalButtons}>
              <Pressable
                style={styles.backButton}
                onPress={() => setShowTerms(false)}
                accessibilityRole="button"
              >
                <Text style={styles.backButtonText}>
                  Voltar
                </Text>
              </Pressable>

              <Pressable
                style={styles.acceptButton}
                onPress={acceptTerms}
                accessibilityRole="button"
              >
                <Ionicons
                  name="checkmark-circle-outline"
                  size={19}
                  color="#fff"
                />

                <Text style={styles.acceptButtonText}>
                  Aceitar termos
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme: any, compacto: boolean) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.background,
    },

    screenScroll: {
      flexGrow: 1,
      paddingBottom: compacto ? 16 : 24,
    },

    container: {
      flex: 0,
      width: '100%',
      maxWidth: 560,
      alignSelf: 'center',
      paddingTop: compacto ? 12 : 20,
      paddingBottom: compacto ? 12 : 20,
      paddingHorizontal: compacto ? 0 : 4,
      gap: compacto ? 12 : 16,
    },

    top: {
      alignItems: 'center',
      marginTop: 0,
      gap: compacto ? 6 : 10,
    },

    title: {
      fontSize: compacto ? 26 : 30,
      fontWeight: '800',
      color: theme.primaryDark,
      marginTop: 4,
      textAlign: 'center',
    },

    subtitle: {
      fontSize: compacto ? 10 : 12,
      color: theme.primary,
      letterSpacing: compacto ? 1.5 : 2,
      fontWeight: '600',
      textAlign: 'center',
    },

    card: {
      width: '100%',
      backgroundColor: theme.card,
      borderRadius: 20,
      marginTop: 4,
      minHeight: compacto ? 180 : 170,
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 12,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 3,
      overflow: 'hidden',
      borderWidth: theme.borderWidth,
      borderColor: theme.border,
    },

    scroll: {
      width: '100%',
      flexGrow: 0,
    },

    scrollContent: {
      alignItems: 'stretch',
    },

    cardPage: {
      minHeight: compacto ? 150 : 145,
      paddingHorizontal: compacto ? 14 : 20,
      paddingTop: compacto ? 18 : 20,
      paddingBottom: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },

    welcome: {
      fontSize: compacto ? 17 : 20,
      fontWeight: '700',
      color: theme.text,
      textAlign: 'center',
      marginBottom: 8,
      flexShrink: 1,
    },

    desc: {
      fontSize: compacto ? 12 : 14,
      color: theme.textMuted,
      textAlign: 'center',
      lineHeight: compacto ? 18 : 20,
      maxWidth: 320,
      flexShrink: 1,
    },

    dots: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      paddingBottom: 12,
      paddingTop: 6,
    },

    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.divider,
    },

    dotActive: {
      backgroundColor: theme.primary,
      width: 18,
    },

    termsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 8,
      paddingHorizontal: 4,
      minHeight: 42,
    },

    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 5,
      borderWidth: 1.5,
      borderColor: theme.primary,
      backgroundColor: theme.card,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    checkboxChecked: {
      backgroundColor: theme.primary,
    },

    termsText: {
      fontSize: compacto ? 12 : 13,
      color: theme.text,
      flex: 1,
      flexShrink: 1,
      lineHeight: compacto ? 17 : 19,
    },

    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.45)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: compacto ? 10 : 20,
    },

    modalContainer: {
      width: '100%',
      maxWidth: 560,
      maxHeight: '90%',
      backgroundColor: theme.card,
      borderRadius: 22,
      padding: compacto ? 14 : 20,
      overflow: 'hidden',
      borderWidth: theme.borderWidth,
      borderColor: theme.border,
    },

    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: compacto ? 12 : 18,
      gap: 10,
    },

    modalHeaderText: {
      flex: 1,
      flexShrink: 1,
    },

    modalTitle: {
      fontSize: compacto ? 19 : 22,
      fontWeight: '800',
      color: theme.primaryDark,
    },

    modalSubtitle: {
      fontSize: compacto ? 12 : 13,
      color: theme.textMuted,
      marginTop: 3,
    },

    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.soft,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    termsContent: {
      flexGrow: 0,
      flexShrink: 1,
    },

    termsContentInner: {
      paddingBottom: 10,
    },

    termsHeading: {
      fontSize: compacto ? 14 : 15,
      fontWeight: '700',
      color: theme.primaryDark,
      marginTop: 16,
      marginBottom: 7,
    },

    termsSubheading: {
      fontSize: compacto ? 12 : 13,
      fontWeight: '700',
      color: theme.primary,
      marginTop: 10,
      marginBottom: 5,
    },

    termsParagraph: {
      fontSize: compacto ? 12 : 13,
      lineHeight: compacto ? 19 : 21,
      color: theme.textSecondary,
      textAlign: 'justify',
    },

    lastUpdate: {
      fontSize: compacto ? 11 : 12,
      fontWeight: '600',
      color: theme.text,
      marginTop: 22,
      marginBottom: 10,
    },

    modalButtons: {
      flexDirection: 'row',
      gap: 10,
      marginTop: compacto ? 12 : 18,
    },

    backButton: {
      flex: 1,
      minWidth: 0,
      minHeight: 46,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.primary,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 6,
    },

    backButtonText: {
      color: theme.primary,
      fontSize: compacto ? 12 : 14,
      fontWeight: '700',
    },

    acceptButton: {
      flex: 1.5,
      minWidth: 0,
      minHeight: 46,
      borderRadius: 12,
      backgroundColor: theme.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      paddingHorizontal: 6,
    },

    acceptButtonText: {
      color: '#fff',
      fontSize: compacto ? 12 : 14,
      fontWeight: '700',
      flexShrink: 1,
      textAlign: 'center',
    },
  });
