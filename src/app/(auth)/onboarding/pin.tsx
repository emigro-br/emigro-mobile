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

      <Box className="flex-1 bg-white">
        <VStack className="flex-1 px-4 py-16 justify-between border">
          <VStack space="lg">
            <Box testID="lock-icon" className="pt-12 pb-6">
              <Icon as={LockIcon} size="4xl" className="text-[red]" />
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
    </>
  );
};

export default PinOnboarding;
