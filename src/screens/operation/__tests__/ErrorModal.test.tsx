import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ErrorModal } from '../modals/ErrorModal';

describe('ErrorModal', () => {
	it('renders correctly', () => {
		const { getByText } = render(<ErrorModal isVisible={true} onClose={jest.fn()} errorMessage="Test error message" />);
		expect(getByText('Transaction Failed')).toBeTruthy();
		expect(getByText('Test error message')).toBeTruthy();
	});

	it('calls onClose when the Close button is pressed', () => {
		const onClose = jest.fn();
		const { getByText } = render(<ErrorModal isVisible={true} onClose={onClose} errorMessage="Test error message" />);
		fireEvent.press(getByText('Close'));
		expect(onClose).toHaveBeenCalled();
	});
});
