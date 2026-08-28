import { useAuthContext } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef } from 'react';
import {
    ActivityIndicator,
    Animated,
    Easing,
    ScrollView,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { useTabBarScroll } from '../hooks/useTabBarVisibility';

type DonationEntry = {
    id: string;
    donorName: string;
    donorEmail: string;
    userId: string;
    amount: number;
    donatedAt: string;
    note?: string;
};

const donationSeedData: DonationEntry[] = [
    {
        id: '1',
        donorName: 'Amina Yusuf',
        donorEmail: 'amina@example.com',
        userId: 'user-01',
        amount: 150,
        donatedAt: '2026-07-18T10:15:00Z',
        note: 'General support',
    },
    {
        id: '2',
        donorName: 'Omar Hassan',
        donorEmail: 'omar@example.com',
        userId: 'user-02',
        amount: 300,
        donatedAt: '2026-07-24T16:40:00Z',
        note: 'Friday program',
    },
    {
        id: '3',
        donorName: 'Admin Team',
        donorEmail: 'admin@example.com',
        userId: 'admin-01',
        amount: 500,
        donatedAt: '2026-08-01T09:05:00Z',
        note: 'Masjid maintenance',
    },
    {
        id: '4',
        donorName: 'Amina Yusuf',
        donorEmail: 'amina@example.com',
        userId: 'user-01',
        amount: 75,
        donatedAt: '2026-08-04T08:00:00Z',
        note: 'Community meal',
    },
];

const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
});

const formatDate = (value: string) =>
    new Date(value).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });

const AnimatedSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(16)).current;

    useEffect(() => {
        const animation = Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration: 500,
                delay,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration: 500,
                delay,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
        ]);

        animation.start();
    }, [delay, opacity, translateY]);

    return (
        <Animated.View style={{ opacity, transform: [{ translateY }] }}>
            {children}
        </Animated.View>
    );
};

export default function DonationScreen() {
    const { user, loading } = useAuthContext();
    const { width } = useWindowDimensions();
    const isWide = width >= 700;

    const rawRole = `${user?.user_metadata?.role ?? user?.app_metadata?.role ?? ''}`.toLowerCase();
    const isAdmin = rawRole === 'admin' || user?.email?.toLowerCase().includes('admin') || false;
    const onScroll = useTabBarScroll();

    const visibleDonations = useMemo(() => {
        if (isAdmin) {
            return donationSeedData;
        }

        return donationSeedData.filter(
            (entry) => entry.userId === user?.id || entry.donorEmail === user?.email,
        );
    }, [isAdmin, user?.email, user?.id]);

    const totalDonated = useMemo(
        () => visibleDonations.reduce((sum, entry) => sum + entry.amount, 0),
        [visibleDonations],
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
                <Text style={styles.loadingText}>Preparing donation view...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} onScroll={onScroll} scrollEventThrottle={16}>
            <LinearGradient
                colors={['#F5FFF7', '#FFFFFF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroGradient}
            />

            <AnimatedSection delay={80}>
                <View style={[styles.heroCard, isWide && styles.heroCardWide]}>
                    <View style={styles.heroInfo}>
                        <View style={styles.badge}>
                            <Ionicons name="heart-outline" size={16} color={Colors.light.primary} />
                            <Text style={styles.badgeText}>{isAdmin ? 'Admin overview' : 'Member contribution'}</Text>
                        </View>
                        <Text style={styles.title}>Donation Center</Text>
                        <Text style={styles.subtitle}>
                            {isAdmin
                                ? 'Track the latest donations, total collected, and recent payment history.'
                                : 'Review your contribution history and keep an eye on your support for the mosque.'}
                        </Text>
                    </View>
                    <View style={styles.heroValueBox}>
                        <Text style={styles.heroValueLabel}>{isAdmin ? 'Total collected' : 'Your total'}</Text>
                        <Text style={styles.heroValue}>{currencyFormatter.format(totalDonated)}</Text>
                    </View>
                </View>
            </AnimatedSection>

            <AnimatedSection delay={180}>
                <View style={[styles.summaryCard, isWide && styles.summaryCardWide]}>
                    <View style={styles.summaryItem}>
                        <Ionicons name="cash-outline" size={20} color={Colors.light.primary} />
                        <View style={styles.summaryTextWrap}>
                            <Text style={styles.summaryLabel}>{isAdmin ? 'Collected this month' : 'Your donations'}</Text>
                            <Text style={styles.summaryValue}>{currencyFormatter.format(totalDonated)}</Text>
                        </View>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                        <Ionicons name="time-outline" size={20} color={Colors.light.primary} />
                        <View style={styles.summaryTextWrap}>
                            <Text style={styles.summaryLabel}>Latest update</Text>
                            <Text style={styles.summaryValue}>{visibleDonations[0] ? formatDate(visibleDonations[0].donatedAt) : 'No donations yet'}</Text>
                        </View>
                    </View>
                </View>
            </AnimatedSection>

            <AnimatedSection delay={280}>
                <View style={styles.listCard}>
                    <View style={styles.listHeader}>
                        <Text style={styles.listTitle}>{isAdmin ? 'Recent donations' : 'Your donation history'}</Text>
                        <Text style={styles.listCount}>{visibleDonations.length} entries</Text>
                    </View>

                    {visibleDonations.length === 0 ? (
                        <View style={styles.emptyState}>
                            <Ionicons name="receipt-outline" size={32} color={Colors.light.textSecondary} />
                            <Text style={styles.emptyTitle}>No donations recorded yet</Text>
                            <Text style={styles.emptySubtitle}>
                                This space will populate automatically once your donation records are synced.
                            </Text>
                        </View>
                    ) : (
                        visibleDonations.map((entry, index) => (
                            <View key={entry.id} style={[styles.entryRow, index !== visibleDonations.length - 1 && styles.entryDivider]}>
                                <View style={styles.entryMain}>
                                    <View style={styles.entryIconWrap}>
                                        <Ionicons name="wallet-outline" size={18} color={Colors.light.primary} />
                                    </View>
                                    <View style={styles.entryTextWrap}>
                                        <Text style={styles.entryName}>{isAdmin ? entry.donorName : 'Your donation'}</Text>
                                        <Text style={styles.entryMeta}>
                                            {isAdmin ? `${entry.donorEmail} • ${formatDate(entry.donatedAt)}` : formatDate(entry.donatedAt)}
                                        </Text>
                                        {entry.note ? <Text style={styles.entryNote}>{entry.note}</Text> : null}
                                    </View>
                                </View>
                                <View style={styles.amountWrap}>
                                    <Text style={styles.amountText}>{currencyFormatter.format(entry.amount)}</Text>
                                </View>
                            </View>
                        ))
                    )}
                </View>
            </AnimatedSection>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.light.background,
    },
    contentContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 32,
        gap: 14,
    },
    heroGradient: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.6,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.light.background,
        gap: 12,
    },
    loadingText: {
        color: Colors.light.textSecondary,
        fontSize: 14,
    },
    heroCard: {
        backgroundColor: Colors.light.cardBackground,
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: Colors.light.border,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 5 },
        elevation: 3,
    },
    heroCardWide: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
    },
    heroInfo: {
        flex: 1,
        gap: 8,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 6,
        backgroundColor: Colors.light.lightGreen,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.light.primary,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: Colors.light.text,
    },
    subtitle: {
        fontSize: 14,
        color: Colors.light.textSecondary,
        lineHeight: 20,
    },
    heroValueBox: {
        minWidth: 120,
        backgroundColor: Colors.light.lightGreen,
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 16,
        alignItems: 'center',
    },
    heroValueLabel: {
        fontSize: 12,
        color: Colors.light.textSecondary,
        marginBottom: 2,
    },
    heroValue: {
        fontSize: 20,
        fontWeight: '700',
        color: Colors.light.text,
    },
    summaryCard: {
        backgroundColor: Colors.light.cardBackground,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    summaryCardWide: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    summaryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    summaryTextWrap: {
        flex: 1,
    },
    summaryLabel: {
        fontSize: 12,
        color: Colors.light.textSecondary,
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.text,
        marginTop: 2,
    },
    summaryDivider: {
        width: 1,
        backgroundColor: Colors.light.border,
        marginHorizontal: 8,
    },
    listCard: {
        backgroundColor: Colors.light.cardBackground,
        borderRadius: 24,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.light.border,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.light.text,
    },
    listCount: {
        fontSize: 12,
        color: Colors.light.textSecondary,
    },
    entryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 12,
        gap: 10,
    },
    entryDivider: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.light.border,
    },
    entryMain: {
        flexDirection: 'row',
        flex: 1,
        gap: 10,
    },
    entryIconWrap: {
        width: 38,
        height: 38,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: Colors.light.lightGreen,
    },
    entryTextWrap: {
        flex: 1,
    },
    entryName: {
        fontSize: 14,
        fontWeight: '600',
        color: Colors.light.text,
    },
    entryMeta: {
        fontSize: 12,
        color: Colors.light.textSecondary,
        marginTop: 2,
    },
    entryNote: {
        fontSize: 12,
        color: Colors.light.textSecondary,
        marginTop: 2,
    },
    amountWrap: {
        alignItems: 'flex-end',
        minWidth: 80,
    },
    amountText: {
        fontSize: 14,
        fontWeight: '700',
        color: Colors.light.primary,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 24,
        gap: 8,
    },
    emptyTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: Colors.light.text,
    },
    emptySubtitle: {
        fontSize: 13,
        color: Colors.light.textSecondary,
        textAlign: 'center',
    },
});
