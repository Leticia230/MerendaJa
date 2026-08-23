// lib/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Define como a notificação se comporta quando o app está aberto
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registrarParaNotificacoes(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('Notificações push só funcionam em dispositivo físico, não em emulador.');
    return null;
  }

  const { status: statusAtual } = await Notifications.getPermissionsAsync();
  let status = statusAtual;

  if (status !== 'granted') {
    const { status: novoStatus } = await Notifications.requestPermissionsAsync();
    status = novoStatus;
  }

  if (status !== 'granted') {
    console.warn('Permissão de notificação negada.');
    return null;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;

  return token;
}

// Notificação local (não precisa de servidor, dispara direto do app)
export async function enviarNotificacaoLocal(titulo: string, corpo: string, segundos = 2) {
  await Notifications.scheduleNotificationAsync({
    content: { title: titulo, body: corpo },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: segundos,
    },
  });
}