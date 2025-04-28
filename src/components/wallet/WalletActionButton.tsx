import React from 'react';
import { Pressable } from '@/components/ui/pressable';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

type Props = {
  label: string;
  icon: any;
  onPress: () => void;
};

export const WalletActionButton = ({ label, icon, onPress }: Props) => {
  return (
<Pressable
  onPress={onPress}
  className="rounded-xl w-20 h-16 items-center justify-center space-y-3"
  style={{
    backgroundColor: '#ff7189',
  }}
  onPressIn={() => {}}
>
  <Icon as={icon} size="lg" className="text-black" />
  <Text className="text-black text-base font-semibold">{label}</Text>
</Pressable>

  );
};
