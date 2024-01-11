import { styled } from 'nativewind';
import { FunctionComponent } from 'react';
import { View } from 'react-native';

import Button from '@components/Button';

import { OperationType } from '@constants/constants';

const StyledView = styled(View);

export interface OperationButtonProps {
  onPress: (operation: OperationType) => void;
}

const OperationButton: FunctionComponent<OperationButtonProps> = ({ onPress }) => {
  const handleOnPress = (operationType: OperationType) => {
    onPress(operationType);
  };

  return (
    <StyledView className="flex-row w-screen justify-around">
      <Button textColor="white" backgroundColor="red" onPress={() => handleOnPress(OperationType.DEPOSIT)}>
        Add money
      </Button>
      <Button textColor="white" backgroundColor="red" onPress={() => handleOnPress(OperationType.WITHDRAW)}>
        Withdraw
      </Button>
    </StyledView>
  );
};

export default OperationButton;
