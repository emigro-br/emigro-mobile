import React, { useEffect, useState } from 'react';
import { Button, TextInput, View } from 'react-native';
import MapView from 'react-native-maps';

const MapScreen = ({ route }: any) => {
  const [region, setRegion] = useState({
    latitude: -32.24066,
    longitude: -58.166874,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [address, setAddress] = useState('');

  const { scannedData } = route.params;

  console.log(scannedData);
  console.log(address, 'addres input');
  console.log(region, 'region');

  /*  const geocodeAddress = async (address: any) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`,
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
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

  useEffect(() => {
    if (route.params && route.params.scannedData && route.params.scannedData.address) {
      geocodeAddress(route.params.scannedData.address);
    }
  }, [route.params]); */

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        {region && (
          <MapView
            initialRegion={{
              latitude: region.latitude,
              longitude: region.longitude,
              latitudeDelta: region.latitudeDelta,
              longitudeDelta: region.longitudeDelta,
            }}
            style={{ width: 450, height: 300 }}
          />
        )}
      </View>
    </View>
  );
};

export default MapScreen;
