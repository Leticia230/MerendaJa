import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import ChefLogo from '../components/ChefLogo';
import { useAccessibility } from '../components/AccessibilityContext';
import { useResponsive } from '../hooks/useResponsive';

export default function SplashScreen() {
  const router = useRouter();
  const { theme } = useAccessibility();

  const {
    width,
    isSmallScreen,
    fontScale,
  } = useResponsive();

  const compacto = isSmallScreen || fontScale >= 1.2;

  const styles = useMemo(
    () => createStyles(theme),
    [theme]
  );

  const logoSize = Math.min(
    width * 0.75,
    compacto ? 240 : 300
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/Inicio');
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <ChefLogo size={logoSize} />
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      width: '100%',
      backgroundColor: theme.background,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
  });
