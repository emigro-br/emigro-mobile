import { styled } from "nativewind";
import React, {useState } from 'react';
import { View, Text } from 'react-native';
import { NavigationProp } from '@react-navigation/native';

import Button from "@components/Button";
import { Card } from "@components/Card";
import { RootStackParamList } from "@navigation/index";
import bloc from "./bloc";
import { ErrorModal } from "@screens/operation/modals/ErrorModal";

const StyledView = styled(View);
const StyledText = styled(Text);


interface DetailsSwapProps {
  navigation: NavigationProp<RootStackParamList>;
}

export const DetailsSwap = ({ navigation }: DetailsSwapProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const { from, fromValue, to, rate, fees } = bloc.transaction!;
  const toValue = fromValue * rate;
  const estimated = toValue - fees;

  const handlePress = async () => {
    setIsLoading(true);

    try {
      const result = await bloc.swap();
      if (result.transactionHash) {
        navigation.navigate('Wallet');
      }
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('An error occurred, please try again later.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <ErrorModal errorMessage={errorMessage} isVisible={!!errorMessage} onClose={() => navigation.goBack()} />
      <StyledView className="h-full p-4">
        <Card>
          <StyledText className="text-lg font-bold mb-6">Confirm Swap</StyledText>
          <Row label='Amount' value={`${fromValue.toFixed(2)} ${from}`} />
          <Row label='Rate' value={`1 ${from} ≈ ${rate.toFixed(6)} ${to}`} />
          <Row label='Exchanged' value={`${toValue.toFixed(2)} ${to}`} />
          <Row label='Fees' value={fees} />
          <Row label='Final receive' value={`${estimated.toFixed(2)} ${to}`} />
          <StyledText className="text-gray text-xs my-4">The final amount is estimated and may change.</StyledText>
          <Button backgroundColor="red" textColor="white" onPress={handlePress} loading={isLoading}>
            Swap {from} for {to}
          </Button>
        </Card>
      </StyledView>
    </>
  );
}

interface RowProps {
  label: string;
  value: string | number;
}

const Row: React.FC<RowProps> = ({ label, value }) => (
  <StyledView className="flex-row justify-between mb-4">
    <StyledText className="text-gray">{label}</StyledText>
    <StyledText>{value}</StyledText>
  </StyledView>
);
