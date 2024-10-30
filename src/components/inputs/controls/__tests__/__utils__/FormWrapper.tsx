import React, { useEffect } from 'react';
import { Control, useForm } from 'react-hook-form';

interface Props {
  children: (control: Control) => React.ReactNode;
  autoSubmit?: boolean;
  onSubmit?: (data: any) => void;
}

export const FormWrapper: React.FC<Props> = ({ children, autoSubmit = false, onSubmit }) => {
  const { control, handleSubmit } = useForm();
  // Automatically submit the form after rendering
  useEffect(() => {
    if (autoSubmit) {
      setTimeout(() => {
        const submit = onSubmit ?? (() => {});
        handleSubmit(submit)();
      }, 0);
    }
  }, [onSubmit]);
  return <>{children(control)}</>;
};
