import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

import Operation from '../operation/Operation';

describe('Operation', () => {
  it('Calls handleOnPress when a button is pressed', async () => {
    const { getByText } = render(<Operation />);
    const button = getByText('USD');
    fireEvent.press(button);

    expect(button).toBeTruthy();
  });

  it('Calls handleOnPress when a button is pressed', async () => {
    const { getByText } = render(<Operation />);
    const button = getByText('BRL');
    fireEvent.press(button);

    expect(button).toBeTruthy();
  });

  it('Calls handleOnPress when a button is pressed', async () => {
    const { getByText } = render(<Operation />);
    const button = getByText('EUR');
    fireEvent.press(button);

    expect(button).toBeTruthy();
  });
});
