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
  next?: any;
} & UseControllerProps<T>;

export const EmailControl = <T extends FieldValues>({ name, ref, control, next }: ControlProps<T>) => {
  return (
    <Controller
      name={name}
      rules={{
        required: 'Email is required',
        pattern: {
          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
          message: 'Invalid email address',
        },
      }}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <EmailInput
          ref={ref}
          value={value}
          onChange={onChange}
          error={error}
          onSubmitEditing={() => next?.current?.focus()}
        />
      )}
    />
  );
};

type Props = {
  ref?: any;
  value: string;
  onChange: (text: string) => void;
  error?: FieldError;
} & TextInputProps;

export const EmailInput = (props: Props) => {
  const { ref, value, onChange, error } = props;
  return (
    <FormControl isInvalid={!!error}>
      <FormControlLabel mb="$1">
        <FormControlLabelText>Email</FormControlLabelText>
      </FormControlLabel>
      <Input size="xl">
        <InputField
          {...props}
          ref={ref}
          placeholder="example@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
          testID="email"
          onChangeText={onChange}
          value={value}
        />
      </Input>
      {error && (
        <FormControlError>
          <FormControlErrorText>{error.message}</FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  );
};
