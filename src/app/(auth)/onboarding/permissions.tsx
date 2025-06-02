// src/app/(auth)/onboarding/permissions.tsx

// src/app/(auth)/onboarding/permissions.tsx

import React, { useRef, useState } from 'react';
import { Animated, Pressable } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';
import { useCameraPermissions, PermissionResponse } from 'expo-camera';
import { useRouter, Stack } from 'expo-router';

import { Box } from '@/components/ui/box';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { Link } from '@/components/ui/link';

const PermissionsScreen = () => {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'granted' | 'denied'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [_, requestCameraPermission] = useCameraPermissions();

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const requestPermissions = async () => {
    try {
      setError(null);
      setStatus('idle');

      const notif = await Notifications.requestPermissionsAsync();
      const cam: PermissionResponse = await requestCameraPermission();

      const notifGranted = notif.status === 'granted';
      const camGranted = cam.status === 'granted';

      if (notifGranted && camGranted) {
        setStatus('granted');
        router.replace('./pin');
      } else {
        setStatus('denied');
        setError('Please enable both camera and notification permissions in settings.');
      }
    } catch (err: any) {
      setError('Something went wrong while requesting permissions.');
      console.error('[PermissionsScreen] Error:', err);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Box className="flex-1 bg-black justify-center">
        <VStack space="lg" className="p-6">
          <Heading size="xl" className="text-white text-center mb-6">
            Permissions
          </Heading>

          <Text className="text-white text-base text-center mb-4">
            To ensure the best experience, Emigro needs access to:
          </Text>

          <VStack space="md" className="mb-6">
            <Text className="text-white">• Notifications — for important updates</Text>
            <Text className="text-white">• Camera — for QR code scanning</Text>
          </VStack>

          {error && (
            <Text className="text-red-500 text-center mb-4">
              {error}
            </Text>
          )}

          <Pressable onPressIn={animatePress} onPress={requestPermissions}>
            <Animated.View
              style={{ transform: [{ scale: scaleAnim }] }}
              className="bg-primary-500 rounded-full py-4 items-center justify-center"
            >
              <Text className="text-white font-bold text-lg">Enable Permissions</Text>
            </Animated.View>
          </Pressable>

          {status === 'denied' && (
            <VStack space="sm" className="mt-4 items-center">
              <Text className="text-white text-center text-sm">
                You can also open your settings manually:
              </Text>
              <Link onPress={() => Linking.openSettings()}>
                <Text className="text-primary-500 underline">Open App Settings</Text>
              </Link>
            </VStack>
          )}
        </VStack>
      </Box>
    </>
  );
};

export default PermissionsScreen;
