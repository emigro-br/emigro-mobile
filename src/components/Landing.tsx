import { NavigationContainer } from '@react-navigation/native';

import RootNavigator from '@navigation/index';

export const Landing = () => {
  return (
    <>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </>
  );
};
