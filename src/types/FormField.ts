import { KeyboardType } from 'react-native';

export type FormField = {
  name: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  label?: string;
  keyboardType: KeyboardType;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};
