import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNavigation } from '@react-navigation/native';

import { Box, Center, Image, Pressable } from '@gluestack-ui/themed';

import emigroLogo from '@assets/images/emigro-logo.png';

const Header: React.FC = () => {
  // https://reactnavigation.org/docs/handling-safe-area/
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  return (
    <Box bg="$primary500" style={{ paddingTop: insets.top }} pb="$2">
      <Center>
        <Pressable onPress={() => navigation.navigate('Wallet' as never)}>
          <Box w="$40" h="$12">
            <Image source={emigroLogo} w="$full" h="$full" alt="Emigro" />
          </Box>
        </Pressable>
      </Center>
    </Box>
  );
};

export default Header;
