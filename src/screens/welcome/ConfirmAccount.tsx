import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { styled } from 'nativewind';

import Button from '@components/Button';
import CustomModal from '@components/CustomModal';

import { CONFIRM_ACCOUNT_ERROR, WRONG_CODE_ERROR } from '@constants/errorMessages';

import { RootStackParamList } from '@navigation/index';

import { confirmAccount } from '@services/auth';

type Props = NativeStackScreenProps<RootStackParamList, 'ConfirmAccount'>;

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);

const ConfirmAccount = ({ route, navigation }: Props) => {
  const [confirmationCode, setConfirmationCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState<boolean>(false);
  const [isConfirmationSuccessful, setIsConfirmationSuccessful] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const { email, username } = route.params;

  if (!email || !username) {
    return (
      <StyledView className="gap-4 p-6 mt-6">
        <StyledText className="text-lg text-center">Invalid confirmation link</StyledText>
      </StyledView>
    );
  }

  const handleConfirmation = async () => {
    // FIXME: is not even checking if the confirmationCode is empty
    try {
      setIsLoading(true);
      setError('');
      const response = await confirmAccount({ email, username, code: confirmationCode });
      if (response?.status) {
        setIsConfirmationSuccessful(true);
        setIsConfirmationModalVisible(true);
      } else {
        setError(WRONG_CODE_ERROR);
      }
    } catch (error) {
      console.error(error);
      setError(CONFIRM_ACCOUNT_ERROR);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseConfirmationModal = () => {
    setIsConfirmationModalVisible(false);
    if (isConfirmationSuccessful) {
      navigation.navigate('Login');
    }
  };

  return (
    <StyledView className="h-full bg-white gap-4 p-4">
      <StyledText className="text-xl font-bold">Confirm your Account</StyledText>
      <StyledText className="text-lg">Enter the confirmation code sent to your email:</StyledText>
      <StyledView>
        <StyledTextInput
          className="text-lg bg-white h-10 p-2 rounded-sm mb-4"
          placeholder="Confirmation code"
          value={confirmationCode}
          onChangeText={(text) => setConfirmationCode(text)}
        />
        <Button onPress={handleConfirmation} loading={isLoading} backgroundColor="red" textColor="white">
          Confirm Account
        </Button>
      </StyledView>

      <StyledView className="flex-row gap-2">
        <StyledText className="">Didn't receive the code?</StyledText>
        <TouchableOpacity>
          <StyledText className="text-red font-bold">Resend it</StyledText>
        </TouchableOpacity>
      </StyledView>
      <StyledText testID="confirm-account-error" className="text-red text-lg text-center">
        {error}
      </StyledText>
      <CustomModal isVisible={isConfirmationModalVisible} title="Confirmation successful">
        <StyledText className="text-lg p-4">Your account has been successfully confirmed.</StyledText>
        <Button onPress={handleCloseConfirmationModal} backgroundColor="red" textColor="white">
          Continue
        </Button>
      </CustomModal>
    </StyledView>
  );
};

export default ConfirmAccount;
