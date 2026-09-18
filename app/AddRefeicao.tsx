import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  KeyboardAvoidingView,
  Platform,
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
} from './services/cardapio';

const DIAS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
const CORES = ['#FFD79A', '#FFB27A', '#FFC845', '#FF9E7A', '#B7E4C7'];
const ICONES = ['bread-slice', 'food', 'fruit-cherries', 'coffee', 'cup', 'food-apple'];

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

  
  const [dia, setDia] = useState(params.dia && DIAS.includes(params.dia) ? params.dia : '');
  const [titulo, setTitulo] = useState(params.titulo ?? '');
  const [horario, setHorario] = useState(params.horario ?? '');
  const [desc, setDesc] = useState(params.desc ?? '');
  const [icon, setIcon] = useState(params.icon ?? ICONES[0]);
  const [color, setColor] = useState(params.color ?? CORES[0]);
  const [salvando, setSalvando] = useState(false);


  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState(false);


  async function salvar() {
    setErro(null);
    setSucesso(false);

    const tituloNormalizado = titulo.trim();
    const descNormalizado = desc.trim();

    if (!dia) {
      setErro('Selecione o dia da semana dessa refeição.');
      return;
    }

    if (!tituloNormalizado || !descNormalizado || !horario.trim()) {
      setErro('Preencha o título, o horário e a descrição da refeição.');
      return;
    }

    if (!params.data) {
      setErro('Não foi possível identificar a data da refeição.');
      return;
    }

    setSalvando(true);

    const refeicao: Refeicao = {
      titulo: tituloNormalizado,
      horario: horario.trim(),
      desc: descNormalizado,
      icon,
      color,
      data: params.data,
    };

    try {
      let refeicoesAtualizadas: Refeicao[] = [];

      if (modoEdicao) {
        await new Promise<void>((resolve, reject) => {
          const unsubscribe = assinarCardapioDia(
            dia,
            async (refeicoes) => {
              unsubscribe();

              try {
                const index = Number(params.index);
                const novaLista = [...refeicoes];

                novaLista[index] = refeicao;

                await salvarRefeicoesDoDia(dia, novaLista);

                refeicoesAtualizadas = novaLista;

                resolve();
              } catch (e) {
                reject(e);
              }
            },
            reject
          );
        });
      } else {
        await adicionarRefeicao(dia, refeicao);

        await new Promise<void>((resolve, reject) => {
          const unsubscribe = assinarCardapioDia(
            dia,
            (refeicoes) => {
              unsubscribe();

              refeicoesAtualizadas = refeicoes;
              resolve();
            },
            reject
          );
        });
      }

      await salvarCardapioPorData(
        params.data,
        refeicoesAtualizadas
      );

      console.log(
        'Refeição salva com sucesso no Firestore:',
        dia,
        params.data,
        refeicao
      );

      setSucesso(true);

      setTimeout(() => router.back(), 600);
    } catch (error: any) {
      console.error('Erro ao salvar refeição:', error);

      if (error?.code === 'permission-denied') {
        setErro(
          'Permissão negada pelo Firestore. Verifique as Security Rules do seu projeto Firebase — provavelmente estão bloqueando escrita nas coleções "cardapios" ou "historicoCardapios".'
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

          <Text style={styles.label}>Dia da semana</Text>
          <View style={styles.row}>
            {DIAS.map((d) => (
              <Pressable
                key={d}
                testID={`dia-${d}`}
                onPress={() => setDia(d)}
                disabled={salvando || modoEdicao}
                style={[
                  styles.dayChip,
                  dia === d && styles.dayChipActive,
                  modoEdicao && styles.dayChipDisabled,
                ]}
              >
                <Text style={[styles.dayText, dia === d && styles.dayTextActive]}>{d}</Text>
              </Pressable>
            ))}
          </View>
          {modoEdicao && (
            <Text style={styles.hint}>
              Não é possível trocar o dia ao editar uma refeição já existente.
            </Text>
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
            disabled={salvando}
            style={{ marginTop: 24 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  body: { padding: 22, paddingBottom: 40 },
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
});