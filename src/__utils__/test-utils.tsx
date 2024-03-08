import { JSX, JSXElementConstructor, ReactElement } from 'react';

import { RenderOptions, render } from '@testing-library/react-native';

import { ThemeProvider } from './ThemeProvider';

type Props = {
  children: JSX.Element;
};

const AllTheProviders = ({ children }: Props) => {
  return <ThemeProvider theme="light">{children}</ThemeProvider>;
};

const customRender = (
  ui: ReactElement<unknown, string | JSXElementConstructor<any>>,
  options?: RenderOptions | undefined,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react-native';

export { customRender as render };
