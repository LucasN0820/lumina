import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useLingui } from '@lingui/react/macro';

import { useTheme } from '@/hooks/use-theme';

export default function TabLayout() {
  const theme = useTheme();
  const { t } = useLingui();

  return (
    <Tabs
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerTitleStyle: { color: theme.text, fontFamily: theme.fontFamily, fontWeight: '700' },
        sceneStyle: { backgroundColor: theme.background },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.mutedText,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.border },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t({ id: 'mobile.tab.create', message: 'Create' }),
          tabBarIcon: ({ color, size }) => (
            <SymbolView name="sparkles" size={size} tintColor={color} weight="semibold" />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: t({ id: 'mobile.tab.library', message: 'Library' }),
          tabBarIcon: ({ color, size }) => (
            <SymbolView name="photo.on.rectangle" size={size} tintColor={color} weight="semibold" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t({ id: 'mobile.tab.profile', message: 'Profile' }),
          tabBarIcon: ({ color, size }) => (
            <SymbolView name="person.crop.circle" size={size} tintColor={color} weight="semibold" />
          ),
        }}
      />
    </Tabs>
  );
}
