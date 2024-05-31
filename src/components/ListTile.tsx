import React from 'react';

import { HStack, Text, VStack } from '@gluestack-ui/themed';

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
        <Text color="$coolGray800" fontWeight="500" $dark-color="$warmGray100">
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
      return (
        <Text size="sm" color="$coolGray500" $dark-color="$warmGray200">
          {subtitle}
        </Text>
      );
    }
    return <HStack>{subtitle}</HStack>; // HStack is workaround to avoid full width
  };

  return (
    <HStack space="md" alignItems="center" testID={testID}>
      {leading}
      <VStack flex={1} space="xs">
        {renderTitle()}
        {renderSubtitle()}
      </VStack>
      {trailing}
    </HStack>
  );
};
