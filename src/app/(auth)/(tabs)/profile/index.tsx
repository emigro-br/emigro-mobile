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

import { Image, View } from 'react-native';
import StellarIcon from '@/assets/images/chains/stellar.png';
import BaseIcon from '@/assets/images/chains/base.png';

const Profile = observer(() => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [assetListOpen, setAssetListOpen] = useState(false);
  const [kycVerified, setKycVerified] = useState(false);
  const publicKey = sessionStore.publicKey;
  const myCurrencies = fiatsFromCryptoCodes(balanceStore.currentAssets());

  useEffect(() => {
    const fetchKycStatus = async () => {
      const { kycVerified } = await sessionStore.checkKycStatus();
      setKycVerified(kycVerified);
      // Only update the state without redirecting or forcing any behavior
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
      evmWallet: sessionStore.evmWallet,
      justLoggedIn: sessionStore.justLoggedIn,
    }, null, 2));
  }, []);
  console.log('[Profile] Stellar:', publicKey);
  useEffect(() => {
    console.log('[DEBUG] evmWallet (on render):', sessionStore.evmWallet);
  }, [sessionStore.evmWallet]);

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

            {publicKey && (
              <VStack space="md">
                {/* 🔸 Separator */}
                <Box className="border-b border-gray-200 my-1" />

                {/* 🔹 Stellar Wallet */}
<ListTile
  leading={
    <View
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Image
        source={StellarIcon}
        style={{ width: 24, height: 24 }}
        resizeMode="contain"
      />
    </View>
  }
  title="Stellar"
  subtitle={maskWallet(publicKey)}
  trailing={
    <Button size="sm" variant="link" action="primary" onPress={() => copyToClipboard(publicKey)}>
      <ButtonIcon as={CopyIcon} />
    </Button>
  }
/>

                {/* 🔸 Separator */}
                <Box className="border-b border-gray-200 my-1" />

                {/* 🔸 EVM Wallet (Base chain) */}
{sessionStore.evmWallet?.publicAddress && (
  <ListTile
    leading={
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'white',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Image
          source={BaseIcon}
          style={{ width: 24, height: 24 }}
          resizeMode="contain"
        />
      </View>
    }
    title="Base (EVM)"
    subtitle={maskWallet(sessionStore.evmWallet.publicAddress)}
    trailing={
      <Button size="sm" variant="link" action="primary" onPress={() => copyToClipboard(sessionStore.evmWallet.publicAddress)}>
        <ButtonIcon as={CopyIcon} />
      </Button>
    }
  />
)}
              </VStack>
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
