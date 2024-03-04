import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  Avatar,
  AvatarImage,
  Box,
  Card,
  FlatList,
  HStack,
  Heading,
  Pressable,
  Text,
  VStack,
} from '@gluestack-ui/themed';

import { CryptoAsset } from '@/types/assets';

import { WalletStackParamList } from '@navigation/WalletStack';

import { AssetToName, iconFor } from '@utils/assets';

interface Item {
  id: string;
  avatarUrl: string;
  code: CryptoAsset;
  fullName: string;
}

type Props = {
  navigation: NativeStackNavigationProp<WalletStackParamList, 'TransfersRoot'>;
};

export const Transfers = ({ navigation }: Props) => {
  const data: Item[] = [];
  const assets = Object.values(CryptoAsset);

  for (const asset of assets) {
    data.push({
      id: asset,
      avatarUrl: iconFor(asset),
      code: asset,
      fullName: AssetToName[asset],
    } as Item);
  }

  return (
    <Box flex={1}>
      <VStack p="$4" space="lg">
        <Heading size="xl">Send money</Heading>
        <Card size="md" py="$1" variant="filled" bg="$white">
          <FlatList
            data={data}
            renderItem={({ item }: { item: Item }) => (
              <Pressable
                onPress={() =>
                  navigation.push('TransfersRoot', {
                    screen: 'SendAsset',
                    params: {
                      asset: item.code,
                    },
                  })
                }
              >
                <Box py="$4">
                  <HStack space="md">
                    <Avatar size="md" bg="$transparent">
                      <AvatarImage source={item.avatarUrl} alt={item.fullName} />
                    </Avatar>
                    <VStack>
                      <Text color="$coolGray800" fontWeight="500" $dark-color="$warmGray100">
                        {item.code}
                      </Text>
                      <Text size="sm" color="$coolGray500" $dark-color="$warmGray200">
                        {item.fullName}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              </Pressable>
            )}
            keyExtractor={(item: Item) => item.id}
          />
        </Card>
      </VStack>
    </Box>
  );
};

export default Transfers;
