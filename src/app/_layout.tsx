// src/app/_layout.tsx
import React, { useEffect, useState, useRef } from 'react';
import { LogBox, View, Text, Platform } from 'react-native';
import * as Updates from 'expo-updates';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import { SplashScreen, Slot, useNavigationContainerRef, useRouter } from 'expo-router';
import { isRunningInExpoGo } from 'expo';
import * as Sentry from '@sentry/react-native';

import { ThemeProvider } from '@/__utils__/ThemeProvider';
import '@/global.css';
import { registerForPushNotificationsAsync } from '@/utils/notifications';
import { api } from '@/services/emigro/api';
import VersionLockScreen from '@/screens/VersionLock';
import { sessionStore } from '@/stores/SessionStore';

LogBox.ignoreLogs([
  'new NativeEventEmitter() was called with a non-null argument',
]);

SplashScreen.preventAutoHideAsync().catch((e) => {
  console.warn('[app/_layout][SPLASH] Failed to prevent auto hide', e);
});

let routingInstrumentation: any;

try {
  const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

  if (Sentry && Sentry.ReactNavigationInstrumentation) {
    routingInstrumentation = new Sentry.ReactNavigationInstrumentation();
  } else {
    console.warn('[app/_layout][SENTRY] ReactNavigationInstrumentation is not available');
  }

  if (sentryDsn && Sentry) {
    console.log('[app/_layout][SENTRY] Initializing...');
    Sentry.init({
      dsn: sentryDsn,
      debug: __DEV__,
      environment: __DEV__ ? 'development' : 'production',
      tracesSampleRate: 1.0,
      integrations: [
        new Sentry.ReactNativeTracing({
          routingInstrumentation,
          enableNativeFramesTracking: !isRunningInExpoGo(),
        }),
      ],
    });
  }
} catch (e) {
  console.error('[app/_layout][SENTRY] Failed to initialize Sentry:', e);
}

function AppLayout() {
  const [isReady, setIsReady] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState('');
  const [storeUrl, setStoreUrl] = useState<string | undefined>(undefined);
  const [mode, setMode] = useState<string | null>(null);

  const navRef = useNavigationContainerRef();
  const router = useRouter();
  const hasRedirected = useRef(false);

  useEffect(() => {
    try {
      if (routingInstrumentation && navRef) {
        console.log('[app/_layout][NAVIGATION] Registering navigation container');
        routingInstrumentation.registerNavigationContainer(navRef);
      }
    } catch (e) {
      console.error('[app/_layout][NAVIGATION] Failed to register container:', e);
    }
  }, [navRef]);

  // App init
  useEffect(() => {
    let cancelled = false;

    async function prepare() {
      try {
        console.log('[app/_layout][UPDATES] Checking for updates...');
        const platform = Platform.OS;
        const currentVersion = Application.nativeApplicationVersion || '0.0.0';
        const res = await api().get('/version/check', {
          params: { platform },
        });

        const { minVersion, forceUpdate, message, storeUrl: apiStoreUrl } = res.data;
        console.log(`[VERSION] App version: ${currentVersion} | Required: ${minVersion}`);

        if (forceUpdate && compareVersions(currentVersion, minVersion) < 0) {
          setBlockMessage(message || 'Please update your app.');
          setStoreUrl(apiStoreUrl);
          setIsBlocked(true);
          return;
        }

        await sessionStore.load();
        setMode(sessionStore.preferences?.startupMode || 'wallet');
		// ✅ Register push device after session is ready
		registerForPushNotificationsAsync().then(async (token) => {
		  if (!token) {
		    console.warn('[PUSH] No push token received');
		    return;
		  }

		  const payload = {
		    expo_push_token: token,
		    device_type: Platform.OS,
		    device_name: Device.deviceName,
		    app_version: Constants.expoConfig?.version,
		    os_version: Device.osVersion,
		  };

		  const maxAttempts = 3;
		  let attempt = 0;

		  while (attempt < maxAttempts) {
		    attempt++;

		    const tokenReady = sessionStore.accessToken;
		    if (!tokenReady) {
		      console.warn(`[PUSH] Attempt ${attempt}: Access token not ready, waiting...`);
		      await new Promise((r) => setTimeout(r, 1000));
		      continue;
		    }

		    const apiWithAuth = api({
		      headers: {
		        Authorization: `Bearer ${tokenReady}`,
		      },
		    });

		    try {
		      await apiWithAuth.post('/notifications/debug/log', {
		        tag: 'TestFlight push registration (attempt ' + attempt + ')',
		        token,
		        payload,
		      });

		      const res = await apiWithAuth.post('/notifications/register-device', payload);
		      console.log('[PUSH] Token sent to backend ✅', res.data);
		      break; // ✅ success, stop trying
		    } catch (err: any) {
		      if (err.response?.status === 401) {
		        console.warn(`[PUSH] Attempt ${attempt}: Unauthorized — will retry`);
		        await new Promise((r) => setTimeout(r, 1000));
		      } else {
		        console.warn('[PUSH] Register device failed:', err.message ?? err);
		        break; // other error, don't retry
		      }
		    }
		  }
		});


		
        if (!__DEV__) {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
          }
        }
      } catch (e) {
        console.warn('[app/_layout][ERROR]', e);
      } finally {
        if (!cancelled) {
          try {
            await SplashScreen.hideAsync();
          } catch (e) {
            console.warn('[app/_layout][SPLASH] Failed to hide splash screen', e);
          }
          setIsReady(true);
        }
      }
    }

    prepare();

    return () => {
      cancelled = true;
    };
  }, []);

  // ✅ Redirect logic in its own useEffect
  useEffect(() => {
    if (!isReady || hasRedirected.current || !mode) return;

    const path = router?.asPath;
    console.log('[app/_layout][REDIRECT CHECK]', { mode, path });

    if (mode === 'payment' && path !== '/(auth)/payments/fast') {
      hasRedirected.current = true;
      console.log('[app/_layout] Redirecting to /payments/fast');
      router.replace('/(auth)/payments/fast');
    }
  }, [isReady, mode, router]);

  if (isBlocked) {
    return <VersionLockScreen message={blockMessage} storeUrl={storeUrl} />;
  }

  if (!isReady) {
    return (
      <View className="flex-1 bg-background-0 justify-center items-center">
        <Text style={{ color: 'gray' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ThemeProvider>
      <Slot />
    </ThemeProvider>
  );
}

const compareVersions = (a: string, b: string) => {
  const pa = a.split('.').map(Number);
  const pb = b.split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] || 0) - (pb[i] || 0);
    if (diff !== 0) return diff;
  }
  return 0;
};

export default Sentry.wrap(AppLayout);
