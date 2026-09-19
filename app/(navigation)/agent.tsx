import { useTranslation } from 'react-i18next'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { ChatComposer } from '@/components/agent/ChatComposer'
import { ChatThread } from '@/components/agent/ChatThread'
import { useThemeColors } from '@/components/ui/useThemeColors'
import { useAgentStore } from '@/stores/agentStore'
import { useAuthStore } from '@/stores/authStore'

export default function AgentScreen() {
  const { t } = useTranslation()
  const colors = useThemeColors()
  const insets = useSafeAreaInsets()
  const token = useAuthStore((state) => state.token)
  const messages = useAgentStore((state) => state.messages)
  const isStreaming = useAgentStore((state) => state.isStreaming)
  const error = useAgentStore((state) => state.error)
  const send = useAgentStore((state) => state.send)
  const abort = useAgentStore((state) => state.abort)
  const model = useAgentStore((state) => state.model)

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: colors.background, paddingBottom: insets.bottom }}>
      <View
        className="border-b px-4 py-2"
        style={{ borderBottomColor: colors.border, backgroundColor: colors.surface }}>
        <Text
          className="text-xs"
          style={{ color: colors.textSecondary }}>
          {t('agentModel')}: {model}
        </Text>
        {error ? (
          <Text
            className="mt-1 text-xs"
            style={{ color: colors.destructive }}>
            {error}
          </Text>
        ) : null}
      </View>
      <ChatThread
        isStreaming={isStreaming}
        messages={messages}
      />
      <ChatComposer
        disabled={!token}
        isStreaming={isStreaming}
        onAbort={abort}
        onSend={(text) => {
          if (!token) {
            return
          }
          void send(token, text)
        }}
      />
    </View>
  )
}
