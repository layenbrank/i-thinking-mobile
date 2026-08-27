import { useColorScheme } from 'react-native'

import Colors from '@/constants/Colors'

function useThemeColors() {
  const scheme = useColorScheme()
  return Colors[scheme === 'dark' ? 'dark' : 'light']
}

export { useThemeColors }
