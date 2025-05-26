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
import StellarIcon from '@/assets/images/chains/stellarwhite.png';
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
  }: {
    name: string;
    icon: any;
    isSelected: boolean;
    isDisabled: boolean;
    onPress?: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={{
        opacity: isDisabled ? 0.5 : 1,
        borderWidth: isSelected ? 2 : 1,
        borderColor: isDisabled
          ? '#e5e7eb'
          : isSelected
          ? '#ef4444' // red border when selected
          : '#e5e7eb', // light gray when not selected
        borderRadius: 12,
        padding: 12,
        backgroundColor: isSelected ? '#ffffff10' : '#0a0a0a', // dark background
        marginBottom: 10,
      }}
    >
      <HStack align="center" space="md">
        <Image source={icon} style={{ width: 28, height: 28, resizeMode: 'contain' }} />
        <Text
          size="md"
          className="font-semibold"
          style={{
            color: isDisabled ? '#a1a1aa' : '#ffffff',
          }}
        >
          {name}
        </Text>
      </HStack>
    </Pressable>
  );

  return (
    <>
      <Stack.Screen options={{ title: capitalizedKind }} />

      <Box className="flex-1 bg-[#0a0a0a]">
        <VStack className="p-4" space="lg">
          <Heading size="xl" style={{ color: '#ffffff' }}>
            {capitalizedKind} money
          </Heading>

          {/* Chain selection */}
          <Text className="font-medium mb-2" style={{ color: '#ffffff' }}>
            Choose a network
          </Text>
          {CHAINS.map((chain) => {
            const icon = chain === 'base' ? BaseIcon : StellarIcon;
            const isSelected = selectedChain === chain;
            return (
              <React.Fragment key={chain}>
                {renderOptionCard({
                  name: chain.toUpperCase(),
                  icon,
                  isSelected,
                  isDisabled: false,
                  onPress: () => {
                    setSelectedChain(chain);
                    setSelectedCurrency(null); // reset currency when chain changes
                  },
                })}
              </React.Fragment>
            );
          })}

          {/* Currency selection */}
          <Text className="font-medium mt-6 mb-2" style={{ color: '#ffffff' }}>
            Select a currency
          </Text>
          {renderOptionCard({
            name: 'USDC',
            icon: USDCIcon,
            isSelected: selectedCurrency === 'USDC',
            isDisabled: !selectedChain,
            onPress: () => setSelectedCurrency('USDC'),
          })}
          {renderOptionCard({
            name: 'ETH',
            icon: ETHIcon,
            isSelected: selectedCurrency === 'ETH',
            isDisabled: selectedChain !== 'base',
            onPress: () => selectedChain === 'base' && setSelectedCurrency('ETH'),
          })}

          {/* Continue button */}
<Button
  onPress={handleContinue}
  disabled={!selectedChain || !selectedCurrency}
  className="mt-6 rounded-full"
  style={{ height: 40 }} 
>
  <ButtonText className="text-lg text-white">Continue</ButtonText>
</Button>
        </VStack>
      </Box>
    </>
  );
};

export default AssetForOperation;
