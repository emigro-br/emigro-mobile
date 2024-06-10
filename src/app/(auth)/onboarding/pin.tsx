import { Box, Button, ButtonText, Heading, LockIcon, Text, VStack } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';

export const PinOnboarding = () => {
  const router = useRouter();
  return (
    <Box flex={1} bg="$white">
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
          size="xl"
          onPress={() =>
            router.navigate({
              pathname: '/settings/configure-pin',
              params: { backTo: '/' },
            })
          }
        >
          <ButtonText>Set up my PIN</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
};

export default PinOnboarding;
