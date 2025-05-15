import type React from "react"
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle,
  type KeyboardAvoidingViewProps,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { TAB_BAR_HEIGHT } from "../utils/responsive"

interface KeyboardAvoidingContainerProps extends KeyboardAvoidingViewProps {
  children: React.ReactNode
  scrollEnabled?: boolean
  contentContainerStyle?: ViewStyle
  style?: ViewStyle
  withTabBar?: boolean
  scrollViewProps?: any
}

/**
 * KeyboardAvoidingContainer bileşeni, klavye açıldığında içeriğin
 * klavye tarafından kapatılmamasını sağlar.
 */
export const KeyboardAvoidingContainer: React.FC<KeyboardAvoidingContainerProps> = ({
  children,
  scrollEnabled = true,
  contentContainerStyle,
  style,
  withTabBar = false,
  scrollViewProps = {},
  ...props
}) => {
  const insets = useSafeAreaInsets()

  // Tab bar varsa bottom padding'i ayarla
  const bottomPadding = withTabBar ? TAB_BAR_HEIGHT : insets.bottom

  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      {...props}
    >
      {scrollEnabled ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomPadding }, contentContainerStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, { paddingBottom: bottomPadding }, contentContainerStyle]}>{children}</View>
      )}
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
  },
})
