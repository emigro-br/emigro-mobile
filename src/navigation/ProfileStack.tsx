import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ConfigurePIN } from '@screens/profile/ConfigurePIN';
import DeleteAccount from '@screens/profile/DeleteAccount';
import Profile from '@screens/profile/Profile';

import screenOptions from './screenOptions';

export type ProfileStackParamList = {
  Profile: undefined;
  DeleteAccount: undefined;
  ConfigurePIN: { backTo: string } | undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Profile" component={Profile} options={{ title: 'Profile', headerShown: false }} />
      <Stack.Screen name="DeleteAccount" component={DeleteAccount} options={{ title: 'Delete Account' }} />
      <Stack.Screen name="ConfigurePIN" component={ConfigurePIN} options={{ title: 'Configure PIN' }} />
    </Stack.Navigator>
  );
}
