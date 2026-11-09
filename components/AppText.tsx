
import React from 'react';
import {
  Text as RNText,
  TextProps,
  StyleSheet,
  TextStyle,
} from 'react-native';

import { useAccessibility } from './AccessibilityContext';

const GRAY_TO_DARK: Record<string, string> = {
  '#333': '#000000',
  '#333333': '#000000',
  '#555': '#000000',
  '#555555': '#000000',
  '#666': '#111111',
  '#666666': '#111111',
  '#777': '#111111',
  '#777777': '#111111',
  '#888': '#111111',
  '#888888': '#111111',
  '#999': '#222222',
  '#999999': '#222222',
  '#aaa': '#222222',
  '#aaaaaa': '#222222',
  '#b0b0b0': '#222222',
  '#bbbbbb': '#222222',
  '#cccccc': '#333333',
};

export default function Text({ style, ...props }: TextProps) {
  const { fs, settings } = useAccessibility();

  const flat = (StyleSheet.flatten(style) || {}) as TextStyle;

  const override: TextStyle = {};

  if (flat.fontSize !== undefined) {
    override.fontSize = fs(flat.fontSize);
  }

  if (flat.lineHeight !== undefined) {
    override.lineHeight = fs(flat.lineHeight);
  }

  if (settings.highContrast && typeof flat.color === 'string') {
    const dark = GRAY_TO_DARK[flat.color.toLowerCase()];

    if (dark) {
      override.color = dark;
    }
  }

  return (
    <RNText
      {...props}
      style={[style, override]}
    />
  );
}
