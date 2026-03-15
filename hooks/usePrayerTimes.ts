import { useEffect, useState } from 'react';
import { getGeocodeAddress, requestLocationPermissions } from '../services/locationService';
import { fetchPrayerTimes, PrayerData } from '../services/prayerService';

export const usePrayerTimes = () => {
    const [data, setData] = useState<PrayerData | null>(null);
    const [address, setAddress] = useState<string>('Locating...');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                setLoading(true);
                // 1. Get location
                const coords = await requestLocationPermissions();

                // 2. Get readable address
                const addr = await getGeocodeAddress(coords.latitude, coords.longitude);
                setAddress(addr);

                // 3. Fetch Prayer Times
                const prayerData = await fetchPrayerTimes(coords.latitude, coords.longitude);
                setData(prayerData);
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
