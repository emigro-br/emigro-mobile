import { View, Platform, Image } from 'react-native';

import * as IconsOutline from 'react-native-heroicons/outline';
import * as IconsSolid from 'react-native-heroicons/solid';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { QrCodeIcon } from 'lucide-react-native';
import { useTheme } from '@/__utils__/ThemeProvider';

export const unstable_settings = {
  initialRouteName: 'wallet',
};

export default function TabLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets(); // ✅ Access iOS safe area

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
          borderTopWidth: 0,
          paddingTop: 4,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom + 4 : 8,
          height: Platform.OS === 'ios' ? 65 + insets.bottom : 65,
        },
        tabBarActiveTintColor: '#f1496a',
        tabBarInactiveTintColor: theme === 'dark' ? '#AAAAAA' : 'grey',
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  height: 4,
                  width: 40,
                  backgroundColor: focused ? '#f1496a' : 'transparent',
                  borderRadius: 2,
                  marginBottom: 4,
                }}
              />
              <IconsSolid.WalletIcon size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: 'Payments',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  height: 4,
                  width: 40,
                  backgroundColor: focused ? '#f1496a' : 'transparent',
                  borderRadius: 2,
                  marginBottom: 4,
                }}
              />
              <IconsOutline.QrCodeIcon size={size} color={color} />
            </View>
          ),
        }}
      />

	  <Tabs.Screen
	    name="emipoints/index"
	    options={{
	      title: 'EmiPoints',
	      tabBarIcon: ({ color, size, focused }) => (
	        <View style={{ alignItems: 'center' }}>
	          <View
	            style={{
	              height: 4,
	              width: 40,
	              backgroundColor: focused ? '#f1496a' : 'transparent',
	              borderRadius: 2,
	              marginBottom: 4,
	            }}
	          />
	          <Image
	            source={require('@/assets/images/icons/emipoint-icon-red.png')}
	            style={{ width: size, height: size, tintColor: color }}
	            resizeMode="contain"
	          />
	        </View>
	      ),
	    }}
	  />



      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center' }}>
              <View
                style={{
                  height: 4,
                  width: 40,
                  backgroundColor: focused ? '#f1496a' : 'transparent',
                  borderRadius: 2,
                  marginBottom: 4,
                }}
              />
              <IconsOutline.UserCircleIcon size={size} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
