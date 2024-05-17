import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SelectCountry } from 'react-native-element-dropdown';

import { Box, Card, HStack, Input, InputField, Pressable, Text, VStack } from '@gluestack-ui/themed';

import { CryptoAsset } from '@/types/assets';
import { AssetToSymbol, iconFor } from '@/utils/assets';

import { SwapType } from './types';

type Props = {
  asset: CryptoAsset;
  balance: number;
  sellOrBuy: SwapType;
  assets: CryptoAsset[];
  value?: number;
  isActive?: boolean;
  testID?: string;
  onPress?: () => void;
  onChangeAsset: (asset: CryptoAsset, type: SwapType) => void;
  onChangeValue: (value: number, type: SwapType) => void;
};

//TODO: rename to SwapBox
export const AssetSwap = ({
  sellOrBuy,
  asset,
  balance,
  assets,
  isActive,
  testID,
  value: propValue,
  onPress,
  onChangeAsset,
  onChangeValue,
}: Props) => {
  const [value, setValue] = React.useState('');

  useEffect(() => {
    if (propValue !== undefined) {
      // accept 0
      if (parseFloat(value) !== propValue) {
        if (propValue === 0) {
          setValue('');
        } else {
          setValue(propValue.toFixed(2));
        }
      }
    }
  }, [propValue]);

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

    if (onChangeValue) {
      onChangeValue(newValue, sellOrBuy);
    }
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  const hasBalance = sellOrBuy === SwapType.SELL && Number(value) > balance;

  const activeProps = isActive
    ? { borderColor: '$borderLight200', borderWidth: 1, bg: '$backgroundLight50' }
    : { bg: '$backgroundLight100' };

  return (
    <Pressable onPress={handlePress} testID={testID}>
      <Card variant="filled" {...activeProps} py="$2">
        <VStack space="sm">
          <Text size="sm">{sellOrBuy === SwapType.SELL ? 'You sell' : 'You get'}</Text>
          <HStack alignItems="center">
            <HStack alignItems="center" justifyContent="flex-start" w="$4/6">
              <Input variant="underlined" borderBottomWidth={0} isFocused={isActive} w="$full">
                <InputField
                  fontWeight="bold"
                  textAlign="left"
                  size="2xl"
                  autoFocus={sellOrBuy === SwapType.SELL}
                  placeholder="0"
                  value={value}
                  onChangeText={(text) => handleInputChange(text)}
                  keyboardType="numeric"
                  onFocus={handlePress}
                  editable={sellOrBuy === SwapType.SELL}
                />
              </Input>
            </HStack>
            <Box w="$2/6">
              <AssetsDropdown
                selected={asset}
                assets={assets}
                onChange={(selected) => onChangeAsset(selected, sellOrBuy)}
              />
            </Box>
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
        </VStack>
      </Card>
    </Pressable>
  );
};

type DropdownProps = {
  selected: CryptoAsset;
  assets: CryptoAsset[];
  onChange: (asset: CryptoAsset) => void;
};

const AssetsDropdown = ({ selected, assets, onChange }: DropdownProps) => {
  const data = assets.map((asset) => ({
    label: asset,
    value: asset,
    image: iconFor(asset),
  }));

  return (
    <SelectCountry
      style={styles.dropdown}
      selectedTextStyle={styles.selectedTextStyle}
      data={data}
      value={selected}
      labelField="label"
      valueField="value"
      imageField="image"
      onChange={(selectedItem) => onChange(selectedItem.value)}
    />
  );
};

const styles = StyleSheet.create({
  dropdown: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  selectedTextStyle: {
    fontWeight: '600',
    marginLeft: 6,
  },
});
