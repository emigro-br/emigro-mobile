import React, { useState } from 'react';
import { Image, Pressable, TextInput } from 'react-native';
import {
  Stack,
  useLocalSearchParams,
  useGlobalSearchParams,
  useRouter,
} from 'expo-router';

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

import { sessionStore } from '@/stores/SessionStore';
import { api } from '@/services/emigro/api';

const iconMap = {
  BRL: require('@/assets/images/icons/brl-icon.png'),
  USDC: USDCIcon,
  ETH: ETHIcon,
};

const OperationScreen = () => {
  const { currency } = useLocalSearchParams<{ currency: string }>();
  const { chain, kind } = useGlobalSearchParams();

  const router = useRouter();
  const userId = sessionStore.user?.id;

  const asset = currency?.toUpperCase() as 'USDC' | 'ETH';
  const network = chain as 'base' | 'stellar';
  const [selectedCurrency, setSelectedCurrency] = useState<'BRL' | 'USDC' | 'ETH'>('BRL');
  const [inputAmount, setInputAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const payload = {
      userId,
      fiatAmount: Number(inputAmount),
      fiatCurrency: selectedCurrency,
      asset,
      chain: network,
    };

    console.log('[handleSubmit] Payload:', payload);

    try {
      setLoading(true);
      const res = await api().post('/coinbase/onramp', payload);
      const { onrampUrl } = res.data;

      router.push({
        pathname: `/ramp/deposit/${currency}/webview`,
        params: { url: encodeURIComponent(onrampUrl) },
      });
    } catch (err) {
      console.error('❌ Error submitting transaction', err);
    } finally {
      setLoading(false);
    }
  };

  const secondCurrency = asset;

  const renderOptionCard = (label: 'BRL' | 'USDC' | 'ETH') => (
    <Pressable
      onPress={() => setSelectedCurrency(label)}
      style={{
        opacity: 1,
        borderWidth: selectedCurrency === label ? 2 : 1,
        borderColor: selectedCurrency === label ? '#ef4444' : '#e5e7eb',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: selectedCurrency === label ? '#ffffff10' : '#0a0a0a',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <Image
        source={iconMap[label]}
        style={{ width: 20, height: 20, marginRight: 8, resizeMode: 'contain' }}
      />
      <Text
        size="md"
        className="font-semibold"
        style={{ color: '#ffffff' }}
      >
        {label}
      </Text>
    </Pressable>
  );

  const labelText = {
    BRL: 'Insert the amount you would like to deposit in Brazilian Reals (BRL)',
    USDC: 'Insert the amount you would like to deposit in USDC',
    ETH: 'Insert the amount you would like to deposit in Ethereum',
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Deposit' }} />

      <Box className="flex-1 bg-[#0a0a0a]">
        <VStack className="p-4 space-y-4">
          <Heading size="xl" className="text-center" style={{ color: '#ffffff' }}>
            Depositing {asset}
          </Heading>

          <Text className="text-gray-400 text-center">
            {labelText[selectedCurrency]}
          </Text>

          {/* <HStack justify="center" align="center" space="md" className="mt-2">
            <Box style={{ marginHorizontal: 6, flex: 1 }}>
              {renderOptionCard('BRL')}
            </Box>
            <Box style={{ marginHorizontal: 6, flex: 1 }}>
              {renderOptionCard(secondCurrency)}
            </Box>
          </HStack> */}

          <TextInput
            placeholder={`Enter amount in ${selectedCurrency}`}
            value={inputAmount}
            onChangeText={setInputAmount}
            keyboardType="decimal-pad"
            placeholderTextColor="#a1a1aa"
            style={{
              borderColor: '#e5e7eb',
              borderWidth: 1,
              borderRadius: 12,
              padding: 16,
              fontSize: 20,
              textAlign: 'center',
              color: '#ffffff',
              marginTop: 20,
            }}
          />

          <Button
            className="mt-6 rounded-full"
            style={{ height: 56 }}
            disabled={!inputAmount || !userId}
            onPress={handleSubmit}
          >
            <ButtonText className="text-lg text-white">
              {loading ? 'Loading...' : 'Pay with Coinbase'}
            </ButtonText>
          </Button>
        </VStack>
      </Box>
    </>
  );
};

export default OperationScreen;
