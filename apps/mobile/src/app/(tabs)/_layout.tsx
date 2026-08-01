import { useLingui } from '@lingui/react/macro';
import { NativeTabs } from 'expo-router/unstable-native-tabs';

import { useTheme } from '@/hooks/use-theme';
import { tabIcons } from '@/navigation/tab-icons';

export default function TabLayout() {
  const theme = useTheme();
  const { t } = useLingui();

  return (
    <NativeTabs
      backgroundColor={theme.surface}
      disableTransparentOnScrollEdge
      iconColor={{ default: theme.mutedText, selected: theme.text }}
      indicatorColor={theme.muted}
      labelStyle={{ color: theme.mutedText, fontFamily: theme.fontFamily, fontSize: 11 }}
      labelVisibilityMode="labeled"
      minimizeBehavior="onScrollDown"
      rippleColor={theme.muted}
      tabBarRespectsIMEInsets
      tintColor={theme.text}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon {...tabIcons.index} />
        <NativeTabs.Trigger.Label>
          {t({ id: 'mobile.tab.create', message: 'Create' })}
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="library">
        <NativeTabs.Trigger.Icon {...tabIcons.library} />
        <NativeTabs.Trigger.Label>
          {t({ id: 'mobile.tab.library', message: 'Library' })}
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <NativeTabs.Trigger.Icon {...tabIcons.profile} />
        <NativeTabs.Trigger.Label>
          {t({ id: 'mobile.tab.profile', message: 'Profile' })}
        </NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
