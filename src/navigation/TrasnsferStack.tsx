import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Transfers from '@/app/wallet/transfers';
import SendAsset from '@/app/wallet/transfers/SendAsset';
import ReviewTransfer from '@/app/wallet/transfers/review';

import screenOptions from './screenOptions';

export type TransferStackParamList = {
  Transfers: undefined;
  SendAsset: {
    asset: string;
  };
  ReviewTransfer: undefined;
};

const Stack = createNativeStackNavigator<TransferStackParamList>();

export function TransferStack() {
  return (
    <Stack.Navigator initialRouteName="Transfers" screenOptions={{ ...screenOptions, headerShown: false }}>
      <Stack.Screen name="Transfers" component={Transfers} options={{ title: 'Transfers' }} />
      <Stack.Screen name="ReviewTransfer" component={ReviewTransfer} options={{ title: 'Review Transfer' }} />
      <Stack.Screen
        name="SendAsset"
        component={SendAsset}
        options={{ title: 'Transfers' }}
        initialParams={{ asset: '' }}
      />
    </Stack.Navigator>
  );
}
