import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { Icons } from '../constants/Icons';

interface PrayerCardProps {
    name: string;
    time: string;
    isActive: boolean;
    iconName?: any;
}

export const PrayerCard: React.FC<PrayerCardProps> = ({ name, time, isActive, iconName }) => {
    return (
        <View style={[styles.container, isActive && styles.activeContainer]}>
            <View style={styles.header}>
                <Text style={[styles.name, isActive && styles.activeText]}>{name.toUpperCase()}</Text>
                <Icons.Ionicons
                    name={iconName || 'notifications'}
                    size={16}
                    color={isActive ? Colors.light.primary : Colors.light.textSecondary}
                />
            </View>
            <Text style={[styles.time, isActive && styles.activeText]}>{time}</Text>

            {isActive && (
                <Text style={styles.viewMonthly}>VIEW MONTHLY</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.light.cardBackground,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
        flex: 1,
        marginHorizontal: 8,
    },
    activeContainer: {
        backgroundColor: Colors.light.lightGreen,
        borderColor: Colors.light.primary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    name: {
        fontSize: 12,
        fontWeight: '600',
        color: Colors.light.textSecondary,
        letterSpacing: 0.5,
    },
    time: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.light.text,
    },
    activeText: {
        color: Colors.light.text, // Could be primary if specified, but screenshot shows dark text
    },
    viewMonthly: {
        position: 'absolute',
        top: -10, // Try to replicate the overlapping view monthly if needed
        right: 16,
        fontSize: 10,
        color: Colors.light.primary,
        fontWeight: '600',
        opacity: 0, // Hiding this for now, placing it at section header is better
    }
});
