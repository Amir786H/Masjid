import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../constants/Colors';
import { Icons } from '../constants/Icons';

interface NextPrayerCardProps {
    prayerName: string;
    countdown: string;
    gregorianDate: string;
    hijriDate: string;
}

const MosqueIllustration = () => (
    <Svg width="120" height="120" viewBox="0 0 100 100" style={styles.mosqueIllustration}>
        <Path
            d="M30 80 V50 Q30 30 50 15 Q70 30 70 50 V80 H30 Z M45 80 V60 H55 V80 H45 Z M10 80 V40 Q10 35 15 35 Q20 35 20 40 V80 H10 Z M80 80 V40 Q80 35 85 35 Q90 35 90 40 V80 H80 Z"
            fill="#C1E1C5" // Soft faded green for background illustration
            opacity="0.5"
        />
    </Svg>
);

export const NextPrayerCard: React.FC<NextPrayerCardProps> = ({
    prayerName,
    countdown,
    gregorianDate,
    hijriDate,
}) => {
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Icons.Ionicons name="time" size={16} color={Colors.light.primary} />
                <Text style={styles.subTitle}>NEXT PRAYER</Text>
            </View>

            <Text style={styles.timeRow}>
                <Text style={styles.prayerName}>{prayerName}</Text>
                <Text style={styles.inText}> in </Text>
                <Text style={styles.countdown}>{countdown}</Text>
            </Text>

            <Text style={styles.dateRow}>
                {gregorianDate} • {hijriDate}
            </Text>

            <MosqueIllustration />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.light.lightGreen,
        borderRadius: 16,
        padding: 24,
        overflow: 'hidden',
        position: 'relative',
        marginVertical: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    subTitle: {
        color: Colors.light.primary,
        fontWeight: '700',
        fontSize: 12,
        marginLeft: 6,
        letterSpacing: 0.5,
    },
    timeRow: {
        marginBottom: 8,
        zIndex: 1, // Stay above illustration
    },
    prayerName: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.light.text,
    },
    inText: {
        fontSize: 28,
        color: Colors.light.text,
        fontWeight: '400',
    },
    countdown: {
        fontSize: 28,
        fontWeight: '700',
        color: Colors.light.primary,
    },
    dateRow: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        zIndex: 1,
    },
    mosqueIllustration: {
        position: 'absolute',
        bottom: -10,
        right: -10,
        opacity: 0.4,
    },
});
