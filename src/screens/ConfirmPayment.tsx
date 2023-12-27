import { useNavigation } from '@react-navigation/native';
import { styled } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Text, TextInput, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

import { useVendor } from '@/contexts/VendorContext';
import { IVendor } from '@/types/IVendor';
import { formatAssetCode } from '@/utils/formatAssetCode';

import Button from '@components/Button';
import CustomModal from '@components/CustomModal';
import Header from '@components/Header';

import useCurrencyChange from '@hooks/useCurrencyChange';
import useGetUserBalance from '@hooks/useGetUserBalance';
import usePayment from '@hooks/usePayment';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);

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
    setPaymentAmount(scannedVendor.amount);
  }, [scannedVendor]);

  return (
    <KeyboardAvoidingView>
      <Header />
      <StyledView className="flex justify-center items-center p-4">
        <StyledView className="flex px-4 mt-10">
          <StyledText className="text-xl font-bold mb-2">Send Money</StyledText>
          <StyledText>To {scannedVendor.name}</StyledText>
        </StyledView>
        <StyledView className="w-full flex justify-center p-6 gap-4 mt-6">
          <StyledText className="font-bold text-xl my-2">
            So that the seller receives exactly the price he set, the quantity to be sent will be automatically
            selected.
          </StyledText>
          <StyledView className="flex-row justify-center align-middle">
            <StyledView className="flex flex-row w-1/2">
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
            </StyledView>
            <StyledView className="flex-row items-center bg-white rounded-md w-1/2 rounded-l-none  mb-6  h-[50px] border-[1px] border-black border-l-0">
              <StyledTextInput
                className="w-full"
                value={transactionValue.toString()}
                onChangeText={setPaymentAmount}
                placeholder="Amount"
                keyboardType="numeric"
              />
            </StyledView>
          </StyledView>
          {insuficcientBalance && <StyledText className="text-red">Insufficient funds</StyledText>}
          {selectedBalance && (
            <StyledView className="mb-6">
              <StyledText className="text-md text-gray mb-1">Balance: {selectedBalance.balance}</StyledText>
            </StyledView>
          )}
          <StyledView className="mb-6">
            {typeof transactionValue === 'object' ? (
              <StyledText className="text-lg mb-1 text-red">
                {transactionValue.message && 'No offers available'}
              </StyledText>
            ) : (
              <StyledText className="text-lg mb-1 font-bold">
                <StyledText>
                  {scannedVendor.name} will receive {paymentAmount} {formatAssetCode(destinationAssetCode)}
                </StyledText>
                {currency === scannedVendor.assetCode}
              </StyledText>
            )}
          </StyledView>
          <StyledView>
            <Button onPress={handleOpenModal} disabled={insuficcientBalance} backgroundColor="black" textColor="white">
              Send Money
            </Button>
          </StyledView>
          <CustomModal isVisible={isModalVisible} title="Confirm Payment" onClose={() => setIsModalVisible(false)}>
            <StyledView className="flex w-full px-4">
              <StyledView>
                <StyledView className="mb-2">
                  <StyledText> {scannedVendor?.name} WILL RECEIVE:</StyledText>
                  <StyledText className="font-bold text-lg text-green">
                    {paymentAmount} {formatAssetCode(destinationAssetCode)}
                  </StyledText>
                </StyledView>
                <StyledText>TRANSACTION AMOUNT:</StyledText>
                <StyledText className="font-bold text-lg text-red">
                  {String(transactionValue)} {formatAssetCode(currency)}
                </StyledText>
              </StyledView>

              <StyledView className="my-4">
                <Button
                  backgroundColor="red"
                  textColor="white"
                  onPress={handleConfirmPayment}
                  disabled={isTransactionLoading}
                >
                  {isTransactionLoading ? <ActivityIndicator size="large" color="white" /> : 'CONFIRM'}
                </Button>
              </StyledView>
              <StyledView>
                <Button backgroundColor="white" onPress={() => setIsModalVisible(false)}>
                  Cancel transaction
                </Button>
              </StyledView>
            </StyledView>
          </CustomModal>
        </StyledView>
      </StyledView>
      {isTransactionCompletedModalVisible && (
        <CustomModal isVisible={isTransactionCompletedModalVisible} title="Transaction completed sucesfully!">
          <StyledView className="flex w-full px-4">
            <Button backgroundColor="red" textColor="white" onPress={handleNavigateWallet}>
              Accept
            </Button>
          </StyledView>
        </CustomModal>
      )}
    </KeyboardAvoidingView>
  );
};

export default ConfirmPayment;
