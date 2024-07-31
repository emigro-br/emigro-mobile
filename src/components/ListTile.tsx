import React from 'react';

import { HStack } from '@/components/ui/hstack';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type Props = {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  testID?: string;
};

export const ListTile = ({ title, subtitle, leading, trailing, testID }: Props) => {
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
    <HStack className="justify-between items-center" testID={testID}>
      <HStack space="md" className="items-center">
        {leading}
        <VStack space="xs">
          {renderTitle()}
          {renderSubtitle()}
        </VStack>
      </HStack>
      {trailing}
    </HStack>
  );
};
