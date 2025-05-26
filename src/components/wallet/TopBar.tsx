import React, { useState } from 'react';
import { View, TextInput, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Icon } from '@/components/ui/icon';
import { BookOpenIcon, QrCodeIcon } from 'lucide-react-native';
import { ProfileSheet } from './ProfileSheet';
import { History } from './History';
import { useRouter } from 'expo-router';

export const TopBar = () => {
  const [profileVisible, setProfileVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <>
      <VStack
        className="px-4 pb-4 bg-background-0"
        style={{ paddingTop: insets.top + 22 }}
      >
        <HStack className="items-center">
          {/* Profile Avatar */}
          <Pressable onPress={() => setProfileVisible(true)}>
            <Image
              source={require('@/assets/images/profile-temp.png')}
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
          </Pressable>

          {/* Spacing between avatar and search */}
          <View className="w-3" />

          {/* Search Bar */}
          <View className="flex-1 rounded-full bg-primary-500/20 px-4 py-2">
            <TextInput
              placeholder="Search"
              placeholderTextColor="#ccc"
              style={{ color: 'white', fontSize: 14 }}
            />
          </View>

          {/* Action Buttons */}
          <HStack className="ml-4">
            <Pressable
              className="w-12 h-12 bg-primary-500 rounded-full items-center justify-center mr-2"
              onPress={() => setHistoryVisible(true)}
            >
              <Icon as={BookOpenIcon} size="md" className="text-white" />
            </Pressable>
            <Pressable
              className="w-12 h-12 bg-primary-500 rounded-full items-center justify-center"
              onPress={() => router.push('/(auth)/payments/scan')}
            >
              <Icon as={QrCodeIcon} size="md" className="text-white" />
            </Pressable>
          </HStack>
        </HStack>
      </VStack>

      {/* Bottom Sheets */}
      <ProfileSheet visible={profileVisible} onClose={() => setProfileVisible(false)} />
      <History visible={historyVisible} onClose={() => setHistoryVisible(false)} />
    </>
  );
};
