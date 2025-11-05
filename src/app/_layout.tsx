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
    console.log('[Sentry] DSN from env:', sentryDsn); // ✅ Log DSN for confirmation

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
    Sentry.captureException(new Error('🔥 Forced Test Error - Post-init'));
  }, []);
  
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

		// 🔒 Admin Locks: enforce major lock before loading user session
		try {
		  const resp = await api().get('/admin/locks/active');
		  const items = Array.isArray(resp.data) ? resp.data : resp.data?.data ?? [];
		  const major = items.find(
		    (l: any) =>
		      String(l.scope).toLowerCase() === 'major' &&
		      (l.is_active === 1 || l.is_active === true)
		  );
		  if (major) {
		    setBlockMessage(major.message || 'App temporarily unavailable.');
		    setStoreUrl(null); // no store deep-link for admin lock
		    setIsBlocked(true);
		    return; // stop boot here
		  }
		} catch (e: any) {
		  console.warn('[AppBoot] /admin/locks/active failed; continuing boot:', e?.message || e);
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

		  try {
		    // ⏳ Wait for valid session (JWT and user ID present)
		    while (!sessionStore.user?.id || !sessionStore.accessToken) {
		      console.warn('[PUSH] Waiting for session to be ready...');
		      await new Promise((res) => setTimeout(res, 500));
		    }

		    const maxAttempts = 3;
		    let attempt = 0;

		    while (attempt < maxAttempts) {
		      attempt++;

		      const apiWithAuth = api({
		        headers: {
		          Authorization: `Bearer ${sessionStore.accessToken}`,
		        },
		      });

		      try {
		        await apiWithAuth.post('/notifications/debug/log', {
		          tag: `TestFlight push registration (attempt ${attempt})`,
		          token,
		          payload,
		        });

		        const res = await apiWithAuth.post('/notifications/register-device', payload);
		        console.log('[PUSH] Token sent to backend ✅', res.data);
		        break; // ✅ success
		      } catch (err: any) {
		        if (err.response?.status === 401) {
		          console.warn(`[PUSH] Attempt ${attempt}: Unauthorized — will retry`);
		          await new Promise((r) => setTimeout(r, 1000));
		        } else {
		          console.warn('[PUSH] Register device failed:', err.message ?? err);
		          break; // 🚫 do not retry on other errors
		        }
		      }
		    }
		  } catch (e) {
		    console.error('[PUSH] Unexpected error during registration:', e);
		    Sentry.captureException(e);
		  } finally {
		    console.log('[PUSH] Push registration flow finished');
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
  
  // 👇 Preload announcements so Wallet can render with no "loading" flash
  useEffect(() => {
    (async () => {
      try {
        const { announcementStore } = await import('@/stores/AnnouncementStore');
        // Make sure session is attempted first (preload can use auth if needed)
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

export default Sentry.wrap(AppLayout);
