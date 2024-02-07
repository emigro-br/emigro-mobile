import React from 'react';

import { render } from '@testing-library/react-native';

import { LoadingModal } from '../modals/LoadingModal';

describe('LoadingModal', () => {
  it('renders correctly with default label', () => {
    const { getByText } = render(<LoadingModal isVisible />);
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('renders correctly with custom label', () => {
    const { getByText } = render(<LoadingModal isVisible label="Custom label" />);
    expect(getByText('Custom label')).toBeTruthy();
  });
});
