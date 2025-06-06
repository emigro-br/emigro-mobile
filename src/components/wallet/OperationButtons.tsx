import React from 'react';

import { useRouter } from 'expo-router';

import { ButtonGroup } from '@/components/ui/button';
import { AddIcon, ArrowRightIcon, ArrowUpIcon, RepeatIcon } from '@/components/ui/icon';

import { CircularButton } from '../CircularButton';

export const OperationButtons = () => {
  const router = useRouter();
  return (
    <ButtonGroup className="justify-between pb-1" testID="operation-buttons">
      <CircularButton label="Deposit" bg="white" icon={AddIcon} onPress={() => router.push('/ramp/deposit')} />
      <CircularButton label="Withdraw" bg="white" icon={ArrowUpIcon} onPress={() => router.push('/ramp/withdraw')} />
      <CircularButton label="Send" bg="white" icon={ArrowRightIcon} onPress={() => router.push('/transfers')} />
      <CircularButton label="Swap" bg="white" icon={RepeatIcon} onPress={() => router.push('/swap')} />
    </ButtonGroup>
  );
};
