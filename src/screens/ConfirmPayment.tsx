import React, { useEffect, useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';

import { useNavigation } from '@react-navigation/native';

import { Box, Button, ButtonText, HStack, Heading, Input, InputField, Text, VStack } from '@gluestack-ui/themed';

import { useVendor } from '@/contexts/VendorContext';
import { IVendor } from '@/types/IVendor';
import { CryptoAsset } from '@/types/assets';

import { ConfirmationModal } from '@components/modals/ConfirmationModal';
import { ErrorModal } from '@components/modals/ErrorModal';
import { LoadingModal } from '@components/modals/LoadingModal';
import { SuccessModal } from '@components/modals/SuccessModal';

import useCurrencyChange from '@hooks/useCurrencyChange';
import useGetUserBalance from '@hooks/useGetUserBalance';
import usePayment from '@hooks/usePayment';

import { AssetToCurrency } from '@utils/assets';

export type RootStackParamList = {
  ConfirmPayment: { scannedVendor: IVendor };
};

const ConfirmPayment: React.FunctionComponent = () => {
  const navigation = useNavigation();
  const { scannedVendor } = useVendor();
  const [open, setOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { userBalance, setUserBalance } = useGetUserBalance();
  const { currency, setCurrency, selectedBalance, handleCurrencyChange } = useCurrencyChange(userBalance);

  const destinationAssetCode = scannedVendor.assetCode;

  const {
    transactionValue,
    isTransactionLoading,
    isTransactionCompletedModalVisible,
    transactionError,
    setIsTransactionCompletedModalVisible,
    handleConfirmPayment,
  } = usePayment(paymentAmount, scannedVendor, currency, destinationAssetCode);

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleNavigateWallet = () => {
    navigation.navigate('Wallet' as never);
    setIsTransactionCompletedModalVisible(false);
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

        <Button onPress={handleOpenModal} isDisabled={insuficcientBalance}>
          <ButtonText>Send Money</ButtonText>
        </Button>
      </VStack>

      {/* TODO: check it is necessary since ConfirmationModal has internal loading */}
      <LoadingModal isOpen={isTransactionLoading} text="Processing..." />

      <ConfirmationModal
        title="Confirm Payment"
        isOpen={isModalVisible && !isTransactionCompletedModalVisible}
        onClose={() => setIsModalVisible(false)}
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
        isOpen={isTransactionCompletedModalVisible && !transactionError}
        title="Transaction completed"
        publicKey={scannedVendor.publicKey}
        onClose={handleNavigateWallet}
      />

      <ErrorModal
        isOpen={isTransactionCompletedModalVisible && !!transactionError}
        title="Transaction error"
        errorMessage="Failed to complete your payment!"
        onClose={handleNavigateWallet}
      />
    </Box>
  );
};

export default ConfirmPayment;
