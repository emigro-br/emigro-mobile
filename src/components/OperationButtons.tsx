import React from 'react';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  Button,
  ButtonGroup,
  ButtonIcon,
  RepeatIcon,
  Text,
  VStack,
} from '@gluestack-ui/themed';

import { WalletStackParamList } from '@navigation/WalletStack';

type Props = {
  navigation: NativeStackNavigationProp<WalletStackParamList>;
};

const OperationButtons = ({ navigation }: Props) => {
  return (
    <ButtonGroup justifyContent="space-around">
      <ButtonItem title="Deposit" icon={ArrowDownIcon} onPress={() => navigation.push('Deposit')} />
      <ButtonItem title="Withdraw" icon={ArrowUpIcon} onPress={() => navigation.push('Withdraw')} />
      <ButtonItem title="Send" icon={ArrowRightIcon} onPress={() => navigation.push('TransfersRoot')} />
      <ButtonItem title="Swap" icon={RepeatIcon} onPress={() => navigation.push('SwapRoot')} />
    </ButtonGroup>
  );
};

type ButtonItemProps = {
  title: string;
  icon: any;
  onPress: () => void;
};

const ButtonItem = ({ title, icon, onPress }: ButtonItemProps) => {
  return (
    <VStack alignItems="center">
      <Button borderRadius="$full" size="lg" marginBottom="$1" height="$12" width="$12" onPress={onPress}>
        <ButtonIcon as={icon} size="xl" />
      </Button>
      <Text>{title}</Text>
    </VStack>
  );
};

export default OperationButtons;
