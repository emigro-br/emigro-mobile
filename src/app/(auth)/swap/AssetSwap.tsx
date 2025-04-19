import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SelectCountry } from 'react-native-element-dropdown';

import { Box } from '@/components/ui/box';
import { Card } from '@/components/ui/card';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { CryptoAsset } from '@/types/assets';
import { iconFor, symbolFor, truncateToTwoDecimals } from '@/utils/assets';

import { SwapType } from '@/types/swap';

type Props = {
  asset: CryptoAsset;
  balance: number;
  sellOrBuy: SwapType;
  assets: CryptoAsset[];
  value?: number;
  isActive?: boolean;
  testID?: string;
  onFocus?: () => void;
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
  onFocus,
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
        // truncate it to no exceed the balance: 1.2322 -> 1.23
        text = truncateToTwoDecimals(Number(text)).toString();
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

  const handleFocus = () => {
    return onFocus && onFocus();
  };

  const hasBalance = sellOrBuy === SwapType.SELL && Number(value) > balance;

  const dynamicStyles = isActive ? 'border border-outline-200 bg-background-50' : 'bg-background-100';

  return (
    <Pressable onPress={handleFocus} testID={testID}>
      <Card variant="filled" className={`py-2 ${dynamicStyles}`}>
        <VStack space="sm">
          <Text size="md">{sellOrBuy === SwapType.SELL ? 'You sell' : 'You get'}</Text>
          <HStack className="items-center">
            <HStack className="items-center justify-start w-4/6">
              <Input variant="underlined" isFocused={isActive} size="2xl" className="border-b-0 w-full">
                <InputField
                  aria-label={`${sellOrBuy === SwapType.SELL ? 'sell' : 'buy'}-input`}
                  autoFocus={sellOrBuy === SwapType.SELL}
                  placeholder="0"
                  value={value}
                  onChangeText={(text) => handleInputChange(text)}
                  keyboardType="numeric"
                  onFocus={handleFocus} // for android
                  editable={sellOrBuy === SwapType.SELL}
                  className="font-bold text-left"
                />
              </Input>
            </HStack>
            <Box className="w-2/6">
              <AssetsDropdown
                selected={asset}
                assets={assets}
                onChange={(selected) => onChangeAsset(selected, sellOrBuy)}
              />
            </Box>
          </HStack>
          <HStack className="justify-between">
            <Pressable onPress={() => isActive && handleInputChange(`${balance}`)}>
              <Text size="sm" className={hasBalance ? 'text-indicator-error' : 'text-typography-500'}>
                Balance: {symbolFor(asset, balance)}
              </Text>
            </Pressable>
            {hasBalance && (
              <Text size="sm" className="text-indicator-error">
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

export default AssetSwap;
