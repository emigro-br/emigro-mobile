import React from 'react';

import {
  AddIcon,
  ArrowDownIcon,
  Button,
  ButtonGroup,
  ButtonIcon,
  RepeatIcon,
  Text,
  VStack,
} from '@gluestack-ui/themed';
import { useNavigation } from '@react-navigation/native';

import { OperationType } from '@constants/constants';

export interface OperationButtonProps {
  onPress: (operation: OperationType) => void;
}

const OperationButton: React.FC<OperationButtonProps> = ({ onPress }) => {
  const navigation = useNavigation();
  const handleOnPress = (operationType: OperationType) => {
    onPress(operationType);
  };

  return (
    <ButtonGroup>
      <ButtonItem title="Add money" icon={AddIcon} onPress={() => handleOnPress(OperationType.DEPOSIT)} />
      <ButtonItem title="Withdraw" icon={ArrowDownIcon} onPress={() => handleOnPress(OperationType.WITHDRAW)} />
      <ButtonItem title="Swap" icon={RepeatIcon} onPress={() => navigation.navigate('Swap' as never)} />
    </ButtonGroup>
  );
};

interface ButtonItemProps {
  title: string;
  icon: any;
  onPress: () => void;
}

const ButtonItem: React.FC<ButtonItemProps> = ({ title, icon, onPress }) => {
  return (
    <VStack alignItems="center" width="$24">
      <Button borderRadius="$full" size="lg" marginBottom="$1" height="$12" width="$12" onPress={onPress}>
        <ButtonIcon as={icon} size="xl" />
      </Button>
      <Text>{title}</Text>
    </VStack>
  );
};

export default OperationButton;
