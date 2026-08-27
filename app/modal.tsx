import { Link } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { PanelTop, X } from 'lucide-react-native'
import { Platform, Pressable, Text, View } from 'react-native'

import { IconBadge } from '@/components/ui/IconBadge'
import { Screen } from '@/components/ui/Screen'
import { useThemeColors } from '@/components/ui/useThemeColors'

export default function ModalScreen() {
  const colors = useThemeColors()

  return (
    <Screen edges={['bottom', 'left', 'right']}>
      <View className="flex-1 items-center justify-center gap-5 px-2">
        <IconBadge icon={PanelTop} size="lg" />

        <View className="gap-2">
          <Text className="text-center text-2xl font-bold" style={{ color: colors.text }}>
            Focused task
          </Text>
          <Text className="text-center text-base leading-6" style={{ color: colors.textSecondary }}>
            Modal presentation isolates short confirmations without competing with the tab bar.
          </Text>
        </View>

        <Link href="../" asChild>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close modal"
            className="mt-2 min-h-[48px] w-full flex-row items-center justify-center gap-2 rounded-xl border active:opacity-70"
            style={{ borderColor: colors.border, backgroundColor: colors.surface }}>
            <X size={18} color={colors.tint} strokeWidth={2} />
            <Text className="text-base font-semibold" style={{ color: colors.tint }}>
              Close
            </Text>
          </Pressable>
        </Link>
      </View>

      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </Screen>
  )
}
