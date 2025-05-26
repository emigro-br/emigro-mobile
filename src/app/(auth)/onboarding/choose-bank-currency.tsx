import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Stack, useRouter } from 'expo-router';

import { AssetListTile } from '@/components/AssetListTile';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Checkbox,
  CheckboxGroup,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
} from '@/components/ui/checkbox';
import { Heading } from '@/components/ui/heading';
import { CheckIcon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { sessionStore } from '@/stores/SessionStore';
import { FiatCurrency, fiatCurrencies } from '@/types/assets';

export const ChooseBankCurrencyScreen = () => {
  const router = useRouter();
  const currencies = fiatCurrencies();
  const handleContinue = (currency: FiatCurrency) => {
    sessionStore.updatePreferences({
      fiatsWithBank: [currency],
    });
    router.navigate('./pin');
  };

  return <ChooseBankCurrency currencies={currencies} onContinue={handleContinue} />;
};

type PageProps = {
  currencies: FiatCurrency[];
  onContinue: (currency: FiatCurrency) => void;
};

export const ChooseBankCurrency = ({ currencies, onContinue }: PageProps) => {
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<FiatCurrency | null>(null);

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <Box style={{ paddingTop: insets.top }} className="flex-1 bg-black">
        <VStack space="lg" className="p-6">
          <Heading size="xl" className="text-white text-center mb-4">
            Choose your main currency
          </Heading>
          <Text className="text-white text-center">
            This currency will be used as a basis for quotes and payments. You may update this in the future.
          </Text>

          <CheckboxGroup value={[selected ?? '']} className="my-4">
            <VStack space="sm">
              {currencies.map((currency) => (
                <Card
                  key={currency}
                  variant={currency === selected ? 'filled' : 'ghost'}
                  className={`bg-[#1a1a1a] border ${
                    currency === selected ? 'border-primary-500' : 'border-[#333]'
                  }`}
                >
                  <Checkbox
                    value={currency}
                    size="md"
                    onChange={() => setSelected(currency)}
                    aria-label={currency}
                  >
                    <CheckboxIndicator className="mr-4">
                      <CheckboxIcon as={CheckIcon} className="text-white" />
                    </CheckboxIndicator>
                    <CheckboxLabel className="text-white">
                      <AssetListTile asset={currency} subasset={currency} assetType="fiat" />
                    </CheckboxLabel>
                  </Checkbox>
                </Card>
              ))}
            </VStack>
          </CheckboxGroup>

          <Button
            onPress={() => selected && onContinue(selected)}
            disabled={!selected}
            size="xl"
            className="rounded-full bg-primary-500 mt-2"
            testID="continue-button"
          >
            <ButtonText className="text-white font-bold text-lg">Continue</ButtonText>
          </Button>
        </VStack>
      </Box>
    </>
  );
};

export default ChooseBankCurrencyScreen;
