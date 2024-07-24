import { useState } from 'react';

import { AssetInput } from '@/components/AssetInput';
import {
  Actionsheet,
  ActionsheetBackdrop,
  ActionsheetContent,
  ActionsheetDragIndicator,
  ActionsheetDragIndicatorWrapper,
} from '@/components/ui/actionsheet';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { View } from '@/components/ui/view';
import { VStack } from '@/components/ui/vstack';
import { CryptoOrFiat } from '@/types/assets';

type Props = {
  tagline?: string;
  initialAmount?: number;
  asset: CryptoOrFiat;
  onSave: (amount: number) => void;
};

export const InputAmount = ({ tagline, initialAmount, asset, onSave }: Props) => {
  const [value, setValue] = useState<number | null>(initialAmount || null);

  return (
    <Box className="h-full">
      <VStack space="md" className="p-4">
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
      <Actionsheet isOpen={isOpen} onClose={onClose} className="z-999">
        <ActionsheetBackdrop />
        <ActionsheetContent className="max-h-[95%]">
          <ActionsheetDragIndicatorWrapper>
            <ActionsheetDragIndicator />
          </ActionsheetDragIndicatorWrapper>
          <VStack className="w-full">
            <InputAmount {...props} onSave={(amount) => handleSave(amount)} />
          </VStack>
        </ActionsheetContent>
      </Actionsheet>
    </View>
  );
};
