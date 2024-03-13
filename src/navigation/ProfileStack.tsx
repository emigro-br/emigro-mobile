import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Header from '@components/Header';

import { ConfigurePIN } from '@screens/profile/ConfigurePIN';
import DeleteAccount from '@screens/profile/DeleteAccount';
import Profile from '@screens/profile/Profile';

export type ProfileStackParamList = {
  Profile: undefined;
  DeleteAccount: undefined;
  ConfigurePIN: { backTo: string } | undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: 'red' }}>
      <Stack.Screen name="Profile" component={Profile} options={{ title: 'Profile', header: () => <Header /> }} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccount} options={{ title: 'Delete Account' }} />
      <Stack.Screen name="ConfigurePIN" component={ConfigurePIN} options={{ title: 'Configure PIN' }} />
    </Stack.Navigator>
  );
}
