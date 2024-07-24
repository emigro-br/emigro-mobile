import { useEffect } from 'react';
import { BackHandler } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import * as Sentry from '@sentry/react-native';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { createStaticPix } from 'pix-utils';
import { CreateStaticPixParams } from 'pix-utils/dist/main/types/pixCreate';

import { Box } from '@/components/ui/box';
import { Button, ButtonGroup, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { CloseIcon } from '@/components/ui/icon';
import { ModalCloseButton } from '@/components/ui/modal';
import { Text } from '@/components/ui/text';
import { Toast, ToastDescription, useToast } from '@/components/ui/toast';
import { VStack } from '@/components/ui/vstack';
import { UserProfile } from '@/services/emigro/types';
import { sessionStore } from '@/stores/SessionStore';
import { emigroCategoryCode } from '@/types/PixPayment';
import { CryptoAsset } from '@/types/assets';
import { AssetToCurrency, fiatToIso, symbolFor } from '@/utils/assets';

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

export const RequestWithQRCode = () => {
  const enableCopy = false;
  const router = useRouter();
  const params = useLocalSearchParams<{ asset: CryptoAsset; value: string }>();
  const insets = useSafeAreaInsets();
  const toast = useToast();

  // prevent back navigation
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => backHandler.remove();
  }, []);

  if (!params.asset || !params.value) {
    return null;
  }

  const asset = params.asset as CryptoAsset;
  const value = parseFloat(params.value);
  const profile = sessionStore.profile!;
  let encodedCode = '';
  try {
    encodedCode = encodeQRCode(profile, asset, value);
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
    router.back();
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
    <Box className={` pt-${insets.top} flex-1 bg-white `}>
      <VStack space="lg" className="p-4">
        <HStack className="justify-between">
          <Heading>Request with QR Code</Heading>
          <ModalCloseButton onPress={() => router.replace('../')} testID="close-button" className="mt--4">
            <CloseIcon size="xl" />
          </ModalCloseButton>
        </HStack>
        <Text>Show this QR code or copy and share with who will make this payment</Text>
        <Center testID="qr-code" className="my-4">
          <QRCode value={encodedCode} size={QRCodeSize.SMALL} />
        </Center>

        <Box>
          <Text bold>Requested value</Text>
          <Text size="4xl" bold className="text-typography-800">
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

export default RequestWithQRCode;
