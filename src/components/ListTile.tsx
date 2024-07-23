import { VStack } from "@/components/ui/vstack";
import { Text } from "@/components/ui/text";
import { HStack } from "@/components/ui/hstack";
import React from 'react';

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
        <Text className="text-typography-800 font-[500] dark:text-typography-100">
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
        <Text size="sm" className="text-typography-500 dark:text-typography-200">
          {subtitle}
        </Text>
      );
    }
    return <HStack>{subtitle}</HStack>; // HStack is workaround to avoid full width
  };

  return (
    <HStack space="md" testID={testID} className="items-center">
      {leading}
      <VStack space="xs" className="flex-1">
        {renderTitle()}
        {renderSubtitle()}
      </VStack>
      {trailing}
    </HStack>
  );
};
