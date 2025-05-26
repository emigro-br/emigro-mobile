import React from 'react';

import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { EmailInputControl } from '../EmailInputControl';
import { FormWrapper } from './__utils__/FormWrapper';

describe('EmailInputControl', () => {
  it('renders correctly with default props', () => {
    const { getByTestId, getByText, getByPlaceholderText } = render(
      <FormWrapper>{(control) => <EmailInputControl name="testEmail" control={control} />}</FormWrapper>,
    );

    const input = getByTestId('testEmail');
    expect(input).toBeOnTheScreen();
    const label = getByText('Email');
    expect(label).toBeOnTheScreen();
    const placeholder = getByPlaceholderText('example@email.com');
    expect(placeholder).toBeOnTheScreen();
  });

  it('call onSubmitEditing on press return key', () => {
    const onSubmitEditing = jest.fn();
    const { getByTestId } = render(
      <FormWrapper>
        {(control) => <EmailInputControl name="testEmail" control={control} onSubmitEditing={onSubmitEditing} />}
      </FormWrapper>,
    );

    const input = getByTestId('testEmail');
    fireEvent(input, 'onSubmitEditing');

    expect(onSubmitEditing).toHaveBeenCalledTimes(1);
  });

  it('renders required error message when field is empty', async () => {
    const { getByText, getByTestId } = render(
      <FormWrapper autoSubmit>{(control) => <EmailInputControl name="testEmail" control={control} />}</FormWrapper>,
    );

    const input = getByTestId('testEmail');
    fireEvent.changeText(input, '');

    await waitFor(() => {
      const errorMessage = getByText('Email is required');
      expect(errorMessage).toBeOnTheScreen();
    });
  });

  it('renders invalid email message when email is not valid', async () => {
    const { getByText, getByTestId } = render(
      <FormWrapper autoSubmit>{(control) => <EmailInputControl name="testEmail" control={control} />}</FormWrapper>,
    );

    const input = getByTestId('testEmail');
    fireEvent.changeText(input, 'invalid-email');

    await waitFor(() => {
      const errorMessage = getByText('Invalid email address');
      expect(errorMessage).toBeOnTheScreen();
    });
  });
});
