import React, { useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import Text from '../components/AppText';
import { useAccessibility } from '../components/AccessibilityContext';

// Cada bloco pode ter:
// - groupTitle: título grande de um grupo (ex.: "Política de Segurança")
// - heading: título de subseção (ex.: "Introdução")
// - label: subtópico em negrito (ex.: "Confidencialidade:")
// - text: o texto do bloco
type Block = {
  groupTitle?: string;
  heading?: string;
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
        text: 'O uso do software está sujeito à Política de Segurança da ClubMeal, descrita abaixo.',
      },
      {
        label: 'Consentimento do usuário:',
        text: 'Antes da coleta de dados pessoais, o MerendaJá solicitará o consentimento explícito do usuário, informando de forma clara quais dados serão coletados, por quanto tempo serão armazenados, como poderão ser excluídos e qual finalidade serão utilizados. O consentimento será livre, informado e inequívoco, podendo ser revogado a qualquer momento através das configurações do sistema.',
      },
      {
        label: 'Política de cookies:',
        text: 'O aplicativo MerendaJá poderá se utilizar de cookies e de outras ferramentas como o armazenamento local para manter o login ativo do usuário, lembrar preferências do usuário tais como idioma e tema, melhorar a experiência do usuário e gerar estatísticas.',
      },

      // ===== Política de Segurança =====
      {
        groupTitle: 'Política de Segurança',
        heading: 'Introdução',
        text: 'A segurança da informação é fundamental para a integridade, confidencialidade e disponibilidade dos dados e sistemas da ClubMeal. Esta política define as diretrizes para proteger as informações da empresa contra acesso não autorizado, uso indevido, divulgação, alteração e destruição.',
      },
      {
        heading: 'Objetivo',
        text: 'O objetivo desta política é estabelecer um conjunto de regras para garantir a proteção das informações da ClubMeal, minimizando riscos e assegurando o cumprimento das leis e regulamentações aplicáveis.',
      },
      {
        heading: 'Escopo',
        text: 'Esta política se aplica a todos os funcionários, contratados, prestadores de serviços, parceiros e terceiros que tenham acesso aos sistemas e informações da ClubMeal.',
      },
      {
        heading: 'Diretrizes gerais',
        label: 'Confidencialidade:',
        text: 'Todas as informações sensíveis devem ser acessíveis somente a indivíduos autorizados. O compartilhamento de informações deve ser limitado ao mínimo necessário.',
      },
      {
        label: 'Integridade:',
        text: 'As informações devem ser protegidas contra alterações não autorizadas. Sistemas de controle de versões e backups regulares devem ser implementados para preservar a integridade dos dados.',
      },
      {
        label: 'Disponibilidade:',
        text: 'As informações e os sistemas devem estar disponíveis para os usuários autorizados sempre que necessário, com medidas de contingência em vigor para garantir a continuidade dos negócios.',
      },
      {
        heading: 'Classificação da informação',
        text: 'As informações da ClubMeal devem ser classificadas em diferentes níveis de sensibilidade, como:',
      },
      {
        label: 'Pública:',
        text: 'Informações que podem ser divulgadas ao público sem restrições.',
      },
      {
        label: 'Confidencial:',
        text: 'Informações que podem causar danos à empresa se divulgadas indevidamente.',
      },
      {
        label: 'Restrita:',
        text: 'Informações altamente sensíveis que exigem o mais alto nível de proteção.',
      },
      {
        heading: 'Controle de acesso',
        label: 'Autenticação e Autorização:',
        text: 'Todos os usuários devem ter credenciais únicas e seguras. O acesso aos sistemas e dados deve ser concedido com base na necessidade de saber e no princípio do menor privilégio.',
      },
      {
        label: 'Gerenciamento de Senhas:',
        text: 'Senhas devem ser complexas e trocadas regularmente. É proibido o compartilhamento de senhas.',
      },
      {
        heading: 'Segurança física',
        label: 'Controle de Acesso Físico:',
        text: 'Somente pessoal autorizado pode acessar áreas onde informações sensíveis são armazenadas ou processadas.',
      },
      {
        label: 'Proteção de Equipamentos:',
        text: 'Todos os dispositivos devem estar fisicamente seguros, especialmente quando transportados.',
      },
      {
        heading: 'Uso de dispositivo e rede',
        label: 'Dispositivos Pessoais:',
        text: 'O uso de dispositivos pessoais para acessar informações da empresa deve ser limitado e autorizado pela equipe de TI.',
      },
      {
        label: 'Rede Segura:',
        text: 'A conexão a redes públicas ou desconhecidas para acessar informações da empresa deve ser evitada. Redes virtuais privadas (VPNs) devem ser usadas quando necessário.',
      },
      {
        heading: 'Treinamento e conscientização',
        text: 'Todos os funcionários devem participar de programas regulares de treinamento em segurança da informação para entender suas responsabilidades e as melhores práticas.',
      },
      {
        heading: 'Resposta a incidentes',
        label: 'Relatório de Incidentes:',
        text: 'Todos os incidentes de segurança devem ser reportados imediatamente ao departamento de TI ou ao responsável pela segurança da informação.',
      },
      {
        label: 'Gestão de Incidentes:',
        text: 'A equipe de resposta a incidentes deve investigar, documentar e mitigar os efeitos de qualquer incidente de segurança.',
      },
      {
        heading: 'Conformidade e auditoria',
        label: 'Conformidade:',
        text: 'A ClubMeal deve assegurar o cumprimento de todas as leis e regulamentações aplicáveis relacionadas à segurança da informação.',
      },
      {
        label: 'Auditorias Regulares:',
        text: 'Auditorias internas e externas devem ser conduzidas regularmente para garantir a aderência a esta política.',
      },
      {
        heading: 'Revisão da política',
        text: 'Esta política deve ser revisada anualmente, ou sempre que necessário, para garantir sua eficácia e conformidade com as mudanças legais e tecnológicas.',
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
        text: 'A ClubMeal reserva-se o direito de modificar estes Termos de Uso a qualquer momento. As modificações serão efetivas quando publicadas no site da ClubMeal ou quando notificadas a você por qualquer outro meio.',
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
  const styles = createStyles(theme);

  const scrollRef = useRef<ScrollView>(null);
  const positions = useRef<Record<number, number>>({});

  const scrollToSection = (number: number) => {
    const y = positions.current[number];
    if (y !== undefined) {
      scrollRef.current?.scrollTo({ y: y - 12, animated: true });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Termos de Uso" />

      <ScrollView ref={scrollRef} contentContainerStyle={styles.body}>
        <Text style={styles.updatedAt}>
          Última atualização: 23 de agosto de 2026
        </Text>

        {/* Índice */}
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

        {/* Seções */}
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
                style={
                  block.groupTitle
                    ? null
                    : index > 0
                    ? block.heading
                      ? styles.headingSpacing
                      : styles.blockSpacing
                    : null
                }
              >
                {block.groupTitle ? (
                  <Text style={styles.groupTitle}>{block.groupTitle}</Text>
                ) : null}

                {block.heading ? (
                  <Text style={styles.heading}>{block.heading}</Text>
                ) : null}

                {block.label ? (
                  <Text style={styles.label}>{block.label}</Text>
                ) : null}

                <Text style={styles.paragraph}>{block.text}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.background,
    },

    body: {
      padding: 22,
      paddingBottom: 40,
    },

    updatedAt: {
      fontSize: 12,
      color: theme.textMuted,
      marginBottom: 16,
    },

    // Índice
    indexCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderColor: theme.border,
      borderWidth: theme.borderWidth,
    },

    indexTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
    },

    indexRow: {
      flexDirection: 'row',
      paddingVertical: 6,
    },

    indexNumber: {
      width: 28,
      fontSize: 14,
      color: theme.textMuted,
    },

    indexLink: {
      flex: 1,
      fontSize: 14,
      color: theme.text,
    },

    // Seções
    card: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderColor: theme.border,
      borderWidth: theme.borderWidth,
    },

    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },

    badge: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: theme.soft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },

    badgeText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text,
    },

    sectionTitle: {
      flex: 1,
      fontSize: 15,
      fontWeight: '700',
      color: theme.text,
    },

    blockSpacing: {
      marginTop: 14,
    },

    headingSpacing: {
      marginTop: 20,
    },

    // Título do grupo (ex.: Política de Segurança)
    groupTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text,
      marginTop: 24,
      marginBottom: 12,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.divider,
    },

    // Título de subseção (ex.: Introdução, Objetivo)
    heading: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.primary,
      marginBottom: 6,
    },

    label: {
      fontSize: 14,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 2,
    },

    paragraph: {
      fontSize: 14,
      color: theme.textSecondary,
      lineHeight: 21,
    },
  });