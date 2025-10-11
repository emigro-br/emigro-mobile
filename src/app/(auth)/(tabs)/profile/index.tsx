import { useState, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Application from 'expo-application';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Coins, Lock, User, CheckCircle, MessageCircle } from 'lucide-react-native';
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

import { useCameraPermissions } from 'expo-camera';

import { StartupModeSheet } from '@/components/StartupModeSheet';

import { useUserRewardPoints } from '@/hooks/useUserRewardPoints';
import { Image } from 'react-native';


import * as Notifications from 'expo-notifications';
import * as Linking from 'expo-linking';

import { HStack } from '@/components/ui/hstack';
import { useChainStore } from '@/stores/ChainStore';
import { balanceStore } from '@/stores/BalanceStore';
import { Image as RNImage } from 'react-native';
import { useWalletBalances } from '@/hooks/useWalletBalances';
import { View } from 'react-native';

import { ProfileSheet } from '@/components/wallet/ProfileSheet';
import { Pressable } from 'react-native';

const Profile = observer(() => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const [assetListOpen, setAssetListOpen] = useState(false);
  const [kycVerified, setKycVerified] = useState(false);
  const [modeSheetOpen, setModeSheetOpen] = useState(false);
 
  const [cameraPermission] = useCameraPermissions();
  const cameraStatus: 'granted' | 'denied' | 'undetermined' =
    cameraPermission?.status ?? 'undetermined';
  const [notificationStatus, setNotificationStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  
  const { points, loading: loadingPoints } = useUserRewardPoints();
  
  const [profileSheetVisible, setProfileSheetVisible] = useState(false);

  // 📌 Get active chains from balances
   const walletId = sessionStore.user?.wallets?.[0]?.id ?? '';
  const { balances } = useWalletBalances(walletId);

  const userChains = Array.from(
    new Set(balances.map((b) => b.chainId).filter(Boolean))
  );

  const chains = useChainStore((s) => s.chains);
  const chainIcons = userChains
    .map((chainId) => chains.find((c) => c.id === chainId || c.chainId === chainId)?.icon)
    .filter(Boolean);


	
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

  // WhatsApp support contact
  const WHATSAPP_NUMBER_DISPLAY = '+55 11 94914 9999';
  const WHATSAPP_NUMBER = '5511949149999';

  const handleContactWhatsApp = async () => {
    const message = encodeURIComponent('Olá! Preciso de ajuda com minha conta.');
    const deeplink = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${message}`;
    try {
      const supported = await Linking.canOpenURL(deeplink);
      if (supported) {
        await Linking.openURL(deeplink);
        await Haptics.selectionAsync();
        return;
      }
    } catch (e) {
      // fall through to web
    }

    const webUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    try {
      await Linking.openURL(webUrl);
      await Haptics.selectionAsync();
    } catch (e) {
      toast.show({
        render: ({ id }) => (
          <Toast nativeID={`toast${id}`} action="error" variant="solid">
            <ToastDescription>Could not open WhatsApp</ToastDescription>
          </Toast>
        ),
      });
    }
  };

  useEffect(() => {
    const fetchPermissions = async () => {
      const notif = await Notifications.getPermissionsAsync();
      setNotificationStatus(notif.granted ? 'granted' : 'denied');
    };
    fetchPermissions();
  }, []);

  
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

  useEffect(() => {
    balanceStore.fetchUserBalance({ force: true });
    useChainStore.getState().fetchChains(); // Zustand store call
  }, []);
  
  return (
	<>
    <ScrollView
      style={{ paddingTop: insets.top }}
      className="flex-1 bg-background-0 dark:bg-background-900"
    >
      <Box className="flex-1 justify-between" style={{ paddingTop: insets.top + 8 }}>
        <VStack space="3xl" className="p-4">
          <Center>
            <Avatar size="xl" className="bg-primary-300 rounded-full">
              <AvatarFallbackText>{fullName}</AvatarFallbackText>
            </Avatar>
            <Heading size="xl" className="py-2">
              {fullName}
            </Heading>
			
			<Box className="flex-row justify-between mt-2 gap-x-4">
			  {/* First Box - Chains */}
			  <Pressable onPress={() => setProfileSheetVisible(true)} style={{ flex: 1 }}>
			    <Box className="p-4 rounded-2xl" style={{ backgroundColor: '#2e2e2e' }}>
			      <View style={{ height: 32, marginBottom: 22, flexDirection: 'row' }}>
			        {chainIcons.slice(0, 3).map((icon, idx) => (
			          <RNImage
			            key={idx}
			            source={icon}
			            style={{
			              width: 32,
			              height: 32,
			              marginLeft: idx === 0 ? 0 : -8,
			              borderWidth: 2,
			              borderColor: '#2e2e2e',
			            }}
			            resizeMode="contain"
			          />
			        ))}
			        {chainIcons.length > 3 && (
			          <Text style={{ color: 'white', fontSize: 12, marginLeft: 6, alignSelf: 'center' }}>
			            +{chainIcons.length - 3}
			          </Text>
			        )}
			      </View>

			      <Text className="font-bold text-left text-gray-300 mb-1">Wallets</Text>
			      <Text className="text-sm text-left text-white">
			        {chainIcons.length} {chainIcons.length === 1 ? 'chain' : 'chains'}
			      </Text>
			    </Box>
			  </Pressable>


			  {/* Second Box - EmiPoints (pressable) */}
			  <Pressable onPress={() => router.push('/emipoints')} style={{ flex: 1 }}>
			    <Box className="p-4 rounded-2xl flex-1" style={{ backgroundColor: '#2e2e2e' }}>
			      <Image
			        source={require('@/assets/images/icons/emipoint-icon-red.png')}
			        style={{ width: 32, height: 32, marginBottom: 22 }}
			      />
			      <Text className="font-bold text-left text-gray-300 mb-1">EmiPoints</Text>
			      <Text className="text-sm text-left text-white">
			        {loadingPoints ? '...' : `${points?.toFixed(2)} EmiPoints`}
			      </Text>
			    </Box>
			  </Pressable>

			</Box>

			
            {/* 🔸 Separator */}
			<Box style={{ height: 1, width: '100%', backgroundColor: 'white', opacity: 0.2, marginTop: 26, marginBottom: 6 }} />
          </Center>

		  <VStack space="xl">
		    <Box style={{ backgroundColor: '#2e2e2e' }} className="rounded-2xl p-4">
		      <ListTile
		        leading={<Icon as={Lock} />}
		        title="Configure your PIN"
		        trailing={<Icon as={ChevronRightIcon} />}
		        onPress={() => router.push('/settings/configure-pin')}
		        testID="configure-pin-button"
		      />
		    </Box>

		    <Box style={{ backgroundColor: '#2e2e2e' }} className="rounded-2xl p-4">
		      <ListTile
		        leading={<Icon as={Coins} />}
		        title={`Bank account currency: ${bankCurrency.length > 0 ? bankCurrency[0] : 'not set'}`}
		        trailing={<Icon as={ChevronRightIcon} />}
		        onPress={() => {
		          console.log('[Profile] User tapped currency selector');
		          setAssetListOpen(true);
		        }}
		        testID="bank-currency-button"
		      />
		    </Box>

		    <Box style={{ backgroundColor: '#2e2e2e' }} className="rounded-2xl p-4">
		      <ListTile
		        leading={<Icon as={CheckCircle} />}
		        title={`Startup Mode: ${sessionStore.preferences?.startupMode ?? 'wallet'}`}
		        trailing={<Icon as={ChevronRightIcon} />}
		        onPress={() => setModeSheetOpen(true)}
		      />
		    </Box>

		    <Box style={{ backgroundColor: '#2e2e2e' }} className="rounded-2xl p-4">
		      <ListTile
		        leading={<Icon as={CheckCircle} />}
		        title="Camera Access"
		        subtitle={cameraStatus === 'granted' ? 'Enabled' : 'Not enabled'}
		        trailing={<Icon as={ChevronRightIcon} />}
		        onPress={() => Linking.openSettings()}
		      />
		    </Box>

		    <Box style={{ backgroundColor: '#2e2e2e' }} className="rounded-2xl p-4">
		      <ListTile
		        leading={<Icon as={CheckCircle} />}
		        title="Notification Access"
		        subtitle={notificationStatus === 'granted' ? 'Enabled' : 'Not enabled'}
		        trailing={<Icon as={ChevronRightIcon} />}
		        onPress={() => Linking.openSettings()}
		      />
		    </Box>

			{/* 📲 WhatsApp Support Contact */}
			<Box style={{ backgroundColor: '#2e2e2e' }} className="rounded-2xl p-4">
			  <ListTile
			    leading={<Icon as={MessageCircle} />}
			    title="Talk to us on WhatsApp"
			    subtitle={WHATSAPP_NUMBER_DISPLAY}
			    trailing={<Icon as={ChevronRightIcon} />}
			    onPress={handleContactWhatsApp}
			    testID="whatsapp-support-button"
			  />
			</Box>
			
			<Box style={{ backgroundColor: '#2e2e2e' }} className="rounded-2xl p-4">
			  <Button onPress={handleLogout} variant="link" action="negative">
			    <ButtonText>Logout</ButtonText>
			  </Button>


			</Box>
		  

            {/*<ListTile
              leading={<Icon as={User} />}
              title="Personal Info"
              trailing={<Icon as={ChevronRightIcon} />}
              onPress={() => router.push('/profile/personal-info')}
              testID="personal-info-button"
            />*/}

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
			
			<Text size="sm">
			  version {Application.nativeApplicationVersion} ({Application.nativeBuildVersion})
			</Text>
          </VStack>
        </VStack>


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
	<StartupModeSheet isOpen={modeSheetOpen} onClose={() => setModeSheetOpen(false)} />
	<ProfileSheet visible={profileSheetVisible} onClose={() => setProfileSheetVisible(false)} />
	</>
  );
});

export default Profile;
