import { RouteProp, useRoute } from '@react-navigation/native';
import { styled } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Text, TextInput, View } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

import { handleQuote, sendTransaction } from '@/services/emigro';

import { balances } from '@api/balance';

import Button from '@components/Button';
import CustomModal from '@components/CustomModal';
import Header from '@components/Header';

type RootStackParamList = {
  ConfirmPayment: { scannedData: { name: string; vendorId: string; address: string; publicKey: string } };
};

interface Balance {
  balance: number;
}

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);

const ConfirmPayment = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'ConfirmPayment'>>();
  const { scannedData } = route.params;
  const [paymentAmount, setPaymentAmount] = useState('');
  const [open, setOpen] = useState(false);
  const [currency, setCurrency] = useState(null);
  const [amountType, setAmountType] = useState('');
  const [selectedBalance, setSelectedBalance] = useState<Balance | null>(null);
  const [items, setItems] = useState(
    balances
      .filter((bal) => bal.asset_type === 'credit_alphanum4')
      .map((bal) => ({ label: bal.asset_code, value: bal.asset_code })),
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [transactionValue, setTransactionValue] = useState('');
  console.log(transactionValue, 'valor transaccion');


  const handlePayment = async () => {
    try {
      const quoteResponse = await handleQuote(from, to, paymentAmount);
      setTransactionValue(quoteResponse);
    } catch (error) {
      console.error(error);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      const paymentResponse = await sendTransaction(transactionValue, route.params.scannedData.publicKey);
      console.log(transactionValue, 'valor que va a recibir el vendor');
      console.log(route.params.scannedData.publicKey, 'public key escaneada');
      console.log(paymentResponse, 'respueste d confirmacion de pago');
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    paymentAmount && handlePayment();
  });

  const handleOpenModal = () => {
    setIsModalVisible(true);
  };

  const handleCurrencyChange = (value: any) => {
    setCurrency(value);
    const balance = balances.find((bal) => bal.asset_code === value);
    setSelectedBalance(balance as any);
    if (value === 'BRL') {
      setAmountType('R$:');
    } else if (value === 'USDC') {
      setAmountType('$US:');
    } else {
      setAmountType('');
    }
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
              <StyledText className="text-md text-gray mb-1">Balance: {selectedBalance.balance}</StyledText>
            </StyledView>
          )}
          <StyledView className="mb-6">
            <StyledText className="text-lg mb-1">Rate: 1 USD = 5BRL</StyledText>
            <StyledText className="text-lg mb-1">Markup: 0%</StyledText>
            <StyledText className="text-lg mb-1">Fee: 0 USD</StyledText>
            <StyledText className="text-lg mb-1 font-bold">
              Total: <StyledText>{transactionValue}</StyledText> BRL
            </StyledText>
          </StyledView>
          <StyledView>
            <Button
              onPress={handleOpenModal}
              disabled={selectedBalance && selectedBalance.balance < Number(paymentAmount) ? true : false}
              bg="red"
              textColor="white"
            >
              <StyledText>Confirm payment</StyledText>
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
                <Button bg="red" textColor="white" onPress={handleConfirmPayment}>
                  CONFIRM
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
    </KeyboardAvoidingView>
  );
};

export default ConfirmPayment;
