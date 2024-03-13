import { useEffect } from 'react';

import { CommonActions, NavigatorScreenParams, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { UnlockScreen } from '@screens/Unlock';
import { PinOnboarding } from '@screens/onboarding/PinOnboarding';

import { sessionStore } from '@stores/SessionStore';

import { AnonStack } from './AnonStack';
import { MainApp, TabNavParamList } from './MainApp';

export type RootStackParamList = {
  Root: NavigatorScreenParams<TabNavParamList> | undefined;
  AnonRoot: undefined;
  PinOnboarding: undefined;
  Unlock: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type Props = {
  isSignedIn: boolean;
};

function RootStack({ isSignedIn }: Props) {
  const navigation = useNavigation();

  useEffect(() => {
    const checkUnlockAsync = async () => {
      const pin = await sessionStore.loadPin();
      // got to unlock screen if user has a pin, else go to pin onboarding
      const nextScreen = pin ? 'Unlock' : 'PinOnboarding';

      // same as navigation.replace(), to prevent back button
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: nextScreen }],
        }),
      );
    };

    if (isSignedIn) {
      checkUnlockAsync();
    }
  }, [isSignedIn]);

  return (
    <Stack.Navigator initialRouteName={isSignedIn ? 'Root' : 'AnonRoot'} screenOptions={{ headerShown: false }}>
      {isSignedIn ? (
        <>
          <Stack.Screen name="Root" component={MainApp} />
          <Stack.Screen name="PinOnboarding" component={PinOnboarding} />
          <Stack.Screen name="Unlock" component={UnlockScreen} />
        </>
      ) : (
        <Stack.Screen name="AnonRoot" component={AnonStack} />
      )}
    </Stack.Navigator>
  );
}

export default RootStack;
