import React from 'react';

import { Button, ButtonIcon } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type Props = {
  label?: string;
  icon: any;
  bg?: any;
  size?: 'sm' | 'md' | 'lg';
  textSize?: 'sm' | 'md' | 'lg';
  onPress: () => void;
  testID?: string;
};

export const CircularButton = ({ label, icon, onPress, bg = 'primary-500', size = 'md', textSize, testID }: Props) => {
  let radius = 12;
  if (size === 'sm') {
    radius = 10;
  } else if (size === 'lg') {
    radius = 16;
  }

  const iconColor = bg === 'white' ? 'primary-500' : 'white';

  return (
    <VStack className="items-center px-1" style={{ width: radius * 2 * 3 }} testID={testID}>
      <Button size={size} onPress={onPress} className={` w-${radius} h-${radius} bg-${bg} p-0 rounded-full mb-1 `}>
        <ButtonIcon as={icon} size="2xl" className={` text-${iconColor} data-[active=true]:text-${iconColor} `} />
      </Button>
      {label && (
        <Text size={textSize ?? size} className={`text-${bg} text-center`}>
          {label}
        </Text>
      )}
    </VStack>
  );
};
