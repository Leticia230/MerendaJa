import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React from "react";
import { useEffect } from "react";
import { LogBox, StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Constants, { ExecutionEnvironment } from "expo-constants";
import { useFonts } from "expo-font";

import { StripeProvider } from "@stripe/stripe-react-native";


LogBox.ignoreAllLogs(true);
SplashScreen.preventAutoHideAsync();

// --- Icon font loader (Expo Go workaround) ---
const ICON_VECTOR_VERSION = "15.1.1";
const ICON_FAMILIES: Record<string, string> = {
  anticon: "AntDesign",
  entypo: "Entypo",
  evilicons: "EvilIcons",
  feather: "Feather",
  FontAwesome: "FontAwesome",
  Fontisto: "Fontisto",
  foundation: "Foundation",
  ionicons: "Ionicons",
  "material-community": "MaterialCommunityIcons",
  material: "MaterialIcons",
  octicons: "Octicons",
  "simple-line-icons": "SimpleLineIcons",
  zocial: "Zocial",
  "FontAwesome5Free-Regular": "FontAwesome5_Regular",
  "FontAwesome5Free-Solid": "FontAwesome5_Solid",
  "FontAwesome5Free-Brand": "FontAwesome5_Brands",
  "FontAwesome6Free-Regular": "FontAwesome6_Regular",
  "FontAwesome6Free-Solid": "FontAwesome6_Solid",
  "FontAwesome6Free-Brand": "FontAwesome6_Brands",
};
const cdnUrl = (file: string): string =>
  `https://cdn.jsdelivr.net/npm/@expo/vector-icons@${ICON_VECTOR_VERSION}/build/vendor/react-native-vector-icons/Fonts/${file}.ttf`;
const iconFontMap = (): Record<string, string> =>
  Object.fromEntries(Object.entries(ICON_FAMILIES).map(([k, f]) => [k, cdnUrl(f)]));

export default function RootLayout() {
  const [loaded, error] = useFonts(
    Constants.executionEnvironment === ExecutionEnvironment.StoreClient
      ? iconFontMap()
      : {}
  );

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <StripeProvider
  publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <StatusBar barStyle="dark-content" />
          <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </StripeProvider>
  );
}