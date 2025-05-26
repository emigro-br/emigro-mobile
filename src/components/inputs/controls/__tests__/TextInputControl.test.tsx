import React from 'react';

import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { TextInputControl } from '../TextInputControl';
import { FormWrapper } from './__utils__/FormWrapper';

describe('TextInputControl', () => {
  it('renders correctly with default props', () => {
    const { getByTestId, getByText, getByPlaceholderText } = render(
      <FormWrapper>
        {(control) => (
          <TextInputControl name="testInput" label="Test Label" placeholder="Custom Placeholder" control={control} />
        )}
      </FormWrapper>,
    );

    const input = getByTestId('testInput');
    expect(input).toBeOnTheScreen();
    const label = getByText('Test Label');
    expect(label).toBeOnTheScreen();
    const placeholder = getByPlaceholderText('Custom Placeholder');
    expect(placeholder).toBeOnTheScreen();
  });

  it('call onSubmitEditing on press return key', () => {
    const onSubmitEditing = jest.fn();
    const { getByTestId } = render(
      <FormWrapper>
        {(control) => (
          <TextInputControl name="testInput" label="Test Input" control={control} onSubmitEditing={onSubmitEditing} />
        )}
      </FormWrapper>,
    );

    const input = getByTestId('testInput');
    fireEvent(input, 'onSubmitEditing');

    expect(onSubmitEditing).toHaveBeenCalledTimes(1);
  });

  it('renders required error message when field is empty', async () => {
    const { getByText, getByTestId } = render(
      <FormWrapper autoSubmit>
        {(control) => <TextInputControl name="testInput" label="Test Input" control={control} />}
      </FormWrapper>,
    );

    const input = getByTestId('testInput');
    fireEvent.changeText(input, '');

    await waitFor(() => {
      const errorMessage = getByText('This is required');
      expect(errorMessage).toBeOnTheScreen();
    });
  });
});
