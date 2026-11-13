import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';

import ScreenHeader from '../components/ScreenHeader';
import LabeledInput from '../components/LabeledInput';
import BotaoPrimario from '../components/BotaoPrimario';
import {
  useAccessibility,
  AccessibilityTheme,
} from '../components/AccessibilityContext';
import {
  Refeicao,
  TipoRefeicao,
  adicionarRefeicaoNaData,
  assinarDatasComCardapio,
  atualizarRefeicaoDaData,
  excluirRefeicaoDaData,
} from './services/cardapio';
import Text from '../components/AppText';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { dataISO } from './services/refeicaoUtils';

import { useResponsive } from '../hooks/useResponsive';
import ResponsiveContainer from '../components/ResponsiveContainer';

const CORES = ['#FFD79A', '#FFB27A', '#FFC845', '#FF9E7A', '#B7E4C7'];

const ICONES = [
  'bread-slice',
  'food',
  'fruit-cherries',
  'coffee',
  'cup',
  'food-apple',
];

const CATEGORIAS: { id: TipoRefeicao; nome: string }[] = [
  { id: 'cafe', nome: 'Café da manhã' },
  { id: 'almoco', nome: 'Almoço' },
  { id: 'jantar', nome: 'Jantar' },
];

LocaleConfig.locales['pt-br'] = {
  monthNames: [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ],
  monthNamesShort: [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ],
  dayNames: [
    'Domingo',
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado',
  ],
  dayNamesShort: [
    'Dom',
    'Seg',
    'Ter',
    'Qua',
    'Qui',
    'Sex',
    'Sáb',
  ],
  today: 'Hoje',
};

LocaleConfig.defaultLocale = 'pt-br';

function dataPorExtenso(iso: string) {
  if (!iso) return '';

  const [a, m, d] = iso.split('-').map(Number);

  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date(a, m - 1, d));
}

export default function AddRefeicao() {
  const router = useRouter();

  const { theme } = useAccessibility();

  const { isSmallScreen, fontScale } = useResponsive();
  const compacto = isSmallScreen || fontScale >= 1.2;

  const styles = useMemo(
    () => createStyles(theme, compacto),
    [theme, compacto]
  );

  const params = useLocalSearchParams<{
    dia?: string;
    data?: string;
    index?: string;
    titulo?: string;
    horario?: string;
    desc?: string;
    icon?: string;
    color?: string;
    tipo?: TipoRefeicao;
  }>();

  const modoEdicao = params.index !== undefined;

  const [data, setData] = useState(params.data || '');

  const [mesVisivel, setMesVisivel] = useState(
    (params.data || dataISO()).slice(0, 7)
  );

  const [datasComCardapio, setDatasComCardapio] = useState<string[]>([]);
  const [titulo, setTitulo] = useState(params.titulo ?? '');
  const [horario, setHorario] = useState(params.horario ?? '');
  const [desc, setDesc] = useState(params.desc ?? '');
  const [icon, setIcon] = useState(params.icon ?? ICONES[0]);
  const [color, setColor] = useState(params.color ?? CORES[0]);

  const [tipo, setTipo] = useState<TipoRefeicao | ''>(
    params.tipo ?? ''
  );

  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const scrollRef = useRef<ScrollView>(null);

  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  useEffect(() => {
    if (modoEdicao) return;

    return assinarDatasComCardapio(
      `${mesVisivel}-01`,
      `${mesVisivel}-31`,
      setDatasComCardapio,
      (e) =>
        console.error(
          'Erro ao carregar datas com cardápio:',
          e
        )
    );
  }, [mesVisivel, modoEdicao]);

  const marcados: Record<string, any> = {};

  datasComCardapio.forEach((d) => {
    marcados[d] = {
      marked: true,
      dotColor: theme.primary,
    };
  });

  if (data) {
    marcados[data] = {
      ...(marcados[data] ?? {}),
      selected: true,
      selectedColor: theme.primary,
    };
  }

  async function salvar() {
    setErro(null);
    setSucesso(false);

    const tituloNormalizado = titulo.trim();
    const descNormalizado = desc.trim();

    if (!data) {
      setErro('Selecione a data dessa refeição.');
      return;
    }

    if (!modoEdicao && data < dataISO()) {
      setErro(
        'Não é possível cadastrar refeições em datas que já passaram.'
      );
      return;
    }

    if (!tituloNormalizado || !descNormalizado || !horario.trim()) {
      setErro(
        'Preencha o título, o horário e a descrição da refeição.'
      );
      return;
    }

    if (!tipo) {
      setErro('Selecione a categoria da refeição.');
      return;
    }

    setSalvando(true);

    const refeicao: Refeicao = {
      titulo: tituloNormalizado,
      horario: horario.trim(),
      desc: descNormalizado,
      icon,
      color,
      data,
      tipo,
    };

    try {
      if (modoEdicao) {
        await atualizarRefeicaoDaData(
          data,
          Number(params.index),
          refeicao
        );
      } else {
        await adicionarRefeicaoNaData(data, refeicao);
      }

      setSucesso(true);

      setTimeout(() => router.back(), 600);
    } catch (error: any) {
      console.error('Erro ao salvar refeição:', error);

      if (error?.code === 'permission-denied') {
        setErro(
          'Permissão negada pelo Firestore. Verifique as Security Rules da coleção "cardapios".'
        );
      } else if (
        error?.code === 'unavailable' ||
        error?.code === 'network-request-failed'
      ) {
        setErro(
          'Sem conexão com o servidor. Verifique sua internet e tente novamente.'
        );
      } else {
        setErro(
          `Não foi possível salvar a refeição. (${error?.code ?? error?.message ?? 'erro desconhecido'})`
        );
      }
    } finally {
      setSalvando(false);
    }
  }

  async function executarExclusao() {
    setErro(null);
    setExcluindo(true);

    try {
      await excluirRefeicaoDaData(
        data,
        Number(params.index)
      );

      router.back();
    } catch (error: any) {
      console.error('Erro ao excluir refeição:', error);

      if (error?.code === 'permission-denied') {
        setErro(
          'Permissão negada pelo Firestore ao excluir a refeição. Verifique as Security Rules.'
        );
      } else {
        setErro(
          `Não foi possível excluir a refeição. (${error?.code ?? error?.message ?? 'erro desconhecido'})`
        );
      }

      scrollRef.current?.scrollTo({
        y: 0,
        animated: true,
      });

      setExcluindo(false);
    }
  }

  function confirmarExclusao() {
    Alert.alert(
      'Excluir refeição',
      `Tem certeza que deseja excluir "${titulo}" de ${dataPorExtenso(data)}? Essa ação não pode ser desfeita.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: executarExclusao,
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title={
          modoEdicao
            ? 'Editar refeição'
            : 'Adicionar refeição'
        }
      />

      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ResponsiveContainer style={styles.formulario}>
            {erro && (
              <View
                style={styles.bannerErro}
                testID="add-refeicao-erro"
              >
                <Ionicons
                  name="alert-circle"
                  size={18}
                  color={theme.error}
                />

                <Text style={styles.bannerErroText}>
                  {erro}
                </Text>
              </View>
            )}

            {sucesso && (
              <View
                style={styles.bannerSucesso}
                testID="add-refeicao-sucesso"
              >
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={theme.success}
                />

                <Text style={styles.bannerSucessoText}>
                  Refeição salva!
                </Text>
              </View>
            )}

            <Text style={styles.label}>
              Data
            </Text>

            {modoEdicao ? (
              <>
                <View style={styles.dataBox}>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={18}
                    color={theme.primary}
                  />

                  <Text style={styles.dataBoxText}>
                    {dataPorExtenso(data)}
                  </Text>
                </View>

                <Text style={styles.hintEdicao}>
                  Não é possível trocar a data ao editar uma refeição já existente.
                </Text>
              </>
            ) : (
              <>
                <View style={styles.calendarWrap}>
                  <Calendar
                    key={theme.background}
                    current={data || dataISO()}
                    minDate={dataISO()}
                    disabledDaysIndexes={[0, 6]}
                    disableAllTouchEventsForDisabledDays
                    onDayPress={(d) => setData(d.dateString)}
                    onMonthChange={(m) =>
                      setMesVisivel(m.dateString.slice(0, 7))
                    }
                    markedDates={marcados}
                    theme={{
                      calendarBackground: theme.card,
                      backgroundColor: theme.card,
                      dayTextColor: theme.text,
                      monthTextColor: theme.text,
                      textSectionTitleColor: theme.textMuted,
                      textDisabledColor: theme.placeholder,
                      todayTextColor: theme.primary,
                      arrowColor: theme.primary,
                      selectedDayBackgroundColor: theme.primary,
                      selectedDayTextColor: theme.onPrimary,
                      dotColor: theme.primary,
                      selectedDotColor: theme.onPrimary,
                    }}
                  />
                </View>

                {data ? (
                  <Text style={styles.hint}>
                    Selecionado: {dataPorExtenso(data)}
                  </Text>
                ) : null}
              </>
            )}

            <Text style={styles.label}>
              Categoria da refeição
            </Text>

            <View style={styles.row}>
              {CATEGORIAS.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => setTipo(item.id)}
                  disabled={salvando}
                  style={[
                    styles.categoriaOption,
                    tipo === item.id && styles.categoriaOptionActive,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{
                    selected: tipo === item.id,
                    disabled: salvando,
                  }}
                >
                  <Text
                    style={[
                      styles.categoriaText,
                      tipo === item.id && styles.categoriaTextActive,
                    ]}
                  >
                    {item.nome}
                  </Text>
                </Pressable>
              ))}
            </View>

            <LabeledInput
              testID="refeicao-titulo-input"
              label="Título"
              placeholder="Ex: Almoço"
              editable={!salvando}
              value={titulo}
              onChangeText={setTitulo}
              containerStyle={styles.inputTitulo}
            />

            <LabeledInput
              testID="refeicao-horario-input"
              label="Horário"
              placeholder="Ex: 11:30 - 12:30"
              editable={!salvando}
              value={horario}
              onChangeText={setHorario}
              containerStyle={styles.inputPadrao}
            />

            <LabeledInput
              testID="refeicao-desc-input"
              label="Descrição"
              placeholder="Ex: Arroz, feijão, frango grelhado"
              multiline
              editable={!salvando}
              value={desc}
              onChangeText={setDesc}
              containerStyle={styles.inputPadrao}
            />

            <Text style={styles.label}>
              Ícone
            </Text>

            <View style={styles.row}>
              {ICONES.map((i) => (
                <Pressable
                  key={i}
                  testID={`icone-${i}`}
                  onPress={() => setIcon(i)}
                  disabled={salvando}
                  style={[
                    styles.iconOption,
                    icon === i && styles.iconOptionActive,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Selecionar ícone ${i}`}
                  accessibilityState={{
                    selected: icon === i,
                    disabled: salvando,
                  }}
                >
                  <MaterialCommunityIcons
                    name={i as any}
                    size={22}
                    color={
                      icon === i
                        ? theme.onPrimary
                        : theme.textMuted
                    }
                  />
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>
              Cor
            </Text>

            <View style={styles.row}>
              {CORES.map((c) => (
                <Pressable
                  key={c}
                  testID={`cor-${c}`}
                  onPress={() => setColor(c)}
                  disabled={salvando}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: c },
                    color === c && styles.colorSwatchActive,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Selecionar cor ${c}`}
                  accessibilityState={{
                    selected: color === c,
                    disabled: salvando,
                  }}
                >
                  {color === c && (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color="#fff"
                    />
                  )}
                </Pressable>
              ))}
            </View>

            <BotaoPrimario
              testID="salvar-refeicao-button"
              title={
                salvando
                  ? 'Salvando...'
                  : modoEdicao
                    ? 'Salvar alterações'
                    : 'Adicionar'
              }
              onPress={salvar}
              disabled={salvando || excluindo}
              style={styles.botaoPrincipal}
            />

            {modoEdicao && (
              <Pressable
                testID="excluir-refeicao-button"
                style={[
                  styles.botaoExcluir,
                  (salvando || excluindo) &&
                    styles.botaoExcluirDesabilitado,
                ]}
                onPress={confirmarExclusao}
                disabled={salvando || excluindo}
                accessibilityRole="button"
                accessibilityState={{
                  disabled: salvando || excluindo,
                }}
              >
                {excluindo ? (
                  <ActivityIndicator color={theme.error} />
                ) : (
                  <>
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={theme.error}
                    />

                    <Text style={styles.botaoExcluirText}>
                      Excluir refeição
                    </Text>
                  </>
                )}
              </Pressable>
            )}
          </ResponsiveContainer>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (
  theme: AccessibilityTheme,
  compacto: boolean
) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: theme.background,
    },

    keyboard: {
      flex: 1,
    },

    body: {
      paddingTop: compacto ? 8 : 12,
      paddingBottom: 35,
    },

    formulario: {
      flex: 0,
    },

    label: {
      fontSize: compacto ? 13 : 14,
      color: theme.text,
      fontWeight: '600',
      marginTop: compacto ? 15 : 18,
      marginBottom: 8,
    },

    hint: {
      fontSize: 12,
      color: theme.textMuted,
      marginTop: 10,
      marginBottom: 12,
      lineHeight: 18,
    },

    hintEdicao: {
      fontSize: 12,
      color: theme.textMuted,
      marginTop: 14,
      marginBottom: 4,
      lineHeight: 18,
    },

    row: {
      flexDirection: 'row',
      gap: 10,
      flexWrap: 'wrap',
      alignItems: 'center',
    },

    categoriaOption: {
      paddingVertical: 11,
      paddingHorizontal: 14,
      borderRadius: 12,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.inputBorder,
    },

    categoriaOptionActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },

    categoriaText: {
      color: theme.text,
      fontSize: 13,
      fontWeight: '600',
    },

    categoriaTextActive: {
      color: theme.onPrimary,
    },

    iconOption: {
      width: compacto ? 42 : 44,
      height: compacto ? 42 : 44,
      borderRadius: 12,
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },

    iconOptionActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },

    colorSwatch: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },

    colorSwatchActive: {
      borderColor: theme.text,
    },

    bannerErro: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      backgroundColor: theme.errorBg,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
    },

    bannerErroText: {
      flex: 1,
      color: theme.error,
      fontSize: 13,
      fontWeight: '600',
      lineHeight: 19,
    },

    bannerSucesso: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: theme.successBg,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
    },

    bannerSucessoText: {
      flex: 1,
      color: theme.success,
      fontSize: 13,
      fontWeight: '600',
    },

    botaoPrincipal: {
      marginTop: compacto ? 20 : 24,
    },

    botaoExcluir: {
      marginTop: 12,
      minHeight: 48,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.error,
      backgroundColor: theme.card,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },

    botaoExcluirDesabilitado: {
      opacity: 0.6,
    },

    botaoExcluirText: {
      color: theme.error,
      fontSize: 15,
      fontWeight: '600',
    },

    calendarWrap: {
      backgroundColor: theme.card,
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.inputBorder,
    },

    dataBox: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.inputBorder,
      padding: 14,
    },

    dataBoxText: {
      flex: 1,
      flexShrink: 1,
      color: theme.text,
      fontSize: 14,
      fontWeight: '700',
    },

    inputTitulo: {
      marginTop: 16,
    },

    inputPadrao: {
      marginTop: 14,
    },
  });
