import { Input, InputField } from "@/components/ui/input";

import {
  FormControl,
  FormControlError,
  FormControlErrorText,
  FormControlLabel,
  FormControlLabelText,
} from "@/components/ui/form-control";

import { TextInputProps } from 'react-native';

// only to avoid react-hook-form import
export type FieldError = {
  type: string;
  message?: string;
};

type Props = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: FieldError;
  // https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/forward_and_create_ref/#option-1---wrapper-component
  mRef?: React.Ref<HTMLInputElement> | null;
} & TextInputProps;

export const TextInput = (props: Props) => {
  const { label, value, onChangeText, error } = props;
  return (
    <FormControl isInvalid={!!error}>
      {label && (
        <FormControlLabel className="mb-1">
          <FormControlLabelText>{label}</FormControlLabelText>
        </FormControlLabel>
      )}
      <Input size="xl">
        <InputField {...props} ref={props.mRef as any} onChangeText={onChangeText} value={value} />
      </Input>
      {error && (
        <FormControlError>
          <FormControlErrorText>{error.message}</FormControlErrorText>
        </FormControlError>
      )}
    </FormControl>
  );
};
