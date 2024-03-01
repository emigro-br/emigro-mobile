import React from 'react';

import { useNavigation } from '@react-navigation/native';

import { Box, Center, Image, Pressable } from '@gluestack-ui/themed';

import emigroLogo from '@assets/images/emigro-logo.png';

const Header: React.FC = () => {
  const navigation = useNavigation();

  return (
    <Box bg="$primary500" pt="$8" pb="$2">
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
