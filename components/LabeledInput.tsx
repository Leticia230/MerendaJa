import React, { forwardRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

type Props = TextInputProps & {
  label: string;
  isPassword?: boolean;
  rightIcon?: React.ReactNode;
  containerStyle?: any;
  testID?: string;
};

const LabeledInput = forwardRef<TextInput, Props>(function LabeledInput(
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
  return (
    <View style={[styles.wrap, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          ref={ref}
          testID={testID}
          placeholderTextColor={colors.textLight}
          secureTextEntry={isPassword ? hide : false}
          style={styles.input}
          {...rest}
        />
        {isPassword ? (
          <Pressable onPress={() => setHide(h => !h)} hitSlop={10}>
            <Ionicons
              name={hide ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        ) : (
          rightIcon
        )}
      </View>
    </View>
  );
});

export default LabeledInput;

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    color: colors.textDark,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: 14,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: colors.textDark,
    padding: 0,
  },
});
