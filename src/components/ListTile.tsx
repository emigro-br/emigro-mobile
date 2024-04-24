import { HStack, Text, VStack } from '@gluestack-ui/themed';

import { Spacer } from './Spacer';

type Props = {
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
};

export const ListTile = ({ title, subtitle, leading, trailing }: Props) => {
  return (
    <HStack space="md" alignItems="center">
      {leading}
      <VStack>
        <Text color="$coolGray800" fontWeight="500" $dark-color="$warmGray100">
          {title}
        </Text>
        {subtitle && (
          <Text size="sm" color="$coolGray500" $dark-color="$warmGray200">
            {subtitle}
          </Text>
        )}
      </VStack>
      <Spacer />
      {trailing}
    </HStack>
  );
};
