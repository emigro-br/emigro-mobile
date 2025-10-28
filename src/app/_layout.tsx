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

import * as Notifications from 'expo-notifications';
import { observer } from 'mobx-react-lite';

// --- Notifications setup ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

LogBox.ignoreLogs([
  'new NativeEventEmitter() was called with a non-null argument',
]);

SplashScreen.preventAutoHideAsync().catch((e) => {
  console.warn('[app/_layout][SPLASH] Failed to prevent auto hide', e);
});

// --- Sentry setup ---
let routingInstrumentation: any;

try {
  const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!sentryDsn) {
    console.warn('[SENTRY] ❌ DSN is missing in production!');
  } else {
    console.log('[SENTRY] ✅ DSN is:', sentryDsn);
  }

  if (Sentry && Sentry.ReactNavigationInstrumentation) {
    routingInstrumentation = new Sentry.ReactNavigationInstrumentation();
  } else {
    console.warn('[app/_layout][SENTRY] ReactNavigationInstrumentation is not available');
  }

  if (sentryDsn && Sentry) {
    console.log('[app/_layout][SENTRY] Initializing...');
    console.log('[Sentry] DSN from env:', sentryDsn);

    Sentry.init({
      dsn: sentryDsn,
      debug: __DEV__,
      environment: __DEV__ ? 'development' : 'production',
      sendDefaultPii: true,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1,
      integrations: [
        new Sentry.ReactNativeTracing({
          routingInstrumentation,
          enableNativeFramesTracking: !isRunningInExpoGo(),
        }),
        Sentry.mobileReplayIntegration(),
        Sentry.feedbackIntegration(),
      ],
    });

    // ✅ Send test events
    Sentry.captureMessage('✅ Test message from _layout.tsx');
    Sentry.captureException(new Error('🚨 Test error from _layout.tsx'));
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
		// Version check (fast-fail in 5s so boot can't hang)
		let needsBlock = false;
		try {
		  const platform = Platform.OS;
		  const currentVersion = Application.nativeApplicationVersion || '0.0.0';

		  // override only this request to 5s (does NOT change global axios defaults)
		  const res = await api({ timeout: 5000 }).get('/version/check', { params: { platform } });
		  const { minVersion, forceUpdate, message, storeUrl: apiStoreUrl } = res.data;
		  console.log(`[VERSION] App version: ${currentVersion} | Required: ${minVersion}`);

		  if (forceUpdate && compareVersions(currentVersion, minVersion) < 0) {
		    setBlockMessage(message || 'Please update your app.');
		    setStoreUrl(apiStoreUrl);
		    needsBlock = true;
		  }
		} catch (e) {
		  console.warn('[app/_layout][VERSION] Skipping version check (timeout or error):', (e as any)?.message ?? e);
		}

		if (needsBlock) {
		  setIsBlocked(true);
		  return; // don't proceed with normal boot if truly blocked
		}


        await sessionStore.load();
        console.log('[SESSION] Loaded →', {
          isLoaded: sessionStore.isLoaded,
          hasSession: !!sessionStore.session,
        });

        setMode(sessionStore.preferences?.startupMode || 'wallet');

        // ✅ Register push device only if signed in
        if (sessionStore.user?.id && sessionStore.accessToken) {
          console.log('[PUSH] Starting registration...');
          registerForPushNotificationsAsync().then(async (token) => {
            if (!token) {
              console.warn('[PUSH] No token received');
              return;
            }

            const payload = {
              expo_push_token: token,
              device_type: Platform.OS,
              device_name: Device.deviceName,
              app_version: Constants.expoConfig?.version,
              os_version: Device.osVersion,
            };

            try {
              const apiWithAuth = api({
                headers: { Authorization: `Bearer ${sessionStore.accessToken}` },
              });
              await apiWithAuth.post('/notifications/register-device', payload);
              console.log('[PUSH] Registered ✅');
            } catch (e) {
              console.warn('[PUSH] Registration failed:', e);
              Sentry.captureException(e);
            }
          });
        } else {
          console.log('[PUSH] Skipped: not logged in');
        }

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

  // 🛡️ Bullet-proof watchdog — prevents infinite spinner
  useEffect(() => {
    if (!isReady) return;
    if (sessionStore.isLoaded) return;

    const t = setTimeout(async () => {
      if (!sessionStore.isLoaded) {
        console.warn('[WATCHDOG] isLoaded still false after 5s → clearing session and continuing');
        try {
          await sessionStore.clear();
        } catch (e) {
          console.warn('[WATCHDOG] clear() failed:', e);
        } finally {
          sessionStore.isLoaded = true;
        }
      }
    }, 5000);

    return () => clearTimeout(t);
  }, [isReady]);

  // 👇 Preload announcements so Wallet can render with no "loading" flash
  useEffect(() => {
    (async () => {
      try {
        const { announcementStore } = await import('@/stores/AnnouncementStore');
        if (!sessionStore.isLoaded) {
          await sessionStore.load().catch(() => undefined);
        }
        await announcementStore.preload();
      } catch (e) {
        console.warn('[app/_layout] Failed to preload announcements', e);
      }
    })();
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

  if (!isReady || !sessionStore.isLoaded) {
    return (
      <View className="flex-1 bg-background-0 justify-center items-center">
        <Text style={{ color: 'gray' }}>Loading…</Text>
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

// ✅ MobX observer ensures re-render on store updates
export default Sentry.wrap(observer(AppLayout));
