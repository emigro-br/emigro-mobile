import { NativeStackScreenProps } from '@react-navigation/native-stack';

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

import { getAssetIcon } from '@/utils/getAssetIcon';

import { AssetCode, AssetCodeToName } from '@constants/assetCode';

import { RootStackParamList } from '@navigation/index';

interface Item {
  id: string;
  avatarUrl: string;
  code: AssetCode;
  fullName: string;
}

type Props = NativeStackScreenProps<RootStackParamList, 'Transfers'>;

const Transfers = ({ navigation }: Props) => {
  const data: Item[] = [];
  const assets = Object.values(AssetCode);

  for (const asset of assets) {
    data.push({
      id: asset,
      avatarUrl: getAssetIcon(asset),
      code: asset,
      fullName: AssetCodeToName[asset],
    } as Item);
  }

  return (
    <Box h="$full">
      <Heading m="$3" size="xl">
        Send
      </Heading>
      <Card size="md" variant="filled" m="$3" bg="$white">
        <FlatList
          data={data}
          renderItem={({ item }: { item: Item }) => (
            <Pressable
              onPress={() =>
                navigation.push('SendAsset', {
                  asset: item.code,
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
    </Box>
  );
};

export default Transfers;
