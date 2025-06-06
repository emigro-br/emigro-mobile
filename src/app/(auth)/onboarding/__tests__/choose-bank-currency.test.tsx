import React from 'react';

import { fireEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { render } from 'test-utils';

import { sessionStore } from '@/stores/SessionStore';
import { FiatCurrency, fiatCurrencies } from '@/types/assets';
import { labelForFiat } from '@/utils/assets';

import { ChooseBankCurrency, ChooseBankCurrencyScreen } from '../choose-bank-currency';

describe('ChooseBankCurrencyScreen component', () => {
  test('Should render correctly', async () => {
    const { getByText, getByLabelText } = render(<ChooseBankCurrencyScreen />);

    const heading = getByText('Choose your main currency');
    expect(heading).toBeOnTheScreen();

    const currencies = fiatCurrencies();
    currencies.forEach((currency) => {
      const checkbox = getByLabelText(currency);
      expect(checkbox).toBeOnTheScreen();
    });
  });

  test('Should navigate to PinOnboarding screen when Continue button is pressed', () => {
    const router = useRouter();
    const updatePreferencesMock = jest.spyOn(sessionStore, 'updatePreferences').mockImplementation(jest.fn());
    const { getByTestId, getByLabelText } = render(<ChooseBankCurrencyScreen />);

    const selectedCurrency = FiatCurrency.USD;
    const checkbox = getByLabelText(selectedCurrency);
    fireEvent.press(checkbox);

    const continueButton = getByTestId('continue-button');
    fireEvent.press(continueButton);

    expect(updatePreferencesMock).toHaveBeenCalledWith({ fiatsWithBank: [selectedCurrency] });
    expect(router.navigate).toHaveBeenCalledWith('./pin');
  });
});

describe('ChooseBankCurrency component', () => {
  const currencies = [FiatCurrency.USD, FiatCurrency.EUR];
  test('Should render ChooseBankCurrency component correctly', async () => {
    const { getByText, getByLabelText, getByTestId } = render(
      <ChooseBankCurrency currencies={currencies} onContinue={jest.fn()} />,
    );

    const heading = getByText('Choose your main currency');
    expect(heading).toBeOnTheScreen();

    const text = getByText('You should choose the currency that you hold in a bank account.');
    expect(text).toBeOnTheScreen();

    currencies.forEach((currency) => {
      const checkbox = getByLabelText(labelForFiat(currency));
      expect(checkbox).toBeOnTheScreen();
    });

    const continueButton = getByTestId('continue-button');
    expect(continueButton).toBeOnTheScreen();
    expect(continueButton).toHaveTextContent('Continue');
    expect(continueButton).toHaveAccessibilityState({ disabled: true });
  });

  test('Should call onContinue with selected currency when Continue button is pressed', () => {
    const mockOnContinue = jest.fn();
    const { getByLabelText, getByTestId } = render(
      <ChooseBankCurrency currencies={currencies} onContinue={mockOnContinue} />,
    );

    const selectedCurrency = FiatCurrency.USD;
    const checkbox = getByLabelText(selectedCurrency);
    fireEvent.press(checkbox);

    const continueButton = getByTestId('continue-button');
    expect(continueButton).toHaveAccessibilityState({ disabled: false });
    fireEvent.press(continueButton);

    expect(mockOnContinue).toHaveBeenCalledWith(selectedCurrency);
  });
});
