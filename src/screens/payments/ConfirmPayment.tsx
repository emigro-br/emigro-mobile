import { useEffect, useState } from 'react';
import { Dropdown } from 'react-native-element-dropdown';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

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
  Text,
  VStack,
} from '@gluestack-ui/themed';
import * as Sentry from '@sentry/react-native';

import { PixPayment } from '@/types/PixPayment';
import { CryptoAsset, cryptoAssets } from '@/types/assets';

import { ErrorModal } from '@components/modals/ErrorModal';
import { SuccessModal } from '@components/modals/SuccessModal';

import { TRANSACTION_ERROR_MESSAGE } from '@constants/errorMessages';

import { PaymentStackParamList } from '@navigation/PaymentsStack';
import { WalletStackParamList } from '@navigation/WalletStack';

import { LoadingScreen } from '@screens/Loading';
import { PinScreen } from '@screens/PinScreen';

import { IQuoteRequest, handleQuote } from '@services/quotes';

import { balanceStore } from '@stores/BalanceStore';
import { paymentStore as bloc, paymentStore } from '@stores/PaymentStore';
import { sessionStore } from '@stores/SessionStore';

import { symbolFor } from '@utils/assets';

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
  const { scannedPayment } = paymentStore;

  const [step, setStep] = useState<TransactionStep>(TransactionStep.NONE);
  const [showPinScreen, setShowPinScreen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset>(scannedPayment?.assetCode ?? CryptoAsset.USDC);
  const [paymentQuote, setPaymentQuote] = useState<number | null>(scannedPayment?.transactionAmount ?? null);
  const [transactionError, setTransactionError] = useState<Error | unknown>(null);

  const isPix = scannedPayment && 'brCode' in scannedPayment;

  useEffect(() => {
    fetchQuote().catch(console.warn);
  }, [selectedAsset]);

  if (!scannedPayment) {
    return <LoadingScreen />;
  }

  const fetchQuote = async () => {
    setPaymentQuote(null);
    const data: IQuoteRequest = {
      from: selectedAsset,
      to: scannedPayment.assetCode,
      amount: `${scannedPayment.transactionAmount}`,
      type: 'strict_receive',
    };
    const quote = await handleQuote(data);

    // no quotes found
    if (quote === null) {
      return;
    }

    setPaymentQuote(quote.source_amount);
  };

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
        wallet: scannedPayment.pixKey,
        asset: scannedPayment.assetCode,
        value: scannedPayment.transactionAmount,
      },
      rate: paymentQuote / scannedPayment.transactionAmount,
      fees: 0,
    };

    bloc.setTransaction(transaction);
    setShowPinScreen(true);
  };

  const handleConfirmPayment = async () => {
    setStep(TransactionStep.PROCESSING);
    try {
      let result;

      // TODO: move to paymentStore
      if (isPix) {
        result = await bloc.payPix();
      } else {
        result = await bloc.pay();
      }

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

  const availableAssets = cryptoAssets();
  const data = availableAssets.map((asset) => ({
    label: asset,
    value: asset,
  }));

  const balance = balanceStore.get(selectedAsset);
  const hasBalance = paymentQuote ? paymentQuote < balance : true;

  const isProcesing = step === TransactionStep.PROCESSING;
  const isPayDisabled = !paymentQuote || !hasBalance || step !== TransactionStep.NONE; // processing, success, error

  return (
    <>
      <SuccessModal
        isOpen={step === TransactionStep.SUCCESS}
        title="Transaction completed"
        onClose={handleCloseFinishedModal}
      >
        <Text>Your payment was successfully completed. </Text>
      </SuccessModal>

      <ErrorModal
        isOpen={step === TransactionStep.ERROR}
        title="Transaction error"
        errorMessage={`Failed to complete your payment:\n ${transactionError}`}
        onClose={() => setStep(TransactionStep.NONE)}
      />

      <Box flex={1} bg="$white">
        <VStack p="$4" space="lg">
          <Heading size="xl">Review the payment</Heading>

          <Box>
            <Text size="4xl" color="$textLight800" bold>
              {symbolFor(scannedPayment.assetCode, scannedPayment.transactionAmount)}
            </Text>
          </Box>

          <VStack space="3xl">
            <Box>
              <Text size="lg">
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
            <ButtonText>{step === TransactionStep.PROCESSING ? 'Processing...' : 'Pay'} </ButtonText>
          </Button>
        </VStack>
      </Box>
    </>
  );
};

interface StaticPixProps {
  pix: PixPayment;
}

const StaticPix = ({ pix }: StaticPixProps) => (
  <VStack space="md">
    <HStack justifyContent="space-between">
      <Text bold>CPF/CNPJ:</Text>
      <Text>{pix.taxId}</Text>
    </HStack>
    <HStack justifyContent="space-between">
      <Text bold>Institution:</Text>
      <Text maxWidth="$2/3">{pix.bankName}</Text>
    </HStack>
    <HStack justifyContent="space-between">
      <Text bold>Pix Key:</Text>
      <Text>{pix.pixKey}</Text>
    </HStack>
    <HStack justifyContent="space-between">
      <Text bold>Identifier:</Text>
      <Text>{pix.txid}</Text>
    </HStack>
  </VStack>
);
