import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
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
import { adicionarRefeicao, assinarCardapioDia, salvarRefeicoesDoDia, Refeicao } from '../app/services/cardapio';

const CORES = ['#FFD79A', '#FFB27A', '#FFC845', '#FF9E7A', '#B7E4C7'];
const ICONES = ['bread-slice', 'food', 'fruit-cherries', 'coffee', 'cup', 'food-apple'];

export default function AddRefeicao() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    dia: string;
    index?: string;
    titulo?: string;
    desc?: string;
    icon?: string;
    color?: string;
  }>();

  const modoEdicao = params.index !== undefined;

  const [titulo, setTitulo] = useState(params.titulo ?? '');
  const [desc, setDesc] = useState(params.desc ?? '');
  const [icon, setIcon] = useState(params.icon ?? ICONES[0]);
  const [color, setColor] = useState(params.color ?? CORES[0]);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    const tituloNormalizado = titulo.trim();
    const descNormalizado = desc.trim();

    if (!tituloNormalizado || !descNormalizado) {
      Alert.alert('Campos obrigatórios', 'Preencha o título e a descrição da refeição.');
      return;
    }

    if (!params.dia) {
      Alert.alert('Erro', 'Dia da semana não informado.');
      return;
    }

    setSalvando(true);

    const refeicao: Refeicao = {
      titulo: tituloNormalizado,
      desc: descNormalizado,
      icon,
      color,
    };

    try {
      if (modoEdicao) {
        // Edição: precisamos da lista atual pra substituir só o item certo.
        await new Promise<void>((resolve, reject) => {
          const unsubscribe = assinarCardapioDia(
            params.dia,
            async (refeicoes) => {
              unsubscribe();
              try {
                const index = Number(params.index);
                const novaLista = [...refeicoes];
                novaLista[index] = refeicao;
                await salvarRefeicoesDoDia(params.dia, novaLista);
                resolve();
              } catch (e) {
                reject(e);
              }
            },
            reject
          );
        });
      } else {
        await adicionarRefeicao(params.dia, refeicao);
      }

      router.back();
    } catch (error) {
      console.error('Erro ao salvar refeição:', error);
      Alert.alert('Erro', 'Não foi possível salvar a refeição. Tente novamente.');
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
          <LabeledInput
            testID="refeicao-titulo-input"
            label="Título"
            placeholder="Ex: Almoço"
            value={titulo}
            onChangeText={setTitulo}
          />

          <LabeledInput
            testID="refeicao-desc-input"
            label="Descrição"
            placeholder="Ex: Arroz, feijão, frango grelhado"
            multiline
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
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
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
});
