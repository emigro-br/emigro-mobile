import { useNavigation } from '@react-navigation/native';
import { styled } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
    <KeyboardAvoidingView>
      <StyledView className="flex items-center bg-white h-full py-4">
        <StyledView className="px-4 mb-4 w-full">
          <StyledText className="text-xl font-bold">Vendor: {scannedVendor.name}</StyledText>
        </StyledView>

        <StyledView className="px-4 gap-4">
          <StyledText className="justify-center text-lg my-2">
            The seller will receive the exact value he set. The quantity that will be sent is computed automatically.
          </StyledText>
          <StyledView className="flex-row align-middle" style={{zIndex: 1}}>
            <StyledView className="flex-row w-1/3">
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
            <StyledView className="flex-row items-center bg-white rounded-md w-2/3 rounded-l-none h-[50px] border-[1px] border-black border-l-0">
              <StyledTextInput
                className="w-full text-right px-4"
                value={transactionValue.toString()}
                onChangeText={setPaymentAmount}
                placeholder="Amount"
                keyboardType="numeric"
                editable={false}
              />
            </StyledView>
          </StyledView>

          <StyledView className='text-right mb-2'>
            {selectedBalance && (
              <StyledText className="text-md text-gray text-right mb-1">Balance: {selectedBalance.balance} {selectedBalance.label} </StyledText>
              )}
            {insuficcientBalance && <StyledText className="text-red text-right">Insufficient funds</StyledText>}
          </StyledView>

          <StyledView className="mb-4">
            {typeof transactionValue === 'object' ? (
              <StyledText className="text-lg mb-1 text-red">
                {transactionValue.message && 'No offers available'}
              </StyledText>
            ) : (
              <StyledText className="text-lg font-bold">
                  {scannedVendor.name} will receive: {paymentAmount} {formatAssetCode(destinationAssetCode)}
              </StyledText>
            )}
          </StyledView>
          <StyledView>
            <Button onPress={handleOpenModal} disabled={insuficcientBalance} backgroundColor="red" textColor="white">
              Send Money
            </Button>
          </StyledView>

        </StyledView>
      </StyledView>

      <CustomModal isVisible={isModalVisible && !isTransactionCompletedModalVisible} title="Confirm Payment" onClose={() => setIsModalVisible(false)}>
        <StyledView className="flex w-full px-4">
          <StyledView>
            <StyledView className="mb-2">
              <StyledText>{scannedVendor?.name} will receive:</StyledText>
              <StyledText className="font-bold text-lg text-green">
                {paymentAmount} {formatAssetCode(destinationAssetCode)}
              </StyledText>
            </StyledView>
            <StyledText>Transaction amount:</StyledText>
            <StyledText className="font-bold text-lg text-red">
              {String(transactionValue)} {formatAssetCode(currency)}
            </StyledText>
          </StyledView>

          <StyledView className="my-2">
            <Button
              backgroundColor="red"
              textColor="white"
              onPress={handleConfirmPayment}
              disabled={isTransactionLoading}
            >
              {isTransactionLoading ? <ActivityIndicator size="small" color="white" /> : 'Confirm'}
            </Button>
          </StyledView>
          {!isTransactionLoading &&
          <TouchableOpacity onPress={() => setIsModalVisible(false)}>
            <StyledText className="text-center text-red p-1">Cancel</StyledText>
          </TouchableOpacity>
          }
        </StyledView>
      </CustomModal>

      {isTransactionCompletedModalVisible && (
        <CustomModal isVisible={isTransactionCompletedModalVisible} title={transactionError ? "Transaction error" : "Transaction completed"}>
          <StyledView className="flex w-full px-2">
            {!!transactionError ? 
              <StyledText className="text-center text-lg mb-2">Failed to complete your payment!</StyledText>
            :
              <StyledText className="text-center text-lg mb-2">Your payment was successful!</StyledText>
            }
            <Button backgroundColor="red" textColor="white" onPress={handleNavigateWallet}>
              Ok
            </Button>
          </StyledView>
        </CustomModal>
      )}
    </KeyboardAvoidingView>
  );
};

export default ConfirmPayment;
