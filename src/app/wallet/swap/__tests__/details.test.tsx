import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { fireEvent, waitFor } from '@testing-library/react-native';

import { inputPIN, render } from 'test-utils';

import { PaymentResponse } from '@/services/emigro/types';
import { paymentStore } from '@/stores/PaymentStore';
import { sessionStore } from '@/stores/SessionStore';
import { CryptoAsset } from '@/types/assets';

import { DetailsSwap } from '../review';

jest.mock('@/services/emigro/users', () => ({
  getUserPublicKey: jest.fn().mockReturnValue('mockedPublicKey'),
}));

jest.mock('@/stores/SessionStore', () => ({
  sessionStore: {
    verifyPin: jest.fn(),
  },
}));

const Stack = createNativeStackNavigator();

describe('DetailsSwap', () => {
  const navigation: any = {
    navigate: jest.fn(),
  };

  const transaction = {
    from: CryptoAsset.EURC,
    fromValue: 100,
    to: CryptoAsset.BRL,
    toValue: 120,
    rate: 1.2,
    fees: 0.01,
  };

  // Create a separate component
  const DetailsSwapScreen = () => <DetailsSwap navigation={navigation} />;

  beforeAll(() => {
    jest.useFakeTimers();
    paymentStore.setSwap(transaction);
    jest.spyOn(paymentStore, 'pay').mockResolvedValue({ transactionHash: 'hash' } as PaymentResponse);
  });

  afterAll(() => {
    jest.restoreAllMocks();
    paymentStore.reset();
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="DetailsSwap" component={DetailsSwapScreen} />
        </Stack.Navigator>
      </NavigationContainer>,
    );

    expect(getByText('Confirm Swap')).toBeOnTheScreen();

    // from
    expect(getByText('Amount')).toBeOnTheScreen();
    expect(getByText('100.00 EURC')).toBeOnTheScreen();

    // rate
    expect(getByText('Rate')).toBeOnTheScreen();
    expect(getByText('1 BRL ≈ 1.200000 EURC')).toBeOnTheScreen();

    // to: rate is 1.2, so 100 EURC = 120 BRL
    expect(getByText('Exchanged')).toBeOnTheScreen();
    expect(getByText('120.00 BRL')).toBeOnTheScreen();

    // fees
    expect(getByText('Fees')).toBeOnTheScreen();
    expect(getByText('0.01')).toBeOnTheScreen();

    // fees is 0.01, so 100 EURC = 120 BRL - 0.01 = 119.99 BRL
    expect(getByText('Final receive')).toBeOnTheScreen();
    expect(getByText('119.99 BRL')).toBeOnTheScreen();

    expect(getByText('The final amount is estimated and may change.')).toBeOnTheScreen();
    expect(getByText('Swap EURC for BRL')).toBeOnTheScreen();
  });

  it('show PIN on button press and pay when confirm', async () => {
    const verifyPinSpy = jest.spyOn(sessionStore, 'verifyPin').mockResolvedValueOnce(true);
    const { getByText } = render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="DetailsSwap" component={DetailsSwapScreen} />
        </Stack.Navigator>
      </NavigationContainer>,
    );

    fireEvent.press(getByText('Swap EURC for BRL'));

    inputPIN('1234');

    expect(verifyPinSpy).toHaveBeenCalledWith('1234');

    await waitFor(() => {
      // expect(getByText('Processing...')).toBeOnTheScreen();
      expect(paymentStore.pay).toHaveBeenCalled();
    });
  });

  it('shows error message', async () => {
    jest.spyOn(sessionStore, 'verifyPin').mockResolvedValueOnce(true);
    jest.spyOn(paymentStore, 'pay').mockRejectedValueOnce(new Error('error message'));

    const { getByText, getByTestId } = render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="DetailsSwap" component={DetailsSwapScreen} />
        </Stack.Navigator>
      </NavigationContainer>,
    );

    fireEvent.press(getByText('Swap EURC for BRL'));

    inputPIN('1234');

    await waitFor(() => {
      //FIXME: the error-modal testID is aways rendering
      expect(getByTestId('error-modal')).toBeOnTheScreen();
    });
  });
});
