import * as Location from 'expo-location';
import * as Linking from 'expo-linking';

export const getCurrentLocation = async () => {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permissão de localização negada');
  }

  const location = await Location.getCurrentPositionAsync({});
  const [address] = await Location.reverseGeocodeAsync({
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  });

  return {
    lat: location.coords.latitude,
    lng: location.coords.longitude,
    address: address ? `${address.street || ''}, ${address.city || ''}`.trim() : undefined,
  };
};

export const geocodeAddress = async (address: string) => {
  const results = await Location.geocodeAsync(address);
  if (results.length === 0) {
    throw new Error('Endereço não encontrado');
  }

  return {
    lat: results[0].latitude,
    lng: results[0].longitude,
    address,
  };
};

export const openMaps = (lat: number, lng: number) => {
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  Linking.openURL(url);
};

export const openPhone = (phone: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  Linking.openURL(`tel:${cleanPhone}`);
};