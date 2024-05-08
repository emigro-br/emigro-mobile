import { useState } from 'react';
import { Controller, FieldValues, UseControllerProps } from 'react-hook-form';

import { PasswordInput } from '../PasswordInput';
import { FieldError } from '../TextInput';

type Props<T extends FieldValues> = {
  validationFull?: boolean;
  mRef?: React.Ref<HTMLInputElement> | null;
  onSubmitEditing?: () => void;
} & UseControllerProps<T>;

/*
Contains at least 1 number
Contains at least 1 special character
Contains at least 1 uppercase letter
Contains at least 1 lowercase letter
*/
// TODO: try mutple errors with: https://www.npmjs.com/package/@hookform/error-message
export const PasswordInputControl = <T extends FieldValues>({
  name,
  control,
  validationFull = false,
  mRef,
  onSubmitEditing,
}: Props<T>) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const minLength = 8;
  const defaultRules = {
    required: 'Password is required',
    minLength: {
      value: minLength,
      message: `Password must be at least ${minLength} characters`,
    },
  };

  const validationRules = {
    required: 'Password is required',
    validate: {
      hasLowercase: (value: string) => /[a-z]/.test(value) || 'Password must contain at least 1 lowercase letter',
      hasUppercase: (value: string) => /[A-Z]/.test(value) || 'Password must contain at least 1 uppercase letter',
      hasNumber: (value: string) => /\d/.test(value) || 'Password must contain at least 1 number',
      hasSpecialCharacter: (value: string) =>
        /[!@#$%^&*(),.?":{}|<>]/.test(value) || 'Password must contain at least 1 special character',
      minLength: (value: string | any[]) => value.length >= 8 || `Password must be at least ${minLength} characters`,
    },
  };

  return (
    <Controller
      name={name}
      rules={validationFull ? validationRules : defaultRules}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <PasswordInput
          mRef={mRef}
          value={value}
          onChangeText={onChange}
          error={error as FieldError}
          showPassword={showPassword}
          toggleShowPassword={() => setShowPassword((prev) => !prev)}
          onSubmitEditing={onSubmitEditing}
          testID={name}
        />
      )}
    />
  );
};
