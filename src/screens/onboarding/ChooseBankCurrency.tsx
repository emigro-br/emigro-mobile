import { useState } from 'react';
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
  SafeAreaView,
  Text,
  VStack,
} from '@gluestack-ui/themed';

import { OnboardingStackParamList } from '@/navigation/OnboardingStack';
import { FiatCurrency } from '@/types/assets';

import { AssetListTile } from '@components/AssetListTile';

import { sessionStore } from '@stores/SessionStore';

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
  const [selected, setSelected] = useState<FiatCurrency | null>(null);

  return (
    <SafeAreaView flex={1} bg="$white">
      <Box flex={1}>
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
    </SafeAreaView>
  );
};
