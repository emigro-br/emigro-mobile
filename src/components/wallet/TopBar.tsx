import React, { useState } from 'react';
import { View, Text, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Pressable } from '@/components/ui/pressable';
import { Icon } from '@/components/ui/icon';
import { BookOpenIcon, QrCodeIcon } from 'lucide-react-native';
import { ProfileSheet } from './ProfileSheet';
import { History } from './History';
import { TransactionDetailsSheet } from '@/components/wallet/TransactionDetailsSheet';
import { useRouter } from 'expo-router';
import { sessionStore } from '@/stores/SessionStore';

export const TopBar = () => {
  const [profileVisible, setProfileVisible] = useState(false);
  const [historyVisible, setHistoryVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const router = useRouter();
  const insets = useSafeAreaInsets();

  const userName = sessionStore.user?.name ?? sessionStore.user?.username ?? '';
  const truncatedName = userName.length > 24 ? userName.slice(0, 24) + '...' : userName;

  return (
    <>
      <VStack className="px-4 pb-4 bg-background-0" style={{ paddingTop: insets.top + 22 }}>
        <HStack className="items-center">
          {/* Profile Avatar */}
          <Pressable onPress={() => setProfileVisible(true)}>
            <Image
              source={require('@/assets/images/profile-temp.png')}
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
          </Pressable>

          <View className="w-3" />

          {/* Username */}
          {userName ? (
            <Text className="ml-0 text-white text-xl">{truncatedName}</Text>
          ) : (
            <Image
              source={require('@/assets/images/emigro-word.png')}
              style={{ width: 100, height: 30, resizeMode: 'contain' }}
            />
          )}

          <View className="flex-1" />

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
              onPress={() => router.push('/(auth)/payments/fast')}
            >
              <Icon as={QrCodeIcon} size="md" className="text-white" />
            </Pressable>
          </HStack>
        </HStack>
      </VStack>

      {/* Sheets */}
      <ProfileSheet
        visible={profileVisible}
        onClose={() => setProfileVisible(false)}
      />

      <History
        isOpen={historyVisible} // ✅ FIXED: was `visible`, now correctly `isOpen`
        onClose={() => setHistoryVisible(false)}
        onTransactionPress={(tx) => {
          setSelectedTransaction(tx);
          setDetailsOpen(true);
        }}
      />

      <TransactionDetailsSheet
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        transaction={selectedTransaction}
      />
    </>
  );
};
