import { useState } from 'react';
import { View } from 'react-native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
  SafeAreaView,
  Spinner,
  Text,
  Toast,
  ToastDescription,
  VStack,
  useToast,
} from '@gluestack-ui/themed';
import * as Application from 'expo-application';
import * as Clipboard from 'expo-clipboard';
import { observer } from 'mobx-react-lite';

import { FiatCurrency } from '@/types/assets';

import { AssetListActionSheet } from '@components/AssetListActionSheet';

import { ProfileStackParamList } from '@navigation/ProfileStack';

import { balanceStore } from '@stores/BalanceStore';
import { sessionStore } from '@stores/SessionStore';

import { AssetToCurrency } from '@utils/assets';
import { maskWallet } from '@utils/masks';

type Props = {
  navigation: NativeStackNavigationProp<ProfileStackParamList, 'Profile'>;
};

const Profile = observer(({ navigation }: Props) => {
  const toast = useToast();
  const [assetListOpen, setAssetListOpen] = useState(false);
  const publicKey = sessionStore.publicKey;
  const myCurrencies = balanceStore.currentAssets().map((asset) => AssetToCurrency[asset]);

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
    <SafeAreaView flex={1} bg="$white">
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
              onPress={() => navigation.push('ConfigurePIN')}
              variant="link"
              action="secondary"
              alignSelf="flex-start"
            >
              <ButtonText>Configure your PIN</ButtonText>
            </Button>

            <Button
              onPress={() => navigation.push('DeleteAccount')}
              variant="link"
              action="negative"
              size="sm"
              alignSelf="flex-start"
            >
              <ButtonText>Delete account</ButtonText>
            </Button>
          </VStack>
        </VStack>
        <Box alignItems="center" py="$4">
          <Button onPress={handleLogout} variant="link" action="negative">
            <ButtonText>Logout</ButtonText>
          </Button>
          <Text size="sm">
            version {Application.nativeApplicationVersion} ({Application.nativeBuildVersion})
          </Text>
        </Box>
      </Box>

      {/* Modals and sheets  */}
      <AssetListActionSheet
        assets={myCurrencies}
        isOpen={assetListOpen}
        onClose={() => setAssetListOpen(false)}
        onItemPress={(currency) => {
          sessionStore.savePreferences({ fiatsWithBank: [currency as FiatCurrency] });
          setAssetListOpen(false);
        }}
      />
    </SafeAreaView>
  );
});

export default Profile;
