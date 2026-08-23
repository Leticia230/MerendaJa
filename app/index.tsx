import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import ChefLogo from '../components/ChefLogo';
import { colors } from '../constants/theme';
import { registrarParaNotificacoes } from './Notifica';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    registrarParaNotificacoes();

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.yellow,
    alignItems: 'center',
    justifyContent: 'center',
  },
});