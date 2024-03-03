import React, { useEffect, useState } from 'react';
import MapView, { Marker } from 'react-native-maps';

import { Box, Center } from '@gluestack-ui/themed';

import { useVendor } from '@/contexts/VendorContext';

const MapScreen: React.FunctionComponent = () => {
  const { scannedVendor } = useVendor();

  const [region, setRegion] = useState({
    latitude: 33.640411,
    longitude: -84.419853,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [address, setAddress] = useState<string | undefined>();

  const geocodeBaseURL = process.env.EXPO_PUBLIC_GEOCODE_BASE_URL;

  useEffect(() => {
    if (scannedVendor && scannedVendor.address !== address) {
      const scannedData = scannedVendor;
      setAddress(scannedData.address);
      fetchGeocodeAddress(scannedData.address);
    }
  }, []);

  const fetchGeocodeAddress = async (address: string) => {
    try {
      const response = await fetch(
        `${geocodeBaseURL}/?q=${encodeURIComponent(address)}&format=json&addressdetails=1&limit=1`,
      );
      const geocodedLocation = await response.json();
      if (geocodedLocation.length > 0) {
        const { lat, lon } = geocodedLocation[0];
        setRegion((prevRegion) => ({
          ...prevRegion,
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
        }));
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box flex={1} justifyContent="center" bg="$white">
      <Center>
        <MapView
          region={{
            latitude: region.latitude,
            longitude: region.longitude,
            latitudeDelta: region.latitudeDelta,
            longitudeDelta: region.longitudeDelta,
          }}
          style={{ width: 450, height: 300 }}
        >
          <Marker coordinate={{ latitude: region.latitude, longitude: region.longitude }} />
        </MapView>
      </Center>
    </Box>
  );
};

export default MapScreen;
