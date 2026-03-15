import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';
import { Icons } from '../constants/Icons';

interface QuickActionButtonProps {
    label: string;
    iconName: any;
    iconFamily: 'Feather' | 'Ionicons' | 'MaterialIcons';
    onPress: () => void;
}

export const QuickActionButton: React.FC<QuickActionButtonProps> = ({
    label,
    iconName,
    iconFamily,
    onPress,
}) => {
    const IconComponent = Icons[iconFamily] as any;

    return (
        <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.iconContainer}>
                <IconComponent name={iconName} size={24} color={Colors.light.primary} />
            </View>
            <Text style={styles.label}>{label}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        width: 70,
    },
    iconContainer: {
        width: 64,
        height: 64,
        backgroundColor: '#F3F4F6', // Lighter grey close to white
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 12,
        color: Colors.light.text,
        textAlign: 'center',
    },
});
