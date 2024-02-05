import { styled } from "nativewind";
import React, { useEffect, useRef } from "react";
import { TextInput, TouchableHighlight, View, Text } from "react-native";
import { Dropdown } from 'react-native-element-dropdown';
import { AssetCode, AssetCodeToSymbol } from "@constants/assetCode";
import { Card } from "../../components/Card";
import { SwapType } from './types';

const StyledView = styled(View);
const StyledText = styled(Text);
const StyledTextInput = styled(TextInput);

type AssetSwapProps = {
  asset: AssetCode;
  balance: number;
  sellOrBuy: SwapType;
  value?: number;
  isActive?: boolean;
  onPress?: () => void;
  onChangeAsset: (asset: AssetCode) => void;
  onChangeValue: (value: number, type: SwapType) => void;
};


export const AssetSwap = (props: AssetSwapProps) => {
  const inputRef = useRef<TextInput>(null);
  const [value, setValue] = React.useState('');

  const { asset, balance, isActive } = props;
  const sign = props.sellOrBuy === SwapType.SELL ? '-' : '+';

  useEffect(() => {
    if (props.value !== undefined) { // accept 0
      if (parseFloat(value) !== props.value) {
        if (props.value === 0) {
          setValue('');
        } else {
          setValue(props.value.toFixed(2));
        }
      }
    }
  }, [props.value]);

  const handleInputChange = (text: string) => {
    // workaround for replaceAll is undefined
    text = text.split(",").join(".");

    // check if text has more than 1 dot
    if (text.split(".").length > 2) {
      return;
    }

    // remove leading zeros
    text = text.replace(/^0+(?=\d)/, '');

    // remove all non-numeric characters
    text = text.replace(/[^0-9.]/g, '');

    // check if decimal has more than 2 characters
    if (text.split(".").length > 1) {
      let [integer, decimal] = text.split(".");
      if (decimal.length > 2) {
        console.log('decimal has more than 2 characters');
        return;
      }
    }

    // now we can set the value
    setValue(text);

    let newValue = Number(text);
    if (isNaN(newValue)) {
      return;
    }

    const prevValue = Number(value);
    if (newValue === prevValue) { // accept 2.
      return;
    }

    if (props.onChangeValue) {
      props.onChangeValue(newValue, props.sellOrBuy);
    }
  };

  const handlePress = () => {
    inputRef.current?.focus()
    if (props.onPress) {
      props.onPress();
    }
  }


  const filteredAssets = Object.values(AssetCode).filter((asset) => !['USD', 'EUR'].includes(asset)); //FIXME: break up assets from curencies

  const data = filteredAssets.map((asset) => ({
    label: asset,
    value: asset,
  }));

  const fontColor = Number(value) > 0 ? 'text-black' : 'text-slate-500';

  return (
    <TouchableHighlight onPress={handlePress} underlayColor="transparent" testID="touchable">
      <Card color={isActive ? 'slate-200' : 'white'}>
        <StyledView className='flex-row justify-between'>
          <StyledView className='flex-col w-1/4'>
            <Dropdown
              selectedTextStyle={{ fontWeight: '500'}}
              data={data}
              value={asset}
              labelField={'label'}
              valueField={'value'}
              onChange={(selectedItem) => props.onChangeAsset(selectedItem.value)}
            />
          </StyledView>
          <StyledView className='flex-row items-center justify-end w-3/4'>
            <StyledText className={`font-bold ${fontColor}`}>{sign}{AssetCodeToSymbol[asset]}</StyledText>
            <StyledTextInput
              ref={inputRef}
              className={`font-bold ${fontColor} text-right px-1 py-2`}
              autoFocus={props.sellOrBuy == SwapType.SELL}
              placeholder='0'
              value={value}
              onChangeText={(text) => handleInputChange(text)}
              keyboardType='numeric'
              onFocus={handlePress}
            />
          </StyledView>
        </StyledView>
        <StyledText className='text-gray text-xs'>Balance: {AssetCodeToSymbol[asset]} {Number(balance).toFixed(2)}</StyledText>
      </Card>
    </TouchableHighlight>
  );
};
