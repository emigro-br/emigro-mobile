import { useNavigation } from '@react-navigation/native';
import { styled } from 'nativewind';
import { View } from 'react-native';

import { useOperationStore } from '@/store/operation.store';

import Balance from '@components/Balance';
import OperationButton from '@components/OperationButton';

import { OperationType } from '@constants/constants';

const StyledView = styled(View);

const Wallet: React.FunctionComponent = () => {
  const { setOperationType } = useOperationStore();
  const navigation = useNavigation();

  const handleOnPress = (operationType: OperationType) => {
    setOperationType(operationType);
    navigation.navigate('Operation' as never);
  };

  return (
    <StyledView className="flex items-center h-full">
      <StyledView className="gap-2 m-1 px-6 w-full flex-row justify-around">
        <OperationButton onPress={handleOnPress} />
      </StyledView>
      <StyledView className="gap-2 m-1 px-6 w-full">
        <Balance />
      </StyledView>
    </StyledView>
  );
};

export default Wallet;
