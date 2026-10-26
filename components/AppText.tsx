import React from 'react';
import { Text as RNText, TextProps, StyleSheet, TextStyle } from 'react-native';
import { useAccessibility } from '../app/AccessibilityContext';

// Em alto contraste, escurece os cinzas mais comuns (não mexe em textos brancos de botões)
const GRAY_TO_DARK: Record<string, string> = {
  '#333': '#000',
  '#333333': '#000',
  '#555': '#000',
  '#666': '#111',
  '#777': '#111',
  '#888': '#111',
  '#999': '#222',
  '#aaa': '#222',
};

export default function Text({ style, ...props }: TextProps) {
  const { fs, settings } = useAccessibility();
  const flat = (StyleSheet.flatten(style) || {}) as TextStyle;

  const override: TextStyle = { fontSize: fs(flat.fontSize ?? 14) };

  if (flat.lineHeight) {
    override.lineHeight = fs(flat.lineHeight);
  }

  if (settings.highContrast && typeof flat.color === 'string') {
    const dark = GRAY_TO_DARK[flat.color.toLowerCase()];
    if (dark) override.color = dark;
  }

  return <RNText {...props} style={[style, override]} />;
}