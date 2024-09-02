import { render } from 'test-utils';

import LockScreen from '../lock';

describe('LockScreen', () => {
  it('should render', () => {
    const { getByTestId } = render(<LockScreen />);
    expect(getByTestId('lock-icon')).toBeOnTheScreen();
    expect(getByTestId('tagline')).toBeOnTheScreen();
    expect(getByTestId('unlock-button')).toBeOnTheScreen();
  });
});
