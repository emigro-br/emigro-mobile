import React, { useState } from 'react';

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
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ClipboardPasteIcon } from 'lucide-react-native';

import { AssetInput } from '@/components/AssetInput';
import { balanceStore } from '@/stores/BalanceStore';
import { transferStore } from '@/stores/TransferStore';
import { CryptoAsset } from '@/types/assets';

export const SendAsset = () => {
  const router = useRouter();
  const { asset } = useLocalSearchParams<{ asset: CryptoAsset }>();
  const [amount, setAmount] = useState<number | null>(null);
  const [address, setAddress] = useState<string>('');

  if (!asset) {
    return <></>;
  }

  const balance = balanceStore.get(asset);
  const stellarKeySize = 56;
  const isValidAddress = address.length && address.length === stellarKeySize;
  const isBalanceExceeded = !!amount && amount > balance;
  const isButtonDisabled = !isValidAddress || isBalanceExceeded || !amount || amount <= 0;

  const handlePressContinue = () => {
    transferStore.setTransfer({
      destinationAddress: address,
      asset,
      amount: amount!,
    });
    router.push('./review');
  };

  const handlePaste = async () => {
    const text = await Clipboard.getStringAsync();
    if (text.length === stellarKeySize) {
      setAddress(text);
    }
  };

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
            <AssetInput
              asset={asset}
              value={amount}
              onChangeValue={setAmount}
              textAlign="center"
              fontSize={36}
              fontWeight="bold"
            />
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
              <InputSlot pr="$3" onPress={handlePaste}>
                <InputIcon as={ClipboardPasteIcon} />
              </InputSlot>
            </Input>
            <FormControlError>
              <FormControlErrorText>A valid wallet is required</FormControlErrorText>
            </FormControlError>
          </FormControl>
          <Button isDisabled={isButtonDisabled} onPress={handlePressContinue}>
            <ButtonText>Continue</ButtonText>
          </Button>
        </VStack>
      </Box>
    </Box>
  );
};

export default SendAsset;
