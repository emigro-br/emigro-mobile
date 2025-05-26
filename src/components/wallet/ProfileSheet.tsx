import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  Clipboard,
} from 'react-native';
import Modal from 'react-native-modal';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { sessionStore } from '@/stores/SessionStore';
import { useChainStore } from '@/stores/ChainStore';
import { chainIconMap } from '@/utils/chainIconMap';
import { Copy } from 'lucide-react-native';
import { showToast } from '@/components/ui/toast';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export const ProfileSheet = ({ visible, onClose }: Props) => {
  const wallets = sessionStore.user?.wallets ?? [];
  const chains = useChainStore.getState().chains;

  const copyToClipboard = (address: string) => {
    Clipboard.setString(address);
    Alert.alert('Copied', 'Wallet address copied to clipboard');
  };

  const formatAddress = (addr: string) =>
    `${addr.slice(0, 6)}...${addr.slice(-6)}`;

  return (
    <Modal
      isVisible={visible}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.6}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={{ justifyContent: 'flex-end', margin: 0 }}
    >
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-background-0 rounded-t-3xl px-6 pt-6 pb-10 h-[93%]">
          {/* Header */}
          <HStack className="justify-between items-center mb-6">
            <Text className="text-xl font-bold text-white"></Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-10 h-10 bg-primary-500 rounded-full items-center justify-center"
            >
              <Text className="text-white text-2xl">×</Text>
            </TouchableOpacity>
          </HStack>

          {/* Centered Profile Picture */}
          <View className="items-center mb-8">
            <Image
              source={require('@/assets/images/profile-temp.png')}
              style={{
                width: 120,
                height: 120,
                borderRadius: 60,
                borderWidth: 2,
                borderColor: '#fe0055',
              }}
            />
          </View>

          {/* Wallet addresses with chain icon */}
          <VStack space="md">
            {wallets.map((wallet) => {
              const chain = chains.find((c) => c.id === wallet.chainId);
              const iconKey = chain?.iconUrl ?? '';
              const icon = chainIconMap[iconKey];

              console.log(`[ProfileSheet] chain.iconUrl: ${iconKey}, icon found: ${!!icon}`);

              return (
                <HStack
                  key={wallet.id}
                  className="bg-background-900 px-4 py-3 rounded-xl items-center justify-between"
                >
                  <HStack space="sm" alignItems="center">
                    {icon ? (
                      <Image
                        source={icon}
                        style={{ width: 24, height: 24, marginRight: 8 }}
                      />
                    ) : (
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          marginRight: 8,
                          borderRadius: 12,
                          backgroundColor: '#888',
                        }}
                      />
                    )}
                    <Text className="text-white font-medium text-sm">
                      {formatAddress(wallet.publicAddress)}
                    </Text>
                  </HStack>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(wallet.publicAddress)}
                  >
                    <Copy size={18} color="#fff" />
                  </TouchableOpacity>
                </HStack>
              );
            })}
          </VStack>

          {/* Manage chains */}
          <TouchableOpacity
            onPress={() => Alert.alert('Coming soon')}
            className="mt-6 bg-primary-500/20 py-4 rounded-full items-center"
          >
            <Text className="text-white font-bold text-lg">Manage chains</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
