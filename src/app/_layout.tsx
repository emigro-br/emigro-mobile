// src/app/_layout.tsx
import React, { useEffect, useState, useRef } from 'react';
import { LogBox, View, Text } from 'react-native';
import { SplashScreen, Slot, useNavigationContainerRef, useRouter } from 'expo-router';
import * as Sentry from '@sentry/react-native';
import { isRunningInExpoGo } from 'expo';

import { ThemeProvider } from '@/__utils__/ThemeProvider';
import '@/global.css';
import { sessionStore } from '@/stores/SessionStore';

// (kept to match your project setup; harmless if unused)
import * as Notifications from 'expo-notifications';

import { observer } from 'mobx-react-lite';

// --- Notifications setup (kept minimal and benign) ---
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

LogBox.ignoreLogs(['new NativeEventEmitter() was called with a non-null argument']);

// Keep splash under our control to avoid flicker
SplashScreen.preventAutoHideAsync().catch(() => {});

// --- Sentry setup (unchanged, safe to keep) ---
let routingInstrumentation: any;
try {
  const sentryDsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (sentryDsn) {
    routingInstrumentation = new Sentry.ReactNavigationInstrumentation();
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
  } else {
    console.warn('[SENTRY] DSN missing; Sentry disabled.');
  }
} catch (e) {
  console.error('[SENTRY] init failed:', e);
}

function AppLayout() {
  const [isReady, setIsReady] = useState(false);
  const navRef = useNavigationContainerRef();
  const router = useRouter();
  const hasRedirected = useRef(false);

  // Register navigation container with Sentry if available
  useEffect(() => {
    try {
      if (routingInstrumentation && navRef) {
        routingInstrumentation.registerNavigationContainer(navRef);
      }
    } catch (e) {
      console.error('[NAVIGATION] Failed to register container:', e);
    }
  }, [navRef]);

  // 🚨 HARD LOGOUT ON BOOT — no conditions
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        console.log('[BOOT] Forcing hard logout: clearing all session keys…');
        await sessionStore.clear();   // wipes auth.*, user.*, profile, preferences, cached points
        sessionStore.isLoaded = true; // let UI proceed immediately
      } catch (e) {
        console.warn('[BOOT] Force clear failed (continuing anyway):', (e as any)?.message ?? e);
        // even if clear failed, ensure UI can proceed
        sessionStore.isLoaded = true;
      } finally {
        if (!cancelled) {
          try {
            await SplashScreen.hideAsync();
          } catch {}
          setIsReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // ➡️ Go straight to the public login screen once ready
  useEffect(() => {
    if (!isReady || !sessionStore.isLoaded || hasRedirected.current) return;
    hasRedirected.current = true;
    try {
      // your repo has src/app/(public)/login.tsx
      router.replace('/(public)/login');
    } catch (e) {
      console.warn('[NAV] router.replace failed, staying on default stack:', e);
    }
  }, [isReady]);

  // Minimal loading guard
  if (!isReady || !sessionStore.isLoaded) {
    return (
      <View className="flex-1 bg-background-0 justify-center items-center">
        <Text style={{ color: 'gray' }}>Loading…</Text>
      </View>
    );
  }

  // Normal render — public stack should show login now
  return (
    <ThemeProvider>
      <Slot />
    </ThemeProvider>
  );
}

export default Sentry.wrap(observer(AppLayout));
