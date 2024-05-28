import { useEffect } from 'react';

import { Redirect, Slot, useRouter } from 'expo-router';
import { observer } from 'mobx-react-lite';

import { SplashScreen } from '@/components/Splash';
import { useSession } from '@/hooks/useSession';
import { securityStore } from '@/stores/SecurityStore';
import { sessionStore } from '@/stores/SessionStore';

export function AppLayout() {
  const router = useRouter();
  const { session, isLoading } = useSession();

  const isLogged = session && !isLoading;
  useEffect(() => {
    if (isLogged) {
      const hasCurrencyChoosen = (sessionStore.preferences?.fiatsWithBank || []).length > 0;
      if (!hasCurrencyChoosen) {
        router.replace('/onboarding/choose-bank-currency');
        return;
      }

      const hasPin = securityStore.pin;
      if (hasPin) {
        router.replace('/unlock');
      } else {
        router.replace('/onboarding/pin');
      }
    }
  }, [isLogged, securityStore.pin]);

  if (isLoading) {
    // We haven't finished checking for the token yet
    return <SplashScreen />;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    return <Redirect href="/welcome" />;
  }

  return <Slot />;
}

export default observer(AppLayout);
