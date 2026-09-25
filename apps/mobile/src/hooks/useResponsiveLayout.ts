import { useWindowDimensions } from 'react-native';

export const useResponsiveLayout = () => {
  const { width, height, fontScale } = useWindowDimensions();
  const isLandscape = width > height;
  const isTablet = width >= 768;
  const isWide = width >= 1024;
  const isCompact = width < 360;
  const contentMaxWidth = isWide ? 1120 : isTablet ? 840 : 640;
  const columns = isWide ? 3 : isTablet ? 2 : 1;
  return { width, height, fontScale, isLandscape, isTablet, isWide, isCompact, contentMaxWidth, columns };
};
