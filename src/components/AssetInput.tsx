import CurrencyInput from 'react-native-currency-input';

import { Input, InputField } from '@/components/ui/input';
import { CryptoAsset, CryptoOrFiat, FiatCurrency } from '@/types/assets';
import { AssetToSymbol } from '@/utils/assets';

type InputWithoutValue = Omit<React.ComponentProps<typeof InputField>, 'value'>;

type Props = {
  asset: CryptoOrFiat;
  value: number | null;
  precision?: number;
  size?: string;
  onChangeValue: (value: number | null) => void;
} & InputWithoutValue;

export const AssetInput = ({ asset, value, onChangeValue, precision = 2, size = 'md', ...props }: Props) => {
  let prefix = '';
  let suffix = '';

  if (asset in FiatCurrency && asset in CryptoAsset) {
    suffix = ` ${asset}`; // Crypto asset is priority
  } else if (asset in FiatCurrency) {
    prefix = `${AssetToSymbol[asset]} `;
  } else if (asset in CryptoAsset) {
    suffix = ` ${asset}`;
  }

  const placeholder = `${prefix}0${suffix}`;

  return (
    <Input variant="underlined" size={size} className="my-3 border-b-0">
      <CurrencyInput
        value={value || null}
        onChangeValue={onChangeValue}
        renderTextInput={(textInputProps) => (
          <InputField
            {...textInputProps}
            {...props}
            placeholder={placeholder}
            // keyboardType='numeric'
          />
        )}
        prefix={prefix}
        suffix={suffix}
        delimiter=","
        separator="."
        precision={precision}
        autoFocus
      />
    </Input>
  );
};
