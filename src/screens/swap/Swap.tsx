import React, { useEffect, useState } from 'react';
import { ArrowPathIcon } from 'react-native-heroicons/solid';

import { NavigationProp } from '@react-navigation/native';

import { Box, Button, ButtonText, Center, Heading, Pressable, Text, VStack } from '@gluestack-ui/themed';

import { IQuoteRequest } from '@/types/IQuoteRequest';
import { CryptoAsset } from '@/types/assets';

import { RootStackParamList } from '@navigation/index';

import { handleQuote } from '@services/emigro';

import { balanceStore } from '@stores/BalanceStore';
import { SwapTransaction, paymentStore as bloc } from '@stores/PaymentStore';

import { AssetSwap } from './AssetSwap';
import { SwapType } from './types';

type SwapProps = {
  navigation: NavigationProp<RootStackParamList>;
};

export const Swap = ({ navigation }: SwapProps) => {
  const [active, setActive] = useState<SwapType>(SwapType.SELL);
  const [sellAsset, setSellAsset] = useState<CryptoAsset>(CryptoAsset.EURC);
  const [buyAsset, setBuyAsset] = useState<CryptoAsset>(CryptoAsset.BRL);
  const [sellValue, setSellValue] = useState(0);
  const [buyValue, setBuyValue] = useState(0);
  const [rate, setRate] = useState<number | null>(null);

  // TODO: disable the not active input while fetching the rate
  const fetchRate = async () => {
    const data: IQuoteRequest = {
      from: sellAsset,
      to: buyAsset,
      amount: '1', // FIXME: we should use sell or buy values for restrictSend and restrictReceive
    };
    const quote = await handleQuote(data);
    const rate = Number(quote);
    if (isNaN(rate)) return;
    setRate(rate);
    return rate;
  };

  useEffect(() => {
    fetchRate();
  }, [sellAsset, buyAsset]); // will update the rate when the assets change

  const onChangeValue = (value: number, type: SwapType) => {
    if (!rate) return;
    if (type === SwapType.SELL) {
      setSellValue(value);
    } else {
      setBuyValue(value);
    }
  };

  const onChangeAsset = (asset: CryptoAsset, type: SwapType) => {
    if (type === SwapType.SELL) {
      if (asset === buyAsset) {
        setBuyAsset(sellAsset);
      }
      setSellAsset(asset);
    } else {
      if (asset === sellAsset) {
        setSellAsset(buyAsset);
      }
      setBuyAsset(asset);
    }
  };

  useEffect(() => {
    if (!rate) return;

    const calculateNewSellValue = (buyValue: number) => buyValue / rate;
    const calculateNewBuyValue = (sellValue: number) => sellValue * rate;

    switch (active) {
      case SwapType.SELL: {
        // Update buyValue based on sellValue
        const newBuyValue = calculateNewBuyValue(sellValue);
        setBuyValue(newBuyValue);
        break;
      }
      case SwapType.BUY: {
        // Update sellValue based on buyValue
        const newSellValue = calculateNewSellValue(buyValue);
        setSellValue(newSellValue);
        break;
      }
      default:
        break;
    }
  }, [sellValue, buyValue, rate]);

  const handleSwap = () => {
    // swap assets
    const temp = sellAsset;
    setSellAsset(buyAsset);
    setBuyAsset(temp);

    // swap values
    if (active === SwapType.SELL) {
      setSellValue(sellValue);
    } else {
      setBuyValue(buyValue);
    }

    // swap rate
    if (rate) {
      setRate(1 / rate);
    }
  };

  const handlePress = () => {
    const transaction: SwapTransaction = {
      from: sellAsset,
      fromValue: sellValue,
      to: buyAsset,
      toValue: buyValue,
      rate: rate!,
      fees: 0, // TODO: add fees
    };
    bloc.setSwap(transaction);
    navigation.navigate('DetailsSwap');
  };

  const isButtonEnabled = () => sellValue > 0 && sellValue <= balanceStore.get(sellAsset) && buyValue > 0;

  return (
    <Box flex={1} bg="$white">
      <VStack p="$4" space="lg">
        <Heading size="xl">Sell {sellAsset}</Heading>
        <VStack space="sm">
          <Text size="xs">You sell</Text>
          <AssetSwap
            asset={sellAsset}
            balance={balanceStore.get(sellAsset)}
            sellOrBuy={SwapType.SELL}
            value={sellValue}
            onChangeAsset={onChangeAsset}
            onChangeValue={onChangeValue}
            isActive={active === SwapType.SELL}
            onPress={() => setActive(SwapType.SELL)}
          />
        </VStack>
        <Center mt="$2">
          <Pressable onPress={handleSwap}>
            <ArrowPathIcon size={24} color="red" testID="arrowIcon" />
          </Pressable>
        </Center>
        <VStack space="sm">
          <Text size="xs">You buy</Text>
          <AssetSwap
            asset={buyAsset}
            balance={balanceStore.get(buyAsset)}
            sellOrBuy={SwapType.BUY}
            value={buyValue}
            onChangeAsset={onChangeAsset}
            onChangeValue={onChangeValue}
            isActive={active === SwapType.BUY}
            onPress={() => setActive(SwapType.BUY)}
          />
          <Text size="xs" color="$gray">
            1 {sellAsset} ≈ {rate?.toFixed(6)} {buyAsset}
          </Text>
        </VStack>
        <Button onPress={handlePress} isDisabled={!isButtonEnabled()}>
          <ButtonText>Review order</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
};
