import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/src/lib/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, color, focused }: { name: IoniconsName; color: string; focused: boolean }) {
  return <Ionicons name={focused ? name : `${name}-outline` as IoniconsName} size={24} color={color} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.card,
          borderTopColor: Colors.border,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerStyle: { backgroundColor: Colors.card },
        headerTintColor: Colors.textPrimary,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, focused }) => <TabIcon name="rocket" color={color} focused={focused} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="launches"
        options={{
          title: 'Lanzamientos',
          tabBarIcon: ({ color, focused }) => <TabIcon name="calendar" color={color} focused={focused} />,
          headerTitle: 'Lanzamientos',
        }}
      />
      <Tabs.Screen
        name="rockets"
        options={{
          title: 'Cohetes',
          tabBarIcon: ({ color, focused }) => <TabIcon name="planet" color={color} focused={focused} />,
          headerTitle: 'Enciclopedia',
        }}
      />
      <Tabs.Screen
        name="news"
        options={{
          title: 'Noticias',
          tabBarIcon: ({ color, focused }) => <TabIcon name="newspaper" color={color} focused={focused} />,
          headerTitle: 'Noticias espaciales',
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color, focused }) => <TabIcon name="bookmark" color={color} focused={focused} />,
          headerTitle: 'Mis favoritos',
        }}
      />
    </Tabs>
  );
}
