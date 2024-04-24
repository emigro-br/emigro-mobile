import React from 'react';
import { DimensionValue } from 'react-native';

import { Button, ButtonIcon, Text, VStack } from '@gluestack-ui/themed';

type Props = {
  label?: string;
  icon: any;
  bg?: any;
  size?: 'sm' | 'md' | 'lg';
  textSize?: 'sm' | 'md' | 'lg';
  w?: DimensionValue;
  onPress: () => void;
};

export const CircularButton = ({ label, icon, onPress, bg = '$primary500', size = 'md', textSize, w }: Props) => {
  let radius: any = '$10';
  if (size === 'sm') {
    radius = '$8';
  } else if (size === 'lg') {
    radius = '$12';
  }

  const iconColor = bg === '$white' ? '$primary500' : '$white';

  return (
    <VStack alignItems="center" w={w}>
      <Button
        bg={bg}
        borderRadius="$full"
        size={size}
        marginBottom="$1"
        height={radius}
        width={radius}
        onPress={onPress}
      >
        <ButtonIcon as={icon} size="xl" color={iconColor} />
      </Button>
      {label && (
        <Text color={bg} size={textSize ?? size}>
          {label}
        </Text>
      )}
    </VStack>
  );
};
