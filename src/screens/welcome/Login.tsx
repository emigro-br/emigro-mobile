import { useNavigation } from '@react-navigation/native';
import { styled } from 'nativewind';
import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';

import signIn from '@/api/auth/signIn';

import { SIGNIN_ERROR_MESSAGE } from '@constants/errorMessages';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);

type FormField = {
  name: string;
  placeholder: string;
  secureTextEntry?: boolean;
};

const formFields: FormField[] = [
  { name: 'username', placeholder: 'Email' },
  { name: 'password', placeholder: 'Password', secureTextEntry: true },
];

const Login = () => {
  const navigation = useNavigation();

  const [formData, setFormData] = useState<Record<string, string>>({
    username: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleChange = (name: string, value: string) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const accessToken = await signIn(formData.username, formData.password);
      accessToken && navigation?.navigate('Root' as never);
    } catch (error) {
      console.error(error, SIGNIN_ERROR_MESSAGE);
      setError(SIGNIN_ERROR_MESSAGE);
    } finally {
      setIsLoggingIn(false);
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

      <TouchableOpacity onPress={handleSignIn}>
        <StyledView className="bg-red rounded-md h-12 justify-center">
          {isLoggingIn ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <StyledText className="text-white text-center text-lg">Log in</StyledText>
          )}
        </StyledView>
      </TouchableOpacity>
      <StyledView className="flex-row justify-center items-center gap-2">
        <StyledText className="text-lg">Don't have an account?</StyledText>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp' as never)}>
          <StyledText className="text-blue text-xl font-bold">Sign up</StyledText>
        </TouchableOpacity>
      </StyledView>

      {error ? <Text>{error}</Text> : null}
    </StyledView>
  );
};

export default Login;
