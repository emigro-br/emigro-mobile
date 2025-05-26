import { Stack, useRouter } from 'expo-router';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Icon, LockIcon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

export const PinOnboarding = () => {
  const router = useRouter();
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <Box className="flex-1 bg-black">
        <VStack className="flex-1 px-6 py-16 justify-between">
          <VStack space="lg">
            <Box testID="lock-icon" className="pt-12 pb-6 items-center">
              <Icon as={LockIcon} size="4xl" className="text-primary-500" />
            </Box>
            <Heading className="text-white text-center">Set up your mobile PIN</Heading>
            <Text className="text-white text-center">
              Protect your account with a PIN code. Your PIN is a 4-digit code that you will use to access your account
              and confirm your transactions.
            </Text>
          </VStack>

          <Button
            size="xl"
            className="rounded-full bg-primary-500"
            onPress={() =>
              router.replace({
                pathname: '/settings/configure-pin',
                params: { backTo: '/wallet' },
              })
            }
          >
            <ButtonText className="text-white font-bold text-lg">Set up my PIN</ButtonText>
          </Button>
        </VStack>
      </Box>
    </>
  );
};

export default PinOnboarding;
