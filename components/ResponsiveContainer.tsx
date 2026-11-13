import React from 'react';
import {
  View,
  StyleSheet,
  ViewProps,
} from 'react-native';

import { useResponsive } from '../hooks/useResponsive';

type Props = ViewProps & {
  children: React.ReactNode;
  fullHeight?: boolean;
};

export default function ResponsiveContainer({
  children,
  style,
  fullHeight = false,
  ...props
}: Props) {
  const { horizontalPadding, contentMaxWidth } = useResponsive();

  return (
    <View
      {...props}
      style={[
        styles.container,
        {
          paddingHorizontal: horizontalPadding,
          maxWidth: contentMaxWidth,
        },
        fullHeight && styles.fullHeight,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignSelf: 'center',
  },
  fullHeight: {
    flex: 1,
  },
});
