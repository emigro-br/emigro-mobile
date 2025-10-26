import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, View, Text, Image, useColorScheme, Animated, Dimensions, Linking } from 'react-native';
import { VStack } from '@/components/ui/vstack';
import { HStack } from '@/components/ui/hstack';
import { ScrollView } from '@/components/ui/scroll-view';
import { Pressable } from '@/components/ui/pressable';
import { Card } from '@/components/ui/card';
import { observer } from 'mobx-react-lite';
import { announcementStore } from '@/stores/AnnouncementStore';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_PADDING = 32;
const CARD_WIDTH = SCREEN_WIDTH - CARD_PADDING;
const CARD_HEIGHT = 120;

export const AnnouncementScroll = observer(() => {
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef<Animated.ScrollView>(null);
  const currentIndex = useRef(0);

  const cards = useMemo(() => announcementStore.announcements, [announcementStore.announcements]);

  // Auto-scroll effect
  useEffect(() => {
    if (!cards.length) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        currentIndex.current = (currentIndex.current + 1) % cards.length;
        scrollRef.current.scrollTo({ x: currentIndex.current * (CARD_WIDTH + 16), animated: true });
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [cards.length]);

  if (!cards.length) return null;

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
          <Pressable
            key={card.id}
            onPress={() => {
              if (card.deepLinkUrl) Linking.openURL(card.deepLinkUrl).catch(() => {});
              else setModalIndex(index);
            }}
          >
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
                className="relative flex-row overflow-hidden rounded-2xl"
                style={{
                  height: CARD_HEIGHT,
                  backgroundColor: isDarkMode ? '#fafdf3' : '#fafdf3',
                }}
              >
                {/* Close (absolute, top-right) */}
				<Pressable
				  onPress={() => announcementStore.close(card.id)}
				  className="absolute top-2 right-2 w-7 h-7 rounded-full items-center justify-center"
				  style={{ backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 1 }}
				  hitSlop={8}
				>
				  <Text className="text-white text-base">×</Text>
				</Pressable>


                {/* Left Text */}
                <VStack className="flex-1 p-4 justify-center">
                  <Text className={`${isDarkMode ? 'text-black' : 'text-black'} font-bold text-lg pr-2`}>
                    {card.title}
                  </Text>

                  {!!card.description && (
                    <Text className={`${isDarkMode ? 'text-black' : 'text-black'} text-sm mt-1`} numberOfLines={2}>
                      {card.description}
                    </Text>
                  )}
                </VStack>

                {/* Right Image */}
                <View className="w-24 h-full overflow-hidden">
                  {card.imageUrl ? (
                    <Image
                      source={{ uri: card.imageUrl }}
                      style={{ width: '100%', height: '100%', borderRadius: 15 }}
                      resizeMode="cover"
                    />
                  ) : null}
                </View>
              </Card>
            </Animated.View>
          </Pressable>
        ))}
      </Animated.ScrollView>

      {/* Modal fallback for cards without deep link */}
      <Modal
        visible={modalIndex !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setModalIndex(null)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="bg-background-0 rounded-t-3xl p-6 h-[70%]">
            <HStack className="justify-between items-center mb-6">
              <Text className="text-xl font-bold text-white">Announcement</Text>
              <Pressable
                onPress={() => setModalIndex(null)}
                className="w-10 h-10 bg-primary-500 rounded-full items-center justify-center"
              >
                <Text className="text-white text-2xl">×</Text>
              </Pressable>
            </HStack>

            <ScrollView>
              <Text className="text-white text-base">
                {modalIndex !== null && (cards[modalIndex]?.description || cards[modalIndex]?.title)}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
});
