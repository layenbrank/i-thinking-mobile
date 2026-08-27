import type { LucideIcon } from 'lucide-react-native'
import { View } from 'react-native'

import { useThemeColors } from '@/components/ui/useThemeColors'

interface IconBadgeProps {
  icon: LucideIcon
  size?: 'sm' | 'md' | 'lg'
  tone?: 'primary' | 'secondary' | 'muted' | 'danger'
}

const SIZE_MAP = {
  sm: { box: 36, icon: 18 },
  md: { box: 44, icon: 22 },
  lg: { box: 64, icon: 28 }
} as const

function IconBadge({ icon: Icon, size = 'md', tone = 'primary' }: IconBadgeProps) {
  const colors = useThemeColors()
  const metric = SIZE_MAP[size]

  const palette = {
    primary: { fg: colors.tint, bg: colors.background },
    secondary: { fg: colors.secondary, bg: colors.background },
    muted: { fg: colors.textSecondary, bg: colors.background },
    danger: { fg: colors.destructive, bg: colors.background }
  }[tone]

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      className="items-center justify-center rounded-2xl"
      style={{
        width: metric.box,
        height: metric.box,
        backgroundColor: palette.bg,
        borderWidth: 1,
        borderColor: colors.border
      }}>
      <Icon size={metric.icon} color={palette.fg} strokeWidth={1.75} />
    </View>
  )
}

export { IconBadge }
