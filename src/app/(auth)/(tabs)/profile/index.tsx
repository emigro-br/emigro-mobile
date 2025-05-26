import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Application from 'expo-application';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Coins, Lock, User, CheckCircle } from 'lucide-react-native';
import { observer } from 'mobx-react-lite';
import { AssetListActionSheet } from '@/components/AssetListActionSheet';
import { ListTile } from '@/components/ListTile';
import { Avatar, AvatarFallbackText } from '@/components/ui/avatar';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { ChevronRightIcon, Icon } from '@/components/ui/icon';
import { ScrollView } from '@/components/ui/scroll-view';
import { Text } from '@/components/ui/text';
import { Toast, ToastDescription, useToast } from '@/components/ui/toast';
import { VStack } from '@/components/ui/vstack';
import { LoadingScreen } from '@/screens/Loading';
import { sessionStore } from '@/stores/SessionStore';
import { Asset, fiatCurrencies } from '@/types/assets';

const Profile = observer(() => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [assetListOpen, setAssetListOpen] = useState(false);
  const [kycVerified, setKycVerified] = useState(false);

  useEffect(() => {
    const fetchKycStatus = async () => {
      const { kycVerified } = await sessionStore.checkKycStatus();
      setKycVerified(kycVerified);
      console.log('KYC Verified:', kycVerified);
    };
    fetchKycStatus();
  }, []);

  useEffect(() => {
    console.log('[DEBUG] Full sessionStore snapshot:', JSON.stringify({
      user: sessionStore.user,
      profile: sessionStore.profile,
      preferences: sessionStore.preferences,
      session: sessionStore.session,
      justLoggedIn: sessionStore.justLoggedIn,
    }, null, 2));
  }, []);

  useEffect(() => {
    console.log('[DEBUG] assetListOpen changed:', assetListOpen);
  }, [assetListOpen]);

  const handleVerifyIdentity = () => {
    if (!kycVerified) {
      router.push('/profile/kyc');
    }
  };

  const handleLogout = async () => {
    await sessionStore.clear();
  };

  const copyToClipboard = async (value: string) => {
    await Clipboard.setStringAsync(value);
    toast.show({
      render: ({ id }) => (
        <Toast nativeID={`toast${id}`} action="muted" variant="solid">
          <ToastDescription>Copied to clipboard</ToastDescription>
        </Toast>
      ),
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const profileInfo = sessionStore.profile;
  if (!profileInfo) {
    return <LoadingScreen />;
  }

  const fullName = `${profileInfo.given_name} ${profileInfo.family_name}`;
  const bankCurrency = sessionStore.preferences?.fiatsWithBank ?? [];

  // 🪙 Fiat currency icon map
  const iconMap: Record<string, string> = {
    BRL: '@/assets/images/icons/brl-icon.png',
    EUR: '@/assets/images/icons/eurc-icon.png',
    GBP: '@/assets/images/icons/gbp-icon.png',
    USD: '@/assets/images/icons/usdc-icon.png',
  };

  // Transform fiat currency codes into Asset objects
  const availableCurrencies: Asset[] = fiatCurrencies().map((code) =>
    new Asset('fiat', code, code, code, code, iconMap[code] ?? '')
  );

  return (
    <ScrollView
      style={{ paddingTop: insets.top }}
      className="flex-1 bg-background-0 dark:bg-background-900"
    >
      <Box className="flex-1 justify-between">
        <VStack space="3xl" className="p-4">
          <Center>
            <Avatar size="xl" className="bg-primary-300 rounded-full">
              <AvatarFallbackText>{fullName}</AvatarFallbackText>
            </Avatar>
            <Heading size="xl" className="py-2">
              {fullName}
            </Heading>

            {/* 🔸 Separator */}
            <Box className="border-b border-gray-200 my-1" />
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
              onPress={() => {
                console.log('[Profile] User tapped currency selector');
                setAssetListOpen(true);
              }}
              testID="bank-currency-button"
            />

            {/* 
            <ListTile
              leading={<CheckCircle />}
              title="Verify Identity"
              subtitle={kycVerified ? 'Verified' : 'Complete your identity verification'}
              trailing={<ChevronRightIcon />}
              onPress={handleVerifyIdentity}
              disabled={kycVerified}
              className={kycVerified ? 'opacity-50' : ''}
            />
            */}

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

      <AssetListActionSheet
        isOpen={assetListOpen}
        onClose={() => {
          console.log('[Profile] Closing asset selector');
          setAssetListOpen(false);
        }}
        assets={availableCurrencies} // TODO: Pass actual assets
        onItemPress={(asset) => {
          console.log('[Profile] Selected asset:', asset);
          sessionStore.updatePreferences({ fiatsWithBank: [asset] });
          setAssetListOpen(false);
        }}
      />
    </ScrollView>
  );
});

export default Profile;
