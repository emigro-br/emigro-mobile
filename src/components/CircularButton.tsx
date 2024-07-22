import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { Button, ButtonIcon } from "@/components/ui/button";
import React from 'react';
import { DimensionValue } from 'react-native';

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
    <VStack className={` w-${w} items-center `}>
      <Button
        size={size}
        onPress={onPress}
        className={` width-${radius} height-${radius} bg-${bg} rounded-full mb-1 `}>
        <ButtonIcon as={icon} size="xl" className={` color-${iconColor} `} />
      </Button>
      {label && (
        <Text size={textSize ?? size} className={` color-${bg} `}>
          {label}
        </Text>
      )}
    </VStack>
  );
};
