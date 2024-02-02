
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Button from '@/components/Button';
import { AssetCode } from '@constants/assetCode';
import { styled } from 'nativewind';
import { ArrowPathIcon } from 'react-native-heroicons/solid';
import { AssetSwap } from './AssetSwap';
import { SwapType } from './types';
import BalanceStore from '@/stores/BalanceStore';
import { IQuoteRequest } from '@/types/IQuoteRequest';
import { handleQuote } from '@/services/emigro';

const StyledView = styled(View);
const StyledText = styled(Text);

export const Swap = () => {
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
   }

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
   }

   useEffect(() => {
      if (!rate) return;

      const calculateNewSellValue = (buyValue: number) => buyValue / rate
      const calculateNewBuyValue = (sellValue: number) => sellValue * rate

      switch (active) {
         case SwapType.SELL:
            // Update buyValue based on sellValue
            const newBuyValue = calculateNewBuyValue(sellValue);
            setBuyValue(newBuyValue);
            break;
         case SwapType.BUY:
            // Update sellValue based on buyValue
            const newSellValue = calculateNewSellValue(buyValue);
            setSellValue(newSellValue)
            break;
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
   }

   const handlePress = () => {
      console.log('handlePress');
   }

   return (
      <StyledView className='bg-white h-full p-4'>
         <StyledText className='text-2xl font-bold mb-4'>Sell {sellAsset}</StyledText>
         <AssetSwap
            asset={sellAsset}
            balance={BalanceStore.get(sellAsset)}
            sellOrBuy={SwapType.SELL}
            value={sellValue}
            onChangeAsset={setSellAsset}
            onChangeValue={onChangeValue}
            isActive={active === SwapType.SELL}
            onPress={() => setActive(SwapType.SELL)}
         />
         <TouchableOpacity onPress={handleSwap}>
            <StyledView className='items-center mb-4' testID='arrowIcon'>
               <ArrowPathIcon size={24} color='red' />
            </StyledView>
         </TouchableOpacity>
         <AssetSwap
            asset={buyAsset}
            balance={BalanceStore.get(buyAsset)}
            sellOrBuy={SwapType.BUY}
            value={buyValue}
            onChangeAsset={setBuyAsset}
            onChangeValue={onChangeValue}
            isActive={active === SwapType.BUY}
            onPress={() => setActive(SwapType.BUY)}
         />
         <StyledText className='text-gray text-xs mb-4'>1 {sellAsset} ≈ {rate?.toFixed(6)} {buyAsset}</StyledText>
         <Button backgroundColor='red' textColor='white' onPress={handlePress}>Review order</Button>
      </StyledView>
   );
};
