import { NavigationContainer, NavigationProp } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { IPaymentResponse } from '@/types/IPaymentResponse';
import { CryptoAsset } from '@/types/assets';

import { Provider } from '@components/Provider';

import { RootStackParamList } from '@navigation/index';

import { paymentStore } from '@stores/PaymentStore';

import { DetailsSwap } from '../DetailsSwap';

jest.mock('@/services/emigro', () => ({
  getUserPublicKey: jest.fn().mockReturnValue('mockedPublicKey'),
}));

const Stack = createNativeStackNavigator();

describe('DetailsSwap', () => {
  const navigation = {
    navigate: jest.fn(),
  } as unknown as NavigationProp<RootStackParamList, 'DetailsSwap'>;

  const transaction = {
    from: CryptoAsset.EURC,
    fromValue: 100,
    to: CryptoAsset.BRL,
    toValue: 120,
    rate: 1.2,
    fees: 0.01,
  };

  // Create a separate component
  const DetailsSwapScreen = () => (
    <Provider>
      <DetailsSwap navigation={navigation} />
    </Provider>
  );

  beforeAll(() => {
    jest.useFakeTimers();
    paymentStore.setSwap(transaction);
    jest.spyOn(paymentStore, 'pay').mockResolvedValue({ transactionHash: 'hash' } as IPaymentResponse);
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
    expect(getByText('1 EURC ≈ 1.200000 BRL')).toBeOnTheScreen();

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

  it('navigates on button press', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="DetailsSwap" component={DetailsSwapScreen} />
        </Stack.Navigator>
      </NavigationContainer>,
    );

    fireEvent.press(getByText('Swap EURC for BRL'));

    await waitFor(() => {
      expect(paymentStore.pay).toHaveBeenCalled();
    });
  });

  it('shows error message', async () => {
    jest.spyOn(paymentStore, 'pay').mockRejectedValue(new Error('error message'));

    const { getByText } = render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="DetailsSwap" component={DetailsSwapScreen} />
        </Stack.Navigator>
      </NavigationContainer>,
    );

    fireEvent.press(getByText('Swap EURC for BRL'));

    await waitFor(() => {
      expect(getByText('error message')).toBeOnTheScreen();
    });
  });
});
