import { Stack } from 'expo-router';

import { LoadingScreen } from '@/components/screens/Loading';
import { Box } from '@/components/ui/box';
import { Divider } from '@/components/ui/divider';
import { Text } from '@/components/ui/text';
import { View } from '@/components/ui/view';
import { VStack } from '@/components/ui/vstack';
import { sessionStore } from '@/stores/SessionStore';

export const PersonalInfo = () => {
  const profileInfo = sessionStore.profile;
  if (!profileInfo) {
    return <LoadingScreen />;
  }

  const fullName = `${profileInfo.given_name} ${profileInfo.family_name}`;

  return (
    <>
      <Stack.Screen options={{ title: 'Personal Info' }} />

      <Box className="flex-1 bg-white">
        <VStack space="lg" className="p-4">
          <View>
            <Text className="text-typography-500">Full Name</Text>
            <Text size="lg">{fullName}</Text>
          </View>

          <Divider />

          <View>
            <Text className="text-typography-500">Email</Text>
            <Text size="lg">{profileInfo.email}</Text>
          </View>

          <Divider />

          {profileInfo.address && (
            <>
              <View>
                <Text className="text-typography-500">Address</Text>
                <Text>{profileInfo.address}</Text>
              </View>

              <Divider />
            </>
          )}
        </VStack>
      </Box>
    </>
  );
};

export default PersonalInfo;
