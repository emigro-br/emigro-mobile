import { Stack } from 'expo-router';

import screenOptions from '@/navigation/screenOptions';

export const unstable_settings = {
  // Ensure any route can link back to `/`
  initialRouteName: 'index',
};

export default function WalletLayout() {
  return <Stack screenOptions={{ ...screenOptions }} />;
}
