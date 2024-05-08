import { Controller, FieldValues, UseControllerProps } from 'react-hook-form';

import { TextInput } from './TextInput';

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
        <TextInput
          ref={ref}
          value={value}
          onChange={onChange}
          error={error}
          onSubmitEditing={() => next?.current?.focus()}
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
