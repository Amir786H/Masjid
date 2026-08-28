import { useEffect, useState } from 'react';
import { getGeocodeAddress } from '../services/locationService';
import { CACHE_KEYS, cacheData, getCachedData } from '../services/offlineService';
import { fetchCustomPrayerResponse, PrayerData } from '../services/prayerService';

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
                // const coords = await requestLocationPermissions();
                const coords = { latitude: 25.461583, longitude: 81.866327 }; // Railway Colony, Prayagraj, Bakshi Bandh Road, Prayag, Allahabad-211002, Uttar Pradesh
                const cacheKey = `${CACHE_KEYS.prayerTimes}:${coords.latitude}:${coords.longitude}`;
                const cached = await getCachedData<PrayerData>(cacheKey);
                
                if (cached) {
                    setData(cached);
                }

                // 2. Get readable address
                try {
                    const addr = await getGeocodeAddress(coords.latitude, coords.longitude);
                    // console.log('Resolved address:', addr);
                    setAddress(addr);
                } catch (addressError) {
                    console.warn('Failed to resolve address, falling back to previous value.', addressError);
                }

                // 3. Fetch Prayer Times
                try {
                    // const prayerData = await fetchPrayerTimes(coords.latitude, coords.longitude);  // LOCATION BASED PRAYER TIMES
                    const prayerData = await fetchCustomPrayerResponse(coords.latitude, coords.longitude); // LOCATION BASED PRAYER TIMES, WHERE TIMINGS ARE IN OBJECT FORMAT, NOT STRING FORMAT & STATIC
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
