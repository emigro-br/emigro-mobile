import { NavigationContainer, NavigationProp } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { IPaymentResponse } from '@/types/IPaymentResponse';

import { AssetCode } from '@constants/assetCode';

import { RootStackParamList } from '@navigation/index';

import { DetailsSwap } from '../DetailsSwap';
import bloc from '../bloc';

jest.mock('@/services/emigro', () => ({
  getUserPublicKey: jest.fn().mockReturnValue('mockedPublicKey'),
}));

const Stack = createNativeStackNavigator();

describe('DetailsSwap', () => {
  const navigation = {
    navigate: jest.fn(),
  } as unknown as NavigationProp<RootStackParamList, 'DetailsSwap'>;

  const transaction = {
    from: AssetCode.EURC,
    fromValue: 100,
    to: AssetCode.BRL,
    toValue: 120,
    rate: 1.2,
    fees: 0.01,
  };

  // Create a separate component
  const DetailsSwapScreen = () => <DetailsSwap navigation={navigation} />;

  beforeAll(() => {
    jest.useFakeTimers();
    bloc.setTransaction(transaction);
    jest.spyOn(bloc, 'swap').mockResolvedValue({ transactionHash: 'hash' } as IPaymentResponse);
  });

  afterAll(() => {
    jest.restoreAllMocks();
    bloc.reset();
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="DetailsSwap" component={DetailsSwapScreen} />
        </Stack.Navigator>
      </NavigationContainer>,
    );

    expect(getByText('Confirm Swap')).toBeTruthy();

    // from
    expect(getByText('Amount')).toBeTruthy();
    expect(getByText('100.00 EURC')).toBeTruthy();

    // rate
    expect(getByText('Rate')).toBeTruthy();
    expect(getByText('1 EURC ≈ 1.200000 BRL')).toBeTruthy();

    // to: rate is 1.2, so 100 EURC = 120 BRL
    expect(getByText('Exchanged')).toBeTruthy();
    expect(getByText('120.00 BRL')).toBeTruthy();

    // fees
    expect(getByText('Fees')).toBeTruthy();
    expect(getByText('0.01')).toBeTruthy();

    // fees is 0.01, so 100 EURC = 120 BRL - 0.01 = 119.99 BRL
    expect(getByText('Final receive')).toBeTruthy();
    expect(getByText('119.99 BRL')).toBeTruthy();

    expect(getByText('The final amount is estimated and may change.')).toBeTruthy();
    expect(getByText('Swap EURC for BRL')).toBeTruthy();
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
      expect(bloc.swap).toBeCalled();
    });
  });

  it('shows error message', async () => {
    jest.spyOn(bloc, 'swap').mockRejectedValue(new Error('error message'));

    const { getByText } = render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="DetailsSwap" component={DetailsSwapScreen} />
        </Stack.Navigator>
      </NavigationContainer>,
    );

    fireEvent.press(getByText('Swap EURC for BRL'));

    await waitFor(() => {
      expect(getByText('error message')).toBeTruthy();
    });
  });
});
