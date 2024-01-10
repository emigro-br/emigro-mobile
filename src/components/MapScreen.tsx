import { styled } from 'nativewind';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { useVendor } from '@/contexts/VendorContext';

const StyledView = styled(View);

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
    <StyledView className="flex-1">
      <StyledView className="flex-1 align-middle justify-center">
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
      </StyledView>
    </StyledView>
  );
};

export default MapScreen;
