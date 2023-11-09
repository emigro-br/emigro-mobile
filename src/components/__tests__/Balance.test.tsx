import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { render, waitFor } from '@testing-library/react-native';

import { mockBalanceUsd, mockNoFunds } from '@/__mocks__/mock-balance';
import * as emigroService from '@/services/emigro';
import { IBalance } from '@/types/IBalance';

import Balance from '@components/Balance';

const Stack = createNativeStackNavigator();
const TestNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Wallet">
      <Stack.Screen name="Balance" component={Balance} />
    </Stack.Navigator>
  </NavigationContainer>
);

describe('Balance', () => {
  it('Should fetches and renders user balance', async () => {
    jest.spyOn(emigroService, 'getUserBalance').mockResolvedValue(Promise.resolve<IBalance[]>([mockBalanceUsd]));

    const { getByText } = render(<TestNavigator />);
    const text = await waitFor(() => getByText('USD'));
    expect(text).toBeTruthy();
  });
  it('Should fetches and renders a message if there is no balance', async () => {
    jest.spyOn(emigroService, 'getUserBalance').mockResolvedValue(Promise.resolve<IBalance[]>([mockNoFunds]));

    const { getByText } = render(<TestNavigator />);
    const text = await waitFor(() => getByText('No funds'));
    expect(text).toBeTruthy();
  });
});
