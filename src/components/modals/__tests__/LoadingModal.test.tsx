import React from 'react';

import { render } from '@testing-library/react-native';

import { LoadingModal } from '../LoadingModal';

describe('LoadingModal', () => {
  it('show not render when is not open', () => {
    const { queryByTestId } = render(<LoadingModal isOpen={false} />);
    expect(queryByTestId('loading-modal')).toBeNull();
  });

  it('renders correctly with default label', () => {
    const { getByTestId } = render(<LoadingModal isOpen />);

    expect(getByTestId('loading-modal')).toBeOnTheScreen();
    // expect(getByText('Loading...')).toBeTruthy();
  });

  // FIXME: gluestack is not rendering Modal on test
  it.skip('renders correctly with custom label', () => {
    const { getByText } = render(<LoadingModal isOpen text="Custom label" />);
    expect(getByText('Custom label')).toBeTruthy();
  });
});
