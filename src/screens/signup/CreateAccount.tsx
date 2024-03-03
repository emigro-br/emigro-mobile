import React, { useState } from 'react';

import {
  AlertCircleIcon,
  Box,
  Button,
  ButtonText,
  Card,
  Center,
  FormControl,
  FormControlError,
  FormControlErrorIcon,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
  Heading,
  Input,
  InputField,
  Link,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Text,
  VStack,
} from '@gluestack-ui/themed';

import { FormField } from '@/types/FormField';
import { IRegisterUser } from '@/types/IRegisterUser';

import { Role } from '@constants/constants';
import { SIGNUP_ERROR_MESSAGE } from '@constants/errorMessages';

import { signUp } from '@services/auth';

type SignUpProps = {
  navigation: any; // FIXME: set the correct type
};

type ConfirmationParams = {
  email: string;
  username: string;
};

const formFields: FormField[] = [
  { name: 'firstName', label: 'First Name', placeholder: 'e.g. John', keyboardType: 'default' },
  { name: 'lastName', label: 'Last Name', placeholder: 'e.g. Doe', keyboardType: 'default' },
  { name: 'email', label: 'Email', placeholder: 'john.doe@example.com', keyboardType: 'email-address' },
  {
    name: 'password',
    label: 'Password',
    placeholder: 'At least 6 characters',
    keyboardType: 'default',
    secureTextEntry: true,
  },
  { name: 'address', label: 'Address', placeholder: 'e.g., 123 Main St, Anytown', keyboardType: 'default' },
];

const CreateAccount = ({ navigation }: SignUpProps) => {
  const [formData, setFormData] = useState<IRegisterUser>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    address: '',
    role: Role.CUSTOMER,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationParams, setConfirmationParams] = useState<ConfirmationParams | null>(null);

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
      address: '',
      role: Role.CUSTOMER,
    });
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      setError('');
      const { username } = await signUp(formData);
      if (!username) {
        throw new Error(SIGNUP_ERROR_MESSAGE);
      }
      setConfirmationParams({ email: formData.email, username });
      clearForm();
    } catch (error) {
      console.error(error);
      setError(SIGNUP_ERROR_MESSAGE);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setConfirmationParams(null);
    navigation.navigate('ConfirmAccount', confirmationParams);
  };

  return (
    <Box flex={1}>
      <ConfirmationModal isOpen={!!confirmationParams} onConfirm={handleCloseModal} />
      <VStack p="$4" space="lg">
        <Heading size="xl">Sign up to Emigro</Heading>
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
                    secureTextEntry={field.secureTextEntry}
                    keyboardType={field.keyboardType}
                    testID={field.name}
                  />
                </Input>
              </FormControl>
            ))}

            <FormControl isInvalid={!!error}>
              <FormControlError>
                <FormControlErrorIcon as={AlertCircleIcon} />
                <FormControlErrorText>{error}</FormControlErrorText>
              </FormControlError>
            </FormControl>

            <Button onPress={handleSubmit} isDisabled={isLoading} size="xl" testID="create-button">
              <ButtonText>{isLoading ? 'Creating account...' : 'Create Account'}</ButtonText>
            </Button>
          </VStack>
        </Card>
        <Center>
          <Text size="xl">
            Already have an account?
            <Link onPress={() => navigation.navigate('Login' as never)}>
              <Text size="xl" color="$primary500" ml="$2" bold>
                Sign in
              </Text>
            </Link>
          </Text>
        </Center>
      </VStack>
    </Box>
  );
};

type ConfirmationProps = {
  isOpen: boolean;
  onConfirm: () => void;
};

const ConfirmationModal = ({ isOpen, onConfirm }: ConfirmationProps) => {
  return (
    <Modal isOpen={isOpen}>
      <ModalBackdrop />
      <ModalContent>
        <ModalHeader>
          <Heading size="lg">Complete registration</Heading>
        </ModalHeader>
        <ModalBody>
          <Text>We have sent you a confirmation code to your email address.</Text>
        </ModalBody>
        <ModalFooter justifyContent="center">
          <Button onPress={onConfirm} action="primary">
            <ButtonText>Continue</ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CreateAccount;
