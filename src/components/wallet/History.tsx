import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Modal from 'react-native-modal';
import { HStack } from '@/components/ui/hstack';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export const History = ({ visible, onClose }: Props) => {
  return (
    <Modal
      isVisible={visible}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      animationInTiming={400}
      animationOutTiming={400}
      backdropOpacity={0.6}
      onBackdropPress={onClose}
      onBackButtonPress={onClose}
      style={{ justifyContent: 'flex-end', margin: 0 }}
    >
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-background-0 rounded-t-3xl p-6 h-[90%]">

          {/* Header Close */}
          <HStack className="justify-between items-center mb-6">
            <Text className="text-xl font-bold text-white">Payment History</Text>
            <TouchableOpacity onPress={onClose} className="w-10 h-10 bg-primary-500 rounded-full items-center justify-center">
              <Text className="text-white text-2xl">×</Text>
            </TouchableOpacity>
          </HStack>

          {/* Scrollable Content */}
          <ScrollView>
            {/* Empty State */}
            <Text className="text-center text-white mt-20 text-lg">
              Coming soon!
            </Text>
          </ScrollView>

        </View>
      </View>
    </Modal>
  );
};
