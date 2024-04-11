import { useState } from 'react';

import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
  Box,
  Button,
  ButtonText,
  Heading,
  VStack,
  View,
} from '@gluestack-ui/themed';

import { CryptoOrFiat } from '@/types/assets';

import { AssetInput } from '@components/AssetInput';

type Props = {
  tagline?: string;
  initialAmount?: number;
  asset: CryptoOrFiat;
  onSave: (amount: number) => void;
};

export const InputAmount = ({ tagline, initialAmount, asset, onSave }: Props) => {
  const [value, setValue] = useState<number | null>(initialAmount || null);

  return (
    <Box h="$full">
      <VStack p="$4" space="md">
        {tagline && <Heading>{tagline}</Heading>}
        <AssetInput
          asset={asset}
          size="4xl"
          fontWeight="bold"
          value={value}
          onChangeValue={(newValue) => setValue(newValue)}
        />
        <Button size="lg" onPress={() => onSave(value ?? 0)} isDisabled={!value}>
          <ButtonText>Confirm</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
};

type SheetProps = Props & {
  isOpen: boolean;
  onClose: () => void;
};

export const InputAmountActionSheet = ({ isOpen, onClose, onSave, ...props }: SheetProps) => {
  const handleSave = (amount: number) => {
    onSave(amount);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <View testID="input-amount-action-sheet">
      <Actionsheet isOpen={isOpen} onClose={onClose} zIndex={999}>
        <ActionsheetBackdrop />
        <ActionsheetContent maxHeight="95%">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <VStack w="$full">
            <InputAmount {...props} onSave={(amount) => handleSave(amount)} />
          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    </View>
  );
};
