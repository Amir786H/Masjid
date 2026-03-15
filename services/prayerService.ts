import axios from 'axios';

export interface PrayerTimings {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Maghrib: string;
    Isha: string;
}

export interface HijriDate {
    date: string;
    format: string;
    day: string;
    weekday: { en: string; ar: string };
    month: { number: number; en: string; ar: string };
    year: string;
}

export interface GregorianDate {
    date: string;
    format: string;
    day: string;
    weekday: { en: string };
    month: { number: number; en: string };
    year: string;
}

export interface PrayerData {
    timings: PrayerTimings;
    date: {
        readable: string;
        timestamp: string;
        hijri: HijriDate;
        gregorian: GregorianDate;
    };
}

export const fetchPrayerTimes = async (latitude: number, longitude: number): Promise<PrayerData> => {
    try {
        const response = await axios.get(
            `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`
        );
        return response.data.data;
    } catch (error) {
        console.error('Error fetching prayer times:', error);
        throw new Error('Could not fetch prayer times.');
    }
};
