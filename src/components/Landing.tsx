import { NavigationContainer } from '@react-navigation/native';

import RootNavigator from '@navigation/index';

type LandingProps = {
  isSignedIn: boolean;
};

export const Landing = (props: LandingProps) => {
  return (
    <NavigationContainer>
      <RootNavigator isSignedIn={props.isSignedIn} />
    </NavigationContainer>
  );
};
