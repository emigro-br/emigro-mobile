import { useState } from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Avatar,
  AvatarFallbackText,
  Box,
  Button,
  ButtonIcon,
  ButtonText,
  Center,
  CopyIcon,
  Divider,
  Heading,
  ScrollView,
  Spinner,
  Text,
  Toast,
  ToastDescription,
  VStack,
  useToast,
} from '@gluestack-ui/themed';
import * as Application from 'expo-application';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { observer } from 'mobx-react-lite';

import { AssetListActionSheet } from '@/components/AssetListActionSheet';
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
          <Toast nativeID={`toast${id}`} action="info" variant="solid">
            <ToastDescription>Copied to clipboard</ToastDescription>
          </Toast>
        ),
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const profileInfo = sessionStore.profile;
  if (!profileInfo) {
    return (
      <Center flex={1} bg="$backgroundLight0">
        <Spinner size="large" testID="loading" />
      </Center>
    );
  }

  const fullName = `${profileInfo.given_name} ${profileInfo.family_name}`;
  const bankCurrency = sessionStore.preferences?.fiatsWithBank ?? [];

  return (
    <ScrollView flex={1} bg="$white" style={{ paddingTop: insets.top }}>
      <Box flex={1} justifyContent="space-between">
        <VStack p="$4" space="lg">
          <Center>
            <Avatar bgColor="$primary300" size="xl" borderRadius="$full">
              <AvatarFallbackText>{fullName}</AvatarFallbackText>
            </Avatar>
            <Heading py="$2">{fullName}</Heading>
            {publicKey && (
              <Button size="md" variant="link" action="primary" onPress={copyToClipboard}>
                <ButtonText>{maskWallet(publicKey)}</ButtonText>
                <ButtonIcon as={CopyIcon} ml="$2" />
              </Button>
            )}
          </Center>

          <VStack space="xl">
            <View>
              <Text size="sm" color="$textLight500">
                Full Name
              </Text>
              <Text>{fullName}</Text>
            </View>

            <Divider />

            <View>
              <Text size="sm" color="$textLight500">
                Email address
              </Text>
              <Text>{profileInfo.email}</Text>
            </View>

            <Divider />

            {profileInfo.address && (
              <>
                <View>
                  <Text size="sm" color="$textLight500">
                    Address
                  </Text>
                  <Text>{profileInfo.address}</Text>
                </View>

                <Divider />
              </>
            )}

            <Box>
              <Button onPress={() => setAssetListOpen(true)} variant="link" action="secondary" alignSelf="flex-start">
                <ButtonText>Bank account currency: {bankCurrency.length > 0 ? bankCurrency[0] : 'not set'} </ButtonText>
              </Button>
              <Text size="sm" color="$textLight500">
                Used for deposit and withdraw
              </Text>
            </Box>

            <Button
              onPress={() => router.push('/settings/configure-pin')}
              variant="link"
              action="secondary"
              alignSelf="flex-start"
            >
              <ButtonText>Configure your PIN</ButtonText>
            </Button>

            <Button
              onPress={() => router.push('/profile/delete-account')}
              variant="link"
              action="negative"
              size="sm"
              alignSelf="flex-start"
            >
              <ButtonText>Delete account</ButtonText>
            </Button>
          </VStack>
        </VStack>
        <Box alignItems="center" mb="$12">
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
