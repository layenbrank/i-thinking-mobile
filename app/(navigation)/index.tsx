import { ClipboardList, FileInput, PanelTop, Sparkles } from 'lucide-react-native'
import { Text, View } from 'react-native'

import { ActionRow } from '@/components/ui/ActionRow'
import { BrandHero } from '@/components/ui/BrandHero'
import { IconBadge } from '@/components/ui/IconBadge'
import { Screen } from '@/components/ui/Screen'
import { useThemeColors } from '@/components/ui/useThemeColors'

export default function HomeScreen() {
  const colors = useThemeColors()

  return (
    <Screen scroll>
      <BrandHero
        eyebrow="i-thinking"
        title="Workspace"
        description="Validated forms, performant lists, and focused modal flows in one starter shell."
      />

      <View className="mb-3 flex-row items-center gap-2">
        <IconBadge icon={Sparkles} size="sm" tone="muted" />
        <Text className="text-xs font-semibold uppercase tracking-wider" style={{ color: colors.textSecondary }}>
          Quick actions
        </Text>
      </View>

      <View className="gap-3">
        <ActionRow
          href="/form"
          title="Form"
          description="Validated intake with Zod + RHF"
          icon={FileInput}
          accessibilityLabel="Open form screen"
        />
        <ActionRow
          href="/list"
          title="List"
          description="Virtualized FlatList sample"
          icon={ClipboardList}
          accessibilityLabel="Open list screen"
        />
        <ActionRow
          href="/modal"
          title="Modal"
          description="Sheet presentation for focused tasks"
          icon={PanelTop}
          accessibilityLabel="Open modal screen"
        />
      </View>
    </Screen>
  )
}
