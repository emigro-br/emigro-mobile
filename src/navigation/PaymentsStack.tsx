import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Header from '@components/Header';

import ConfirmPayment from '@screens/payments/ConfirmPayment';
import { PayWithQRCode } from '@screens/payments/PayWithQRCode';
import { Payments } from '@screens/payments/Payments';
import { RequestPayment } from '@screens/payments/RequestPayment';
import { RequestWithQRCode } from '@screens/payments/RequestWithQRCode';

import screenOptions from './screenOptions';

export type PaymentStackParamList = {
  Payments: undefined;
  PayWithQRCode: undefined;
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
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Payments" component={Payments} options={{ title: 'Payments', header: () => <Header /> }} />
      <Stack.Screen name="PayWithQRCode" component={PayWithQRCode} options={{ title: 'Scan a Payment' }} />
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
