
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import Button from '@/components/Button';
import { AssetCode } from '@constants/assetCode';
import { styled } from 'nativewind';
import { ArrowDownCircleIcon } from 'react-native-heroicons/solid';
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
         setBuyValue(value * rate);
      } else {
         setSellValue(value / rate);
      }
   }

   const handlePress = () => {
      console.log('handlePress');
   }

   return (
      <StyledView className='h-full p-4'>
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
         <StyledView className='items-center mb-4' testID='arrowIcon'>
            <ArrowDownCircleIcon size={36} color='red' />
         </StyledView>
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
         <StyledText className='text-gray text-xs mb-4'>1 {sellAsset} ≈ {rate} {buyAsset}</StyledText>
         <Button backgroundColor='red' textColor='white' onPress={handlePress}>Review order</Button>
      </StyledView>
   );
};
