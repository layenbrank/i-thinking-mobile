import { BookOpen, Compass, Layers, ShieldCheck } from 'lucide-react-native'
import { View } from 'react-native'

import { InfoCard } from '@/components/ui/InfoCard'
import { Screen } from '@/components/ui/Screen'
import { SectionHeader } from '@/components/ui/SectionHeader'

export default function ExploreScreen() {
  return (
    <Screen scroll>
      <SectionHeader
        icon={Compass}
        title="Explore"
        description="Discover how navigation, modules, and trust cues stay readable without visual noise."
      />

      <View className="gap-3">
        <InfoCard
          icon={Layers}
          title="Navigation model"
          description="Four primary destinations stay in the tab bar. Modal flows sit on the root stack."
        />
        <InfoCard
          icon={ShieldCheck}
          title="Trust cues"
          description="Icons mark purpose—validation, lists, confirmation—not empty ornament."
        />
        <InfoCard
          icon={BookOpen}
          title="Next modules"
          description="Reserve this surface for docs, feature previews, and onboarding shortcuts."
        />
      </View>
    </Screen>
  )
}
