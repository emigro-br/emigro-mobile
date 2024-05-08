import { Controller, FieldValues, UseControllerProps } from 'react-hook-form';

import { FieldError, TextInput } from '../TextInput';

type Props<T extends FieldValues> = {
  mRef?: React.Ref<HTMLInputElement> | null;
  onSubmitEditing?: () => void;
} & UseControllerProps<T>;

export const EmailInputControl = <T extends FieldValues>({ name, control, mRef, onSubmitEditing }: Props<T>) => {
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
        <TextInput
          mRef={mRef}
          value={value}
          onChangeText={onChange}
          error={error as FieldError}
          onSubmitEditing={onSubmitEditing}
          label="Email"
          placeholder="example@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          returnKeyType="next"
          testID={name}
        />
      )}
    />
  );
};
