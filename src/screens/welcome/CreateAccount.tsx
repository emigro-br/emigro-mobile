import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { styled } from 'nativewind';

import { FormField } from '@/types/FormField';
import { IRegisterUser } from '@/types/IRegisterUser';

import Button from '@components/Button';
import CustomModal from '@components/CustomModal';

import { Role } from '@constants/constants';
import { SIGNUP_ERROR_MESSAGE } from '@constants/errorMessages';

import { signUp } from '@services/auth';

type SignUpProps = {
  navigation: any;
};

type ConfirmationParams = {
  email: string;
  username: string;
};

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);

const formFields: FormField[] = [
  { name: 'email', placeholder: 'Email', keyboardType: 'email-address' },
  { name: 'password', placeholder: 'Password', secureTextEntry: true, keyboardType: 'default' },
  { name: 'firstName', placeholder: 'First Name', keyboardType: 'default' },
  { name: 'lastName', placeholder: 'Last Name', keyboardType: 'default' },
  { name: 'address', placeholder: 'Address', keyboardType: 'default' },
];

const CreateAccount = ({ navigation }: SignUpProps) => {
  const [formData, setFormData] = useState<IRegisterUser>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    address: '',
    role: Role.CUSTOMER,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [confirmaationParams, setConfirmationParams] = useState<ConfirmationParams | null>(null);

  const [error, setError] = useState('');

  const handleChange = (name: string, value: string) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const clearForm = () => {
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      address: '',
      role: Role.CUSTOMER,
    });
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError('');
      const { username } = await signUp(formData);
      if (!username) {
        throw new Error(SIGNUP_ERROR_MESSAGE);
      }
      setConfirmationParams({ email: formData.email, username });
      clearForm();
    } catch (error) {
      console.error(error);
      setError(SIGNUP_ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseConfirmationModal = () => {
    setConfirmationParams(null);
    navigation.navigate('ConfirmAccount', confirmaationParams);
  };

  return (
    <StyledView className="gap-4 p-6 mt-6">
      {formFields.map((field) => (
        <StyledTextInput
          key={field.name}
          className="text-lg bg-white h-10 p-2 rounded-sm mb-2"
          placeholder={field.placeholder}
          value={formData[field.name]}
          onChangeText={(text) => handleChange(field.name, text)}
          secureTextEntry={field.secureTextEntry}
          keyboardType={field.keyboardType}
        />
      ))}

      <TouchableOpacity onPress={handleSubmit}>
        <Button backgroundColor="red" textColor="white" disabled={isLoading} onPress={handleSubmit}>
          {isLoading ? <ActivityIndicator size="large" color="gray" /> : 'Sign Up'}
        </Button>
      </TouchableOpacity>
      <StyledView className="flex-row justify-center items-center gap-2">
        <StyledText className="text-lg">Already have an account?</StyledText>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <StyledText className="text-red text-lg font-bold">Log in</StyledText>
        </TouchableOpacity>
      </StyledView>
      <StyledText className="text-red text-center text-lg">{error}</StyledText>
      <CustomModal isVisible={!!confirmaationParams} title="Complete registration">
        <StyledText className="text-lg p-4">We have sent you a confirmation code to your email address.</StyledText>
        <Button backgroundColor="red" textColor="white" onPress={handleCloseConfirmationModal}>
          Continue
        </Button>
      </CustomModal>
    </StyledView>
  );
};

export default CreateAccount;
