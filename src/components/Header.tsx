import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useRouter } from 'expo-router';

import emigroLogo from '@/assets/images/emigro-logo.png';
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Image } from '@/components/ui/image';
import { Pressable } from '@/components/ui/pressable';

type Props = {
  leading?: JSX.Element;
  title?: JSX.Element;
  actions?: JSX.Element[];
};

export const EmigroHeader = (props: Props) => {
  const router = useRouter();
  return (
    <Header
      title={
        <Pressable onPress={() => router.navigate('/')}>
          <Box className="w-40 h-14">
            <Image source={emigroLogo} alt="Emigro" testID="emigro-logo" className="w-full h-full" />
          </Box>
        </Pressable>
      }
      {...props}
    />
  );
};

const Header = ({ title, leading, actions = [] }: Props) => {
  // https://reactnavigation.org/docs/handling-safe-area/
  const insets = useSafeAreaInsets();

  return (
    <HStack style={{ paddingTop: insets.top }} className="bg-primary-900 justify-between items-center pb-2">
      <Box testID="header-leading" className="basis-1/4">
        {leading}
      </Box>
      <Box testID="header-title" className="basis-1/2 items-center">
        {title}
      </Box>
      <Box testID="header-actions" className="basis-1/4 items-end">
        {actions.map((action, index) => (
          <HStack key={index}>{action}</HStack>
        ))}
      </Box>
    </HStack>
  );
};
