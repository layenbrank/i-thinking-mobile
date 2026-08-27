import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, Mail, Send } from 'lucide-react-native'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Pressable, Text, TextInput, View } from 'react-native'
import { z } from 'zod'

import { Screen } from '@/components/ui/Screen'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { useThemeColors } from '@/components/ui/useThemeColors'

const schema = z.object({
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be 18+')
})

type FormData = z.infer<typeof schema>

export default function ComplexForm() {
  const { t } = useTranslation()
  const colors = useThemeColors()
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', age: 0 }
  })

  function onSubmit(data: FormData) {
    console.log(data)
  }

  return (
    <Screen scroll>
      <SectionHeader
        icon={Send}
        title="Intake form"
        description="Visible labels, field-level errors, and input icons that clarify each control."
      />

      <View className="gap-5">
        <View className="gap-2">
          <Text className="text-sm font-medium" style={{ color: colors.text }}>
            Email
          </Text>
          <View
            className="min-h-[48px] flex-row items-center gap-3 rounded-xl border px-3"
            style={{
              backgroundColor: colors.surface,
              borderColor: errors.email ? colors.destructive : colors.border
            }}>
            <Mail size={18} color={colors.textSecondary} strokeWidth={1.75} />
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  accessibilityLabel="Email"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="flex-1 py-3 text-base"
                  keyboardType="email-address"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder="name@company.com"
                  placeholderTextColor={colors.textSecondary}
                  style={{ color: colors.text }}
                  value={value}
                />
              )}
            />
          </View>
          {errors.email ? (
            <Text className="text-sm" style={{ color: colors.destructive }}>
              {errors.email.message}
            </Text>
          ) : null}
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium" style={{ color: colors.text }}>
            Age
          </Text>
          <View
            className="min-h-[48px] flex-row items-center gap-3 rounded-xl border px-3"
            style={{
              backgroundColor: colors.surface,
              borderColor: errors.age ? colors.destructive : colors.border
            }}>
            <Calendar size={18} color={colors.textSecondary} strokeWidth={1.75} />
            <Controller
              control={control}
              name="age"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  accessibilityLabel="Age"
                  className="flex-1 py-3 text-base"
                  keyboardType="number-pad"
                  onBlur={onBlur}
                  onChangeText={(text) => onChange(Number(text) || 0)}
                  placeholder="18"
                  placeholderTextColor={colors.textSecondary}
                  style={{ color: colors.text }}
                  value={value ? String(value) : ''}
                />
              )}
            />
          </View>
          {errors.age ? (
            <Text className="text-sm" style={{ color: colors.destructive }}>
              {errors.age.message}
            </Text>
          ) : null}
        </View>

        <Pressable
          accessibilityRole="button"
          className="mt-2 min-h-[48px] flex-row items-center justify-center gap-2 rounded-xl active:opacity-80"
          onPress={handleSubmit(onSubmit)}
          style={{ backgroundColor: colors.tint }}>
          <Send size={18} color="#FFFFFF" strokeWidth={2} />
          <Text className="text-base font-semibold text-white">{t('submit')}</Text>
        </Pressable>
      </View>
    </Screen>
  )
}
