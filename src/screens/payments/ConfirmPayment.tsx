import { useEffect, useState } from 'react';
import { Dropdown } from 'react-native-element-dropdown';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Box, Button, ButtonText, Card, Divider, HStack, Heading, Text, VStack } from '@gluestack-ui/themed';
import * as Sentry from '@sentry/react-native';

import { IQuoteRequest } from '@/types/IQuoteRequest';
import { CryptoAsset, cryptoAssets } from '@/types/assets';

import { ErrorModal } from '@components/modals/ErrorModal';
import { LoadingModal } from '@components/modals/LoadingModal';
import { SuccessModal } from '@components/modals/SuccessModal';

import { TRANSACTION_ERROR_MESSAGE } from '@constants/errorMessages';

import { PaymentStackParamList } from '@navigation/PaymentsStack';
import { WalletStackParamList } from '@navigation/WalletStack';

import { PinScreen } from '@screens/PinScreen';

import { handleQuote } from '@services/emigro';

import { balanceStore } from '@stores/BalanceStore';
import { paymentStore as bloc, paymentStore } from '@stores/PaymentStore';
import { sessionStore } from '@stores/SessionStore';

import { AssetToCurrency, labelFor, symbolFor } from '@utils/assets';

enum TransactionStep {
  NONE = 'none',
  // CONFIRM_PAYMENT = 'confirm_payment',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  ERROR = 'error',
}

type Props = {
  navigation: NativeStackNavigationProp<WalletStackParamList & PaymentStackParamList, 'ConfirmPayment'>;
};

export const ConfirmPayment = ({ navigation }: Props) => {
  const scannedVendor = paymentStore.scannedPayment!; //FIXME:
  const [step, setStep] = useState<TransactionStep>(TransactionStep.NONE);
  const [showPinScreen, setShowPinScreen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset>(scannedVendor.assetCode);
  const [paymentQuote, setPaymentQuote] = useState<number | null>(scannedVendor.amount);
  const [transactionError, setTransactionError] = useState<Error | unknown>(null);

  const availableAssets = cryptoAssets();
  const data = availableAssets.map((asset) => ({
    label: asset,
    value: asset,
  }));

  const fetchQuote = async () => {
    setPaymentQuote(null);
    const data: IQuoteRequest = {
      // FIXME: use resctrictReceive and then invert these values
      to: selectedAsset,
      from: scannedVendor.assetCode,
      amount: `${scannedVendor.amount}`,
    };
    const quote = await handleQuote(data);

    // no quotes found
    if (quote === null || isNaN(quote)) {
      return;
    }

    setPaymentQuote(quote);
  };

  useEffect(() => {
    fetchQuote().catch(console.warn);
  }, [selectedAsset]);

  const handlePressPay = () => {
    if (!paymentQuote) {
      console.warn('Payment amount is not set');
      return;
    }

    const transaction = {
      from: {
        wallet: sessionStore.publicKey!,
        asset: selectedAsset,
        value: paymentQuote,
      },
      to: {
        wallet: scannedVendor.publicKey,
        asset: scannedVendor.assetCode,
        value: scannedVendor.amount,
      },
      rate: paymentQuote / scannedVendor.amount,
      fees: 0,
    };

    bloc.setTransaction(transaction);
    setShowPinScreen(true);
  };

  const handleConfirmPayment = async () => {
    setStep(TransactionStep.PROCESSING);
    try {
      const result = await bloc.pay();
      if (result.transactionHash) {
        setStep(TransactionStep.SUCCESS);
      }
    } catch (error) {
      Sentry.captureException(error);
      setStep(TransactionStep.ERROR);
      setTransactionError(TRANSACTION_ERROR_MESSAGE);
    }
  };

  const handleCloseFinishedModal = () => {
    setStep(TransactionStep.NONE);
    navigation.popToTop(); // clean the stack backing to Payments
    navigation.navigate('Wallet');
  };

  if (showPinScreen) {
    return (
      <PinScreen
        tagline="Enter your PIN code"
        btnLabel="Confirm"
        verifyPin={async (pin) => await sessionStore.verifyPin(pin)}
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

  const balance = balanceStore.get(selectedAsset);
  const hasBalance = paymentQuote ? paymentQuote < balance : true;
  const vendorCurrency = AssetToCurrency[scannedVendor.assetCode as CryptoAsset];

  return (
    <>
      <LoadingModal isOpen={step === TransactionStep.PROCESSING} text="Processing..." />

      <SuccessModal
        isOpen={step === TransactionStep.SUCCESS}
        title="Transaction completed"
        publicKey={scannedVendor.publicKey}
        onClose={handleCloseFinishedModal}
      />

      <ErrorModal
        isOpen={step === TransactionStep.ERROR}
        title="Transaction error"
        errorMessage={`Failed to complete your payment:\n ${transactionError}`}
        onClose={() => setStep(TransactionStep.NONE)}
      />

      <Box flex={1} bg="$white">
        <VStack p="$4" space="lg">
          <Heading size="xl">Review the details of this payment</Heading>

          <Box>
            <Text bold>Requested value</Text>
            <Text size="4xl" color="$textLight800" bold>
              {scannedVendor.amount} {labelFor(vendorCurrency)}
            </Text>
          </Box>

          <VStack>
            <Text size="lg">
              for{' '}
              <Text bold size="lg">
                {scannedVendor.name}
              </Text>
            </Text>
            {scannedVendor.address && (
              <Text>
                Location: <Text>{scannedVendor.address}</Text>
              </Text>
            )}
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
          <Button size="lg" onPress={handlePressPay} isDisabled={!paymentQuote || !hasBalance}>
            <ButtonText>Pay</ButtonText>
          </Button>
        </VStack>
      </Box>
    </>
  );
};
