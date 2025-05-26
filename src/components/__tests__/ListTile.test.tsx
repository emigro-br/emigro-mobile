import { View } from 'react-native';

import { fireEvent, screen } from '@testing-library/react-native';

import { render } from 'test-utils';

import { ListTile } from '../ListTile';

describe('ListTile component', () => {
  it('Should render the title and subtitle correctly', () => {
    const title = 'Sample Title';
    const subtitle = 'Sample Subtitle';
    const testID = 'list-tile';

    render(<ListTile title={title} subtitle={subtitle} testID="list-tile" />);

    const titleElement = screen.getByText(title);
    const subtitleElement = screen.getByText(subtitle);
    const listTileElement = screen.getByTestId(testID);

    expect(titleElement).toBeOnTheScreen();
    expect(subtitleElement).toBeOnTheScreen();
    expect(listTileElement).toBeOnTheScreen();
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

  it('Should render the title and subtitle as components correctly', () => {
    const title = <View testID="title-component">Title Component</View>;
    const subtitle = <View testID="subtitle-component">Subtitle Component</View>;

    const { getByTestId } = render(<ListTile title={title} subtitle={subtitle} />);
    const titleElement = getByTestId('title-component');
    const subtitleElement = getByTestId('subtitle-component');

    expect(titleElement).toBeOnTheScreen();
    expect(subtitleElement).toBeOnTheScreen();
  });

  it('calls the onPress function when an item is pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<ListTile title="Clickable" onPress={onPressMock} />);

    // Simulate pressing the first item
    fireEvent.press(getByText('Clickable'));

    expect(onPressMock).toHaveBeenCalled();
  });
});
