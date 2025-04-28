import React, { useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Animated } from 'react-native';
import Modal from 'react-native-modal';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export const ProfileSheet = ({ visible, onClose }: Props) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            delay: 500, // small pause before blinking again
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      fadeAnim.stopAnimation();
      fadeAnim.setValue(0);
    }
  }, [visible]);

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
        <View className="bg-background-0 rounded-t-3xl p-6 h-[93%]">

          {/* Header Close */}
          <HStack className="justify-between items-center mb-6">
            <Text className="text-xl font-bold text-white">PFP Challenge</Text>
            <TouchableOpacity onPress={onClose} className="w-10 h-10 bg-primary-500 rounded-full items-center justify-center">
              <Text className="text-white text-2xl">×</Text>
            </TouchableOpacity>
          </HStack>

          {/* Scrollable content */}
          <ScrollView>

            {/* Banner Image */}
            <Image
              source={require('@/assets/images/staking-banner.png')}
              style={{ width: '100%', height: 140, borderRadius: 20, marginBottom: 20 }}
            />

            {/* Description */}
            <Text className="text-white text-lg font-bold mb-2">
              Stake your NFTs!
            </Text>
            <Text className="text-white mb-6">
              Stake your NFTs to increase your season points and unlock more rewards.
            </Text>

            {/* NFT Slots Container with Padding */}
            <View className="px-6">
              <View className="flex-row justify-between mb-4">
                {/* First Circle with Blinking Image */}
                <View className="w-36 h-36 border-2 border-dashed border-primary-500 rounded-full items-center justify-center overflow-hidden">
                  <Animated.Image
                    source={require('@/assets/images/profile-temp.png')}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: 9999,
                      opacity: fadeAnim,
                    }}
                    resizeMode="cover"
                  />
                  {/* Plus sign underneath */}
                  <Text className="absolute text-primary-500 text-4xl">+</Text>
                </View>

                {/* Second Circle */}
                <View className="w-36 h-36 border-2 border-dashed border-primary-500 rounded-full items-center justify-center">
                  <Text className="text-primary-500 text-4xl">+</Text>
                </View>
              </View>

              <View className="flex-row justify-between mb-6">
                {/* Third Circle */}
                <View className="w-36 h-36 border-2 border-dashed border-primary-500 rounded-full items-center justify-center">
                  <Text className="text-primary-500 text-4xl">+</Text>
                </View>

                {/* Fourth Circle */}
                <View className="w-36 h-36 border-2 border-dashed border-primary-500 rounded-full items-center justify-center">
                  <Text className="text-primary-500 text-4xl">+</Text>
                </View>
              </View>
            </View>

            {/* Coming Soon Button */}
            <TouchableOpacity
              disabled
              className="bg-primary-500/40 py-4 rounded-full items-center"
            >
              <Text className="text-white font-bold text-lg">Coming soon</Text>
            </TouchableOpacity>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
