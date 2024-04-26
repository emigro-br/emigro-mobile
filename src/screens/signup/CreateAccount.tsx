import React, { useState } from 'react';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  AlertCircleIcon,
  Box,
  Button,
  ButtonText,
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
  HStack,
  Heading,
  Input,
  InputField,
  Link,
  ScrollView,
  Text,
  VStack,
} from '@gluestack-ui/themed';

import { FormField } from '@/types/FormField';
import { IRegisterUser } from '@/types/IRegisterUser';
import { BadRequestException } from '@/types/errors';

import { Role } from '@constants/constants';
import { SIGNUP_ERROR_MESSAGE } from '@constants/errorMessages';

import { AnonStackParamList } from '@navigation/AnonStack';

import { signUp } from '@services/emigro/auth';

type Props = {
  navigation: NativeStackNavigationProp<AnonStackParamList, 'SignUp'>;
};

const formFields: FormField[] = [
  { name: 'firstName', label: 'First Name', placeholder: 'e.g. John', keyboardType: 'default' },
  { name: 'lastName', label: 'Last Name', placeholder: 'e.g. Doe', keyboardType: 'default' },
  {
    name: 'email',
    label: 'Email',
    placeholder: 'john.doe@example.com',
    keyboardType: 'email-address',
    autoCapitalize: 'none',
  },
  {
    name: 'password',
    label: 'Password',
    placeholder: 'At least 6 characters',
    keyboardType: 'default',
    secureTextEntry: true,
    returnKeyType: 'done',
  },
];

export const CreateAccount = ({ navigation }: Props) => {
  const [formData, setFormData] = useState<IRegisterUser>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: Role.CUSTOMER,
  });
  const [isLoading, setIsLoading] = useState(false);

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
      role: Role.CUSTOMER,
    });
  };

  // TODO: improve the validation
  const isValidForm = formData.firstName && formData.lastName && formData.email && formData.password;

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError('');
      if (!isValidForm) {
        setError('Invalid form values');
        return;
      }
      const { username } = await signUp(formData);
      if (!username) {
        throw new Error(SIGNUP_ERROR_MESSAGE);
      }
      navigation.push('ConfirmAccount', { email: formData.email, username });
      clearForm();
    } catch (error) {
      if (error instanceof BadRequestException) {
        console.warn('Error', error);
        setError(SIGNUP_ERROR_MESSAGE);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(SIGNUP_ERROR_MESSAGE);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView bg="$white">
      <Box flex={1} bg="$white">
        <VStack p="$4" space="lg">
          <Heading size="xl">Sign up to Emigro</Heading>
          <VStack space="2xl">
            {formFields.map((field) => (
              <FormControl key={field.name}>
                <FormControlLabel mb="$1">
                  <FormControlLabelText>{field.label}</FormControlLabelText>
                </FormControlLabel>
                <Input size="xl">
                  <InputField
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChangeText={(text) => handleChange(field.name, text)}
                    secureTextEntry={field.secureTextEntry}
                    keyboardType={field.keyboardType}
                    autoCapitalize={field.autoCapitalize}
                    returnKeyType={field.returnKeyType || 'next'}
                    testID={field.name}
                  />
                </Input>
              </FormControl>
            ))}

            {error && (
              <FormControl isInvalid={!!error}>
                <FormControlError>
                  <FormControlErrorIcon as={AlertCircleIcon} />
                  <FormControlErrorText>{error}</FormControlErrorText>
                </FormControlError>
              </FormControl>
            )}

            <Button onPress={handleSubmit} isDisabled={!isValidForm || isLoading} size="xl" testID="create-button">
              <ButtonText>{isLoading ? 'Creating account...' : 'Create Account'}</ButtonText>
            </Button>
            <HStack justifyContent="center">
              <Text size="lg">Already have an account?</Text>
              <Link onPress={() => navigation.replace('Login')}>
                <Text size="lg" color="$primary500" ml="$2" bold>
                  Sign in
                </Text>
              </Link>
            </HStack>
          </VStack>
        </VStack>
      </Box>
    </ScrollView>
  );
};
