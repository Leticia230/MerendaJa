import React, { useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScreenHeader from '../components/ScreenHeader';
import Text from '../components/AppText';
import { useAccessibility } from '../components/AccessibilityContext';
import ResponsiveContainer from '../components/ResponsiveContainer';
import { useResponsive } from '../hooks/useResponsive';

type Block = {
  label?: string;
  text: string;
};

type Section = {
  number: number;
  title: string;
  blocks: Block[];
};

const SECTIONS: Section[] = [
  {
    number: 1,
    title: 'Aceitação dos termos',
    blocks: [
      {
        text: 'Ao baixar, instalar, acessar ou usar o software MerendaJá, você concorda em cumprir e estar legalmente vinculado aos seguintes Termos de Uso. Se você não concorda com estes termos, não deve utilizar o software.',
      },
    ],
  },
  {
    number: 2,
    title: 'Licença de uso',
    blocks: [
      {
        label: 'Concessão de Licença:',
        text: 'Sujeito ao cumprimento destes Termos de Uso, a ClubMeal concede a você uma licença limitada, não exclusiva, intransferível e revogável para usar o software MerendaJá apenas para fins pessoais e não comerciais.',
      },
      {
        label: 'Restrições de Uso:',
        text: 'Você concorda em não (a) copiar, modificar ou criar obras derivadas do software; (b) realizar engenharia reversa, descompilar, ou tentar extrair o código-fonte do software; (c) alugar, arrendar, sublicenciar, ou distribuir o software para terceiros.',
      },
    ],
  },
  {
    number: 3,
    title: 'Atualizações',
    blocks: [
      {
        text: 'A ClubMeal pode fornecer atualizações, correções de bugs ou outras modificações do software periodicamente. Essas atualizações podem ser instaladas automaticamente, e você concorda em receber essas atualizações como parte do seu uso contínuo do software.',
      },
    ],
  },
  {
    number: 4,
    title: 'Propriedade intelectual',
    blocks: [
      {
        text: 'Todos os direitos, títulos e interesses relacionados ao software, incluindo, sem limitação, todos os direitos autorais, patentes, segredos comerciais, marcas registradas e outros direitos de propriedade intelectual são de propriedade exclusiva da ClubMeal. Estes Termos de Uso não concedem a você qualquer direito de propriedade intelectual sobre o software.',
      },
    ],
  },
  {
    number: 5,
    title: 'Coleta de dados e privacidade',
    blocks: [
      {
        text: 'Referente a como coletaremos e utilizaremos os dados coletados no período de experiência do usuário dentro do MerendaJá.',
      },
      {
        label: 'Coleta de dados:',
        text: 'A ClubMeal pode coletar informações sobre o uso do software, incluindo dados técnicos e informações relacionadas ao desempenho, para melhorar a funcionalidade do software.',
      },
      {
        label: 'Política de privacidade:',
        text: 'O uso do software está sujeito à Política de Segurança da ClubMeal, descrita a seguir.',
      },
      {
        label: 'Política de segurança — Introdução:',
        text: 'A segurança da informação é fundamental para a integridade, confidencialidade e disponibilidade dos dados e sistemas da ClubMeal. Esta política define as diretrizes para proteger as informações da empresa contra acesso não autorizado, uso indevido, divulgação, alteração e destruição.',
      },
      {
        label: 'Política de segurança — Objetivo:',
        text: 'Estabelecer um conjunto de regras para garantir a proteção das informações da ClubMeal, minimizando riscos e assegurando o cumprimento das leis e regulamentações aplicáveis.',
      },
      {
        label: 'Política de segurança — Escopo:',
        text: 'Aplica-se a todos os funcionários, contratados, prestadores de serviços, parceiros e terceiros que tenham acesso aos sistemas e informações da ClubMeal.',
      },
      {
        label: 'Diretrizes gerais — Confidencialidade:',
        text: 'Informações sensíveis devem ser acessíveis somente a indivíduos autorizados. O compartilhamento deve ser limitado ao mínimo necessário.',
      },
      {
        label: 'Diretrizes gerais — Integridade:',
        text: 'As informações devem ser protegidas contra alterações não autorizadas. Controle de versões e backups regulares devem ser implementados.',
      },
      {
        label: 'Diretrizes gerais — Disponibilidade:',
        text: 'Informações e sistemas devem estar disponíveis aos usuários autorizados sempre que necessário, com medidas de contingência para garantir a continuidade dos negócios.',
      },
      {
        label: 'Classificação da informação — Pública:',
        text: 'Informações que podem ser divulgadas ao público sem restrições.',
      },
      {
        label: 'Classificação da informação — Confidencial:',
        text: 'Informações que podem causar danos à empresa se divulgadas indevidamente.',
      },
      {
        label: 'Classificação da informação — Restrita:',
        text: 'Informações altamente sensíveis, que exigem o mais alto nível de proteção.',
      },
      {
        label: 'Controle de acesso — Autenticação e autorização:',
        text: 'Todos os usuários devem ter credenciais únicas e seguras. O acesso é concedido com base na necessidade de saber e no princípio do menor privilégio.',
      },
      {
        label: 'Controle de acesso — Gerenciamento de senhas:',
        text: 'Senhas devem ser complexas e trocadas regularmente. É proibido compartilhá-las.',
      },
      {
        label: 'Segurança física — Controle de acesso físico:',
        text: 'Somente pessoal autorizado pode acessar áreas onde informações sensíveis são armazenadas ou processadas.',
      },
      {
        label: 'Segurança física — Proteção de equipamentos:',
        text: 'Todos os dispositivos devem estar fisicamente seguros, especialmente quando transportados.',
      },
      {
        label: 'Uso de dispositivo e rede — Dispositivos pessoais:',
        text: 'O uso de dispositivos pessoais para acessar informações da empresa deve ser limitado e autorizado pela equipe de TI.',
      },
      {
        label: 'Uso de dispositivo e rede — Rede segura:',
        text: 'A conexão a redes públicas ou desconhecidas para acessar informações da empresa deve ser evitada. Redes virtuais privadas (VPNs) devem ser usadas quando necessário.',
      },
      {
        label: 'Treinamento e conscientização:',
        text: 'Todos os funcionários devem participar de treinamentos regulares em segurança da informação para entender suas responsabilidades e as melhores práticas.',
      },
      {
        label: 'Resposta a incidentes — Relatório:',
        text: 'Todo incidente de segurança deve ser reportado imediatamente ao departamento de TI ou ao responsável pela segurança da informação.',
      },
      {
        label: 'Resposta a incidentes — Gestão:',
        text: 'A equipe de resposta deve investigar, documentar e mitigar os efeitos de qualquer incidente de segurança.',
      },
      {
        label: 'Conformidade e auditoria — Conformidade:',
        text: 'A ClubMeal deve cumprir todas as leis e regulamentações aplicáveis à segurança da informação.',
      },
      {
        label: 'Conformidade e auditoria — Auditorias regulares:',
        text: 'Auditorias internas e externas devem ser conduzidas regularmente para garantir a aderência a esta política.',
      },
      {
        label: 'Revisão da política:',
        text: 'Esta política deve ser revisada anualmente, ou sempre que necessário, para garantir sua eficácia e conformidade com mudanças legais e tecnológicas.',
      },
      {
        label: 'Consentimento do usuário:',
        text: 'Antes da coleta de dados pessoais, o MerendaJá solicitará o consentimento explícito do usuário, informando de forma clara quais dados serão coletados, por quanto tempo serão armazenados, como poderão ser excluídos e qual finalidade serão utilizados. O consentimento será livre, informado e inequívoco, podendo ser revogado a qualquer momento através das configurações do sistema.',
      },
      {
        label: 'Política de cookies:',
        text: 'O aplicativo MerendaJá poderá se utilizar de cookies e de outras ferramentas como o armazenamento local para manter o login ativo do usuário, lembrar preferências do usuário tais como idioma e tema, melhorar a experiência do usuário e gerar estatísticas.',
      },
    ],
  },
  {
    number: 6,
    title: 'Limitação de responsabilidade',
    blocks: [
      {
        text: 'Em nenhuma circunstância a ClubMeal será responsável por quaisquer danos diretos, indiretos, incidentais, especiais, consequenciais ou punitivos decorrentes do uso ou da incapacidade de usar o software, mesmo que a ClubMeal tenha sido avisada da possibilidade de tais danos.',
      },
    ],
  },
  {
    number: 7,
    title: 'Garantia limitada',
    blocks: [
      {
        text: 'O software é fornecido "como está", sem garantias de qualquer tipo, expressas ou implícitas, incluindo, mas não se limitando a garantias de comercialização, adequação a um propósito específico ou não violação.',
      },
    ],
  },
  {
    number: 8,
    title: 'Rescisão',
    blocks: [
      {
        text: 'Estes Termos de Uso são efetivos até serem rescindidos. A ClubMeal pode rescindir estes Termos de Uso a qualquer momento, sem aviso prévio, se você violar qualquer uma das disposições aqui contidas. Após a rescisão, você deve cessar todo o uso do software e destruir todas as cópias do software em sua posse.',
      },
    ],
  },
  {
    number: 9,
    title: 'Disposições gerais',
    blocks: [
      {
        label: 'Legislação aplicável:',
        text: 'Estes Termos de Uso serão regidos e interpretados de acordo com as leis do Brasil, Estado de São Paulo, sem consideração aos conflitos de leis.',
      },
      {
        label: 'Alterações aos termos:',
        text: 'A ClubMeal reserva-se o direito de modificar estes Termos de Uso a qualquer momento. As modificações serão efetivas quando publicadas no site da Club Meal ou quando notificadas a você por qualquer outro meio.',
      },
      {
        label: 'Acordo integral:',
        text: 'Estes Termos de Uso constituem o acordo integral entre você e a ClubMeal em relação ao uso do software e substituem todos os entendimentos ou acordos anteriores, escritos ou orais, relativos ao assunto.',
      },
    ],
  },
  {
    number: 10,
    title: 'Contato',
    blocks: [
      {
        text: 'Se você tiver dúvidas sobre estes Termos de Uso, entre em contato com a ClubMeal em clubmeal74@gmail.com.',
      },
    ],
  },
];

export default function TermsOfUseScreen() {
  const { theme } = useAccessibility();

  const { isSmallScreen, fontScale } = useResponsive();
  const compacto = isSmallScreen || fontScale >= 1.2;

  const styles = useMemo(
    () => createStyles(theme, compacto),
    [theme, compacto]
  );

  const scrollRef = useRef<ScrollView>(null);
  const positions = useRef<Record<number, number>>({});

  const scrollToSection = (number: number) => {
    const y = positions.current[number];

    if (y !== undefined) {
      scrollRef.current?.scrollTo({
        y: Math.max(0, y - 12),
        animated: true,
      });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Termos de Uso" />

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ResponsiveContainer style={styles.body}>
          <Text style={styles.updatedAt}>
            Última atualização: 23 de agosto de 2026
          </Text>

          <View style={styles.indexCard}>
            <Text style={styles.indexTitle}>Neste documento</Text>

            {SECTIONS.map((section) => (
              <TouchableOpacity
                key={section.number}
                onPress={() => scrollToSection(section.number)}
                style={styles.indexRow}
                accessibilityRole="button"
                accessibilityLabel={`Ir para ${section.title}`}
              >
                <Text style={styles.indexNumber}>{section.number}.</Text>

                <Text style={styles.indexLink}>{section.title}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {SECTIONS.map((section) => (
            <View
              key={section.number}
              style={styles.card}
              onLayout={(e) => {
                positions.current[section.number] = e.nativeEvent.layout.y;
              }}
            >
              <View style={styles.cardHeader}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{section.number}</Text>
                </View>

                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>

              {section.blocks.map((block, index) => (
                <View
                  key={index}
                  style={index > 0 ? styles.blockSpacing : undefined}
                >
                  {block.label ? (
                    <Text style={styles.label}>{block.label}</Text>
                  ) : null}

                  <Text style={styles.paragraph}>{block.text}</Text>
                </View>
              ))}
            </View>
          ))}
        </ResponsiveContainer>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any, compacto: boolean) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.background,
    },

    scrollContent: {
      flexGrow: 1,
      paddingBottom: compacto ? 24 : 40,
    },

    body: {
      flex: 0,
      paddingTop: compacto ? 14 : 18,
      paddingBottom: compacto ? 12 : 20,
    },

    updatedAt: {
      fontSize: compacto ? 11 : 12,
      color: theme.textMuted,
      marginBottom: 16,
    },

    indexCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: compacto ? 13 : 16,
      marginBottom: 16,
      borderColor: theme.border,
      borderWidth: theme.borderWidth,
    },

    indexTitle: {
      fontSize: compacto ? 12 : 13,
      fontWeight: '700',
      color: theme.text,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
    },

    indexRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: compacto ? 7 : 6,
      minHeight: 36,
    },

    indexNumber: {
      width: 28,
      fontSize: compacto ? 13 : 14,
      color: theme.textMuted,
    },

    indexLink: {
      flex: 1,
      flexShrink: 1,
      fontSize: compacto ? 13 : 14,
      color: theme.text,
    },

    card: {
      width: '100%',
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: compacto ? 13 : 16,
      marginBottom: 12,
      borderColor: theme.border,
      borderWidth: theme.borderWidth,
    },

    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 8,
    },

    badge: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: theme.soft,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    },

    badgeText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text,
    },

    sectionTitle: {
      flex: 1,
      flexShrink: 1,
      fontSize: compacto ? 14 : 15,
      fontWeight: '700',
      color: theme.text,
    },

    blockSpacing: {
      marginTop: compacto ? 12 : 14,
    },

    label: {
      fontSize: compacto ? 13 : 14,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 3,
    },

    paragraph: {
      fontSize: compacto ? 13 : 14,
      color: theme.textSecondary,
      lineHeight: compacto ? 20 : 21,
    },
  });