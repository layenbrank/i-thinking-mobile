import { Link } from 'expo-router'
import { ChevronRight, type LucideIcon } from 'lucide-react-native'
import { Pressable, Text, View } from 'react-native'

import { IconBadge } from '@/components/ui/IconBadge'
import { useThemeColors } from '@/components/ui/useThemeColors'

interface ActionRowProps {
  href: '/form' | '/list' | '/modal' | '/explore'
  title: string
  description: string
  icon: LucideIcon
  accessibilityLabel: string
}

function ActionRow({ href, title, description, icon, accessibilityLabel }: ActionRowProps) {
  const colors = useThemeColors()

  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        className="min-h-[64px] flex-row items-center gap-3 rounded-2xl border px-4 py-3 active:opacity-70"
        style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
        <IconBadge icon={icon} size="md" />
        <View className="min-w-0 flex-1 gap-0.5">
          <Text className="text-base font-semibold" style={{ color: colors.text }}>
            {title}
          </Text>
          <Text className="text-sm" style={{ color: colors.textSecondary }}>
            {description}
          </Text>
        </View>
        <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.75} />
      </Pressable>
    </Link>
  )
}

export { ActionRow }
