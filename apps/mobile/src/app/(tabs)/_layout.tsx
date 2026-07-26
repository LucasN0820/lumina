import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { useTheme } from '@/hooks/use-theme';

export default function TabLayout() {
  const theme = useTheme();

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
          title: '创作',
          tabBarIcon: ({ color, size }) => (
            <SymbolView name="sparkles" size={size} tintColor={color} weight="semibold" />
          ),
        }}
      />
      <Tabs.Screen
        name="library"
        options={{
          title: '壁纸库',
          tabBarIcon: ({ color, size }) => (
            <SymbolView name="photo.on.rectangle" size={size} tintColor={color} weight="semibold" />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '我的',
          tabBarIcon: ({ color, size }) => (
            <SymbolView name="person.crop.circle" size={size} tintColor={color} weight="semibold" />
          ),
        }}
      />
    </Tabs>
  );
}
