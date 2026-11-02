import React, { useState, useEffect, useRef} from 'react';
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
import { colors } from '../constants/theme';
import {
  adicionarRefeicao,
  assinarCardapioDia,
  salvarRefeicoesDoDia,
  salvarCardapioPorData,
  Refeicao,
  excluirRefeicao,
  adicionarRefeicaoNaData,
  assinarDatasComCardapio,
  atualizarRefeicaoDaData,
  excluirRefeicaoDaData,
} from './services/cardapio';
import Text from '../components/AppText';  
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { dataISO } from './services/refeicaoUtils';

const CORES = ['#FFD79A', '#FFB27A', '#FFC845', '#FF9E7A', '#B7E4C7'];
const ICONES = ['bread-slice', 'food', 'fruit-cherries', 'coffee', 'cup', 'food-apple'];

LocaleConfig.locales['pt-br'] = {
  monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
  monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
  dayNames: ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'],
  dayNamesShort: ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'],
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
  const params = useLocalSearchParams<{
    dia?: string;
    data?: string;
    index?: string;
    titulo?: string;
    horario?: string;
    desc?: string;
    icon?: string;
    color?: string;
  }>();

  const modoEdicao = params.index !== undefined;

  const [data, setData] = useState(params.data || '');
  const [mesVisivel, setMesVisivel] = useState((params.data || dataISO()).slice(0, 7));
  const [datasComCardapio, setDatasComCardapio] = useState<string[]>([]);
  const [titulo, setTitulo] = useState(params.titulo ?? '');
  const [horario, setHorario] = useState(params.horario ?? '');
  const [desc, setDesc] = useState(params.desc ?? '');
  const [icon, setIcon] = useState(params.icon ?? ICONES[0]);
  const [color, setColor] = useState(params.color ?? CORES[0]);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const scrollRef = useRef<ScrollView>(null);


  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);

  // Pontinhos nos dias que já têm refeição (só no modo de adicionar)
  useEffect(() => {
    if (modoEdicao) return;
    return assinarDatasComCardapio(
      `${mesVisivel}-01`,
      `${mesVisivel}-31`, // comparação de texto: '2026-11-31' cobre o mês todo
      setDatasComCardapio,
      (e) => console.error('Erro ao carregar datas com cardápio:', e)
    );
  }, [mesVisivel, modoEdicao]);

  const marcados: Record<string, any> = {};
  datasComCardapio.forEach((d) => {
    marcados[d] = { marked: true, dotColor: colors.primary };
  });
  if (data) {
    marcados[data] = {
      ...(marcados[data] ?? {}),
      selected: true,
      selectedColor: colors.primary,
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
    setErro('Não é possível cadastrar refeições em datas que já passaram.');
    return;
  }

  if (!tituloNormalizado || !descNormalizado || !horario.trim()) {
    setErro('Preencha o título, o horário e a descrição da refeição.');
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
  };

  try {
    if (modoEdicao) {
      await atualizarRefeicaoDaData(data, Number(params.index), refeicao);
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
    } else if (error?.code === 'unavailable' || error?.code === 'network-request-failed') {
      setErro('Sem conexão com o servidor. Verifique sua internet e tente novamente.');
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
    await excluirRefeicaoDaData(data, Number(params.index));
    router.back();
  } catch (error: any) {
    console.error('Erro ao excluir refeição:', error);

    if (error?.code === 'permission-denied') {
      setErro('Permissão negada pelo Firestore ao excluir a refeição. Verifique as Security Rules.');
    } else {
      setErro(`Não foi possível excluir a refeição. (${error?.code ?? error?.message ?? 'erro desconhecido'})`);
    }
    scrollRef.current?.scrollTo({ y: 0, animated: true });
    setExcluindo(false);
  }
}

function confirmarExclusao() {
  Alert.alert(
    'Excluir refeição',
    `Tem certeza que deseja excluir "${titulo}" de ${dataPorExtenso(data)}? Essa ação não pode ser desfeita.`,
    [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: executarExclusao },
    ]
  );
}


  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title={modoEdicao ? 'Editar refeição' : 'Adicionar refeição'} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
          {erro && (
            <View style={styles.bannerErro} testID="add-refeicao-erro">
              <Ionicons name="alert-circle" size={18} color="#B3261E" />
              <Text style={styles.bannerErroText}>{erro}</Text>
            </View>
          )}

          {sucesso && (
            <View style={styles.bannerSucesso} testID="add-refeicao-sucesso">
              <Ionicons name="checkmark-circle" size={18} color="#2E7D32" />
              <Text style={styles.bannerSucessoText}>Refeição salva!</Text>
            </View>
          )}

          <Text style={styles.label}>Data</Text>

          {modoEdicao ? (
            <>
              <View style={styles.dataBox}>
                <MaterialCommunityIcons name="calendar" size={18} color={colors.primary} />
                <Text style={styles.dataBoxText}>{dataPorExtenso(data)}</Text>
              </View>
              <Text style={styles.hintEdicao}>
                Não é possível trocar a data ao editar uma refeição já existente.
              </Text>
            </>
          ) : (
            <>
              <View style={styles.calendarWrap}>
                <Calendar
                  current={data || dataISO()}
                  minDate={dataISO()}                       // bloqueia datas passadas
                  disabledDaysIndexes={[0, 6]}              // sem sábado e domingo
                  disableAllTouchEventsForDisabledDays
                  onDayPress={(d) => setData(d.dateString)}
                  onMonthChange={(m) => setMesVisivel(m.dateString.slice(0, 7))}
                  markedDates={marcados}
                  theme={{
                    todayTextColor: colors.primary,
                    arrowColor: colors.primary,
                    selectedDayBackgroundColor: colors.primary,
                  }}
                />
              </View>
              {data ? (
                <Text style={styles.hint}>Selecionado: {dataPorExtenso(data)}</Text>
              ) : null}
            </>
          )}

          <LabeledInput
            testID="refeicao-titulo-input"
            label="Título"
            placeholder="Ex: Almoço"
            editable={!salvando}
            value={titulo}
            onChangeText={setTitulo}
            containerStyle={{ marginTop: 16 }}
          />

          <LabeledInput
            testID="refeicao-horario-input"
            label="Horário"
            placeholder="Ex: 11:30 - 12:30"
            editable={!salvando}
            value={horario}
            onChangeText={setHorario}
            containerStyle={{ marginTop: 14 }}
          />

          <LabeledInput
            testID="refeicao-desc-input"
            label="Descrição"
            placeholder="Ex: Arroz, feijão, frango grelhado"
            multiline
            editable={!salvando}
            value={desc}
            onChangeText={setDesc}
            containerStyle={{ marginTop: 14 }}
          />

          <Text style={styles.label}>Ícone</Text>
          <View style={styles.row}>
            {ICONES.map((i) => (
              <Pressable
                key={i}
                testID={`icone-${i}`}
                onPress={() => setIcon(i)}
                disabled={salvando}
                style={[styles.iconOption, icon === i && styles.iconOptionActive]}
              >
                <MaterialCommunityIcons
                  name={i as any}
                  size={22}
                  color={icon === i ? '#fff' : colors.textMuted}
                />
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Cor</Text>
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
              >
                {color === c && <Ionicons name="checkmark" size={16} color="#fff" />}
              </Pressable>
            ))}
          </View>

          <BotaoPrimario
            testID="salvar-refeicao-button"
            title={salvando ? 'Salvando...' : modoEdicao ? 'Salvar alterações' : 'Adicionar'}
            onPress={salvar}
            disabled={salvando || excluindo}
            style={{ marginTop: 24 }}
          />

          {modoEdicao && (
            <Pressable
              testID="excluir-refeicao-button"
              style={[styles.botaoExcluir, (salvando || excluindo) && { opacity: 0.6 }]}
              onPress={confirmarExclusao}
              disabled={salvando || excluindo}
            >
              {excluindo ? (
                <ActivityIndicator color="#B3261E" />
              ) : (
                <>
                  <Ionicons name="trash-outline" size={18} color="#B3261E" />
                  <Text style={styles.botaoExcluirText}>Excluir refeição</Text>
                </>
              )}
            </Pressable>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  body: {
  paddingHorizontal: 22,
  },
  label: {
    fontSize: 13,
    color: colors.textDark,
    fontWeight: '600',
    marginTop: 18,
    marginBottom: 8,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: -4,
    marginBottom: 4,
  },
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  dayChip: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayChipDisabled: {
    opacity: 0.6,
  },
  dayText: { color: colors.textDark, fontWeight: '700', fontSize: 13 },
  dayTextActive: { color: '#fff' },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchActive: {
    borderColor: colors.textDark,
  },
  bannerErro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FDECEA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  bannerErroText: {
    flex: 1,
    color: '#B3261E',
    fontSize: 13,
    fontWeight: '600',
  },
  bannerSucesso: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  bannerSucessoText: {
    flex: 1,
    color: '#2E7D32',
    fontSize: 13,
    fontWeight: '600',
  },
  botaoExcluir: {
  marginTop: 12,
  height: 48,
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#B3261E',
  backgroundColor: '#fff',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  },
  botaoExcluirText: { color: '#B3261E', fontSize: 15, fontWeight: '600' },
  calendarWrap: {
  backgroundColor: '#fff',
  borderRadius: 16,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: colors.inputBorder,
},
dataBox: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  backgroundColor: '#fff',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: colors.inputBorder,
  padding: 14,
},
dataBoxText: { color: colors.textDark, fontSize: 14, fontWeight: '700' },
hintEdicao: {
  fontSize: 12,
  color: colors.textMuted,
  marginTop: 14,
  marginBottom: 4,
},
});