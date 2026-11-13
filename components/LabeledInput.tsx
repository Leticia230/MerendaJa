import React, { forwardRef, useState } from 'react';
import {
  StyleSheet,
  Pressable,
  TextInputProps,
  View,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Text from '../components/AppText';
import { useAccessibility } from './AccessibilityContext';

type Props = TextInputProps & {
  label: string;
  isPassword?: boolean;
  rightIcon?: React.ReactNode;
  containerStyle?: any;
  testID?: string;
};

const LabeledInput = forwardRef<TextInput, Props>(
  function LabeledInput(
    {
      label,
      isPassword,
      rightIcon,
      containerStyle,
      testID,
      ...rest
    }: Props,
    ref
  ) {
    const [hide, setHide] = useState(!!isPassword);

    const { theme } = useAccessibility();

    const styles = createStyles(theme);

    return (
      <View style={[styles.wrap, containerStyle]}>
        <Text style={styles.label}>{label}</Text>

        <View style={styles.inputRow}>
          <TextInput
            ref={ref}
            testID={testID}
            placeholderTextColor={theme.placeholder}
            secureTextEntry={isPassword ? hide : false}
            selectionColor={theme.primary}
            style={styles.input}
            {...rest}
          />

          {isPassword ? (
            <Pressable
              onPress={() => setHide(h => !h)}
              hitSlop={10}
            >
              <Ionicons
                name={hide ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={theme.textMuted}
              />
            </Pressable>
          ) : (
            rightIcon
          )}
        </View>
      </View>
    );
  }
);

export default LabeledInput;

const createStyles = (theme: any) =>
  StyleSheet.create({
    wrap: {
      marginBottom: 14,
    },
    label: {
      fontSize: 13,
      color: theme.text,
      fontWeight: '600',
      marginBottom: 6,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.card,
      borderRadius: 12,
      borderWidth: theme.borderWidth || 1,
      borderColor: theme.inputBorder,
      paddingHorizontal: 14,
      height: 48,
    },
    input: {
      flex: 1,
      fontSize: 14,
      color: theme.text,
      padding: 0,
    },
  });
