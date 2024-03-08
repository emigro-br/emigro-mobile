import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Header from '@components/Header';

import ConfirmPayment from '@screens/payments/ConfirmPayment';
import Payments from '@screens/payments/Payments';
import { RequestPayment } from '@screens/payments/RequestPayment';

export type PaymentStackParamList = {
  Payments: undefined;
  ConfirmPayment: undefined;
  RequestPayment: undefined;
};

const Stack = createNativeStackNavigator<PaymentStackParamList>();

export function PaymentStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: 'red' }}>
      <Stack.Screen name="Payments" component={Payments} options={{ title: 'Payments', header: () => <Header /> }} />
      <Stack.Screen name="ConfirmPayment" component={ConfirmPayment} options={{ title: 'Confirm Payment' }} />
      <Stack.Screen name="RequestPayment" component={RequestPayment} options={{ title: 'Request Payment' }} />
    </Stack.Navigator>
  );
}
