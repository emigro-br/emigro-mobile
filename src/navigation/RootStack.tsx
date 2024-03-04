import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AnonStack } from './AnonStack';
import { MainApp } from './MainApp';

export type RootStackParamList = {
  Root: undefined;
  AnonRoot: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type Props = {
  isSignedIn: boolean;
};

function RootStack({ isSignedIn }: Props) {
  return (
    <Stack.Navigator initialRouteName={isSignedIn ? 'Root' : 'AnonRoot'} screenOptions={{ headerShown: false }}>
      {isSignedIn ? (
        <Stack.Screen name="Root" component={MainApp} />
      ) : (
        <Stack.Screen name="AnonRoot" component={AnonStack} />
      )}
    </Stack.Navigator>
  );
}

export default RootStack;
