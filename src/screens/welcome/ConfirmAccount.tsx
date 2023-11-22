import AsyncStorage from '@react-native-async-storage/async-storage';
import { styled } from 'nativewind';
import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { confirmAccount } from '@/services/cognito';

import Button from '@components/Button';
import CustomModal from '@components/CustomModal';

import { CONFIRM_ACCOUNT_ERROR, WRONG_CODE_ERROR } from '@constants/errorMessages';

type ConfirmAccountProps = {
  navigation: any;
};

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);

const ConfirmAccount = ({ navigation }: ConfirmAccountProps) => {
  const [confirmationCode, setConfirmationCode] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isConfirmationModalVisible, setIsConfirmationModalVisible] = useState<boolean>(false);
  const [isConfirmationSuccessful, setIsConfirmationSuccessful] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmation = async () => {
    try {
      setIsLoading(true);
      setError('');
      const [[, email], [, username]] = await AsyncStorage.multiGet(['email', 'username']);
      if (email && username) {
        const response = await confirmAccount({ email, username, code: confirmationCode });
        if (response && response.status) {
          setIsConfirmationSuccessful(true);
          setIsConfirmationModalVisible(true);
        } else {
          setError(WRONG_CODE_ERROR);
        }
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
    <StyledView className="gap-4 p-6 mt-6">
      <StyledText className="text-lg text-center">Enter the confirmation code sent to your email:</StyledText>
      <StyledTextInput
        className="text-lg bg-white h-10 p-2 rounded-sm mb-2"
        placeholder="Confirmation code"
        value={confirmationCode}
        onChangeText={(text) => setConfirmationCode(text)}
      />
      <Button onPress={handleConfirmation} disabled={isLoading} backgroundColor="blue" textColor="white">
        {isLoading ? <ActivityIndicator size="large" color="gray" /> : 'Confirm Account'}
      </Button>
      <StyledView className="flex-row justify-center items-center gap-2">
        <StyledText className="text-lg">Didn't receive the code?</StyledText>
        <TouchableOpacity>
          <StyledText className="text-blue text-xl font-bold">Resend Code</StyledText>
        </TouchableOpacity>
      </StyledView>
      <StyledText testID="error" className="text-red text-lg text-center">
        {error}
      </StyledText>
      <CustomModal isVisible={isConfirmationModalVisible} title="Confirmation successful">
        <StyledText className="text-lg p-4">Your account has been successfully confirmed.</StyledText>
        <Button onPress={handleCloseConfirmationModal} backgroundColor="blue" textColor="white">
          Accept
        </Button>
      </CustomModal>
    </StyledView>
  );
};

export default ConfirmAccount;
