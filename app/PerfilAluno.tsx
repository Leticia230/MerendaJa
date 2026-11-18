
import React, { useCallback, useMemo, useState } from 'react';

import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

import ScreenHeader from '../components/ScreenHeader';
import ResponsiveContainer from '../components/ResponsiveContainer';
import { useResponsive } from '../hooks/useResponsive';
import { useAccessibility } from '../components/AccessibilityContext';

import { buscarPerfilAluno } from './services/alunos';
import { listarTurmas } from './services/turmas';
import { useInstituicaoId } from './services/useInstituicaoId';

import { auth } from '../components/firebaseConfig';
import Text from '../components/AppText';

// Componente para exibir informações somente para consulta
function ProfileInfo({
  label,
  value,
  icon,
  theme,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  theme: any;
}) {
  return (
    
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.card,
        borderRadius: 14,
        padding: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.textMuted + '55',
      }}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          backgroundColor: theme.primary + '25',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 13,
        }}
      >
        <Ionicons
          name={icon}
          size={21}
          color={theme.primary}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 12,
            color: theme.textMuted,
            fontWeight: '600',
            marginBottom: 4,
          }}
        >
          {label}
        </Text>

        <Text
          style={{
            fontSize: 15,
            color: theme.text,
            fontWeight: '700',
          }}
        >
          {value || 'Não informado'}
        </Text>
      </View>

      <Ionicons
        name="lock-closed-outline"
        size={16}
        color={theme.textMuted}
      />
    </View>

  );
}

export default function ProfileScreen() {
  const { theme } = useAccessibility();

  const {
    isSmallScreen,
    fontScale,
    horizontalPadding,
  } = useResponsive();

  const compacto = isSmallScreen || fontScale >= 1.2;

  const styles = useMemo(
    () => createStyles(theme, compacto),
    [theme, compacto]
  );

  const {
    instituicaoId,
    carregando: carregandoInstituicao,
  } = useInstituicaoId();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [rm, setRm] = useState('');
  const [turma, setTurma] = useState('');
  const [periodo, setPeriodo] = useState('');

  const [carregando, setCarregando] = useState(true);

  // Recarrega sempre que a tela volta ao foco
  useFocusEffect(
    useCallback(() => {
      if (carregandoInstituicao) return;

      let ativo = true;

      async function carregarPerfil() {
        try {
          const alunoId = auth.currentUser?.uid;

          if (!alunoId) {
            Alert.alert(
              'Erro',
              'Não foi possível identificar o aluno.'
            );
            return;
          }

          const perfil = await buscarPerfilAluno(alunoId);

          if (!ativo) return;

          if (!perfil) {
            Alert.alert(
              'Erro',
              'Perfil do aluno não encontrado.'
            );
            return;
          }

          setNome(perfil.nome ?? '');
          setEmail(perfil.email ?? '');
          setRm(perfil.rm ?? '');

          // Turma e período vêm das turmas da instituição
          let turmaNome = perfil.turmaNome ?? '';
          let periodoNome = perfil.periodo ?? '';

          if (instituicaoId) {
            try {
              const turmas = await listarTurmas(instituicaoId);

              const doAluno = turmas.filter((t) =>
                t.alunosIds.includes(alunoId)
              );

              if (doAluno.length > 0) {
                turmaNome = doAluno.map((t) => t.nome).join(', ');

                periodoNome = Array.from(
                  new Set(doAluno.map((t) => t.periodo))
                ).join(', ');
              } else {
                console.log(
                  '[Perfil] aluno não encontrado em nenhuma turma.',
                  'uid do login:',
                  alunoId,
                  '| turmas:',
                  JSON.stringify(
                    turmas.map((t) => ({
                      nome: t.nome,
                      alunosIds: t.alunosIds,
                    }))
                  )
                );
              }
            } catch (e) {
              console.error('Erro ao carregar turma do aluno:', e);
            }
          } else {
            console.log(
              '[Perfil] instituicaoId não encontrado para este aluno.'
            );
          }

          if (!ativo) return;

          setTurma(turmaNome);
          setPeriodo(periodoNome);
        } catch (error) {
          console.error('Erro ao carregar perfil:', error);

          Alert.alert(
            'Erro',
            'Não foi possível carregar os dados do perfil.'
          );
        } finally {
          if (ativo) setCarregando(false);
        }
      }

      carregarPerfil();

      return () => {
        ativo = false;
      };
    }, [instituicaoId, carregandoInstituicao])
  );

  if (carregando) {
    return (
      <SafeAreaView style={styles.safe}>
        <ScreenHeader title="Meu perfil" />

        <View style={styles.loading}>
          <ActivityIndicator
            size="large"
            color={theme.primary}
          />

          <Text style={styles.loadingText}>
            Carregando perfil...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Meu perfil" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ResponsiveContainer
          style={[
            styles.body,
            { paddingHorizontal: horizontalPadding },
          ]}
        >
          {/* Identificação do aluno */}
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Ionicons
                name="person"
                size={compacto ? 38 : 44}
                color={theme.onPrimary}
              />
            </View>

            <Text style={styles.profileName}>
              {nome || 'Aluno'}
            </Text>

            <View style={styles.readOnlyBadge}>
              <Ionicons
                name="eye-outline"
                size={14}
                color={theme.primary}
              />

              <Text style={styles.readOnlyText}>
                Somente visualização
              </Text>
            </View>
          </View>

          {/* Informações pessoais */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>
              Informações pessoais
            </Text>

            <ProfileInfo
              label="Nome completo"
              value={nome}
              icon="person-outline"
              theme={theme}
            />

            <ProfileInfo
              label="E-mail"
              value={email}
              icon="mail-outline"
              theme={theme}
            />

            <ProfileInfo
              label="Registro de matrícula (RM)"
              value={rm}
              icon="card-outline"
              theme={theme}
            />

            {/* Informações escolares */}
            <Text style={styles.sectionTitle}>
              Informações escolares
            </Text>

            <ProfileInfo
              label="Turma"
              value={turma}
              icon="school-outline"
              theme={theme}
            />

            <ProfileInfo
              label="Período"
              value={periodo}
              icon="time-outline"
              theme={theme}
            />
          </View>

          {/* Aviso de consulta */}
          <View style={styles.notice}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color={theme.primary}
            />

            <Text style={styles.helperText}>
              Esta página é destinada somente à consulta.
              Seus dados são cadastrados e administrados pela
              instituição. Para solicitar alterações, procure
              a secretaria.
            </Text>
          </View>
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

    scroll: {
      flex: 1,
    },

    scrollContent: {
      flexGrow: 1,
      paddingBottom: 24,
    },

    body: {
      flex: 0,
      paddingTop: compacto ? 12 : 20,
      paddingBottom: 40,
    },

    // Cabeçalho do perfil
    profileHeader: {
      alignItems: 'center',
      marginBottom: compacto ? 24 : 30,
    },

    avatar: {
      width: compacto ? 84 : 100,
      height: compacto ? 84 : 100,
      borderRadius: compacto ? 42 : 50,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.primary,
      marginBottom: 14,
      shadowColor: theme.primary,
      shadowOpacity: 0.25,
      shadowRadius: compacto ? 7 : 10,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      elevation: 4,
    },

    profileName: {
      fontSize: compacto ? 19 : 22,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 4,
      textAlign: 'center',
    },

    profileSubtitle: {
      fontSize: 13,
      color: theme.textMuted,
    },

    readOnlyBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.primary + '25',
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 20,
      marginTop: 13,
    },

    readOnlyText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.primary,
    },

    sectionTitle: {
      fontSize: compacto ? 14 : 15,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 14,
      marginTop: 8,
    },

    notice: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      padding: 14,
      marginTop: 12,
      borderRadius: 12,
      backgroundColor: theme.primary + '20',
      borderWidth: 1,
      borderColor: theme.primary + '55',
    },

    helperText: {
      flex: 1,
      fontSize: compacto ? 11 : 12,
      color: theme.text,
      fontWeight: '500',
      lineHeight: compacto ? 16 : 18,
    },

    // Carregamento
    loading: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 20,
    },

    loadingText: {
      marginTop: 12,
      fontSize: compacto ? 13 : 14,
      color: theme.textMuted,
      textAlign: 'center',
    },

    infoSection: {
      marginTop: 4,
    },
  });
