import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Header from '@components/Header';

import ConfirmPayment from '@screens/payments/ConfirmPayment';
import { Payments } from '@screens/payments/Payments';
import { RequestPayment } from '@screens/payments/RequestPayment';
import { RequestWithQRCode } from '@screens/payments/RequestWithQRCode';

export type PaymentStackParamList = {
  Payments: undefined;
  ConfirmPayment: undefined;
  RequestPayment: {
    asset: string;
  };
  RequestWithQRCode: {
    asset: string;
    value: number;
  };
};

const Stack = createNativeStackNavigator<PaymentStackParamList>();

export function PaymentStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: 'red' }}>
      <Stack.Screen name="Payments" component={Payments} options={{ title: 'Payments', header: () => <Header /> }} />
      <Stack.Screen name="ConfirmPayment" component={ConfirmPayment} options={{ title: 'Confirm Payment' }} />
      <Stack.Screen name="RequestPayment" component={RequestPayment} options={{ title: 'Request Payment' }} />
      <Stack.Screen
        name="RequestWithQRCode"
        component={RequestWithQRCode}
        options={{
          title: 'Request with QR Code',
          headerShown: false,
          gestureEnabled: false, // disable swap back gesture
        }}
      />
    </Stack.Navigator>
  );
}
