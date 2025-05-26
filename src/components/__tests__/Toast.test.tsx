import { render, screen } from '@testing-library/react-native';

import { Toast } from '../Toast';

describe('Toast', () => {
  const mockProps = {
    id: '1',
    title: 'Test Title',
    description: 'Test Description',
  };

  it('should render the toast component with correct props', () => {
    render(<Toast {...mockProps} action="success" />);

    const toastElement = screen.getByTestId('toast-1');
    expect(toastElement).toBeOnTheScreen();

    const titleElement = screen.getByText('Test Title');
    expect(titleElement).toBeOnTheScreen();

    const descriptionElement = screen.getByText('Test Description');
    expect(descriptionElement).toBeOnTheScreen();
  });
});
