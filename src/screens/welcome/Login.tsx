import { styled } from 'nativewind';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import signIn from '@/api/auth/signIn';

type LoginProps = {
  navigation: any;
};

const StyledView = styled(View);
const StyledText = styled(Text);

const Login = ({ navigation }: LoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    try {
      const accessToken = signIn(username, password);
      (await accessToken) && navigation.navigate('Wallet');
    } catch (error) {
      console.log(error);
      setError('Error to sign in, please check your credentials');
    }
  };

  return (
    <StyledView className="gap-2 m-0">
      <TextInput placeholder="Email" value={username} onChangeText={(value) => setUsername(value)} />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={(value) => setPassword(value)}
        secureTextEntry={true}
      />
      <TouchableOpacity onPress={handleSignIn}>
        <StyledView className="bg-red rounded-md mx-6 h-10 justify-center">
          <StyledText className="text-white text-center text-md">Log in</StyledText>
        </StyledView>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleSignIn}>
        <StyledView className="bg-blue rounded-md mx-6 h-10 justify-center">
          <StyledText className="text-white text-center text-md" onPress={() => navigation.navigate('SignUp')}>
            Don't have an account? Sign up
          </StyledText>
        </StyledView>
      </TouchableOpacity>
      {error ? <Text>{error}</Text> : null}
    </StyledView>
  );
};

export default Login;
