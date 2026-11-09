
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import ChefLogo from '../components/ChefLogo';
import { useAccessibility } from '../components/AccessibilityContext';

export default function SplashScreen() {
  const router = useRouter();
  const { theme } = useAccessibility();
  const styles = createStyles(theme);

  useEffect(() => {

    const timer = setTimeout(() => {
      router.replace('/Inicio');
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <ChefLogo size={300} />
    </View>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
