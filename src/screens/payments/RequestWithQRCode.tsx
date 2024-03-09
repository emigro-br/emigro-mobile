import QRCode from 'react-native-qrcode-svg';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import {
  Box,
  Button,
  ButtonGroup,
  ButtonText,
  Center,
  CloseIcon,
  Heading,
  ModalCloseButton,
  SafeAreaView,
  ScrollView,
  Text,
  Toast,
  ToastDescription,
  VStack,
  useToast,
} from '@gluestack-ui/themed';
import * as Clipboard from 'expo-clipboard';

import { PaymentStackParamList } from '@navigation/PaymentsStack';

import { sessionStore } from '@stores/SessionStore';

const enum QRCodeSize {
  SMALL = 200,
  MEDIUM = 250,
  LARGE = 300,
}

type QRCodeRequest = {
  name: string;
  address?: string;
  publicKey: string;
  amount: number;
  assetCode: string;
};

const encodeQRCode = (request: QRCodeRequest): string => {
  return JSON.stringify(request);
};

type Props = NativeStackScreenProps<PaymentStackParamList, 'RequestWithQRCode'>;

export const RequestWithQRCode = ({ navigation, route }: Props) => {
  const toast = useToast();
  const { asset, value } = route.params;
  const enableCopy = false;

  const profile = sessionStore.profile;
  const fullname = `${profile?.given_name || ''} ${profile?.family_name || ''}`.trim();
  const request: QRCodeRequest = {
    name: fullname || 'Unknown',
    address: profile?.address,
    publicKey: sessionStore.publicKey!,
    amount: value,
    assetCode: asset,
  };

  const encodedCode = encodeQRCode(request);

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
    <SafeAreaView bg="$white">
      <ScrollView>
        <Box flex={1}>
          <ModalCloseButton onPress={() => navigation.popToTop()} position="absolute" right="$2" testID="close-button">
            <CloseIcon size="lg" />
          </ModalCloseButton>
          <VStack p="$4" space="lg">
            <Heading>Request with QR Code</Heading>
            <Text>Show this QR code or copy and share with who will make this payment</Text>
            <Center my="$4" testID="qr-code">
              <QRCode value={encodedCode} size={QRCodeSize.MEDIUM} />
            </Center>

            <Box>
              <Text bold>Requested value</Text>
              <Text size="4xl" color="$textLight800" bold>
                {request.amount} {request.assetCode}
              </Text>
              <Text>For {request.name}</Text>
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
      </ScrollView>
    </SafeAreaView>
  );
};
