import React, { useEffect, useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useVendor } from '@contexts/VendorContext';
import { Box, Button, ButtonText, HStack, Heading, Input, InputField, Text, VStack } from '@gluestack-ui/themed';

import { CryptoAsset } from '@/types/assets';

import { ConfirmationModal } from '@components/modals/ConfirmationModal';
import { ErrorModal } from '@components/modals/ErrorModal';
import { LoadingModal } from '@components/modals/LoadingModal';
import { SuccessModal } from '@components/modals/SuccessModal';

import useCurrencyChange from '@hooks/useCurrencyChange';
import useGetUserBalance from '@hooks/useGetUserBalance';
import usePayment, { TransactionStep } from '@hooks/usePayment';

import { PaymentStackParamList } from '@navigation/PaymentsStack';
import { WalletStackParamList } from '@navigation/WalletStack';

import { AssetToCurrency } from '@utils/assets';

type Props = {
  navigation: NativeStackNavigationProp<WalletStackParamList & PaymentStackParamList, 'ConfirmPayment'>;
};

const ConfirmPayment = ({ navigation }: Props) => {
  const { scannedVendor } = useVendor();
  const [open, setOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const { userBalance, setUserBalance } = useGetUserBalance();
  const { currency, setCurrency, selectedBalance, handleCurrencyChange } = useCurrencyChange(userBalance);

  const destinationAssetCode = scannedVendor.assetCode;

  const { transactionValue, transactionError, step, setStep, handleConfirmPayment } = usePayment(
    paymentAmount,
    scannedVendor,
    currency,
    destinationAssetCode,
  );

  const handleContinue = () => {
    setStep(TransactionStep.CONFIRM_PAYMENT);
  };

  const handleCloseFinishedModal = () => {
    setStep(TransactionStep.NONE);
    navigation.navigate('Wallet');
  };

  const insuficcientBalance = Number(selectedBalance.balance) < Number(paymentAmount);

  useEffect(() => {
    setCurrency(scannedVendor.assetCode);
    setPaymentAmount(scannedVendor.amount);
  }, [scannedVendor]);

  return (
    <Box flex={1} bg="$white">
      <VStack p="$4" space="lg">
        <Heading>Vendor: {scannedVendor.name}</Heading>

        <Text size="lg">
          The seller will receive the exact value he set. The quantity that will be sent is computed automatically.
        </Text>

        <HStack>
          <Box w="$1/4">
            <DropDownPicker
              open={open}
              value={currency}
              items={userBalance}
              setOpen={setOpen}
              setValue={setCurrency}
              setItems={setUserBalance}
              placeholder="Type"
              style={{
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
                borderRightWidth: 0,
              }}
              onChangeValue={handleCurrencyChange}
            />
          </Box>
          <Box w="$3/4">
            <Input borderColor="$black" borderLeftWidth={0} h={50}>
              <InputField
                textAlign="right"
                value={`${transactionValue}`}
                onChangeText={setPaymentAmount}
                placeholder="Amount"
                keyboardType="numeric"
                editable={false}
              />
            </Input>
          </Box>
        </HStack>

        {selectedBalance.balance && (
          <Box>
            {selectedBalance && (
              <Text color="$gray" textAlign="right" mb="$1">
                Balance: {selectedBalance.balance} {selectedBalance.label}{' '}
              </Text>
            )}
            {insuficcientBalance && (
              <Text color="red" textAlign="right">
                Insufficient funds
              </Text>
            )}
          </Box>
        )}

        <Box>
          {typeof transactionValue === 'object' ? (
            <Text size="lg" mb="$1" color="red">
              {transactionValue.message && 'No offers available'}
            </Text>
          ) : (
            <Text size="lg" bold>
              {scannedVendor.name} will receive: {paymentAmount} {AssetToCurrency[destinationAssetCode as CryptoAsset]}
            </Text>
          )}
        </Box>

        <Button onPress={handleContinue} isDisabled={insuficcientBalance}>
          <ButtonText>Continue</ButtonText>
        </Button>
      </VStack>

      {/* TODO: check it is necessary since ConfirmationModal has internal loading */}
      <LoadingModal isOpen={step === TransactionStep.PROCESSING} text="Processing..." />

      <ConfirmationModal
        title="Confirm Payment"
        isOpen={step === TransactionStep.CONFIRM_PAYMENT}
        onClose={() => setStep(TransactionStep.NONE)}
        onPress={handleConfirmPayment}
      >
        <VStack space="md">
          <Text>{scannedVendor?.name} will receive:</Text>
          <Text size="lg" color="$green" bold>
            {paymentAmount} {AssetToCurrency[destinationAssetCode as CryptoAsset]}
          </Text>
          <Text>Transaction amount:</Text>
          <Text size="lg" color="$red" bold>
            {String(transactionValue)} {AssetToCurrency[currency as CryptoAsset]}
          </Text>
        </VStack>
      </ConfirmationModal>

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
        onClose={handleCloseFinishedModal}
      />
    </Box>
  );
};

export default ConfirmPayment;
