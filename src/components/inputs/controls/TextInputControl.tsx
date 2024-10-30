import { Controller, FieldValues, UseControllerProps } from 'react-hook-form';

import { FieldError, TextInput } from '../TextInput';

type Props<T extends FieldValues> = {
  label?: string;
  placeholder?: string;
  mRef?: React.Ref<HTMLInputElement> | null;
  onSubmitEditing?: () => void;
} & UseControllerProps<T>;

export const TextInputControl = <T extends FieldValues>({
  name,
  label,
  placeholder,
  control,
  mRef,
  onSubmitEditing,
}: Props<T>) => {
  return (
    <Controller
      name={name}
      rules={{
        required: 'This is required',
      }}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <TextInput
          mRef={mRef}
          value={value}
          label={label}
          placeholder={placeholder}
          onChangeText={onChange}
          error={error as FieldError}
          onSubmitEditing={onSubmitEditing}
          returnKeyType="next"
          testID={name}
        />
      )}
    />
  );
};
