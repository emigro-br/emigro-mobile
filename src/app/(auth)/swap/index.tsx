import React, { useEffect, useState } from 'react';

import { Stack, useRouter } from 'expo-router';

import { Box } from '@/components/ui/box';
import { Button, ButtonIcon, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { RepeatIcon } from '@/components/ui/icon';
import { Spinner } from '@/components/ui/spinner';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { IQuoteRequest, fetchQuote } from '@/services/emigro/quotes';
import { balanceStore } from '@/stores/BalanceStore';
import { sessionStore } from '@/stores/SessionStore';
import { swapStore as bloc } from '@/stores/SwapStore';
import { CryptoAsset } from '@/types/assets';
import { CurrencyToAsset } from '@/utils/assets';

import { AssetSwap } from './AssetSwap';
import { SwapType } from './types';

export const Swap = () => {
  const router = useRouter();
  const myAssetss: CryptoAsset[] = balanceStore.currentAssets().filter((asset) => asset !== CryptoAsset.BRZ); // BRZ has no avaliable offers on DEX
  const [active, setActive] = useState<SwapType>(SwapType.SELL);
  const [sellAsset, setSellAsset] = useState<CryptoAsset>(myAssetss[0]);
  const [buyAsset, setBuyAsset] = useState<CryptoAsset>(myAssetss.length > 1 ? myAssetss[1] : myAssetss[0]); // just a protection for empty wallet
  const [sellValue, setSellValue] = useState(0);
  const [buyValue, setBuyValue] = useState(0);
  const [rate, setRate] = useState<number | null>(null);
  const [fetchingRate, setFetchingRate] = useState(false);

  // TODO: disable the not active input while fetching the rate
  const fetchRate = async () => {
    if (!sellAsset || !buyAsset) {
      return;
    }
    if (sellAsset === buyAsset) {
      setRate(1);
      return 1;
    }
    if (!sellValue) {
      // using the last rate value when the sellValue is 0 (empty)
      return;
    }

    setFetchingRate(true);
    setRate(null);
    const sourceAmount = sellValue > 0 ? sellValue : 1;
    const data: IQuoteRequest = {
      from: sellAsset,
      to: buyAsset,
      amount: `${sourceAmount.toFixed(2)}`,
      type: 'strict_send',
    };
    const quote = await fetchQuote(data);
    if (!quote) {
      return;
    }
    const destinationAmount = quote.destination_amount;
    const rate = sourceAmount / destinationAmount;
    setRate(rate);
    return rate;
  };

  useEffect(() => {
    fetchRate()
      .catch(() => {
        setRate(null);
        setBuyValue(0);
      })
      .finally(() => setFetchingRate(false));
  }, [sellValue, sellAsset, buyAsset]); // will update the rate when the assets change

  useEffect(() => {
    // use USDC as the default sell asset if it is in the wallet
    const sellAsset = myAssetss.includes(CryptoAsset.USDC) ? CryptoAsset.USDC : myAssetss[0];
    let buyAsset = myAssetss[1];

    // use the preferences to set the initial buy asset
    if (sessionStore.preferences?.fiatsWithBank?.length) {
      const fiat = sessionStore.preferences.fiatsWithBank[0]; // use the first fiat
      const asset = CurrencyToAsset[fiat];
      // ensure that the asset exists in the wallet
      buyAsset = myAssetss.includes(asset) ? asset : buyAsset;
    }

    // set the initial assets
    setSellAsset(sellAsset);
    setBuyAsset(buyAsset);
  }, [sessionStore.preferences]);

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

    const calculateNewSellValue = (buyValue: number) => buyValue * rate;
    const calculateNewBuyValue = (sellValue: number) => sellValue / rate;

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
  }, [sellValue, rate]);

  const handleSwitch = () => {
    // switch assets
    const temp = sellAsset;
    setSellAsset(buyAsset);
    setBuyAsset(temp);

    // switch values
    if (active === SwapType.SELL) {
      setSellValue(sellValue);
    } else {
      setBuyValue(buyValue);
    }

    // switch rate
    if (rate) {
      setRate(1 / rate);
    }
  };

  const handlePress = () => {
    bloc.setSwap({ fromAsset: sellAsset, toAsset: buyAsset, fromValue: sellValue, toValue: buyValue, rate: rate! });
    router.push('/swap/review');
  };

  const isButtonDisabled =
    fetchingRate ||
    sellAsset === buyAsset ||
    sellValue <= 0 ||
    buyValue <= 0 ||
    sellValue > balanceStore.get(sellAsset);

  return (
    <>
      <Stack.Screen options={{ title: 'Swap' }} />
      <Box className="flex-1 bg-white">
        <VStack space="sm" className="p-4">
          <Heading size="xl">Sell {sellAsset}</Heading>
          <AssetSwap
            sellOrBuy={SwapType.SELL}
            asset={sellAsset}
            value={sellValue}
            balance={balanceStore.get(sellAsset)}
            assets={myAssetss}
            onChangeAsset={(asset) => onChangeAsset(asset, SwapType.SELL)}
            onChangeValue={(value) => setSellValue(value)}
            isActive={active === SwapType.SELL}
            onFocus={() => setActive(SwapType.SELL)}
            testID="sell-box"
          />
          <Center className="my-0.5">
            <Button onPress={handleSwitch} testID="arrowIcon" variant="outline" className="rounded-full h-10 w-10">
              <ButtonIcon as={RepeatIcon} className="text-primary-500" />
            </Button>
          </Center>
          <AssetSwap
            sellOrBuy={SwapType.BUY}
            asset={buyAsset}
            value={buyValue}
            balance={balanceStore.get(buyAsset)}
            assets={myAssetss}
            onChangeAsset={(asset) => onChangeAsset(asset, SwapType.BUY)}
            onChangeValue={(value) => setBuyValue(value)}
            isActive={active === SwapType.BUY}
            // onFocus={() => setActive(SwapType.BUY)}
            testID="buy-box"
          />
          <Box className="my-1.5 ml-1">
            {fetchingRate && (
              <HStack space="md" testID="fetching">
                <Spinner size="small" className="text-typography-500" />
                <Text size="xs" className="text-typography-500">
                  Fetching best price...
                </Text>
              </HStack>
            )}
            {sellAsset && buyAsset && sellValue > 0 && !fetchingRate && rate === null && (
              <Text size="sm" className="text-error-500">
                Failed to fetch the rate
              </Text>
            )}
            {!fetchingRate && rate && (
              <Text size="sm" className="text-black">
                1 {buyAsset} ≈ {rate.toFixed(6)} {sellAsset}
              </Text>
            )}
          </Box>
          <Button onPress={handlePress} disabled={isButtonDisabled} size="xl">
            <ButtonText>Review order</ButtonText>
          </Button>
        </VStack>
      </Box>
    </>
  );
};

export default Swap;
