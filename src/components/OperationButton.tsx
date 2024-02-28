import React from 'react';

import { useNavigation } from '@react-navigation/native';

import {
  ArrowDownIcon,
  ArrowUpIcon,
  Button,
  ButtonGroup,
  ButtonIcon,
  RepeatIcon,
  Text,
  VStack,
} from '@gluestack-ui/themed';

const OperationButton = () => {
  const navigation = useNavigation();

  return (
    <ButtonGroup justifyContent="space-around">
      <ButtonItem title="Deposit" icon={ArrowDownIcon} onPress={() => navigation.navigate('Deposit' as never)} />
      <ButtonItem title="Withdraw" icon={ArrowUpIcon} onPress={() => navigation.navigate('Withdraw' as never)} />
      <ButtonItem title="Swap" icon={RepeatIcon} onPress={() => navigation.navigate('Swap' as never)} />
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

export default OperationButton;
