import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ChooseBankCurrencyScreen } from '@/app/onboarding/choose-bank-currency';
import { PinOnboarding } from '@/app/onboarding/pin';

export type OnboardingStackParamList = {
  ChooseBankCurrency: undefined;
  PinOnboarding: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingStack() {
  return (
    <Stack.Navigator initialRouteName="ChooseBankCurrency" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ChooseBankCurrency" component={ChooseBankCurrencyScreen} />
      <Stack.Screen name="PinOnboarding" component={PinOnboarding} />
    </Stack.Navigator>
  );
}
