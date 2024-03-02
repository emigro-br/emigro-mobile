import React, { useState } from 'react';

import { useNavigation } from '@react-navigation/native';

import {
  AlertCircleIcon,
  Box,
  Button,
  ButtonText,
  Card,
  Center,
  EyeIcon,
  EyeOffIcon,
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
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

const Login: React.FunctionComponent = () => {
  const navigation = useNavigation();

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
  });

  const [error, setError] = useState<string>('');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const handleChange = (name: string, value: string) => {
    setFormData((prevData) => ({ ...prevData, [name]: value }));
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
      await sessionStore.save(authSession);
      sessionStore.fetchPublicKey();
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
                    value={formData[field.name]}
                    onChangeText={(text) => handleChange(field.name, text)}
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
            <Button onPress={handleSignIn} isDisabled={isLoggingIn} size="xl" testID="signin-button">
              <ButtonText>{isLoggingIn ? 'Signing in...' : 'Sign in'}</ButtonText>
            </Button>
          </VStack>
        </Card>
        <Center>
          <Text size="xl">
            Don't have an account?
            <Link onPress={() => navigation.navigate('SignUp' as never)}>
              <Text size="xl" color="$primary500" ml="$2" bold>
                Sign up
              </Text>
            </Link>
          </Text>
        </Center>
      </VStack>
    </Box>
  );
};

export default Login;
