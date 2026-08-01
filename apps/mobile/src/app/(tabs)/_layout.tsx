import { useLingui } from '@lingui/react/macro';
import { Tabs } from 'expo-router';

import { AppIcon } from '@/components/ui/app-icon';
import { useTheme } from '@/hooks/use-theme';
import { tabIcons } from '@/navigation/tab-icons';

export default function TabLayout() {
  const theme = useTheme();
  const { t } = useLingui();

  return (
    <Tabs
      initialRouteName="(create)"
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: theme.background },
        tabBarActiveTintColor: theme.text,
        tabBarHideOnKeyboard: true,
        tabBarInactiveTintColor: theme.mutedText,
        tabBarLabelStyle: { fontFamily: theme.fontFamily, fontSize: 11 },
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
      }}
    >
      <Tabs.Screen
        name="(create)"
        options={{
          tabBarIcon: ({ color, size }) => (
            <AppIcon color={color} name={tabIcons.create} size={size} />
          ),
          title: t({ id: 'mobile.tab.create', message: 'Create' }),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          tabBarIcon: ({ color, size }) => (
            <AppIcon color={color} name={tabIcons.library} size={size} />
          ),
          title: t({ id: 'mobile.tab.library', message: 'Library' }),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => (
            <AppIcon color={color} name={tabIcons.profile} size={size} />
          ),
          title: t({ id: 'mobile.tab.profile', message: 'Profile' }),
        }}
      />
    </Tabs>
  );
}
