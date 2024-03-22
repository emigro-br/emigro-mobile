import { useState } from 'react';
import { Dropdown } from 'react-native-element-dropdown';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useVendor } from '@contexts/VendorContext';
import { Box, Button, ButtonText, Card, Divider, HStack, Heading, Text, VStack } from '@gluestack-ui/themed';

import { CryptoAsset, cryptoAssets } from '@/types/assets';

import { ErrorModal } from '@components/modals/ErrorModal';
import { LoadingModal } from '@components/modals/LoadingModal';
import { SuccessModal } from '@components/modals/SuccessModal';

import usePayment, { TransactionStep } from '@hooks/usePayment';

import { PaymentStackParamList } from '@navigation/PaymentsStack';
import { WalletStackParamList } from '@navigation/WalletStack';

import { PinScreen } from '@screens/PinScreen';

import { balanceStore } from '@stores/BalanceStore';
import { sessionStore } from '@stores/SessionStore';

import { AssetToCurrency, labelFor, symbolFor } from '@utils/assets';

type Props = {
  navigation: NativeStackNavigationProp<WalletStackParamList & PaymentStackParamList, 'ConfirmPayment'>;
};

const ConfirmPayment = ({ navigation }: Props) => {
  const { scannedVendor } = useVendor();
  const [showPinScreen, setShowPinScreen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<CryptoAsset>(scannedVendor.assetCode);
  const [paymentAmount, setPaymentAmount] = useState<number>(scannedVendor.amount);

  const availableAssets = cryptoAssets();
  const data = availableAssets.map((asset) => ({
    label: asset,
    value: asset,
  }));

  const destinationAssetCode = scannedVendor.assetCode;

  const { transactionValue, transactionError, step, setStep, handleConfirmPayment } = usePayment(
    scannedVendor,
    paymentAmount,
    selectedAsset,
    destinationAssetCode,
  );

  const balance = balanceStore.get(selectedAsset);
  const hasBalance = transactionValue < balance;
  const currencyAsset = AssetToCurrency[scannedVendor.assetCode as CryptoAsset];

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
              {scannedVendor.amount} {labelFor(currencyAsset)}
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
                  {symbolFor(selectedAsset, transactionValue)}
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
          <Button size="lg" onPress={() => setShowPinScreen(true)} isDisabled={!hasBalance}>
            <ButtonText>Pay</ButtonText>
          </Button>
        </VStack>
      </Box>
    </>
  );
};

export default ConfirmPayment;
