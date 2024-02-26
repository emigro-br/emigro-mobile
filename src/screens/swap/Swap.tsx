import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { ArrowPathIcon } from 'react-native-heroicons/solid';

import { NavigationProp } from '@react-navigation/native';

import { styled } from 'nativewind';

import Button from '@/components/Button';
import { IQuoteRequest } from '@/types/IQuoteRequest';

import { AssetCode } from '@constants/assetCode';

import { RootStackParamList } from '@navigation/index';

import { handleQuote } from '@services/emigro';

import { balanceStore } from '@stores/BalanceStore';

import { AssetSwap } from './AssetSwap';
import bloc, { SwapTransaction } from './bloc';
import { SwapType } from './types';

const StyledView = styled(View);
const StyledText = styled(Text);

type SwapProps = {
  navigation: NavigationProp<RootStackParamList>;
};

export const Swap = ({ navigation }: SwapProps) => {
  const [active, setActive] = useState<SwapType>(SwapType.SELL);
  const [sellAsset, setSellAsset] = useState<AssetCode>(AssetCode.EURC);
  const [buyAsset, setBuyAsset] = useState<AssetCode>(AssetCode.BRL);
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

  const onChangeAsset = (asset: AssetCode, type: SwapType) => {
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
    bloc.setTransaction(transaction);
    navigation.navigate('DetailsSwap');
  };

  const isButtonEnabled = () => sellValue > 0 && sellValue <= balanceStore.get(sellAsset) && buyValue > 0;

  return (
    <StyledView className="bg-white h-full p-4">
      <StyledText className="text-2xl font-bold mb-4">Sell {sellAsset}</StyledText>
      <StyledText className="text-gray text-xs mb-1">You sell</StyledText>
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
      <TouchableOpacity onPress={handleSwap}>
        <StyledView className="items-center mb-1" testID="arrowIcon">
          <ArrowPathIcon size={24} color="red" />
        </StyledView>
      </TouchableOpacity>
      <StyledText className="text-gray text-xs mb-1">You buy</StyledText>
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
      <StyledText className="text-gray text-xs mb-4">
        1 {sellAsset} ≈ {rate?.toFixed(6)} {buyAsset}
      </StyledText>
      <Button backgroundColor="red" textColor="white" onPress={handlePress} disabled={!isButtonEnabled()}>
        Review order
      </Button>
    </StyledView>
  );
};
