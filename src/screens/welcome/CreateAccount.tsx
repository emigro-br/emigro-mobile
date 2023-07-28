import { styled } from 'nativewind';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import signUp from '@api/auth/signUp';

import { SIGNUP_ERROR_MESSAGE } from '@constants/errorMessages';

type SignUpProps = {
  navigation: any;
};

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);

const CreateAccount = ({ navigation }: SignUpProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    try {
      signUp(email, password, firstName, lastName, location);
      navigation.navigate('Login');
    } catch (error) {
      console.error(error, SIGNUP_ERROR_MESSAGE);
      setError(SIGNUP_ERROR_MESSAGE);
    }
  };

  return (
    <StyledView className="gap-4 p-6 mt-6">
      <StyledTextInput
        className="text-lg bg-white h-10 p-2 rounded-sm mb-2"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <StyledTextInput
        className="text-lg bg-white h-10 p-2 rounded-sm mb-2"
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <StyledTextInput
        className="text-lg bg-white h-10 p-2 rounded-sm mb-2"
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <StyledTextInput
        className="text-lg bg-white h-10 p-2 rounded-sm mb-2"
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      <StyledTextInput
        className="text-lg bg-white h-10 p-2 rounded-sm mb-2"
        placeholder="Location"
        value={location}
        onChangeText={setLocation}
      />
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
