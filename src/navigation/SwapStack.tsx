import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { DetailsSwap } from '@screens/swap/DetailsSwap';
import { Swap } from '@screens/swap/Swap';

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
