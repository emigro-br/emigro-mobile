import React, { useState } from 'react';
import CurrencyInput from 'react-native-currency-input';
import { QrCodeIcon } from 'react-native-heroicons/solid';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import {
  Box,
  Button,
  ButtonText,
  Center,
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
  Heading,
  Input,
  InputField,
  InputIcon,
  InputSlot,
  Text,
  VStack,
} from '@gluestack-ui/themed';

import { RootStackParamList } from '@navigation/index';

import { balanceStore } from '@stores/BalanceStore';

type Props = NativeStackScreenProps<RootStackParamList, 'SendAsset'>;

const SendAsset = ({ route, navigation }: Props) => {
  const [amount, setAmount] = useState<number | null>(null);
  const [address, setAddress] = useState<string>('');
  const { asset } = route.params;
  const balance = balanceStore.get(asset);

  if (!asset) {
    return <></>;
  }

  const stellarKeySize = 56;
  const isValidAddress = address.length && address.length === stellarKeySize;
  const isBalanceExceeded = !!amount && amount > balance;
  const isButtonDisabled = !isValidAddress || isBalanceExceeded || !amount || amount <= 0;

  return (
    <Box
      flex={1}
      sx={{
        _light: { bg: 'white' },
        _dark: { bg: '$backgroundDark950' },
      }}
    >
      <Heading mt="$4" mx="$4" size="xl">
        Send {asset}
      </Heading>

      <Box m="$4">
        <VStack space="md">
          <FormControl size="md" isInvalid={isBalanceExceeded}>
            <Text size="xs">
              Balance: {balance} {asset}
            </Text>
            <Input variant="underlined" size="xl" my="$3" borderBottomWidth={0}>
              <CurrencyInput
                value={amount}
                onChangeValue={setAmount}
                renderTextInput={(textInputProps) => (
                  <InputField
                    {...textInputProps}
                    placeholder={`0 ${asset}`}
                    // keyboardType='numeric'
                    textAlign="center"
                    fontSize={36}
                    fontWeight="bold"
                  />
                )}
                suffix={` ${asset}`}
                delimiter=","
                separator="."
                precision={2}
                autoFocus
              />
            </Input>
            <Center>
              <FormControlError>
                <FormControlErrorText>Exceeds Balance</FormControlErrorText>
              </FormControlError>
            </Center>
          </FormControl>

          <FormControl size="md" isInvalid={!isValidAddress}>
            <FormControlLabel mb="$1">
              <FormControlLabelText>Recipient Wallet</FormControlLabelText>
            </FormControlLabel>
            <Input variant="outline" isRequired>
              <InputField placeholder="Enter the wallet address here" value={address} onChangeText={setAddress} />
              <InputSlot pr="$3" onPress={() => console.log('Paste')}>
                <InputIcon as={QrCodeIcon} />
              </InputSlot>
            </Input>
            <FormControlError>
              <FormControlErrorText>A valid wallet is required</FormControlErrorText>
            </FormControlError>
          </FormControl>
          <Button isDisabled={isButtonDisabled} onPress={() => navigation.navigate('Transfers')}>
            <ButtonText>Continue</ButtonText>
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};

export default SendAsset;
