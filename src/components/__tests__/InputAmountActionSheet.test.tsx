import { fireEvent, render, screen } from '@testing-library/react-native';

import { FiatCurrency } from '@/types/assets';

import { InputAmount } from '../InputAmountActionSheet';

describe('InputAmount', () => {
  const mockProps = {
    tagline: 'Test Tagline',
    initialAmount: 0,
    asset: FiatCurrency.EUR,
    onSave: jest.fn(),
  };

  beforeEach(() => {
    render(<InputAmount {...mockProps} />);
  });

  it('should render the component with correct props', () => {
    const taglineElement = screen.getByRole('header');
    expect(taglineElement).toHaveTextContent('Test Tagline');

    const assetInputElement = screen.getByLabelText('Input Field');
    expect(assetInputElement).toBeOnTheScreen();
    expect(assetInputElement.props.value).toBe('');
    expect(assetInputElement.props.placeholder).toBe('€ 0');

    const confirmButtonElement = screen.getByText('Confirm');
    expect(confirmButtonElement).toBeOnTheScreen();
    expect(confirmButtonElement).toBeDisabled();
  });

  it('should render correct with initial value', () => {
    render(<InputAmount {...mockProps} initialAmount={100} />);
    const assetInputElement = screen.getByLabelText('Input Field');
    expect(assetInputElement).toBeOnTheScreen();
    expect(assetInputElement.props.value).toBe('€ 100.00');

    const confirmButtonElement = screen.getByText('Confirm');
    expect(confirmButtonElement).toBeEnabled();
  });

  it('should update the value when input changes', () => {
    const assetInputElement = screen.getByLabelText('Input Field');
    fireEvent.changeText(assetInputElement, '200'); // € 2.00

    expect(assetInputElement.props.value).toBe('€ 2.00');
  });

  it('should call onSave with the correct value when confirm button is pressed', () => {
    const assetInputElement = screen.getByLabelText('Input Field');
    fireEvent.changeText(assetInputElement, '300'); // € 3.00

    const confirmButtonElement = screen.getByText('Confirm');
    fireEvent.press(confirmButtonElement);

    expect(mockProps.onSave).toHaveBeenCalledWith(3);
  });
});
