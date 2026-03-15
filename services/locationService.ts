import * as Location from 'expo-location';

export const requestLocationPermissions = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
        throw new Error('Permission to access location was denied');
    }

    const location = await Location.getCurrentPositionAsync({});
    return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
    };
};

// Optionally, get the city/country name from coordinates
export const getGeocodeAddress = async (latitude: number, longitude: number) => {
    const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (geocode.length > 0) {
        const { city, country } = geocode[0];
        return `${city}, ${country}`;
    }
    return 'Unknown Location';
};
