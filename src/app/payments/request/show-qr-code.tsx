import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import {
  Box,
  Button,
  ButtonGroup,
  ButtonText,
  Center,
  CloseIcon,
  HStack,
  Heading,
  ModalCloseButton,
  Text,
  Toast,
  ToastDescription,
  VStack,
  useToast,
} from '@gluestack-ui/themed';
import * as Sentry from '@sentry/react-native';
import * as Clipboard from 'expo-clipboard';
import { createStaticPix } from 'pix-utils';
import { CreateStaticPixParams } from 'pix-utils/dist/main/types/pixCreate';

import { emigroCategoryCode } from '@/types/PixPayment';
import { CryptoAsset } from '@/types/assets';

import { PaymentStackParamList } from '@navigation/PaymentsStack';

import { UserProfile } from '@services/emigro/types';

import { sessionStore } from '@stores/SessionStore';

import { AssetToCurrency, fiatToIso, symbolFor } from '@utils/assets';

const enum QRCodeSize {
  SMALL = 200,
  MEDIUM = 250,
  LARGE = 300,
}

type PaymentRequest = CreateStaticPixParams & {
  merchantName: string;
  merchantCity?: string;
  pixKey: string;
  transactionAmount: number;
  transactionCurrency: string;
  merchantCategoryCode: string;
  // countryCode: 'BR',
};

const buildMerchantName = (profile: UserProfile): string => {
  return `${profile.given_name || ''} ${profile.family_name || ''}`.trim() || 'Unknown';
};

const encodeQRCode = (profile: UserProfile, asset: CryptoAsset, amount: number): string => {
  const fiat = asset === 'XLM' ? 'XLM' : AssetToCurrency[asset];
  // EmvMaiSchema.BC_GUI = 'br.gov.bcb.pix'; // FIXME: we have to fork pix-utils to change this

  const walletKey = sessionStore.publicKey!;

  const request: PaymentRequest = {
    merchantName: buildMerchantName(profile).substring(0, 25),
    merchantCity: profile.address?.substring(0, 15) ?? 'São Paulo',
    // infoAdicional: profile.sub, // FIXME: parsing error when add both large infoAdicional and pixKey
    pixKey: walletKey,
    transactionAmount: amount,
    transactionCurrency: fiatToIso[fiat],
    merchantCategoryCode: emigroCategoryCode,
  };

  const pix = createStaticPix(request).throwIfError();

  const brcode = pix.toBRCode();
  return brcode;
};

type Props = NativeStackScreenProps<PaymentStackParamList, 'RequestWithQRCode'>;

export const RequestWithQRCode = ({ navigation, route }: Props) => {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { asset, value } = route.params;
  const enableCopy = false;

  // prevent back navigation
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  const profile = sessionStore.profile!;
  let encodedCode = '';
  try {
    encodedCode = encodeQRCode(profile, asset as CryptoAsset, value);
  } catch (error) {
    Sentry.withScope(function (scope) {
      scope.setLevel('warning');
      scope.setExtras({
        profile,
        asset,
        value,
      });
      Sentry.captureException(error);
    });

    toast.show({
      render: ({ id }) => (
        <Toast nativeID={`toast-${id}`} action="error" variant="solid">
          <ToastDescription>Failed to generate QR code</ToastDescription>
        </Toast>
      ),
    });
    navigation.goBack();
    return null;
  }

  const copyToClipboard = async () => {
    await Clipboard.setStringAsync(encodedCode);
    toast.show({
      render: ({ id }) => (
        <Toast nativeID={`toast-${id}`} action="info" variant="solid">
          <ToastDescription>Copied to clipboard</ToastDescription>
        </Toast>
      ),
    });
  };

  return (
    <Box flex={1} bg="$white" pt={insets.top}>
      <VStack p="$4" space="lg">
        <HStack justifyContent="space-between">
          <Heading>Request with QR Code</Heading>
          <ModalCloseButton onPress={() => navigation.popToTop()} testID="close-button" mt="-$4">
            <CloseIcon size="xl" />
          </ModalCloseButton>
        </HStack>
        <Text>Show this QR code or copy and share with who will make this payment</Text>
        <Center my="$4" testID="qr-code">
          <QRCode value={encodedCode} size={QRCodeSize.SMALL} />
        </Center>

        <Box>
          <Text bold>Requested value</Text>
          <Text size="4xl" color="$textLight800" bold>
            {symbolFor(asset as CryptoAsset, value)}
          </Text>
          <Text>For {buildMerchantName(profile)}</Text>
        </Box>
        {enableCopy && (
          <ButtonGroup flexDirection="column">
            <Button onPress={copyToClipboard}>
              <ButtonText>Copy the code</ButtonText>
            </Button>
          </ButtonGroup>
        )}
      </VStack>
    </Box>
  );
};
