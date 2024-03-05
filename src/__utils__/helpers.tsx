import { JSX, JSXElementConstructor, ReactElement } from 'react';

import { RenderOptions, render } from '@testing-library/react-native';

import { ThemeProvider } from './ThemeProvider';

// export const withProvider = Component: React.FC => props => {
//   return (
//     <Provider>
//       <Component {...props} />
//     </Provider>
//   );
// }

export const withTheme = (children: JSX.Element) => {
  return <ThemeProvider>{children}</ThemeProvider>;
};

// global.withProvider = withProvider;

const customRender = (
  ui: ReactElement<unknown, string | JSXElementConstructor<any>>,
  options: RenderOptions | undefined,
) => render(ui, { wrapper: withTheme, ...options });

export * from '@testing-library/react-native';

export { customRender as render };
