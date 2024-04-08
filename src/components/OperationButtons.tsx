import React from 'react';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { AddIcon, ArrowRightIcon, ArrowUpIcon, ButtonGroup, RepeatIcon } from '@gluestack-ui/themed';

import { WalletStackParamList } from '@navigation/WalletStack';

import { CircularButton } from './CircularButton';

type Props = {
  navigation: NativeStackNavigationProp<WalletStackParamList>;
};

const OperationButtons = ({ navigation }: Props) => {
  const w = 80; // set with to keep the buttons spaced equally
  return (
    <ButtonGroup justifyContent="space-around" py="$2">
      <CircularButton label="Deposit" bg="$white" w={w} icon={AddIcon} onPress={() => navigation.push('Deposit')} />
      <CircularButton
        label="Withdraw"
        bg="$white"
        w={w}
        icon={ArrowUpIcon}
        onPress={() => navigation.push('Withdraw')}
      />
      <CircularButton
        label="Send"
        bg="$white"
        w={w}
        icon={ArrowRightIcon}
        onPress={() => navigation.push('TransfersRoot')}
      />
      <CircularButton label="Swap" bg="$white" w={w} icon={RepeatIcon} onPress={() => navigation.push('SwapRoot')} />
    </ButtonGroup>
  );
};

export default OperationButtons;
