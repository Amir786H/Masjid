import { useEffect, useState } from 'react';
import { PrayerTimings } from '../services/prayerService';

export interface NextPrayerInfo {
    name: string;
    timeRemaining: string; // MM:SS format or HH:MM:SS
    isNext: boolean;
}

const parseTime = (timeStr: string) => {
    // timeStr is usually "HH:mm" in 24h format
    const [hours, minutes] = timeStr.split(':').map(Number);
    const now = new Date();
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0);
    return date.getTime();
};

export const useCountdown = (timings: PrayerTimings | undefined) => {
    const [nextPrayer, setNextPrayer] = useState<{ name: string; time: number } | null>(null);
    const [countdown, setCountdown] = useState<string>('00:00');

    useEffect(() => {
        if (!timings) return;

        const calculateNextPrayer = () => {
            const now = new Date().getTime();
            const prayers = [
                { name: 'Fajr', time: parseTime(timings.Fajr) },
                { name: 'Sunrise', time: parseTime(timings.Sunrise) },
                { name: 'Dhuhr', time: parseTime(timings.Dhuhr) },
                { name: 'Asr', time: parseTime(timings.Asr) },
                { name: 'Maghrib', time: parseTime(timings.Maghrib) },
                { name: 'Isha', time: parseTime(timings.Isha) },
            ];

            // Find the first prayer whose time is strictly after 'now'
            let next = prayers.find((p) => p.time > now);

            if (!next) {
                // If no prayer left today, next is tomorrow's Fajr (add 24h to Fajr)
                next = { name: 'Fajr', time: prayers[0].time + 24 * 60 * 60 * 1000 };
            }

            setNextPrayer(next);
            return next;
        };

        const nextP = calculateNextPrayer();

        // Timer interval
        const interval = setInterval(() => {
            if (!nextP) return;
            const now = new Date().getTime();
            const diff = nextP.time - now;

            if (diff <= 0) {
                // Time is up, recalculate next prayer
                calculateNextPrayer();
                return;
            }

            // Convert diff to HH:MM:SS
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            const hZero = hours < 10 ? `0${hours}` : hours;
            const mZero = minutes < 10 ? `0${minutes}` : minutes;
            const sZero = seconds < 10 ? `0${seconds}` : seconds;

            if (hours > 0) {
                setCountdown(`${hZero}:${mZero}:${sZero}`);
            } else {
                setCountdown(`${mZero}:${sZero}`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [timings]);

    return { nextPrayerName: nextPrayer?.name, countdown };
};
