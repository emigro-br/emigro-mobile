import React, { useState, useEffect, useRef } from 'react';
import { Modal, View, Text, Image, useColorScheme, Animated, Dimensions } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { ScrollView } from '@/components/ui/scroll-view';
import { Pressable } from '@/components/ui/pressable';
import { Card } from '@/components/ui/card';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_PADDING = 32;
const CARD_WIDTH = SCREEN_WIDTH - CARD_PADDING;
const CARD_HEIGHT = 120;

export const AnnouncementScroll = () => {
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<Animated.ScrollView>(null);
  const currentIndex = useRef(0);

  const cards = [
    {
      title: 'Make a Pix payment using crypto',
      description: 'Top-up your wallet and make your Pix payment using crypto',
      image: require('@/assets/images/pix-green.png'),
    },
    {
      title: 'Onramp with Coinbase',
      description: 'Deposit assets in your Emigro wallet using Coinbase',
      image: require('@/assets/images/coinbase.png'),
    },
  ];

  // Auto-scroll effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        currentIndex.current = (currentIndex.current + 1) % cards.length;
        scrollRef.current.scrollTo({ x: currentIndex.current * (CARD_WIDTH + 16), animated: true });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [cards.length]);

  return (
    <>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        className="pb-4"
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
      >
        {cards.map((card, index) => (
          
		  <Pressable key={index}>
            <Animated.View
style={{
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
  marginRight: index === cards.length - 1 ? 0 : 16,
  transform: [
    {
      scale: scrollX.interpolate({
        inputRange: [
          (index - 1) * (CARD_WIDTH + 16),
          index * (CARD_WIDTH + 16),
          (index + 1) * (CARD_WIDTH + 16),
        ],
        outputRange: [0.95, 1, 0.95],
        extrapolate: 'clamp',
      }),
    },
  ],
}}
            >
<Card
  className={`flex-row overflow-hidden rounded-2xl`}
  style={{
    height: CARD_HEIGHT,
    backgroundColor: isDarkMode ? '#fafdf3' : '#fafdf3',
  }}
>
                {/* Left Text */}
                <VStack className="flex-1 p-4 justify-center">
                  <Text
                    className={`${isDarkMode ? 'text-white' : 'text-black'} font-bold text-lg`}
                  >
                    {card.title}
                  </Text>
                  <Text
                    className={`${isDarkMode ? 'text-white' : 'text-black'} text-sm mt-1`}
                  >
                    {card.description}
                  </Text>
                </VStack>

                {/* Right Image */}
                <View className="w-24 h-full overflow-hidden">
                  <Image
                    source={card.image}
                    style={{ width: '100%', height: '100%', borderRadius: 15 }}
                    resizeMode="cover"
                  />
                </View>
              </Card>
            </Animated.View>
          </Pressable>
        ))}
      </Animated.ScrollView>

      {/* Modal */}
      <Modal
        visible={modalIndex !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setModalIndex(null)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-background-0 rounded-t-3xl p-6 h-[70%]">
            <HStack className="justify-between items-center mb-6">
              <Text className="text-xl font-bold text-white">Announcement Details</Text>
              <Pressable
                onPress={() => setModalIndex(null)}
                className="w-10 h-10 bg-primary-500 rounded-full items-center justify-center"
              >
                <Text className="text-white text-2xl">×</Text>
              </Pressable>
            </HStack>

            <ScrollView>
              <Text className="text-white text-base">
                {modalIndex !== null && cards[modalIndex].description}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};
