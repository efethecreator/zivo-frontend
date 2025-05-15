// utils/responsive.ts
import { Dimensions, PixelRatio, Platform, StatusBar } from "react-native";

// Ekran boyutları
export const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get("window");

// Tasarım için referans boyutlar (iPhone 11 Pro / X)
const DESIGN_WIDTH = 375;
const DESIGN_HEIGHT = 812;

// Ölçekleme faktörleri
export const widthScale = SCREEN_WIDTH / DESIGN_WIDTH;
export const heightScale = SCREEN_HEIGHT / DESIGN_HEIGHT;

// Responsive boyut hesaplama
export const normalize = (
  size: number,
  based: "width" | "height" = "width"
) => {
  const scale = based === "width" ? widthScale : heightScale;
  const newSize = size * scale;

  // Reduce size slightly for better fit across devices
  const adjustedSize = newSize * 0.92;

  if (Platform.OS === "ios") {
    return Math.round(PixelRatio.roundToNearestPixel(adjustedSize));
  }

  // Make Android sizing more consistent with iOS
  return Math.round(PixelRatio.roundToNearestPixel(adjustedSize));
};

// Responsive padding ve margin değerleri
export const spacing = {
  xs: normalize(4),
  s: normalize(7),
  m: normalize(14),
  l: normalize(22),
  xl: normalize(30),
  xxl: normalize(38),
};

// Responsive font boyutları
export const fontSizes = {
  xs: normalize(9),
  s: normalize(11),
  m: normalize(13),
  l: normalize(15),
  xl: normalize(17),
  xxl: normalize(19),
  xxxl: normalize(22),
  title: normalize(26),
  header: normalize(30),
};

// Status bar yüksekliği
export const STATUS_BAR_HEIGHT =
  Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0;

// Header yüksekliği (status bar dahil)
export const HEADER_HEIGHT =
  Platform.OS === "ios" ? normalize(88) : normalize(56) + STATUS_BAR_HEIGHT;

// Tab bar yüksekliği
export const TAB_BAR_HEIGHT =
  Platform.OS === "ios" ? normalize(80) : normalize(60);

// Ekran boyutlarını dinleyen bir hook oluşturabiliriz
export const isSmallDevice = SCREEN_WIDTH < 375;
export const isMediumDevice = SCREEN_WIDTH >= 375 && SCREEN_WIDTH < 414;
export const isLargeDevice = SCREEN_WIDTH >= 414;

// Cihaz tipi kontrolü
export const isIphoneX = () => {
  return (
    Platform.OS === "ios" &&
    !Platform.isPad &&
    !Platform.isTV &&
    (SCREEN_HEIGHT >= 812 || SCREEN_WIDTH >= 812)
  );
};

// Güvenli alan hesaplamaları için yardımcı fonksiyonlar
export const getStatusBarHeight = () => {
  return Platform.OS === "ios"
    ? isIphoneX()
      ? 44
      : 20
    : StatusBar.currentHeight || 0;
};

export const getBottomSpace = () => {
  return isIphoneX() ? 34 : 0;
};
