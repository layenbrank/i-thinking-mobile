import { Image, Text, View } from 'react-native'

import { useThemeColors } from '@/components/ui/useThemeColors'

interface BrandHeroProps {
  eyebrow: string
  title: string
  description: string
}

function BrandHero({ eyebrow, title, description }: BrandHeroProps) {
  const colors = useThemeColors()

  return (
    <View
      className="mb-8 overflow-hidden rounded-3xl border p-5"
      style={{ backgroundColor: colors.surface, borderColor: colors.border }}>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        className="absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-40"
        style={{ backgroundColor: colors.background }}
      />
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        className="absolute -bottom-10 -left-4 h-24 w-24 rounded-full opacity-50"
        style={{ backgroundColor: colors.background }}
      />

      <View className="mb-4 flex-row items-center gap-3">
        <Image
          accessibilityIgnoresInvertColors
          accessible={false}
          className="h-12 w-12 rounded-2xl"
          resizeMode="contain"
          source={require('../../assets/images/icon.png')}
          style={{ backgroundColor: colors.background }}
        />
        <Text className="text-sm font-semibold tracking-wide" style={{ color: colors.secondary }}>
          {eyebrow}
        </Text>
      </View>

      <Text className="mb-2 text-3xl font-bold tracking-tight" style={{ color: colors.text }}>
        {title}
      </Text>
      <Text className="text-base leading-6" style={{ color: colors.textSecondary }}>
        {description}
      </Text>
    </View>
  )
}

export { BrandHero }
