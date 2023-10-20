import { styled } from 'nativewind';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { signUp } from '@/services/cognito';
import { FormField } from '@/types/FormField';

import { Role } from '@constants/constants';
import { SIGNUP_ERROR_MESSAGE } from '@constants/errorMessages';

type SignUpProps = {
  navigation: any;
};

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);

const formFields: FormField[] = [
  { name: 'email', placeholder: 'Email' },
  { name: 'password', placeholder: 'Password', secureTextEntry: true },
  { name: 'firstName', placeholder: 'First Name' },
  { name: 'lastName', placeholder: 'Last Name' },
  { name: 'address', placeholder: 'Address' },
];

const CreateAccount: React.FunctionComponent<SignUpProps> = ({ navigation }) => {
  const [formData, setFormData] = useState<IRegisterUser>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    address: '',
    role: Role.CUSTOMER,
  });

  const [error, setError] = useState<string>('');

  const handleChange = (name: string, value: string) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = () => {
    try {
      signUp(formData);
      navigation.navigate('Login');
    } catch (error) {
      console.error(error, SIGNUP_ERROR_MESSAGE);
      setError(SIGNUP_ERROR_MESSAGE);
    }
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
        />
      ))}

      <TouchableOpacity onPress={handleSubmit}>
        <StyledView className="bg-red rounded-md h-12 justify-center">
          <StyledText className="text-white text-center text-lg">Sign Up</StyledText>
        </StyledView>
      </TouchableOpacity>
      <StyledView className="flex-row justify-center items-center gap-2">
        <StyledText className="text-lg">Already have an account?</StyledText>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <StyledText className="text-blue text-xl font-bold">Log in</StyledText>
        </TouchableOpacity>
      </StyledView>
      {error ? <Text>{error}</Text> : null}
    </StyledView>
  );
};

export default CreateAccount;
