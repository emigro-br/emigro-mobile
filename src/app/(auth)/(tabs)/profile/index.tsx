import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import * as Application from 'expo-application';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Coins, Lock, User } from 'lucide-react-native';
import { observer } from 'mobx-react-lite';

import { AssetListActionSheet } from '@/components/AssetListActionSheet';
import { ListTile } from '@/components/ListTile';
import { Avatar, AvatarFallbackText } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { ChevronRightIcon, CopyIcon, Icon } from '@/components/ui/icon';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { Toast, ToastDescription, useToast } from '@/components/ui/toast';
import { VStack } from '@/components/ui/vstack';
import { LoadingScreen } from '@/screens/Loading';
import { balanceStore } from '@/stores/BalanceStore';
import { sessionStore } from '@/stores/SessionStore';
import { FiatCurrency } from '@/types/assets';
import { fiatsFromCryptoCodes } from '@/utils/assets';
import { maskWallet } from '@/utils/masks';

const Profile = observer(() => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [assetListOpen, setAssetListOpen] = useState(false);
  const publicKey = sessionStore.publicKey;
  const myCurrencies = fiatsFromCryptoCodes(balanceStore.currentAssets());

  const handleLogout = async () => {
    await sessionStore.clear();
  };

  const copyToClipboard = async () => {
    if (publicKey) {
      await Clipboard.setStringAsync(publicKey);
      toast.show({
        render: ({ id }) => (
          <Toast nativeID={`toast${id}`} action="muted" variant="solid">
            <ToastDescription>Copied to clipboard</ToastDescription>
          </Toast>
        ),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const profileInfo = sessionStore.profile;
  if (!profileInfo) {
    return <LoadingScreen />;
  }

  const fullName = `${profileInfo.given_name} ${profileInfo.family_name}`;
  const bankCurrency = sessionStore.preferences?.fiatsWithBank ?? [];

  return (
    <ScrollView style={{ paddingTop: insets.top }} className="flex-1 bg-white">
      <Box className="flex-1 justify-between">
        <VStack space="3xl" className="p-4">
          <Center>
            <Avatar size="xl" className="bg-primary-300 rounded-full">
              <AvatarFallbackText>{fullName}</AvatarFallbackText>
            </Avatar>
            <Heading size="xl" className="py-2">
              {fullName}
            </Heading>
            {publicKey && (
              <Button size="md" variant="link" action="primary" onPress={copyToClipboard}>
                <ButtonText>{maskWallet(publicKey)}</ButtonText>
                <ButtonIcon as={CopyIcon} className="ml-2" />
              </Button>
            )}
          </Center>

          <VStack space="xl">
            <ListTile
              leading={<Icon as={User} />}
              title="Personal Info"
              trailing={<Icon as={ChevronRightIcon} />}
              onPress={() => router.push('/profile/personal-info')}
              testID="personal-info-button"
            />

            <ListTile
              leading={<Icon as={Lock} />}
              title="Configure your PIN"
              trailing={<Icon as={ChevronRightIcon} />}
              onPress={() => router.push('/settings/configure-pin')}
              testID="configure-pin-button"
            />

            <ListTile
              leading={<Icon as={Coins} />}
              title={`Bank account currency: ${bankCurrency.length > 0 ? bankCurrency[0] : 'not set'}`}
              subtitle="Used for deposit and withdraw"
              trailing={<Icon as={ChevronRightIcon} />}
              onPress={() => setAssetListOpen(true)}
              testID="bank-currency-button"
            />

            <Button
              onPress={() => router.push('/profile/delete-account')}
              variant="link"
              action="negative"
              size="sm"
              className="self-start"
            >
              <ButtonText>Delete account</ButtonText>
            </Button>
          </VStack>
        </VStack>

        <Box className="items-center mb-12">
          <Button onPress={handleLogout} variant="link" action="negative">
            <ButtonText>Logout</ButtonText>
          </Button>
          <Text size="sm">
            version {Application.nativeApplicationVersion} ({Application.nativeBuildVersion})
          </Text>
        </Box>
      </Box>
      {/* Modals and sheets  */}
      {myCurrencies.length > 0 && (
        <AssetListActionSheet
          assets={myCurrencies}
          isOpen={assetListOpen}
          onClose={() => setAssetListOpen(false)}
          onItemPress={(currency) => {
            sessionStore.updatePreferences({ fiatsWithBank: [currency as FiatCurrency] });
            setAssetListOpen(false);
          }}
        />
      )}
    </ScrollView>
  );
});

export default Profile;
