import type { LucideIcon } from 'lucide-react-native'
import { Text, View } from 'react-native'

import { IconBadge } from '@/components/ui/IconBadge'
import { useThemeColors } from '@/components/ui/useThemeColors'

interface InfoCardProps {
  title: string
  description: string
  icon: LucideIcon
}

function InfoCard({ title, description, icon }: InfoCardProps) {
  const colors = useThemeColors()

  return (
    <View
      className="flex-row gap-3 rounded-2xl border p-4"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
      <IconBadge icon={icon} size="md" tone="secondary" />
      <View className="min-w-0 flex-1 gap-1">
        <Text className="text-base font-semibold" style={{ color: colors.text }}>
          {title}
        </Text>
        <Text className="text-sm leading-5" style={{ color: colors.textSecondary }}>
          {description}
        </Text>
      </View>
    </View>
  )
}

export { InfoCard }
