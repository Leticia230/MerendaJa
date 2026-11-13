import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import {
  arrayUnion,
  doc,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import { auth, db } from '../../components/firebaseConfig';

export async function registrarDispositivoParaNotificacoes(
  instituicaoId: string
) {
  try {
    if (Platform.OS === 'web' || !Device.isDevice) {
      return null;
    }

    const usuario = auth.currentUser;

    if (!usuario || !instituicaoId) {
      console.log('Usuário ou instituição não identificados.');
      return null;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Notificações',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#F99033',
      });
    }

    const permissaoAtual = await Notifications.getPermissionsAsync();
    let status = permissaoAtual.status;

    if (status !== 'granted') {
      const permissao = await Notifications.requestPermissionsAsync();
      status = permissao.status;
    }

    if (status !== 'granted') {
      console.log('Permissão de notificações não concedida.');
      return null;
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
      throw new Error('ID do projeto Expo não encontrado.');
    }

    const resposta = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    const token = resposta.data;

    await setDoc(
      doc(db, 'users', usuario.uid),
      {
        instituicaoId,
        expoPushTokens: arrayUnion(token),
        expoPushTokenAtualizadoEm: serverTimestamp(),
      },
      { merge: true }
    );

    console.log('Dispositivo registrado para notificações.');

    return token;
  } catch (error) {
    console.error('Erro ao registrar notificações push:', error);
    return null;
  }
}
