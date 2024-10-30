import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Stack, useRouter } from 'expo-router';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Center } from '@/components/ui/center';
import { Heading } from '@/components/ui/heading';
import { Icon, LockIcon } from '@/components/ui/icon';
import { VStack } from '@/components/ui/vstack';

export const LockScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <>
      <Stack.Screen options={{ headerShown: false, animation: 'fade' }} />

      <Box className="flex-1 bg-white" style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <VStack className="flex-1 px-8 justify-between" space="lg">
          <Center className="flex-1">
            <Box testID="lock-icon" className="pb-6">
              <Icon as={LockIcon} size="4xl" className="text-[red]" />
            </Box>
            <Heading size="2xl" className="text-center" testID="tagline">
              Emigro is Locked
            </Heading>
          </Center>
          <Button size="lg" onPress={() => router.replace('/unlock')} testID="unlock-button">
            <ButtonText>Unlock</ButtonText>
          </Button>
        </VStack>
      </Box>
    </>
  );
};

export default LockScreen;
