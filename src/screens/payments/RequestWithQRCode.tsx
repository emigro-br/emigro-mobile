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
  VStack,
} from '@gluestack-ui/themed';

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
  const { asset, value } = route.params;
  const request: QRCodeRequest = {
    name: 'Scanned Name',
    address: 'Scanned Address',
    publicKey: sessionStore.publicKey!,
    amount: value,
    assetCode: asset,
  };

  return (
    <SafeAreaView bg="$white">
      <ScrollView>
        <Box flex={1}>
          <ModalCloseButton onPress={() => navigation.popToTop()} position="absolute" right="$2">
            <CloseIcon size="lg" />
          </ModalCloseButton>
          <VStack p="$4" space="lg">
            <Heading>Request with QR Code</Heading>
            <Text>Show this QR code or copy and share with who will make this payment</Text>
            <Center my="$4">
              <QRCode value={encodeQRCode(request)} size={QRCodeSize.MEDIUM} />
            </Center>

            <Box>
              <Text bold>Requested value</Text>
              <Text size="4xl">
                {request.amount} {request.assetCode}
              </Text>
              <Text>For {request.name}</Text>
            </Box>
            <ButtonGroup flexDirection="column">
              <Button onPress={() => navigation.popToTop()}>
                <ButtonText>Copy the code</ButtonText>
              </Button>
              <Button action="secondary" onPress={() => navigation.popToTop()}>
                <ButtonText>Send payment link</ButtonText>
              </Button>
            </ButtonGroup>
          </VStack>
        </Box>
      </ScrollView>
    </SafeAreaView>
  );
};
