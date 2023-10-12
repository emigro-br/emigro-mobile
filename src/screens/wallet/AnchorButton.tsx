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
  const handleOnPress =  async (operationType: OperationType) => { onPress(operationType) }
  
  return (
    <StyledView className="flex-row justify-around items-center mb-4">
      <Button
        textColor="white"
        backgroundColor="red"
        onPress={() => handleOnPress(OperationType.Deposit)}
        disabled={depositLoading}>
          {depositLoading ? <ActivityIndicator size="large" color="red" /> : OperationType.Deposit.toUpperCase()}
      </Button>
      <Button
        textColor="white"
        backgroundColor="red"
        onPress={() => handleOnPress(OperationType.Withdraw)}
        disabled={withdrawLoading}>
          {withdrawLoading ? <ActivityIndicator size="large" color="red" /> : OperationType.Withdraw.toUpperCase()}
      </Button>
    </StyledView>
  );
};

export default AnchorButton;