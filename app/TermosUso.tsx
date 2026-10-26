import React, { useRef } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { colors } from '../constants/theme';
import Text from '../components/AppText';  

// Cada bloco pode ter um "label" (subtópico em negrito) e o "text".
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
        text: 'O uso do software está sujeito à Política de Privacidade da ClubMeal, que pode ser acessada em link para a Política de Privacidade.',
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
        text: 'Em nenhuma circunstância a ClubMeal será responsável por quaisquer danos diretos, indiretos, incidentais, especiais, consequenciais ou punitivos decorrentes do uso ou da incapacidade de usar o software, mesmo que a ClubMeal tenha sido avisada da possibilidade de tais danos',
      },
    ],
  },
  {
    number: 7,
    title: 'Garantia limitada',
    blocks: [
      {
        text: 'O software é fornecido "como está", sem garantias de qualquer tipo, expressas ou implícitas, incluindo, mas não se limitando a garantias de comercialização, adequação a um propósito específico ou não violação',
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
        text: 'A ClubMeal reserva-se o direito de modificar estes Termos de Uso a qualquer momento. As modificações serão efetivas quando publicadas no site da Club Meal ou quando notificadas a você por qualquer outro meio',
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
  const scrollRef = useRef<ScrollView>(null);
  const positions = useRef<Record<number, number>>({});

  const scrollToSection = (number: number) => {
    const y = positions.current[number];
    if (y !== undefined) {
      scrollRef.current?.scrollTo({ y: y - 12, animated: true });
    }
  };

  // ... o return continua igual

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Termos de Uso" />
      <ScrollView ref={scrollRef} contentContainerStyle={styles.body}>
        <Text style={styles.updatedAt}>Última atualização: 23 de agosto de 2026</Text>

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
              <View key={index} style={index > 0 ? styles.blockSpacing : null}>
                {block.label ? <Text style={styles.label}>{block.label}</Text> : null}
                <Text style={styles.paragraph}>{block.text}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  body: { padding: 22, paddingBottom: 40 },
  updatedAt: {
    fontSize: 12,
    color: '#999',
    marginBottom: 16,
  },

  // Índice
  indexCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  indexTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
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
    color: '#999',
  },
  indexLink: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },

  // Seções
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
    backgroundColor: '#eee',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },
  blockSpacing: {
    marginTop: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    marginBottom: 2,
  },
  paragraph: {
    fontSize: 14,
    color: '#555',
    lineHeight: 21,
  },
});