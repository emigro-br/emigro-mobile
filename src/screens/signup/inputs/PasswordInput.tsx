import { useState } from 'react';
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
  InputIcon,
  InputSlot,
} from '@gluestack-ui/themed';
import { EyeIcon, EyeOffIcon } from 'lucide-react-native';

type ControlProps<T extends FieldValues> = {
  ref?: any;
  next?: any;
  validationFull?: boolean;
} & UseControllerProps<T>;

export const PasswordControl = <T extends FieldValues>({
  name,
  ref,
  next,
  control,
  validationFull = false,
}: ControlProps<T>) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  return (
    /*
    Contains at least 1 number
    Contains at least 1 special character
    Contains at least 1 uppercase letter
    Contains at least 1 lowercase letter
    */
    // TODO: try mutple errors with: https://www.npmjs.com/package/@hookform/error-message
    <Controller
      name={name}
      rules={{
        required: 'Password is required',
        minLength: { value: 8, message: 'Password must be at least 8 characters' },
        validate: validationFull
          ? {
              hasNumber: (value) => /\d/.test(value) || 'Password must contain at least 1 number',
              hasSpecialCharacter: (value) =>
                /[!@#$%^&*(),.?":{}|<>]/.test(value) || 'Password must contain at least 1 special character',
              hasUppercase: (value) => /[A-Z]/.test(value) || 'Password must contain at least 1 uppercase letter',
              hasLowercase: (value) => /[a-z]/.test(value) || 'Password must contain at least 1 lowercase letter',
            }
          : {},
      }}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <PasswordInput
          ref={ref}
          value={value}
          onChange={onChange}
          error={error}
          showPassword={showPassword}
          toggleShowPassword={() => setShowPassword((prev) => !prev)}
          testID={name}
        />
      )}
    />
  );
};

type Props = {
  ref?: any;
  value: string;
  showPassword: boolean;
  toggleShowPassword: () => void;
  onChange: (text: string) => void;
  error?: FieldError;
} & TextInputProps;

export const PasswordInput = (props: Props) => {
  const { ref, value, showPassword, toggleShowPassword, onChange, error } = props;
  return (
    <FormControl isInvalid={!!error}>
      <FormControlLabel mb="$1">
        <FormControlLabelText>Password</FormControlLabelText>
      </FormControlLabel>
      <Input size="xl">
        <InputField
          {...props}
          ref={ref}
          type={!showPassword ? 'password' : 'text'}
          placeholder="Enter your password"
          keyboardType="default"
          autoCapitalize="none"
          returnKeyType="done"
          onChangeText={onChange}
          value={value}
          blurOnSubmit
        />
        {toggleShowPassword && (
          <InputSlot pr="$3" onPress={toggleShowPassword}>
            <InputIcon
              as={showPassword ? EyeIcon : EyeOffIcon}
              color={showPassword ? '$primary500' : '$textLight500'}
            />
          </InputSlot>
        )}
      </Input>
      {error && (
        <FormControlError>
          <FormControlErrorText>{error.message}</FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  );
};
