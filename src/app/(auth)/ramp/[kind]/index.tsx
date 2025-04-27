import React, { useState } from 'react';
import { Image, Pressable } from 'react-native';
import { Stack, useLocalSearchParams, usePathname, useRouter } from 'expo-router';

import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { Button, ButtonText } from '@/components/ui/button';

import BaseIcon from '@/assets/images/chains/base.png';
import StellarIcon from '@/assets/images/chains/stellar.png';
import USDCIcon from '@/assets/images/icons/usdc-icon.png';
import ETHIcon from '@/assets/images/icons/ethereum.png';

const CHAINS = ['base', 'stellar'] as const;
type ChainType = typeof CHAINS[number];

const AssetForOperation = () => {
  const { kind } = useLocalSearchParams();
  const path = usePathname();
  const router = useRouter();

  const [selectedChain, setSelectedChain] = useState<ChainType | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<'USDC' | 'ETH' | null>(null);

  const capitalizedKind = kind ? `${kind[0].toUpperCase()}${kind.slice(1)}` : 'Ramp';

  const handleContinue = () => {
    if (selectedCurrency && selectedChain) {
      router.push(`${path}/${selectedCurrency.toLowerCase()}?chain=${selectedChain}`);
    }
  };

  const renderOptionCard = ({
    name,
    icon,
    isSelected,
    isDisabled,
    onPress,
    borderColor = '#e5e7eb',
  }: {
    name: string;
    icon: any;
    isSelected: boolean;
    isDisabled: boolean;
    borderColor?: string;
    onPress?: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={{
        opacity: isDisabled ? 0.4 : 1,
        borderWidth: isSelected ? 2 : 1,
        borderColor: isSelected ? borderColor : '#e5e7eb',
        borderRadius: 12,
        padding: 12,
        backgroundColor: isSelected ? '#fff5f5' : '#ffffff',
        marginBottom: 10,
      }}
    >
      <HStack align="center" space="md">
        <Image source={icon} style={{ width: 28, height: 28, resizeMode: 'contain' }} />
        <Text size="md" className="font-semibold">{name}</Text>
      </HStack>

    </Pressable>
  );

  return (
    <>
      <Stack.Screen options={{ title: capitalizedKind }} />

      <Box className="flex-1 bg-white">
        <VStack className="p-4" space="lg">
          <Heading size="xl">{capitalizedKind} money</Heading>

          {/* Chain selection */}
          <Text className="font-medium mb-2">Choose a network</Text>
          {CHAINS.map((chain) => {
            const icon = chain === 'base' ? BaseIcon : StellarIcon;
            const isSelected = selectedChain === chain;
            return renderOptionCard({
              name: chain.toUpperCase(),
              icon,
              isSelected,
              isDisabled: false,
              onPress: () => {
                setSelectedChain(chain);
                setSelectedCurrency(null); // reset currency when chain changes
              },
              borderColor: '#ef4444', // red
            });
          })}

          {/* Currency selection */}
          <Text className="font-medium mt-6 mb-2">Select a currency</Text>
          {renderOptionCard({
            name: 'USDC',
            icon: USDCIcon,
            isSelected: selectedCurrency === 'USDC',
            isDisabled: !selectedChain,
            onPress: () => setSelectedCurrency('USDC'),
            borderColor: '#ef4444',
          })}
          {renderOptionCard({
            name: 'ETH',
            icon: ETHIcon,
            isSelected: selectedCurrency === 'ETH',
            isDisabled: selectedChain !== 'base',
            onPress: () => selectedChain === 'base' && setSelectedCurrency('ETH'),
            borderColor: '#ef4444',
          })}

          {/* Continue */}
          <Button
            onPress={handleContinue}
            disabled={!selectedChain || !selectedCurrency}
            className="mt-6"
          >
            <ButtonText>Continue</ButtonText>
          </Button>
        </VStack>
      </Box>
    </>
  );
};

export default AssetForOperation;
