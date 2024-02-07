import React from 'react';
import { Image, TouchableOpacity, View } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import { styled } from 'nativewind';

import emigroLogo from '@assets/images/emigro-logo.png';

const StyledView = styled(View);
const StyledImage = styled(Image);

const Header: React.FunctionComponent = () => {
  const navigation = useNavigation();

  return (
    <StyledView className="flex-row items-center justify-center bg-red pt-8">
      <TouchableOpacity onPress={() => navigation.navigate('Wallet' as never)}>
        <StyledView className="h-14 w-40">
          <StyledImage className="h-full w-full object-contain" source={emigroLogo} />
        </StyledView>
      </TouchableOpacity>
    </StyledView>
  );
};

export default Header;
