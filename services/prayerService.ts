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

export interface CustomPrayerResponse {
    // timings: { [key: string]: string };
    timings: PrayerTimings;
    date: PrayerData['date'];
    // meta: any;
}
export interface NewCustomPrayerResponse {
    // timings: { [key: string]: string };
    timings: PrayerTimings;
    date: PrayerData['date'];
    // meta: any;
}

export const fetchPrayerTimes = async (latitude: number, longitude: number): Promise<PrayerData> => {
    // console.log(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`);
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


//For creating the static prayer timings for the masjid, 
// so that we can use it in the app without any internet connection.
// And also to create the date format for gregorian and hijri date format
export function getIslamicDate() {
    const now = new Date();

    // Gregorian
    const gregorianDay = String(now.getDate()).padStart(2, '0');
    const gregorianMonth = String(now.getMonth() + 1).padStart(2, '0');
    const gregorianYear = now.getFullYear();

    // Hijri
    const hijriFormatter = new Intl.DateTimeFormat(
        'en-TN-u-ca-islamic',
        {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            weekday: 'long',
        }
    );

    const hijriParts = hijriFormatter.formatToParts(now);

    const getPart = (type: string) =>
        hijriParts.find(part => part.type === type)?.value ?? '';

    const hijriDay = getPart('day');
    const hijriMonth = getPart('month');
    const hijriYear = getPart('year');
    const hijriWeekday = getPart('weekday');
    const hijriWeekdayAr = new Intl.DateTimeFormat('ar', {
        weekday: 'long',
        calendar: 'islamic',
    }).format(now);
    const hijriMonthNameEn = new Intl.DateTimeFormat('en-US', {
        month: 'long',
        calendar: 'islamic',
    }).format(now);
    const hijriMonthNameAr = new Intl.DateTimeFormat('ar', {
        month: 'long',
        calendar: 'islamic',
    }).format(now);

    return {
        date: {
            gregorian: {
                date: `${gregorianDay}-${gregorianMonth}-${gregorianYear}`,
                day: gregorianDay,
                designation: {
                    abbreviated: 'AD',
                    expanded: 'Anno Domini',
                },
                format: 'DD-MM-YYYY',
                month: {
                    number: Number(gregorianMonth),
                    en: now.toLocaleString('en-US', {
                        month: 'long',
                    }),
                },
                weekday: {
                    en: now.toLocaleString('en-US', {
                        weekday: 'long',
                    }),
                },
                year: String(gregorianYear),
            },

            hijri: {
                date: `${hijriDay}-${hijriMonth}-${hijriYear}`,
                day: hijriDay,
                designation: {
                    abbreviated: 'AH',
                    expanded: 'Anno Hegirae',
                },
                format: 'DD-MM-YYYY',
                month: {
                    number: Number(hijriMonth),
                    en: hijriMonthNameEn,
                    ar: hijriMonthNameAr,
                },
                weekday: {
                    en: hijriWeekday,
                    ar: hijriWeekdayAr,
                },
                year: hijriYear,
            },

            readable: now.toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            }),

            timestamp: Math.floor(now.getTime() / 1000).toString(),
        },
    };
}

// Latitude: 25.461583
// Longitude:  81.866327
// Address: Railway Colony, Prayagraj, Bakshi Bandh Road, Prayag, Allahabad-211002, Uttar Pradesh

export const OldfetchCustomPrayerResponse = async (latitude: number, longitude: number): Promise<CustomPrayerResponse> => {
    try {
        const response = await axios.get(`https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=2`);
        const data = response.data.data;

        const staticTimings: PrayerTimings = {
            Asr: "15:37",
            Dhuhr: "12:06",
            Fajr: "04:31",
            Isha: "19:42",
            Maghrib: "18:35",
            Sunrise: "05:37",
        };

        return {
            timings: staticTimings,
            date: data.date,
            // meta: data.meta
        };
    } catch (error) {
        console.error('Error fetching custom prayer response:', error);
        throw new Error('Could not fetch custom prayer response.');
    }
};


export const fetchCustomPrayerResponse = async (latitude: number, longitude: number): Promise<NewCustomPrayerResponse> => {
    const dateData = getIslamicDate();
    // console.log(dateData);
    
    try {
        const staticTimings: PrayerTimings = {
            Asr: "15:37",
            Dhuhr: "12:06",
            Fajr: "04:31",
            Isha: "19:42",
            Maghrib: "18:35",
            Sunrise: "05:37",
        };

        return {
            timings: staticTimings,
            date: dateData.date,
            // meta: data.meta
        };
    } catch (error) {
        console.error('Error fetching custom prayer response:', error);
        throw new Error('Could not fetch custom prayer response.');
    }
};

