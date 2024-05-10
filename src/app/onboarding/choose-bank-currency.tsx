import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from 'react-native-screens/native-stack';

import {
  Box,
  Button,
  ButtonText,
  Card,
  CheckIcon,
  Checkbox,
  CheckboxGroup,
  CheckboxIcon,
  CheckboxIndicator,
  CheckboxLabel,
  Heading,
  Text,
  VStack,
} from '@gluestack-ui/themed';

import { AssetListTile } from '@/components/AssetListTile';
import { OnboardingStackParamList } from '@/navigation/OnboardingStack';
import { sessionStore } from '@/stores/SessionStore';
import { FiatCurrency } from '@/types/assets';

type Props = {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'ChooseBankCurrency'>;
};

export const ChooseBankCurrencyScreen = ({ navigation }: Props) => {
  const currencies = Object.values(FiatCurrency);
  const handleContinue = (currency: FiatCurrency) => {
    sessionStore.updatePreferences({
      fiatsWithBank: [currency],
    });
    navigation.navigate('PinOnboarding');
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
    <Box flex={1} bg="$white" style={{ paddingTop: insets.top }}>
      <VStack p="$4" space="lg">
        <Heading>Choose your main currency</Heading>
        <Text>You should choose the currency that you hold in a bank account.</Text>

        <CheckboxGroup value={[selected ?? '']} my="$4">
          <VStack space="sm">
            {currencies.map((currency) => (
              <Card key={currency} variant={currency === selected ? 'filled' : 'ghost'}>
                <Checkbox value={currency} size="md" onChange={() => setSelected(currency)} aria-label={currency}>
                  <CheckboxIndicator mr="$4">
                    <CheckboxIcon as={CheckIcon} />
                  </CheckboxIndicator>
                  <CheckboxLabel>
                    <AssetListTile asset={currency} subasset={currency} />
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
