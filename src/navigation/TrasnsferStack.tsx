import { createNativeStackNavigator } from '@react-navigation/native-stack';

import ReviewTransfer from '@screens/transfers/ReviewTransfer';
import SendAsset from '@screens/transfers/SendAsset';
import Transfers from '@screens/transfers/Transfers';

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
