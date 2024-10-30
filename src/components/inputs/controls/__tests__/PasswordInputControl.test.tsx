import React from 'react';

import { fireEvent, waitFor } from '@testing-library/react-native';

import { render } from 'test-utils';

import { PasswordInputControl } from '../PasswordInputControl';
import { FormWrapper } from './__utils__/FormWrapper';

describe('PasswordControl', () => {
  it('renders correctly with default props', () => {
    const { getByTestId } = render(
      <FormWrapper>{(control) => <PasswordInputControl name="testPassword" control={control} />}</FormWrapper>,
    );

    const input = getByTestId('testPassword');
    expect(input).toBeOnTheScreen();
  });

  it('call onSubmitEditing on press return key', () => {
    const onSubmitEditing = jest.fn();
    const { getByTestId } = render(
      <FormWrapper>
        {(control) => <PasswordInputControl name="testPassword" control={control} onSubmitEditing={onSubmitEditing} />}
      </FormWrapper>,
    );

    const input = getByTestId('testPassword');
    fireEvent(input, 'onSubmitEditing');

    expect(onSubmitEditing).toHaveBeenCalledTimes(1);
  });

  it('renders error messages for default validation', async () => {
    const { getByText, getByTestId } = render(
      <FormWrapper autoSubmit>
        {(control) => <PasswordInputControl name="testPassword" control={control} />}
      </FormWrapper>,
    );

    const input = getByTestId('testPassword');

    // Empty password
    fireEvent.changeText(input, '');
    await waitFor(() => {
      const errorMessage = getByText('Password is required');
      expect(errorMessage).toBeOnTheScreen();
    });

    // Mininimum size 8 characters
    fireEvent.changeText(input, 'Pass1!');
    await waitFor(() => {
      const errorMessage = getByText('Password must be at least 8 characters');
      expect(errorMessage).toBeOnTheScreen();
    });
  });

  it('renders error messages for full validation (all rules)', async () => {
    const { getByText, getByTestId } = render(
      <FormWrapper autoSubmit>
        {(control) => <PasswordInputControl name="testPassword" control={control} validationFull />}
      </FormWrapper>,
    );
    const input = getByTestId('testPassword');

    // Empty password
    fireEvent.changeText(input, '');

    await waitFor(() => {
      const errorMessage = getByText('Password is required');
      expect(errorMessage).toBeOnTheScreen();
    });

    // Contains at least 1 lowercase letter
    fireEvent.changeText(input, ' ');
    await waitFor(() => {
      const errorMessage = getByText('Password must contain at least 1 lowercase letter');
      expect(errorMessage).toBeOnTheScreen();
    });

    // Contains at least 1 uppercase letter
    fireEvent.changeText(input, 'pass');
    await waitFor(() => {
      const errorMessage = getByText('Password must contain at least 1 uppercase letter');
      expect(errorMessage).toBeOnTheScreen();
    });

    // Contains at least 1 number
    fireEvent.changeText(input, 'Pass');
    await waitFor(() => {
      const errorMessage = getByText('Password must contain at least 1 number');
      expect(errorMessage).toBeOnTheScreen();
    });

    // Contains at least 1 special character
    fireEvent.changeText(input, 'Pass1');
    await waitFor(() => {
      const errorMessage = getByText('Password must contain at least 1 special character');
      expect(errorMessage).toBeOnTheScreen();
    });

    // Mininimum size 8 characters
    fireEvent.changeText(input, 'Pass1!');
    await waitFor(() => {
      const errorMessage = getByText('Password must be at least 8 characters');
      expect(errorMessage).toBeOnTheScreen();
    });
  });
});
