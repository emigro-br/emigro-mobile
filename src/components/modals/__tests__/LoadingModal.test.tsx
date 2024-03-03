import React from 'react';

import { render } from '@testing-library/react-native';

import { LoadingModal } from '../LoadingModal';

// FIXME: gluestack is not rendering Modal on test
describe.skip('LoadingModal', () => {
  it('renders correctly with default label', () => {
    const { getByText, getByTestId } = render(<LoadingModal isOpen />);

    expect(getByTestId('loading-modal')).toBeOnTheScreen();
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('renders correctly with custom label', () => {
    const { getByText } = render(<LoadingModal isOpen text="Custom label" />);
    expect(getByText('Custom label')).toBeTruthy();
  });
});
