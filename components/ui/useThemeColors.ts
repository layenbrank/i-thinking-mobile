import { useColorScheme as useSystemColorScheme } from 'react-native'
import { useAppColorScheme } from '@/components/useAppColorScheme'
import Colors from '@/constants/Colors'

function useThemeColors() {
  const scheme = useAppColorScheme()
  return Colors[scheme]
}

export { useThemeColors }
