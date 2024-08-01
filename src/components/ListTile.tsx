import React from 'react';
import { Pressable } from 'react-native';

import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type Props = {
  leading?: React.ReactNode;
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
  testID?: string;
};

export const ListTile = ({ leading, title, subtitle, trailing, onPress, testID }: Props) => {
  const renderTitle = () => {
    if (typeof title === 'string') {
      return (
        <Text size="lg" className="text-typography-800 font-medium">
          {title}
        </Text>
      );
    }
    return title;
  };

  const renderSubtitle = () => {
    if (!subtitle) {
      return null;
    }
    if (typeof subtitle === 'string') {
      return <Text className="text-typography-500">{subtitle}</Text>;
    }
    return <HStack>{subtitle}</HStack>; // HStack is workaround to avoid full width
  };

  return (
    <Pressable onPress={onPress} testID={testID}>
      <HStack className="justify-between items-center">
        <HStack space="md" className="items-center">
          {leading}
          <VStack space="xs">
            {renderTitle()}
            {renderSubtitle()}
          </VStack>
        </HStack>
        {trailing}
      </HStack>
    </Pressable>
  );
};
