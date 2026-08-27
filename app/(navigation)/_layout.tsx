import { ClipboardList, FileInput, Home, LayoutGrid, type LucideIcon } from 'lucide-react-native'
import { Tabs } from 'expo-router'
import { Platform } from 'react-native'

import { useThemeColors } from '@/components/ui/useThemeColors'

interface NavIconProps {
  icon: LucideIcon
  color: string
  focused: boolean
}

function NavIcon({ icon: Icon, color, focused }: NavIconProps) {
  return <Icon size={22} color={color} strokeWidth={focused ? 2.25 : 1.75} />
}

export default function NavigationLayout() {
  const colors = useThemeColors()

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17
        },
        headerShadowVisible: false,
        headerTitleAlign: 'center',
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10
        },
        tabBarItemStyle: {
          minHeight: 44,
          gap: 2
        }
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarAccessibilityLabel: 'Home',
          tabBarIcon: ({ color, focused }) => <NavIcon icon={Home} color={color} focused={focused} />
        }}
      />
      <Tabs.Screen
        name="form"
        options={{
          title: 'Form',
          tabBarAccessibilityLabel: 'Form',
          tabBarIcon: ({ color, focused }) => (
            <NavIcon icon={FileInput} color={color} focused={focused} />
          )
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: 'List',
          tabBarAccessibilityLabel: 'List',
          tabBarIcon: ({ color, focused }) => (
            <NavIcon icon={ClipboardList} color={color} focused={focused} />
          )
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarAccessibilityLabel: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <NavIcon icon={LayoutGrid} color={color} focused={focused} />
          )
        }}
      />
    </Tabs>
  )
}
