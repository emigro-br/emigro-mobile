import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';

import CustomModal from '@components/CustomModal';

describe('CustomModal component', () => {
  test('Should render CustomModal when isVisible is true', () => {
    const { getByText } = render(
      <CustomModal isVisible title="Testing title">
        <Text>Modal Content</Text>
      </CustomModal>,
    );
    const titleElement = getByText('Testing title');
    const contentElement = getByText('Modal Content');

    expect(titleElement).toBeDefined();
    expect(contentElement).toBeDefined();
  });

  test('Should not render CustomModal when isVisible is false', () => {
    const { queryByText } = render(
      <CustomModal isVisible={false} title="Testing title">
        <Text>Modal Content</Text>
      </CustomModal>,
    );
    const titleElement = queryByText('Testing title');
    const contentElement = queryByText('Modal Content');

    expect(titleElement).toBeNull();
    expect(contentElement).toBeNull();
  });
});
