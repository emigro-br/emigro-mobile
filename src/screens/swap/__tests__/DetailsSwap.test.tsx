import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { DetailsSwap } from '../DetailsSwap';
import { NavigationContainer, NavigationProp, RouteProp } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AssetCode } from '@constants/assetCode';
import { RootStackParamList } from '@navigation/index';


const Stack = createNativeStackNavigator();

describe('DetailsSwap', () => {
  const route: RouteProp<RootStackParamList, 'DetailsSwap'> = {
    key: 'DetailsSwap',
    name: 'DetailsSwap',
    params: {
      from: AssetCode.EURC,
      fromValue: 100,
      to: AssetCode.BRL,
      rate: 1.2,
      fees: 0.01,
    },
  };

  const navigation = {
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
    reset: jest.fn(),
    isFocused: jest.fn(),
    canGoBack: jest.fn(),
    // add other properties and methods as needed
  } as unknown as NavigationProp<RootStackParamList, 'DetailsSwap'>;

  // Create a separate component
  const DetailsSwapScreen = () => <DetailsSwap route={route} navigation={navigation} />;

  beforeAll(() => {
    jest.useFakeTimers();
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="DetailsSwap" component={DetailsSwapScreen} initialParams={route.params} />
        </Stack.Navigator>
      </NavigationContainer>
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
    expect(getByText('Estimated')).toBeTruthy();
    expect(getByText('119.99 BRL')).toBeTruthy();

    expect(getByText('The final amount is estimated and may change.')).toBeTruthy();
    expect(getByText('Swap EURC for BRL')).toBeTruthy();
  });

  it('navigates on button press', async () => {
    const { getByText } = render(
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="DetailsSwap" component={DetailsSwapScreen} initialParams={route.params} />
        </Stack.Navigator>
      </NavigationContainer>
    );

    fireEvent.press(getByText('Swap EURC for BRL'));

    await waitFor(() => {
      jest.runAllTimers();
      expect(navigation.navigate).toBeCalledWith('Wallet');
    });
  });
});
