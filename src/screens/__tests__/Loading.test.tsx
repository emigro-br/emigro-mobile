import React from 'react';

import { render } from '@testing-library/react-native';

import { LoadingScreen } from '../Loading';

describe('LoadingScreen', () => {
  it('should render the loading spinner', () => {
    const { getByTestId } = render(<LoadingScreen />);
    const spinner = getByTestId('loading-spinner');

    expect(spinner).toBeOnTheScreen();
  });
});
