import { Controller, FieldError, FieldValues, UseControllerProps } from 'react-hook-form';
import { TextInputProps } from 'react-native';

import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
  Input,
  InputField,
} from '@gluestack-ui/themed';

type ControlProps<T extends FieldValues> = {
  ref?: any;
  label: string;
  placeholder?: string;
  next?: any;
} & UseControllerProps<T>;

export const TextControl = <T extends FieldValues>({
  ref,
  name,
  label,
  placeholder,
  control,
  next,
}: ControlProps<T>) => {
  return (
    <Controller
      name={name}
      rules={{
        required: 'This is required',
      }}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <TextInput
          ref={ref}
          value={value}
          label={label}
          placeholder={placeholder}
          onChange={onChange}
          error={error}
          onSubmitEditing={() => next?.current?.focus()}
          testID={name}
        />
      )}
    />
  );
};

type Props = {
  ref?: any;
  label: string;
  value: string;
  onChange: (text: string) => void;
  error?: FieldError;
} & TextInputProps;

export const TextInput = (props: Props) => {
  const { ref, label, value, onChange, error } = props;
  return (
    <FormControl isInvalid={!!error}>
      <FormControlLabel mb="$1">
        <FormControlLabelText>{label}</FormControlLabelText>
      </FormControlLabel>
      <Input size="xl">
        <InputField {...props} ref={ref} returnKeyType="next" onChangeText={onChange} value={value} />
      </Input>
      {error && (
        <FormControlError>
          <FormControlErrorText>{error.message}</FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  );
};
