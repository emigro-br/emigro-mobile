import React from 'react';

import { Box } from '@gluestack-ui/themed';

import MapScreen from '../components/MapScreen';

const Location = () => {
  return (
    <Box flex={1} bg="$white">
      <MapScreen />
    </Box>
  );
};

export default Location;
