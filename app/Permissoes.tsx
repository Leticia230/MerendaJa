import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '../components/ScreenHeader';
import { colors } from '../constants/theme';
import * as Notifications from 'expo-notifications';
import * as Location from 'expo-location';

function Toggle({ value, onChange, testID }: any) {
  return (
    <Pressable
      testID={testID}
      onPress={() => onChange(!value)}
      style={[styles.toggle, value ? styles.toggleOn : styles.toggleOff]}
    >
      <View style={[styles.thumb, value ? styles.thumbOn : styles.thumbOff]} />
    </Pressable>
  );
}

export default function PermissoesScreen() {
  const [notif, setNotif] = useState(true);
  const [loc, setLoc] = useState(false);

  useEffect(() => {
    async function verificarPermissao() {
      const { status } = await Notifications.getPermissionsAsync();
      setNotif(status === 'granted');
    }

    verificarPermissao();
  }, []);

  useEffect(() => {
    async function verificarLocalizacao() {
      const { status } = await Location.getForegroundPermissionsAsync();
      setLoc(status === 'granted');
    }

    verificarLocalizacao();
  }, []);

  return (
<SafeAreaView
  style={[
    styles.safe,
    {
      paddingTop: 50,
    },
  ]}
>    
    <ScreenHeader title="Permissões" />
      <View style={styles.body}>
        <View style={styles.card}>
          <Text style={styles.label}>Acesso a notificações</Text>
          <Toggle
            testID="toggle-notifications"
            value={notif}
            onChange={async (value: boolean) => {
              if (value) {
                const { status } = await Notifications.requestPermissionsAsync();
                setNotif(status === 'granted');
              } else {
                setNotif(false);
              }
            }}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Acesso à localização</Text>
          <Toggle
            testID="toggle-location"
            value={loc}
            onChange={async (value: boolean) => {
              if (value) {
                const { status } =
                  await Location.requestForegroundPermissionsAsync();

                setLoc(status === 'granted');
              } else {
                setLoc(false);
              }
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.cream },
  body: { padding: 18, gap: 12 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
  },
  label: { flex: 1, fontSize: 14, fontWeight: '600', color: colors.textDark },
  toggle: { width: 44, height: 26, borderRadius: 13, padding: 3, justifyContent: 'center' },
  toggleOn: { backgroundColor: colors.primary },
  toggleOff: { backgroundColor: '#E1E1E1' },
  thumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  thumbOn: { alignSelf: 'flex-end' },
  thumbOff: { alignSelf: 'flex-start' },
});
