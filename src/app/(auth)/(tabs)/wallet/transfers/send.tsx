import React, { useState } from 'react';

import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ClipboardPasteIcon } from 'lucide-react-native';

import { AssetInput } from '@/components/AssetInput';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
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
    <Box className="flex-1 bg-white  dark:bg-backgroundDark-950">
      <Heading size="xl" className="mt-4 mx-4">
        Send {asset}
      </Heading>
      <Box className="m-4">
        <VStack space="md">
          <FormControl size="md" isInvalid={isBalanceExceeded}>
            <Text size="sm">
              Balance: {balance} {asset}
            </Text>
            <AssetInput
              asset={asset}
              value={amount}
              onChangeValue={setAmount}
              size="4xl"
              textAlign="center"
              className="font-bold"
            />
            <Center>
              <FormControlError>
                <FormControlErrorText>Exceeds Balance</FormControlErrorText>
              </FormControlError>
            </Center>
          </FormControl>

          <FormControl size="md" isInvalid={!isValidAddress}>
            <FormControlLabel className="mb-1">
              <FormControlLabelText>Recipient Wallet</FormControlLabelText>
            </FormControlLabel>
            <Input variant="outline" isRequired>
              <InputField placeholder="Enter the wallet address here" value={address} onChangeText={setAddress} />
              <InputSlot onPress={handlePaste} className="pr-3">
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
