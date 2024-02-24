import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';

import { styled } from 'nativewind';

import { FormField } from '@/types/FormField';

import { SIGNIN_ERROR_MESSAGE, SIGN_IN_FIELDS_ERROR } from '@constants/errorMessages';

import { signIn } from '@services/auth';
import { getUserPublicKey } from '@services/emigro';

import { sessionStore } from '@stores/SessionStore';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);

const formFields: FormField[] = [
  { name: 'email', placeholder: 'Email', keyboardType: 'email-address', autoCapitalize: 'none' },
  { name: 'password', placeholder: 'Password', secureTextEntry: true, keyboardType: 'default' },
];

type FormData = {
  [key in FormField['name']]: string;
};

const Login: React.FunctionComponent = () => {
  const navigation = useNavigation();

  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });

  const [error, setError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const handleChange = (name: string, value: string) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const triggerUpdateUserPublicKey = async () => {
    try {
      // TODO: improve this workaround to update the session with the user public key
      const publicKey = await getUserPublicKey();
      const authSession = sessionStore.session;
      if (authSession) {
        authSession.publicKey = publicKey;
        sessionStore.save(authSession);
      } else {
        console.warn('Failed to update user public key');
      }
    } catch (error) {
      console.warn('Failed to get user public key:', error);
    }
  };

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      if (!formData.email || !formData.password) {
        setError(SIGN_IN_FIELDS_ERROR);
        setIsLoggingIn(false);
        return;
      }
      const authSession = await signIn(formData.email, formData.password);
      sessionStore.save(authSession);
      setError('');
      triggerUpdateUserPublicKey();
      const accessToken = sessionStore.getAccessToken();
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
          className="text-lg bg-white py-2 px-3 rounded-md mb-2"
          placeholder={field.placeholder}
          value={formData[field.name]}
          onChangeText={(text) => handleChange(field.name, text)}
          secureTextEntry={field.secureTextEntry}
          keyboardType={field.keyboardType}
          autoCapitalize={field.autoCapitalize}
        />
      ))}

      <TouchableOpacity onPress={handleSignIn}>
        <StyledView className="bg-red rounded-md h-12 justify-center">
          {isLoggingIn ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <StyledText className="text-white font-bold text-center text-lg">Sign in</StyledText>
          )}
        </StyledView>
      </TouchableOpacity>
      <StyledView className="flex-row justify-center items-center gap-2">
        <StyledText className="text-lg">Don't have an account?</StyledText>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp' as never)}>
          <StyledText className="text-red text-lg font-bold">Sign up</StyledText>
        </TouchableOpacity>
      </StyledView>

      {error ? <StyledText className="text-red text-center text-lg">{error}</StyledText> : ''}
    </StyledView>
  );
};

export default Login;
