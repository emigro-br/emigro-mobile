import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRouter } from 'expo-router';

import emigroLogo from '@/assets/images/emigro-logo.png';
import { Box } from '@/components/ui/box';
import { Center } from '@/components/ui/center';
import { Image } from '@/components/ui/image';
import { Pressable } from '@/components/ui/pressable';

const Header: React.FC = () => {
  // https://reactnavigation.org/docs/handling-safe-area/
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <Box style={{ paddingTop: insets.top }} className="bg-primary-500 pb-2">
      <Center>
        <Pressable onPress={() => router.navigate('/')}>
          <Box className="w-40 h-12">
            <Image source={emigroLogo} alt="Emigro" testID="logo" className="w-full h-full" />
          </Box>
        </Pressable>
      </Center>
    </Box>
  );
};

export default Header;
