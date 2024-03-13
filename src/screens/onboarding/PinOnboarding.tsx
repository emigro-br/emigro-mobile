import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Box, Button, ButtonText, Heading, LockIcon, Text, VStack } from '@gluestack-ui/themed';

import { RootStackParamList } from '@navigation/RootStack';

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PinOnboarding'>;
};

export const PinOnboarding = ({ navigation }: Props) => {
  return (
    <Box flex={1}>
      <VStack flex={1} px="$4" py="$16" justifyContent="space-between" borderWidth={1}>
        <VStack space="lg">
          <Box pt="$12" pb="$6" testID="lock-icon">
            <LockIcon size="4xl" color="red" />
          </Box>
          <Heading>Set up your mobile PIN</Heading>
          <Text>
            Protect your account with a PIN code. Your PIN is a 4-digit code that you will use to access your account
            and confirm your transactions.
          </Text>
        </VStack>

        <Button
          size="lg"
          onPress={() =>
            navigation.navigate('Root', {
              screen: 'ProfileTab',
              params: {
                screen: 'ConfigurePIN',
                params: { backTo: 'Root' },
              },
            })
          }
        >
          <ButtonText>Set up my PIN</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
};
