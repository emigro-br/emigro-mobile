import { TextInputProps } from 'react-native';

import { EyeIcon, EyeOffIcon } from 'lucide-react-native';

import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from '@/components/ui/form-control';
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input';

import { FieldError } from './TextInput';

type Props = {
  value: string;
  showPassword: boolean;
  toggleShowPassword: () => void;
  onChangeText: (text: string) => void;
  error?: FieldError;
  mRef?: React.Ref<HTMLInputElement> | null;
} & TextInputProps;

export const PasswordInput = (props: Props) => {
  const { value, showPassword, toggleShowPassword, onChangeText, error } = props;
  return (
    <FormControl isInvalid={!!error}>
      <FormControlLabel className="mb-1">
        <FormControlLabelText>Password</FormControlLabelText>
      </FormControlLabel>
      <Input size="xl">
        <InputField
          {...props}
          ref={props.mRef as any}
          type={!showPassword ? 'password' : 'text'}
          placeholder="Enter your password"
          keyboardType="default"
          autoCapitalize="none"
          returnKeyType="done"
          onChangeText={onChangeText}
          value={value}
          blurOnSubmit
        />
        {toggleShowPassword && (
          <InputSlot
            onPress={toggleShowPassword}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="pr-3"
          >
            <InputIcon
              as={showPassword ? EyeIcon : EyeOffIcon}
              className={` ${showPassword ? 'text-primary-500' : 'text-typography-500'} `}
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
