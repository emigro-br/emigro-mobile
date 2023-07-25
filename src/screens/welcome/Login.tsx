import { styled } from 'nativewind';
import React, { useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';

import signIn from '@/api/auth/signIn';

type LoginProps = {
  navigation: any;
};

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);

const Login = ({ navigation }: LoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const accessToken = signIn(username, password);
      (await accessToken) && navigation?.navigate('Root');
    } catch (error) {
      console.error(error);
      setError('Error to sign in, please check your credentials');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <StyledView className="gap-4 p-6 mt-6">
      <StyledTextInput
        className="text-lg bg-white h-10 p-2 rounded-sm mb-2"
        placeholder="Email"
        value={username}
        onChangeText={(value) => setUsername(value)}
      />
      <StyledTextInput
        className="text-lg bg-white h-10 p-2 rounded-sm mb-2"
        placeholder="Password"
        value={password}
        onChangeText={(value) => setPassword(value)}
        secureTextEntry={true}
      />
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
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <StyledText className="text-blue text-xl font-bold">Sign up</StyledText>
        </TouchableOpacity>
      </StyledView>

      {error ? <Text>{error}</Text> : null}
    </StyledView>
  );
};

export default Login;
