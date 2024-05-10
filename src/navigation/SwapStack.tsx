import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Swap } from '@/app/wallet/swap';
import { DetailsSwap } from '@/app/wallet/swap/review';

import screenOptions from './screenOptions';

export type SwapStackParamList = {
  Swap: undefined;
  SwapReview: undefined;
};

const Stack = createNativeStackNavigator<SwapStackParamList>();

export function SwapStack() {
  return (
    <Stack.Navigator screenOptions={{ ...screenOptions, headerShown: false }}>
      <Stack.Screen name="Swap" component={Swap} options={{ title: 'Swap' }} />
      <Stack.Screen name="SwapReview" component={DetailsSwap} options={{ title: 'Review Swap' }} />
    </Stack.Navigator>
  );
}
