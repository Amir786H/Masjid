import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

interface CommunityHighlightProps {
    imageUrl: string;
    date: string;
    title: string;
    description: string;
    onPress: () => void;
}

export const CommunityHighlight: React.FC<CommunityHighlightProps> = ({
    imageUrl,
    date,
    title,
    description,
    onPress,
}) => {
    return (
        <View style={styles.container}>
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />

            <View style={styles.content}>
                <View style={styles.tagRow}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>FEATURED</Text>
                    </View>
                    <Text style={styles.date}>{date}</Text>
                </View>

                <Text style={styles.title}>{title}</Text>
                <Text style={styles.description} numberOfLines={2}>{description}</Text>

                <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
                    <Text style={styles.buttonText}>Learn More & Register</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: Colors.light.cardBackground,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#F3F4F6', // Lighter grey border
    },
    image: {
        width: '100%',
        height: 180,
    },
    content: {
        padding: 16,
    },
    tagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    badge: {
        backgroundColor: Colors.light.lightGreen,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
    },
    badgeText: {
        color: Colors.light.primary,
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    date: {
        fontSize: 12,
        color: Colors.light.textSecondary,
        fontWeight: '500',
    },
    title: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.light.text,
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        lineHeight: 20,
        marginBottom: 16,
    },
    button: {
        backgroundColor: Colors.light.primary,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
    },
});
