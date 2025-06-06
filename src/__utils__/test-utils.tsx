import { JSX, JSXElementConstructor, ReactElement } from 'react';

import { NavigationContainer } from '@react-navigation/native';

import { RenderOptions, fireEvent, render, screen } from '@testing-library/react-native';

import { ThemeProvider } from './ThemeProvider';

type Props = {
  children: JSX.Element;
};

const AllTheProviders = ({ children }: Props) => {
  return (
    <NavigationContainer>
      <ThemeProvider theme="light">{children}</ThemeProvider>
    </NavigationContainer>
  );
};

const customRender = (
  ui: ReactElement<unknown, string | JSXElementConstructor<any>>,
  options?: RenderOptions | undefined,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react-native';

export { customRender as render };

export const inputPIN = (pin: string, labelText: string = 'Input Field') => {
  const inputFields = screen.getAllByLabelText(labelText);

  for (let i = 0; i < pin.length; i++) {
    fireEvent.changeText(inputFields[i], pin[i]);
  }

  const submitButton = screen.getByTestId('submit-button');
  fireEvent.press(submitButton);
  return inputFields;
};
