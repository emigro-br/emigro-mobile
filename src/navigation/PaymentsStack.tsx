import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Payments } from '@/app/payments';
import { ConfirmPayment } from '@/app/payments/confirm';
import { PastePixCode } from '@/app/payments/pix/copia-e-cola';
import { RequestPayment } from '@/app/payments/request';
import { RequestWithQRCode } from '@/app/payments/request/show-qr-code';
import { PayWithQRCode } from '@/app/payments/scan';
import Header from '@/components/Header';

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
  PastePixCode: undefined;
};

const Stack = createNativeStackNavigator<PaymentStackParamList>();

export function PaymentStack() {
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="Payments" component={Payments} options={{ title: 'Payments', header: () => <Header /> }} />
      <Stack.Screen
        name="PayWithQRCode"
        component={PayWithQRCode}
        options={{ title: 'Scan a Payment', headerShown: false }}
      />
      <Stack.Screen
        name="ConfirmPayment"
        component={ConfirmPayment}
        options={{ title: 'Confirm Payment', headerBackTitle: 'Scan' }}
      />
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
      <Stack.Screen name="PastePixCode" component={PastePixCode} options={{ title: 'Pay with Pix' }} />
    </Stack.Navigator>
  );
}
