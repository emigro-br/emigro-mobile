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
      <Button textColor="white" backgroundColor="blue" onPress={() => handleOnPress(OperationType.DEPOSIT)}>
        {OperationType.DEPOSIT}
      </Button>
      <Button textColor="white" backgroundColor="red" onPress={() => handleOnPress(OperationType.WITHDRAW)}>
        {OperationType.WITHDRAW}
      </Button>
    </StyledView>
  );
};

export default OperationButton;
