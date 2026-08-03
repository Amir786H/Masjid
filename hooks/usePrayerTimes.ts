import { useEffect, useState } from 'react';
import { getGeocodeAddress, requestLocationPermissions } from '../services/locationService';
import { fetchPrayerTimes, PrayerData } from '../services/prayerService';
import { cacheData, getCachedData, CACHE_KEYS } from '../services/offlineService';

export const usePrayerTimes = () => {
    const [data, setData] = useState<PrayerData | null>(null);
    const [address, setAddress] = useState<string>('Locating...');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    //HAVE TO SYNC ALL THE LOGIC TO THE OFFLINE SUPPORT AS WELL FOR
    //INTERNET CONNECTVITY or NO INTERNET SERVICE AVAILABLE ALSO.
    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                // 1. Get location
                const coords = await requestLocationPermissions();
                const cacheKey = `${CACHE_KEYS.prayerTimes}:${coords.latitude}:${coords.longitude}`;
                const cached = await getCachedData<PrayerData>(cacheKey);
                if (cached) {
                    setData(cached);
                }

                // 2. Get readable address
                try {
                    const addr = await getGeocodeAddress(coords.latitude, coords.longitude);
                    setAddress(addr);
                } catch (addressError) {
                    console.warn('Failed to resolve address, falling back to previous value.', addressError);
                }

                // 3. Fetch Prayer Times
                try {
                    const prayerData = await fetchPrayerTimes(coords.latitude, coords.longitude);
                    setData(prayerData);
                    await cacheData(cacheKey, prayerData);
                } catch (error: any) {
                    if (!cached) {
                        throw error;
                    }
                    console.warn('Unable to refresh prayer times, using cached values.', error);
                }
            } catch (err: any) {
                setError(err.message || 'Failed to load prayer times');
            } finally {
                setLoading(false);
            }
        };

        init();
    }, []);

    return { data, address, loading, error };
};
