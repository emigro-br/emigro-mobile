import { useState } from 'react';
import CurrencyInput from 'react-native-currency-input';
import { QrCodeIcon } from 'react-native-heroicons/solid';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import {
  Box,
  Button,
  ButtonText,
  Card,
  Heading,
  Input,
  InputField,
  InputIcon,
  InputSlot,
  Text,
  VStack,
} from '@gluestack-ui/themed';

import { RootStackParamList } from '@navigation/index';

type Props = NativeStackScreenProps<RootStackParamList, 'TransferAsset'>;

const TransferAsset = ({ route, navigation }: Props) => {
  const [amount, setAmount] = useState<number | null>(null);
  const [address, setAddress] = useState<string>('');
  const { asset } = route.params;

  if (!asset) {
    return <></>;
  }

  return (
    <Box h="$full">
      <Heading m="$3" size="xl">
        Send {asset}
      </Heading>

      <Card size="md" variant="filled" m="$3" bg="$white">
        <VStack space="md">
          <Text size="xs">Balance: 0 {asset}</Text>
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
            />
          </Input>
          <Input variant="outline">
            <InputField placeholder="Enter the wallet address here" value={address} onChangeText={setAddress} />
            <InputSlot pr="$3" onPress={() => console.log('Paste')}>
              <InputIcon as={QrCodeIcon} />
            </InputSlot>
          </Input>
          <Button isDisabled={!address} onPress={() => navigation.navigate('Transfers')}>
            <ButtonText>Send {asset}</ButtonText>
          </Button>
        </VStack>
      </Card>
    </Box>
  );
};

export default TransferAsset;
