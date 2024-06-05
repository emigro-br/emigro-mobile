import React from 'react';
import mockSafeAreaContext from 'react-native-safe-area-context/jest/mock';

import { fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { render } from 'test-utils';

import WithdrawalSuccess from '../success';

jest.mock('react-native-safe-area-context', () => mockSafeAreaContext);

describe('WithdrawalSuccess', () => {
  it('should render the success message correctly', () => {
    const { getByText } = render(<WithdrawalSuccess />);

    const title = getByText('Withdrawal successfully confirmed!');
    expect(title).toBeOnTheScreen();

    const doneButton = getByText('Done');
    expect(doneButton).toBeOnTheScreen();
  });

  it('should call the onContinue function when the done button is pressed', () => {
    const router = useRouter();
    const { getByText } = render(<WithdrawalSuccess />);
    const doneButton = getByText('Done');
    fireEvent.press(doneButton);
    expect(router.dismiss).toHaveBeenCalled();
  });
});
