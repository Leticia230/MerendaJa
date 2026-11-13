import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { useAccessibility } from './AccessibilityContext';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
};

export default function BotaoPrimeiro({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
  testID,
}: Props) {
  const { theme } = useAccessibility();

  const isOutline = variant === 'outline';

  const styles = createStyles(theme);

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isOutline ? styles.outline : styles.primary,
        pressed && { opacity: 0.85 },
        (disabled || loading) && { opacity: 0.6 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={isOutline ? theme.primary : theme.onPrimary}
        />
      ) : (
        <Text
          style={[
            styles.text,
            isOutline && { color: theme.primary },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    base: {
      height: 52,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    primary: {
      backgroundColor: theme.primary,
      shadowColor: theme.primary,
      shadowOpacity: 0.25,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: theme.primary,
    },
    text: {
      color: theme.onPrimary,
      fontSize: 16,
      fontWeight: '700',
    },
  });
