import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ChooseBankCurrencyScreen } from '@screens/onboarding/ChooseBankCurrency';
import { PinOnboarding } from '@screens/onboarding/PinOnboarding';

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
