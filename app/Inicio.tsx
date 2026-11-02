
import React, { useState } from 'react';
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
import { colors } from '../constants/theme';

export default function InicioScreen() {
  const router = useRouter();

  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);

  const handleScroll = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;

    const page = Math.round(
      contentOffset.x / layoutMeasurement.width
    );

    setCurrentPage(page);
  };

  // Aceita os termos e fecha somente o Modal
  const acceptTerms = () => {
    setAgreed(true);
    setShowTerms(false);
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

        {/* TERMOS DE USO */}
        <Pressable
          testID="terms-checkbox"
          style={styles.termsRow}
          onPress={() => setShowTerms(true)}
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
            color={colors.primary}
          />
        </Pressable>

        {/* BOTÃO COMEÇAR */}
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

      </View>

      {/* MODAL DOS TERMOS */}
      <Modal
        visible={showTerms}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTerms(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>

            {/* CABEÇALHO */}
            <View style={styles.modalHeader}>
              <View>
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
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={colors.textDark}
                />
              </Pressable>
            </View>

            {/* CONTEÚDO DOS TERMOS */}
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

            {/* BOTÕES DO MODAL */}
            <View style={styles.modalButtons}>
              <Pressable
                style={styles.backButton}
                onPress={() => setShowTerms(false)}
              >
                <Text style={styles.backButtonText}>
                  Voltar
                </Text>
              </Pressable>

              <Pressable
                style={styles.acceptButton}
                onPress={acceptTerms}
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

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginTop: 12,
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

  scroll: {
    width: '100%',
  },

  scrollContent: {
    alignItems: 'stretch',
  },

  cardPage: {
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

  // MODAL

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalContainer: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 20,
    overflow: 'hidden',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primaryDark,
  },

  modalSubtitle: {
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 3,
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  termsContent: {
    flexGrow: 0,
    flexShrink: 1,
  },

  termsContentInner: {
    paddingBottom: 10,
  },

  termsHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primaryDark,
    marginTop: 16,
    marginBottom: 7,
  },

  termsSubheading: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 10,
    marginBottom: 5,
  },

  termsParagraph: {
    fontSize: 13,
    lineHeight: 21,
    color: colors.textMuted,
    textAlign: 'justify',
  },

  lastUpdate: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textDark,
    marginTop: 22,
    marginBottom: 10,
  },

  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },

  backButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },

  acceptButton: {
    flex: 1.5,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },

  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
});
