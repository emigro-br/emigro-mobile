import React from 'react';
import { StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { Box } from '@/components/ui/box';

const loadingLottie = require('@/assets/lotties/loading.json');

export const LoadingScreen = () => {
  return (
    <Box className="flex-1 bg-background-900 justify-center items-center">
      <LottieView
        source={loadingLottie}
        autoPlay
        loop
        style={styles.lottie}
        testID="loading-lottie"
      />
    </Box>
  );
};

const styles = StyleSheet.create({
  lottie: {
    width: 180,
    height: 180,
  },
});
