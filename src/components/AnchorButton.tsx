import { styled } from 'nativewind';
import React, { FunctionComponent } from 'react';
import { ActivityIndicator, View } from 'react-native';

import Button from '@components/Button';

import { OperationType } from '@constants/constants';

const StyledView = styled(View);

export interface AnchorButtonProps {
  onPress: (operation: string) => void;
  depositLoading: boolean;
  withdrawLoading: boolean;
}

const AnchorButton: FunctionComponent<AnchorButtonProps> = ({ onPress, depositLoading, withdrawLoading }) => {
  const handleOnPress = (operationType: OperationType) => {
    onPress(operationType);
  };

  return (
    <StyledView className="flex-row mb-4 w-full justify-around">
      <Button
        textColor="white"
        backgroundColor="red"
        onPress={() => handleOnPress(OperationType.DEPOSIT)}
        disabled={depositLoading}
      >
        {depositLoading ? <ActivityIndicator size="large" color="red" /> : OperationType.DEPOSIT}
      </Button>
      <Button
        textColor="white"
        backgroundColor="red"
        onPress={() => handleOnPress(OperationType.WITHDRAW)}
        disabled={withdrawLoading}
      >
        {withdrawLoading ? <ActivityIndicator size="large" color="red" /> : OperationType.WITHDRAW}
      </Button>
    </StyledView>
  );
};

export default AnchorButton;
