import { useEffect, useState } from 'react';
import { Dropdown } from 'react-native-element-dropdown';

import {
  Box,
  Button,
  ButtonSpinner,
  ButtonText,
  Card,
  Center,
  Divider,
  HStack,
  Heading,
  Pressable,
  ScrollView,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import * as Sentry from '@sentry/react-native';
import { usePathname, useRouter } from 'expo-router';

import { InputAmountActionSheet } from '@/components/InputAmountActionSheet';
import { LoadingScreen } from '@/components/Loading';
import { PinScreen } from '@/components/screens/PinScreen';
import { TRANSACTION_ERROR_MESSAGE } from '@/constants/errorMessages';
import { IQuoteRequest, handleQuote } from '@/services/emigro/quotes';
import { balanceStore } from '@/stores/BalanceStore';
import { paymentStore } from '@/stores/PaymentStore';
import { securityStore } from '@/stores/SecurityStore';
import { Payment, PixPayment } from '@/types/PixPayment';
import { CryptoAsset, FiatCurrency } from '@/types/assets';
import { AssetToCurrency, symbolFor } from '@/utils/assets';
import { maskWallet } from '@/utils/masks';

export const ConfirmPayment = () => {
  const router = useRouter();
  const path = usePathname();
  const { scannedPayment } = paymentStore;

  const [isProcesing, setIsProcessing] = useState(false);
  const [showPinScreen, setShowPinScreen] = useState(false);
  const [showEditAmount, setShowEditAmount] = useState(false);
  const [requestedAmount, setRequestedAmount] = useState<number>(scannedPayment?.transactionAmount ?? 0);
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset>(scannedPayment?.assetCode ?? CryptoAsset.USDC);
  const [paymentQuote, setPaymentQuote] = useState<number | null>(scannedPayment?.transactionAmount ?? null);

  const isPix = scannedPayment && 'pixKey' in scannedPayment;

  const fetchQuote = async () => {
    if (!selectedAsset || !scannedPayment || !requestedAmount) {
      return;
    }
    setPaymentQuote(null);
    const data: IQuoteRequest = {
      from: selectedAsset,
      to: scannedPayment.assetCode,
      amount: `${requestedAmount}`,
      type: 'strict_receive',
    };
    const quote = await handleQuote(data);

    // no quotes found
    if (quote === null) {
      return;
    }

    setPaymentQuote(quote.source_amount);
  };

  useEffect(() => {
    fetchQuote().catch(console.warn);
  }, [selectedAsset, requestedAmount]);

  if (!scannedPayment) {
    return <LoadingScreen />;
  }

  const handlePressPay = () => {
    if (!paymentQuote) {
      console.warn('Payment amount is not set');
      return;
    }

    const transaction = {
      from: {
        asset: selectedAsset,
        value: Number(paymentQuote), // FIXME: check where is  string
      },
      to: {
        wallet: scannedPayment.walletKey!, // TODO: for pix is the Emigro wallet in the server side
        asset: scannedPayment.assetCode,
        value: requestedAmount,
      },
      rate: paymentQuote / requestedAmount,
      fees: 0,
    };

    paymentStore.setTransaction(transaction);
    setShowPinScreen(true);
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    try {
      let result: any; // FIXME: try to define the type

      // TODO: move to paymentStore
      if (isPix) {
        result = await paymentStore.payPix();
      } else {
        result = await paymentStore.pay();
      }

      if (result.status === 'paid' || result.transactionHash) {
        router.replace(`${path}/success`);
      } else if (['created', 'pending'].includes(result.status)) {
        router.replace(`${path}/waiting`);
      } else {
        throw new Error(TRANSACTION_ERROR_MESSAGE);
      }
    } catch (error) {
      let message;
      if (error instanceof Error) {
        message = error.message;
      } else {
        message = TRANSACTION_ERROR_MESSAGE;
      }
      Sentry.captureException(error);
      router.replace({
        pathname: `${path}/error`,
        params: { error: message },
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (showPinScreen) {
    return (
      <PinScreen
        tagline="Enter your PIN code"
        btnLabel="Confirm"
        autoSubmit
        verifyPin={async (pin) => await securityStore.verifyPin(pin)}
        onPinSuccess={() => {
          setShowPinScreen(false);
          handleConfirmPayment();
        }}
        onPinFail={(error) => {
          console.warn('Error on pay transfer', error); // FIXME:
          setShowPinScreen(false);
        }}
      />
    );
  }

  const data = balanceStore.currentAssets().map((asset) => ({
    label: asset,
    value: asset,
  }));

  const balance = balanceStore.get(selectedAsset);
  const hasBalance = paymentQuote ? paymentQuote < balance : true;

  const isPayDisabled = !paymentQuote || !hasBalance || isProcesing;
  const isAmountEditable = scannedPayment.transactionAmount === 0;

  return (
    <>
      <InputAmountActionSheet
        isOpen={showEditAmount}
        onClose={() => setShowEditAmount(false)}
        tagline="Enter the amount you want to pay"
        initialAmount={requestedAmount}
        asset={AssetToCurrency[scannedPayment.assetCode] as FiatCurrency} //TODO: improve this
        onSave={(amount) => setRequestedAmount(amount)}
      />

      <ScrollView flex={1} bg="$white">
        <Box flex={1}>
          <VStack p="$4" space="lg">
            <Heading size="xl">Review the payment</Heading>

            <HStack alignItems="center">
              <Pressable onPress={() => isAmountEditable && setShowEditAmount(true)}>
                <Text size="4xl" color="$textLight800" bold>
                  {symbolFor(scannedPayment.assetCode, requestedAmount)}
                </Text>
              </Pressable>
              {isAmountEditable && (
                <Button variant="link" ml="$2" onPress={() => setShowEditAmount(true)}>
                  <ButtonText>Edit</ButtonText>
                </Button>
              )}
            </HStack>

            <VStack space="3xl">
              <Box>
                <Text size="lg" numberOfLines={1} ellipsizeMode="tail">
                  for{' '}
                  <Text bold size="lg">
                    {scannedPayment.merchantName}
                  </Text>
                </Text>
                {scannedPayment.merchantCity && (
                  <Text>
                    in <Text>{scannedPayment.merchantCity}</Text>
                  </Text>
                )}
              </Box>

              {scannedPayment.infoAdicional && (
                <Center>
                  <Card variant="filled" bg="$backgroundLight100">
                    <Text textAlign="center">{scannedPayment.infoAdicional}</Text>
                  </Card>
                </Center>
              )}

              {isPix && <StaticPix pix={scannedPayment as PixPayment} />}
              {!isPix && <StellarPay pay={scannedPayment} />}
            </VStack>

            <Divider />

            <Text>Select the account</Text>
            <Card variant="filled" pb="$2">
              <HStack>
                <Box w="$1/4">
                  <Dropdown
                    selectedTextStyle={{ fontWeight: '500' }}
                    data={data}
                    value={selectedAsset}
                    labelField="label"
                    valueField="value"
                    onChange={(selectedItem) => setSelectedAsset(selectedItem.value)}
                    disable={isProcesing}
                  />
                </Box>
                <Box w="$3/4">
                  <Text textAlign="right" py="$1">
                    {paymentQuote && symbolFor(selectedAsset, paymentQuote)}
                  </Text>
                </Box>
              </HStack>
              <HStack justifyContent="space-between">
                <Text size="xs" color={`${hasBalance ? '$gray' : '$red'}`}>
                  Balance: {symbolFor(selectedAsset, balance)}
                </Text>
                {!hasBalance && (
                  <Text color="$red" size="xs">
                    exceeds balance
                  </Text>
                )}
              </HStack>
            </Card>

            <Text size="xs">
              The seller will receive the exact value he set. The quantity that will be sent is computed automatically.
            </Text>
            <Button size="lg" onPress={handlePressPay} isDisabled={isPayDisabled}>
              {isProcesing && <ButtonSpinner mr="$1" />}
              <ButtonText>{isProcesing ? 'Processing...' : 'Pay'} </ButtonText>
            </Button>
          </VStack>
        </Box>
      </ScrollView>
    </>
  );
};

interface StaticPixProps {
  pix: PixPayment;
}

const StaticPix = ({ pix }: StaticPixProps) => (
  <VStack space="md">
    <HStack justifyContent="space-between">
      <Text bold>CPF/CNPJ: </Text>
      <Text>{pix.taxId}</Text>
    </HStack>
    <HStack justifyContent="space-between">
      <Text bold>Institution: </Text>
      <Text numberOfLines={2} ellipsizeMode="tail" maxWidth="$2/3">
        {pix.bankName}
      </Text>
    </HStack>
    <HStack justifyContent="space-between">
      <Text bold>Pix Key: </Text>
      <Text>{pix.pixKey}</Text>
    </HStack>
    <HStack justifyContent="space-between">
      <Text bold>Identifier: </Text>
      <Text>{pix.txid}</Text>
    </HStack>
  </VStack>
);

interface StellarPayProps {
  pay: Payment;
}

const StellarPay = ({ pay }: StellarPayProps) => (
  <VStack space="md">
    <HStack justifyContent="space-between">
      <Text bold>Institution:</Text>
      <Text maxWidth="$2/3">Stellar Network</Text>
    </HStack>
    <HStack justifyContent="space-between">
      <Text bold>Wallet Key:</Text>
      <Text>{maskWallet(pay.walletKey!)}</Text>
    </HStack>
    {/* <HStack justifyContent="space-between">
      <Text bold>Identifier:</Text>
      <Text>{pix.txid}</Text>
    </HStack> */}
  </VStack>
);

export default ConfirmPayment;
