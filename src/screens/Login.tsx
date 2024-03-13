import React, { useState } from 'react';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  AlertCircleIcon,
  Box,
  Button,
  ButtonText,
  Card,
  EyeIcon,
  EyeOffIcon,
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
  InputIcon,
  InputSlot,
  Link,
  Text,
  VStack,
} from '@gluestack-ui/themed';

import { FormField } from '@/types/FormField';

import { SIGNIN_ERROR_MESSAGE, SIGN_IN_FIELDS_ERROR } from '@constants/errorMessages';

import { AnonStackParamList } from '@navigation/AnonStack';

import { signIn } from '@services/auth';

import { sessionStore } from '@stores/SessionStore';

const formFields: FormField[] = [
  {
    name: 'email',
    label: 'Email',
    placeholder: 'example@email.com',
    keyboardType: 'email-address',
    autoCapitalize: 'none',
  },
  {
    name: 'password',
    label: 'Password',
    placeholder: 'Enter your password',
    secureTextEntry: true,
    keyboardType: 'default',
  },
];

type FormData = {
  [key in FormField['name']]: string;
};

type Props = {
  navigation: NativeStackNavigationProp<AnonStackParamList, 'Login'>;
};

const Login = ({ navigation }: Props) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [error, setError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const handleValueChange = (name: string, value: string) => {
    if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
    }
  };

  // TODO: improve this validation
  const isValidForm = !!email && !!password;

  const handleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      if (!isValidForm) {
        setError(SIGN_IN_FIELDS_ERROR);
        setIsLoggingIn(false);
        return;
      }
      const authSession = await signIn(email, password);
      await sessionStore.signIn(authSession);
      setError('');
    } catch (error) {
      console.error(error, SIGNIN_ERROR_MESSAGE);
      setError(SIGNIN_ERROR_MESSAGE);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleState = () => {
    setShowPassword((showState) => {
      return !showState;
    });
  };

  const formValue: FormData = {
    email,
    password,
  };

  return (
    <Box flex={1}>
      <VStack p="$4" space="lg">
        <Heading size="xl">Sign in to Emigro</Heading>
        <Card>
          <VStack space="xl">
            {formFields.map((field) => (
              <FormControl key={field.name}>
                <FormControlLabel mb="$1">
                  <FormControlLabelText>{field.label}</FormControlLabelText>
                </FormControlLabel>
                <Input size="xl">
                  <InputField
                    placeholder={field.placeholder}
                    value={formValue[field.name]}
                    onChangeText={(text) => handleValueChange(field.name, text)}
                    type={field.secureTextEntry && !showPassword ? 'password' : 'text'}
                    keyboardType={field.keyboardType}
                    autoCapitalize={field.autoCapitalize}
                    testID={field.name}
                  />
                  {field.secureTextEntry && (
                    <InputSlot pr="$3" onPress={handleState}>
                      {/* EyeIcon, EyeOffIcon are both imported from 'lucide-react-native' */}
                      <InputIcon
                        as={showPassword ? EyeIcon : EyeOffIcon}
                        color={showPassword ? '$primary500' : '$textLight500'}
                      />
                    </InputSlot>
                  )}
                </Input>
              </FormControl>
            ))}

            <FormControl isInvalid={!!error}>
              <FormControlError>
                <FormControlErrorIcon as={AlertCircleIcon} />
                <FormControlErrorText>{error}</FormControlErrorText>
              </FormControlError>
            </FormControl>
            <Button onPress={handleSignIn} isDisabled={!isValidForm || isLoggingIn} size="xl" testID="signin-button">
              <ButtonText>{isLoggingIn ? 'Signing in...' : 'Sign in'}</ButtonText>
            </Button>
          </VStack>
        </Card>
        <HStack justifyContent="center">
          <Text size="xl">Don't have an account?</Text>
          <Link onPress={() => navigation.replace('SignUp')}>
            <Text size="xl" color="$primary500" ml="$2" bold>
              Sign up
            </Text>
          </Link>
        </HStack>
      </VStack>
    </Box>
  );
};

export default Login;
