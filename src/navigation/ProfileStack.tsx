import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Profile from '@/app/profile';
import DeleteAccount from '@/app/profile/delete-account';
import { ConfigurePIN } from '@/app/settings/configure-pin';

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
