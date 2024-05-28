import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Box, Center, Image, Pressable } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';

import emigroLogo from '@/assets/images/emigro-logo.png';

const Header: React.FC = () => {
  // https://reactnavigation.org/docs/handling-safe-area/
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <Box bg="$primary500" style={{ paddingTop: insets.top }} pb="$2">
      <Center>
        <Pressable onPress={() => router.navigate('/')}>
          <Box w="$40" h="$12">
            <Image source={emigroLogo} w="$full" h="$full" alt="Emigro" testID="logo" />
          </Box>
        </Pressable>
      </Center>
    </Box>
  );
};

export default Header;
