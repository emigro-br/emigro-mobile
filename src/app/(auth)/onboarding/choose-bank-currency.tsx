import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Heading } from "@/components/ui/heading";
import { Checkbox, CheckboxGroup, CheckboxIcon, CheckboxIndicator, CheckboxLabel } from "@/components/ui/checkbox";
import { CheckIcon } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Button, ButtonText } from "@/components/ui/button";
import { Box } from "@/components/ui/box";
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRouter } from 'expo-router';

import { AssetListTile } from '@/components/AssetListTile';
import { sessionStore } from '@/stores/SessionStore';
import { FiatCurrency } from '@/types/assets';

export const ChooseBankCurrencyScreen = () => {
  const router = useRouter();
  const currencies = Object.values(FiatCurrency);
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
    <Box style={{ paddingTop: insets.top }} className="flex-1 bg-white">
      <VStack space="lg" className="p-4">
        <Heading>Choose your main currency</Heading>
        <Text>You should choose the currency that you hold in a bank account.</Text>

        <CheckboxGroup value={[selected ?? '']} className="my-4">
          <VStack space="sm">
            {currencies.map((currency) => (
              <Card key={currency} variant={currency === selected ? 'filled' : 'ghost'}>
                <Checkbox value={currency} size="md" onChange={() => setSelected(currency)} aria-label={currency}>
                  <CheckboxIndicator className="mr-4">
                    <CheckboxIcon as={CheckIcon} />
                  </CheckboxIndicator>
                  <CheckboxLabel>
                    <AssetListTile asset={currency} subasset={currency} assetType="fiat" />
                  </CheckboxLabel>
                </Checkbox>
              </Card>
            ))}
          </VStack>
        </CheckboxGroup>

        <Button onPress={() => selected && onContinue(selected)} isDisabled={!selected} testID="continue-button">
          <ButtonText>Continue</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
};

export default ChooseBankCurrencyScreen;
