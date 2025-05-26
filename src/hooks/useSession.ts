import { useEffect, useState } from 'react';

import { securityStore } from '@/stores/SecurityStore';
import { sessionStore } from '@/stores/SessionStore';

export const useSession = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const authSession = await sessionStore.load();
        if (authSession) {
          console.debug('Refreshing session...');
          const newSession = await sessionStore.refresh();
          if (!newSession) {
            throw new Error('Can not refresh the session');
          }

          // update user and profile in background, something can be changed in other devices
          sessionStore.fetchUser();
          sessionStore.fetchProfile();
        }
        await securityStore.loadPin();
      } catch (error) {
        console.warn('Can not load the token, cleaning session', error);
        await sessionStore.clear();
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  return {
    isLoading,
    session: sessionStore.session,
  };
};
