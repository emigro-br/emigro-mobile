import { styled } from "nativewind";
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { NavigationProp, RouteProp } from '@react-navigation/native';

import Button from "@components/Button";
import { Card } from "@components/Card";
import { RootStackParamList } from "@navigation/index";

const StyledView = styled(View);
const StyledText = styled(Text);

type DetailsSwapRouteProp = RouteProp<
  RootStackParamList,
  'DetailsSwap'
>;

interface DetailsSwapProps {
  route: DetailsSwapRouteProp;
  navigation: NavigationProp<RootStackParamList>;
}

export const DetailsSwap = ({ route, navigation }: DetailsSwapProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const { from, fromValue, to, rate, fees } = route.params;
  const toValue = fromValue * rate;
  const estimated = toValue - fees;

  const handlePress = () => {
    setIsLoading(true);
    console.log('Swapping...');
    setTimeout(() => {
      console.log('Swap confirmed');
      navigation.navigate('Wallet');
    }, 2000);
  }

  return (
    <StyledView className="h-full p-4">
      <Card>
        <StyledText className="text-lg font-bold mb-6">Confirm Swap</StyledText>
        <Row label='Amount' value={`${fromValue.toFixed(2)} ${from}`}  />
        <Row label='Rate' value={`1 ${from} ≈ ${rate.toFixed(6)} ${to}`} />
        <Row label='Exchanged' value={`${toValue.toFixed(2)} ${to}`} />
        <Row label='Fees' value={fees} />
        <Row label='Estimated' value={`${estimated.toFixed(2)} ${to}`} />
        <StyledText className="text-gray text-xs my-4">The final amount is estimated and may change.</StyledText>
        <Button backgroundColor="red" textColor="white" onPress={handlePress} loading={isLoading}>
          Swap {from} for {to}
        </Button>
      </Card>
    </StyledView>
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
