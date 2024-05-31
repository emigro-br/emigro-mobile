import React from 'react';

import { AddIcon, ArrowRightIcon, ArrowUpIcon, ButtonGroup, RepeatIcon } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';

import { CircularButton } from './CircularButton';

const OperationButtons = () => {
  const router = useRouter();
  const w = 80; // set with to keep the buttons spaced equally
  return (
    <ButtonGroup justifyContent="space-around" py="$2">
      <CircularButton
        label="Deposit"
        bg="$white"
        w={w}
        icon={AddIcon}
        onPress={() => router.push('/wallet/ramp/deposit')}
      />
      <CircularButton
        label="Withdraw"
        bg="$white"
        w={w}
        icon={ArrowUpIcon}
        onPress={() => router.push('/wallet/ramp/withdraw')}
      />
      <CircularButton
        label="Send"
        bg="$white"
        w={w}
        icon={ArrowRightIcon}
        onPress={() => router.push('/wallet/transfers')}
      />
      <CircularButton label="Swap" bg="$white" w={w} icon={RepeatIcon} onPress={() => router.push('/wallet/swap')} />
    </ButtonGroup>
  );
};

export default OperationButtons;
