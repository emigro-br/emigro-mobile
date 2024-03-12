import { useEffect } from 'react';

import { CommonActions, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { UnlockScreen } from '@screens/Unlock';

import { sessionStore } from '@stores/SessionStore';

import { AnonStack } from './AnonStack';
import { MainApp } from './MainApp';

export type RootStackParamList = {
  Root: undefined;
  AnonRoot: undefined;
  Unlock: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type Props = {
  isSignedIn: boolean;
};

function RootStack({ isSignedIn }: Props) {
  const navigation = useNavigation();
  const { justLoggedIn } = sessionStore;

  useEffect(() => {
    const checkUnlockAsync = async () => {
      // got to unlock screen if user is signed in and not just logged in
      if (isSignedIn && !justLoggedIn) {
        // FIXME: skip pin screen if user has no pin
        const pin = await sessionStore.loadPin();
        if (!pin) {
          return;
        }
        // same as navigation.replace(), to prevent back button
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Unlock' }],
          }),
        );
      }
    };

    checkUnlockAsync();
  }, [isSignedIn, justLoggedIn]);

  return (
    <Stack.Navigator initialRouteName={isSignedIn ? 'Root' : 'AnonRoot'} screenOptions={{ headerShown: false }}>
      {isSignedIn ? (
        <>
          <Stack.Screen name="Unlock" component={UnlockScreen} />
          <Stack.Screen name="Root" component={MainApp} />
        </>
      ) : (
        <Stack.Screen name="AnonRoot" component={AnonStack} />
      )}
    </Stack.Navigator>
  );
}

export default RootStack;
