import React, { useEffect, useState } from 'react';
import { LogBox, View, ActivityIndicator } from 'react-native';

import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useFonts } from 'expo-font';
import { StripeProvider } from '@stripe/stripe-react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

import {
  AccessibilityProvider,
  useAccessibility,
} from '../components/AccessibilityContext';
import { auth, db } from '../components/firebaseConfig';

LogBox.ignoreAllLogs(true);

SplashScreen.preventAutoHideAsync().catch(() => {});

function ThemedApp() {
  const { isDark, theme } = useAccessibility();
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          // ajuste para o caminho real da sua tela de login
          router.replace('/Login');
        } else {
          const snap = await getDoc(doc(db, 'users', user.uid));
          const tipo = snap.data()?.tipo; // aluno ou instituicao
          // ajuste para os caminhos reais das suas áreas
          router.replace(
          tipo === 'instituicao' ? '/(tabs-instituicao)/Home' : '/(tabs-aluno)/Home'
        );
        }
      } catch (e) {
        router.replace('/Login');
      } finally {
        setCarregando(false);
      }
    });
    return unsub;
  }, []);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: {
            backgroundColor: theme.background,
          },
        }}
      />

      {carregando && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: theme.background,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      )}
    </>
  );
}

const ICON_VECTOR_VERSION = '15.1.1';

const ICON_FAMILIES: Record<string, string> = {
  anticon: 'AntDesign',
  entypo: 'Entypo',
  evilicons: 'EvilIcons',
  feather: 'Feather',
  FontAwesome: 'FontAwesome',
  Fontisto: 'Fontisto',
  foundation: 'Foundation',
  ionicons: 'Ionicons',
  'material-community': 'MaterialCommunityIcons',
  material: 'MaterialIcons',
  octicons: 'Octicons',
  'simple-line-icons': 'SimpleLineIcons',
  zocial: 'Zocial',
  'FontAwesome5Free-Regular': 'FontAwesome5_Regular',
  'FontAwesome5Free-Solid': 'FontAwesome5_Solid',
  'FontAwesome5Free-Brand': 'FontAwesome5_Brands',
  'FontAwesome6Free-Regular': 'FontAwesome6_Regular',
  'FontAwesome6Free-Solid': 'FontAwesome6_Solid',
  'FontAwesome6Free-Brand': 'FontAwesome6_Brands',
};

const cdnUrl = (file: string): string =>
  `https://cdn.jsdelivr.net/npm/@expo/vector-icons@${ICON_VECTOR_VERSION}/build/vendor/react-native-vector-icons/Fonts/${file}.ttf`;

const iconFontMap = (): Record<string, string> =>
  Object.fromEntries(
    Object.entries(ICON_FAMILIES).map(([key, family]) => [
      key,
      cdnUrl(family),
    ])
  );

export default function RootLayout() {
  const [loaded, error] = useFonts(
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient
      ? iconFontMap()
      : {}
  );

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <AccessibilityProvider>
            <ThemedApp />
          </AccessibilityProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </StripeProvider>
  );
}