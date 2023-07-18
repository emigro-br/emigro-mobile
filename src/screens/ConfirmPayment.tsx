import { RouteProp, useRoute } from '@react-navigation/native';
import { styled } from 'nativewind';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Text, TextInput, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

import Button from '@components/Button';
import CustomModal from '@components/CustomModal';
import Header from '@components/Header';

import useCurrencyChange from '@hooks/useCurrencyChange';
import useGetUserBalance from '@hooks/useGetUserBalance';
import usePayment from '@hooks/usePayment';

type RootStackParamList = {
  ConfirmPayment: { scannedData: { name: string; vendorId: string; address: string; publicKey: string } };
};

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);

const ConfirmPayment = ({ navigation }: any) => {
  const route = useRoute<RouteProp<RootStackParamList, 'ConfirmPayment'>>();

  const { scannedData } = route.params;

  const [open, setOpen] = useState(false);

  const [paymentAmount, setPaymentAmount] = useState('');

  const [isModalVisible, setIsModalVisible] = useState(false);

  const {
    transactionValue,
    isTransactionLoading,
    isTransactionCompletedModalVisible,
    setTransactionCompletedModalVisible,
    handleConfirmPayment,
  } = usePayment(paymentAmount, scannedData);

  const { items, setItems } = useGetUserBalance();

  const { currency, setCurrency, selectedBalance, amountType, handleCurrencyChange } = useCurrencyChange(items);

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleNavigateWallet = () => {
    navigation.navigate('Wallet');
    setTransactionCompletedModalVisible(false);
  };

  return (
    <KeyboardAvoidingView>
      <Header children />
      <StyledView className="flex justify-center items-center p-4">
        <StyledView className="flex-row px-4 mt-10">
          <StyledText className="text-xl font-bold">Vendor: </StyledText>
          <StyledText className="text-xl">
            {scannedData.name}, {scannedData.address}
          </StyledText>
        </StyledView>
        <StyledView className="w-full flex justify-center p-6 gap-4 mt-6">
          <StyledText className="font-bold text-xl my-2">Select an amount:</StyledText>
          <StyledView className="flex-row justify-center align-middle">
            <StyledView className="flex flex-row w-1/3">
              <DropDownPicker
                open={open}
                value={currency}
                items={items}
                setOpen={setOpen}
                setValue={setCurrency}
                setItems={setItems}
                placeholder="Type"
                style={{
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                  borderRightWidth: 0,
                }}
                onChangeValue={handleCurrencyChange}
              />
            </StyledView>
            <StyledView className="flex-row items-center rounded-md rounded-l-none  mb-6 bg-white h-[50px] border-[1px] border-black border-l-0">
              <StyledText className="w-1/4 ml-2 font-bold">{amountType}</StyledText>
              <StyledTextInput className="w-24" value={paymentAmount} onChangeText={setPaymentAmount} />
            </StyledView>
          </StyledView>
          {selectedBalance && selectedBalance.balance < Number(paymentAmount) && (
            <StyledText className="text-red">Insufficient funds</StyledText>
          )}
          {selectedBalance && (
            <StyledView className="mb-6">
              <StyledText className="text-md text-gray mb-1">Balance: {selectedBalance?.balance}</StyledText>
            </StyledView>
          )}
          <StyledView className="mb-6">
            <StyledText className="text-lg mb-1">Rate: {currency === 'USDC' ? '1 USD = 5 BRL' : null}</StyledText>
            <StyledText className="text-lg mb-1">Markup: 0%</StyledText>
            <StyledText className="text-lg mb-1">Fee: 0 USD</StyledText>
            {typeof transactionValue === 'object' ? (
              <StyledText className="text-lg mb-1 text-red">{transactionValue.message}</StyledText>
            ) : (
              <StyledText className="text-lg mb-1 font-bold">
                Total: <StyledText>{transactionValue}</StyledText>
                {currency === 'USDC' ? ' BRL' : ' USD'}
              </StyledText>
            )}
          </StyledView>
          <StyledView>
            <Button
              onPress={handleOpenModal}
              disabled={selectedBalance && selectedBalance.balance < Number(paymentAmount) ? true : false}
              bg="red"
              textColor="white"
            >
              Confirm payment
            </Button>
          </StyledView>
          <CustomModal isVisible={isModalVisible} title="Confirm Payment" onClose={() => setIsModalVisible(false)}>
            <StyledView className="flex w-full px-4">
              <StyledView>
                <StyledText>FOR:</StyledText>
                <StyledText className="font-bold text-lg mb-2">
                  {scannedData.name} {scannedData.address}
                </StyledText>
                <StyledView className="mb-2">
                  <StyledText>VENDOR WILL RECEIVE:</StyledText>
                  <StyledText className="font-bold text-lg text-green">$R: {transactionValue}</StyledText>
                </StyledView>
                <StyledText>TRANSACTION AMOUNT:</StyledText>
                <StyledText className="font-bold text-lg text-red">
                  {amountType} {paymentAmount}
                </StyledText>
              </StyledView>

              <StyledView className="my-4">
                <Button bg="red" textColor="white" onPress={handleConfirmPayment} disabled={isTransactionLoading}>
                  {isTransactionLoading ? <ActivityIndicator size="large" color="white" /> : 'CONFIRM'}
                </Button>
              </StyledView>
              <StyledView>
                <Button bg="white" onPress={() => setIsModalVisible(false)}>
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
            <Button bg="red" textColor="white" onPress={handleNavigateWallet}>
              Accept
            </Button>
          </StyledView>
        </CustomModal>
      )}
    </KeyboardAvoidingView>
  );
};

export default ConfirmPayment;
