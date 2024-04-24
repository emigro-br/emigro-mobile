import { View } from 'react-native';

import { screen } from '@testing-library/react-native';

import { render } from 'test-utils';

import { ListTile } from '../ListTile';

describe('ListTile component', () => {
  it('Should render the title and subtitle correctly', () => {
    const title = 'Sample Title';
    const subtitle = 'Sample Subtitle';

    render(<ListTile title={title} subtitle={subtitle} />);

    const titleElement = screen.getByText(title);
    const subtitleElement = screen.getByText(subtitle);

    expect(titleElement).toBeOnTheScreen();
    expect(subtitleElement).toBeOnTheScreen();
  });

  it('Should render the leading and trailing elements correctly', () => {
    const leadingElement = <View testID="leading-element">Leading Element</View>;
    const trailingElement = <View testID="trailing-element">Trailing Element</View>;

    render(<ListTile title="" leading={leadingElement} trailing={trailingElement} />);

    const leadingElementRendered = screen.getByTestId('leading-element');
    const trailingElementRendered = screen.getByTestId('trailing-element');

    expect(leadingElementRendered).toBeOnTheScreen();
    expect(trailingElementRendered).toBeOnTheScreen();
  });
});
