import { styled } from 'nativewind';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import SignUp from '@api/auth/signUp';

type SignUpProps = {
  navigation: any;
};

const StyledView = styled(View);
const StyledText = styled(Text);

const CreateAccount = ({ navigation }: SignUpProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      SignUp(email, password);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <StyledView className="gap-2 m-0">
      <StyledView className="gap-2">
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
        <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      </StyledView>
      <StyledView className="bg-red rounded-md mx-6 h-10 justify-center">
        <TouchableOpacity onPress={handleSubmit}>
          <StyledText className="text-white text-center text-md">Sign Up</StyledText>
        </TouchableOpacity>
      </StyledView>
      <StyledView className="bg-blue rounded-md mx-6 h-10 justify-center">
        <TouchableOpacity onPress={() => navigation.navigate('LogIn')}>
          <StyledText className="text-white text-center text-md">Already have an account? Log in</StyledText>
        </TouchableOpacity>
      </StyledView>
      {error ? <Text>{error}</Text> : null}
    </StyledView>
  );
};

export default CreateAccount;
