import { useWindowDimensions } from 'react-native';

export function useResponsive() {
  const { width, height, fontScale } = useWindowDimensions();

  return {
    width,
    height,
    fontScale,

    isSmallScreen: width < 360,
    isMediumScreen: width >= 360 && width < 600,
    isLargeScreen: width >= 600,

    horizontalPadding: Math.max(16, Math.min(width * 0.05, 32)),
    contentMaxWidth: 900,
  };
}
