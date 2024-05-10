import { useEffect } from 'react';

import { CommonActions, NavigatorScreenParams, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { UnlockScreen } from '@/app/unlock';
import { sessionStore } from '@/stores/SessionStore';

import { AnonStack } from './AnonStack';
import { MainApp, TabNavParamList } from './MainApp';
import { OnboardingStack } from './OnboardingStack';

export type RootStackParamList = {
  Root: NavigatorScreenParams<TabNavParamList> | undefined;
  AnonRoot: undefined;
  Onboarding: undefined;
  Unlock: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type Props = {
  isSignedIn: boolean;
};

function RootStack({ isSignedIn }: Props) {
  const navigation = useNavigation();

  const navReplace = (name: string, params?: any) => {
    // same as navigation.replace(), to prevent back button
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name, params }],
      }),
    );
  };

  useEffect(() => {
    const checkUnlockAsync = async () => {
      // TODO: load the PIN in the store to prevent check async
      const pin = await sessionStore.loadPin();
      if (pin) {
        navReplace('Unlock');
      }
    };

    if (isSignedIn) {
      checkUnlockAsync();

      // TODO: also check the PIN
      const onboardingComplete = (sessionStore.preferences?.fiatsWithBank || []).length > 0;
      if (!onboardingComplete) {
        navReplace('Onboarding');
      }
    }
  }, [isSignedIn]);

  return (
    <Stack.Navigator initialRouteName={isSignedIn ? 'Root' : 'AnonRoot'} screenOptions={{ headerShown: false }}>
      {isSignedIn ? (
        <>
          <Stack.Screen name="Root" component={MainApp} />
          <Stack.Screen name="Onboarding" component={OnboardingStack} />
          <Stack.Screen name="Unlock" component={UnlockScreen} />
        </>
      ) : (
        <Stack.Screen name="AnonRoot" component={AnonStack} />
      )}
    </Stack.Navigator>
  );
}

export default RootStack;
