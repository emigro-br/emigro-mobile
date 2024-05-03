import React, { useRef, useState } from 'react';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  AlertCircleIcon,
  Box,
  Button,
  ButtonText,
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
  LinkText,
  Text,
  VStack,
} from '@gluestack-ui/themed';

import { FormField } from '@/types/FormField';
import { BadRequestException } from '@/types/errors';

import { SIGNIN_ERROR_MESSAGE, SIGN_IN_FIELDS_ERROR } from '@constants/errorMessages';

import { AnonStackParamList } from '@navigation/AnonStack';

import { sessionStore } from '@stores/SessionStore';

const formFields: FormField[] = [
  {
    name: 'email',
    label: 'Email',
    placeholder: 'example@email.com',
    keyboardType: 'email-address',
    autoCapitalize: 'none',
    returnKeyType: 'next',
  },
  {
    name: 'password',
    label: 'Password',
    placeholder: 'Enter your password',
    secureTextEntry: true,
    keyboardType: 'default',
    autoCapitalize: 'none',
    returnKeyType: 'done',
  },
];

type FormData = {
  [key in FormField['name']]: string;
};

type Props = {
  navigation: NativeStackNavigationProp<AnonStackParamList, 'Login'>;
};

const Login = ({ navigation }: Props) => {
  const refs = useRef<HTMLInputElement[]>([]);
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
      await sessionStore.signIn(email, password);
      setError('');
    } catch (error) {
      if (error instanceof BadRequestException) {
        console.warn('Error', error);
        setError(SIGNIN_ERROR_MESSAGE);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unknown error occurred');
      }
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
    <Box flex={1} bg="$white">
      <VStack p="$4" space="lg">
        <Heading size="xl">Sign in to Emigro</Heading>
        <VStack space="2xl">
          {formFields.map((field, index) => (
            <FormControl key={field.name}>
              <FormControlLabel mb="$1">
                <FormControlLabelText>{field.label}</FormControlLabelText>
              </FormControlLabel>
              <Input size="xl">
                <InputField
                  ref={(input: any) => {
                    refs.current[index] = input;
                  }}
                  placeholder={field.placeholder}
                  value={formValue[field.name]}
                  onChangeText={(text) => handleValueChange(field.name, text)}
                  type={field.secureTextEntry && !showPassword ? 'password' : 'text'}
                  keyboardType={field.keyboardType}
                  autoCapitalize={field.autoCapitalize}
                  returnKeyType={field.returnKeyType}
                  onSubmitEditing={() => {
                    if (index < formFields.length - 1) {
                      // If this is not the last field, move the focus to the next field
                      refs.current[index + 1].focus();
                    } else {
                      // If this is the last field, submit the form
                      handleSignIn();
                    }
                  }}
                  blurOnSubmit={index === formFields.length - 1}
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

          <Link onPress={() => navigation.push('PasswordRecovery')} testID="forgot-password-link">
            <LinkText color="$primary500" textDecorationLine="none" textAlign="right">
              Forgot your password?
            </LinkText>
          </Link>

          {error && (
            <FormControl isInvalid={!!error}>
              <FormControlError>
                <FormControlErrorIcon as={AlertCircleIcon} />
                <FormControlErrorText>{error}</FormControlErrorText>
              </FormControlError>
            </FormControl>
          )}
          <Button onPress={handleSignIn} isDisabled={!isValidForm || isLoggingIn} size="xl" testID="signin-button">
            <ButtonText>{isLoggingIn ? 'Signing in...' : 'Sign in'}</ButtonText>
          </Button>
          <HStack justifyContent="center">
            <Text size="lg">Don't have an account?</Text>
            <Link onPress={() => navigation.replace('SignUp')}>
              <Text size="lg" color="$primary500" ml="$2" bold>
                Sign up
              </Text>
            </Link>
          </HStack>
        </VStack>
      </VStack>
    </Box>
  );
};

export default Login;
