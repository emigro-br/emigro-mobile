import React, { useEffect } from 'react';
import { Dropdown } from 'react-native-element-dropdown';

import { Box, Card, HStack, Input, InputField, Pressable, Text } from '@gluestack-ui/themed';

import { CryptoAsset, cryptoAssets } from '@/types/assets';

import { AssetToSymbol } from '@utils/assets';

import { SwapType } from './types';

type AssetSwapProps = {
  asset: CryptoAsset;
  balance: number;
  sellOrBuy: SwapType;
  value?: number;
  isActive?: boolean;
  onPress?: () => void;
  onChangeAsset: (asset: CryptoAsset, type: SwapType) => void;
  onChangeValue: (value: number, type: SwapType) => void;
};

export const AssetSwap = (props: AssetSwapProps) => {
  const [value, setValue] = React.useState('');

  const { asset, balance, isActive } = props;
  const sign = props.sellOrBuy === SwapType.SELL ? '-' : '+';

  useEffect(() => {
    if (props.value !== undefined) {
      // accept 0
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
    text = text.split(',').join('.');

    // check if text has more than 1 dot
    if (text.split('.').length > 2) {
      return;
    }

    // remove leading zeros
    text = text.replace(/^0+(?=\d)/, '');

    // remove all non-numeric characters
    text = text.replace(/[^0-9.]/g, '');

    // check if decimal has more than 2 characters
    if (text.split('.').length > 1) {
      const [, decimal] = text.split('.');
      if (decimal.length > 2) {
        console.log('decimal has more than 2 characters');
        return;
      }
    }

    // now we can set the value
    setValue(text);

    const newValue = Number(text);
    if (isNaN(newValue)) {
      return;
    }

    const prevValue = Number(value);
    if (newValue === prevValue) {
      // accept 2.
      return;
    }

    if (props.onChangeValue) {
      props.onChangeValue(newValue, props.sellOrBuy);
    }
  };

  const handlePress = () => {
    if (props.onPress) {
      props.onPress();
    }
  };

  const filteredAssets = cryptoAssets();

  const data = filteredAssets.map((asset) => ({
    label: asset,
    value: asset,
  }));

  const fontColor = Number(value) > 0 ? '$black' : '$textLight500';
  const hasBalance = props.sellOrBuy === SwapType.SELL && Number(value) > balance;

  return (
    <Pressable onPress={handlePress} testID="touchable">
      <Card variant={isActive ? 'outline' : 'elevated'} borderColor="$red">
        <HStack>
          <Box w="$1/4">
            <Dropdown
              selectedTextStyle={{ fontWeight: '500' }}
              data={data}
              value={asset}
              labelField="label"
              valueField="value"
              onChange={(selectedItem) => props.onChangeAsset(selectedItem.value, props.sellOrBuy)}
            />
          </Box>
          <HStack alignItems="center" justifyContent="flex-end" w="$3/4">
            <Text bold color={fontColor}>
              {sign}
              {AssetToSymbol[asset]}
            </Text>
            <Input
              variant="underlined"
              // size='md'
              minWidth="$12" // FIXME: dynamic width is not working
              borderBottomWidth={0}
              isFocused={isActive}
            >
              <InputField
                fontWeight="bold"
                textAlign="right"
                autoFocus={props.sellOrBuy === SwapType.SELL}
                placeholder="0"
                value={value}
                onChangeText={(text) => handleInputChange(text)}
                keyboardType="numeric"
                onFocus={handlePress}
              />
            </Input>
          </HStack>
        </HStack>
        <HStack justifyContent="space-between">
          <Text size="xs" color={`${hasBalance ? '$red' : '$gray'}`}>
            Balance: {AssetToSymbol[asset]} {Number(balance).toFixed(2)}
          </Text>
          {hasBalance && (
            <Text color="$red" size="xs">
              exceeds balance
            </Text>
          )}
        </HStack>
      </Card>
    </Pressable>
  );
};
