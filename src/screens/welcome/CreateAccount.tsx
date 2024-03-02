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
  Heading,
  Input,
  InputField,
  Link,
  LinkText,
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
  { name: 'email', placeholder: 'Email', keyboardType: 'email-address' },
  { name: 'password', placeholder: 'Password', secureTextEntry: true, keyboardType: 'default' },
  { name: 'firstName', placeholder: 'First Name', keyboardType: 'default' },
  { name: 'lastName', placeholder: 'Last Name', keyboardType: 'default' },
  { name: 'address', placeholder: 'Address', keyboardType: 'default' },
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
        <Card mt="$8">
          <VStack space="xl">
            {formFields.map((field) => (
              <Input size="xl" key={field.name}>
                <InputField
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChangeText={(text) => handleChange(field.name, text)}
                  secureTextEntry={field.secureTextEntry}
                  keyboardType={field.keyboardType}
                />
              </Input>
            ))}

            <FormControl isInvalid={!!error}>
              <FormControlError>
                <FormControlErrorIcon as={AlertCircleIcon} />
                <FormControlErrorText>{error}</FormControlErrorText>
              </FormControlError>
            </FormControl>

            <Button onPress={handleSubmit} isDisabled={isLoading} size="xl">
              <ButtonText>{isLoading ? 'Signing up...' : 'Sign up'}</ButtonText>
            </Button>
          </VStack>
        </Card>
        <Center>
          <Text size="xl">
            Already have an account?
            <Link onPress={() => navigation.navigate('Login' as never)}>
              <LinkText size="xl" color="$primary500" ml="$2">
                Sign in
              </LinkText>
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
