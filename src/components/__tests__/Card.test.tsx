import { render } from '@testing-library/react-native';
import { Card } from '../Card';
import { Text } from 'react-native';

describe('Card', () => {
  it('renders children correctly', () => {
    const { getByText } = render(
      <Card>
        <Text>Test Child</Text>
      </Card>
    );

    expect(getByText('Test Child')).toBeTruthy();
  });
});
