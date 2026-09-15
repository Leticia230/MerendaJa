import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors } from '../constants/theme';

type Props = {
  title: string;
  onBack?: () => void;
  right?: React.ReactNode;
};

export default function ScreenHeader({ title, onBack, right }: Props) {
  const router = useRouter();
  return (
    <View style={styles.wrap} testID="screen-header">
      <Pressable
        testID="header-back-button"
        onPress={onBack ?? (() => router.back())}
        hitSlop={12}
        style={styles.back}
      >
        <Ionicons name="chevron-back" size={22} color={colors.textDark} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>{right}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 16,
    minHeight: 64,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: colors.textLight,
  },
  right: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
