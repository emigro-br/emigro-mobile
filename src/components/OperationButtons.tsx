import React from 'react';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AddIcon, ArrowRightIcon, ArrowUpIcon, ButtonGroup, RepeatIcon } from '@gluestack-ui/themed';

import { WalletStackParamList } from '@navigation/WalletStack';

import { CircularButton } from './CircularButton';

type Props = {
  navigation: NativeStackNavigationProp<WalletStackParamList>;
};

const OperationButtons = ({ navigation }: Props) => {
  return (
    <ButtonGroup justifyContent="space-around" py="$2">
      <CircularButton label="Deposit" bg="$white" icon={AddIcon} onPress={() => navigation.push('Deposit')} />
      <CircularButton label="Withdraw" bg="$white" icon={ArrowUpIcon} onPress={() => navigation.push('Withdraw')} />
      <CircularButton label="Send" bg="$white" icon={ArrowRightIcon} onPress={() => navigation.push('TransfersRoot')} />
      <CircularButton label="Swap" bg="$white" icon={RepeatIcon} onPress={() => navigation.push('SwapRoot')} />
    </ButtonGroup>
  );
};

export default OperationButtons;
