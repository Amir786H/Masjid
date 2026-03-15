import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView, Platform, Dimensions, StatusBar, ScrollView } from 'react-native';
import * as Location from 'expo-location';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, Rect, Line, Path } from 'react-native-svg';

const { width } = Dimensions.get('window');

const MECCA_LAT = 21.422487;
const MECCA_LON = 39.826206;

export default function QiblaScreen() {
    const [locationName, setLocationName] = useState('Finding location...');
    const [heading, setHeading] = useState(0);
    const [qiblaDirection, setQiblaDirection] = useState(0);
    const [distance, setDistance] = useState(0);
    const [loading, setLoading] = useState(true);

    const checkLocation = async () => {
        setLoading(true);
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setLocationName('Permission denied');
                setLoading(false);
                return;
            }

            let loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Highest
            });
            
            // Reverse geocode
            let geocode = await Location.reverseGeocodeAsync({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude
            });
            if (geocode.length > 0) {
                const geo = geocode[0];
                setLocationName(`${geo.city || geo.subregion || geo.region || 'Unknown'}, ${geo.country || geo.isoCountryCode}`);
            } else {
                setLocationName('Location found');
            }

            // Calculations
            const q = calculateQiblaDirection(loc.coords.latitude, loc.coords.longitude);
            // Don't round yet for maximum rendering precision, but keep a rounded one for text
            setQiblaDirection(q);

            const d = calculateDistance(loc.coords.latitude, loc.coords.longitude);
            setDistance(Math.round(d));

        } catch (err) {
            setLocationName('Error fetching location');
            console.log(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        checkLocation();

        let sub: Location.LocationSubscription | undefined;
        let isMounted = true;
        const startHeading = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                sub = await Location.watchHeadingAsync((headingData) => {
                    if (!isMounted) return;
                    // Use true heading relative to geographic North for precise Qibla direction
                    // fallback to magnetic only if trueHeading isn't available (-1 means unavailable)
                    const preciseHeading = headingData.trueHeading >= 0 ? headingData.trueHeading : headingData.magHeading;
                    setHeading(preciseHeading); 
                });
            }
        };
        startHeading();
        
        return () => {
            isMounted = false;
            if (sub) {
                sub.remove();
            }
        };
    }, []);

    const calculateQiblaDirection = (lat: number, lon: number) => {
        const PI = Math.PI;
        const latk = MECCA_LAT * PI / 180.0;
        const longk = MECCA_LON * PI / 180.0;
        const phi = lat * PI / 180.0;
        const lambda = lon * PI / 180.0;
        let numerator = Math.sin(longk - lambda);
        let denominator = (Math.cos(phi) * Math.tan(latk)) - (Math.sin(phi) * Math.cos(longk - lambda));
        let qibla = Math.atan2(numerator, denominator) * 180.0 / PI;
        if (qibla < 0) qibla += 360;
        return qibla;
    };

    const calculateDistance = (lat: number, lon: number) => {
        const R = 6371; // km
        const dLat = (MECCA_LAT - lat) * Math.PI / 180;
        const dLon = (MECCA_LON - lon) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
                  Math.cos(lat * Math.PI / 180) * Math.cos(MECCA_LAT * Math.PI / 180) * 
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    };

    const getCompassDirection = (deg: number) => {
        if (deg < 0) deg += 360;
        if (deg >= 337.5 || deg < 22.5) return 'North';
        if (deg >= 22.5 && deg < 67.5) return 'North East';
        if (deg >= 67.5 && deg < 112.5) return 'East';
        if (deg >= 112.5 && deg < 157.5) return 'South East';
        if (deg >= 157.5 && deg < 202.5) return 'South';
        if (deg >= 202.5 && deg < 247.5) return 'South West';
        if (deg >= 247.5 && deg < 292.5) return 'West';
        if (deg >= 292.5 && deg < 337.5) return 'North West';
        return 'North'; // Fallback
    };

    const getCompassShort = (deg: number) => {
        const dir = getCompassDirection(deg);
        return dir.split(' ').map(w => w[0]).join(''); 
    };

    const handleCalibrate = () => {
        Alert.alert("Calibrate Compass", "Please wave your device in a figure 8 motion to calibrate the compass sensors.", [{ text: "OK" }]);
    };

    const roundedHeading = Math.round(heading);
    const roundedQibla = Math.round(qiblaDirection);

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} bounces={false}>
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity style={styles.iconCircleGreen}>
                            <Ionicons name="arrow-back" size={24} color="#22C55E" />
                        </TouchableOpacity>
                        <Text style={styles.titleText}>Qibla Finder</Text>
                        <TouchableOpacity style={styles.iconCircleYellow}>
                            <Ionicons name="settings-sharp" size={24} color="#EAB308" />
                        </TouchableOpacity>
                    </View>

                    {/* Location Card */}
                    <View style={styles.locationCard}>
                        <View style={styles.locationLeft}>
                            <View style={styles.locationIconBox}>
                                <Ionicons name="location-sharp" size={24} color="#FFFFFF" />
                            </View>
                            <View style={styles.locationTextColumn}>
                                <Text style={styles.locationLabel}>CURRENT LOCATION</Text>
                                {loading ? (
                                    <ActivityIndicator size="small" color="#22C55E" style={{ alignSelf: 'flex-start' }} />
                                ) : (
                                    <Text style={styles.locationName} numberOfLines={2}>{locationName}</Text>
                                )}
                            </View>
                        </View>
                        <TouchableOpacity onPress={checkLocation}>
                            <Ionicons name="refresh" size={24} color="#9CA3AF" />
                        </TouchableOpacity>
                    </View>

                    {/* Compass Assembly */}
                    <View style={styles.compassSection}>
                        <View style={[styles.compassWrapper, { transform: [{ rotate: `${-heading}deg` }] }]}>
                            {/* Outer rings */}
                            <Svg width="300" height="300" viewBox="0 0 300 300">
                                <Circle cx="150" cy="150" r="140" stroke="#E5E7EB" strokeWidth="2" fill="none" opacity={0.6} />
                                <Circle cx="150" cy="150" r="120" stroke="#F3F4F6" strokeWidth="4" fill="#FFFFFF" />
                            </Svg>
                            
                            {/* Compass Letters */}
                            <Text style={[styles.compassText, { top: 15, left: 142 }]}>N</Text>
                            <Text style={[styles.compassText, { bottom: 15, left: 144 }]}>S</Text>
                            <Text style={[styles.compassText, { top: 140, right: 15 }]}>E</Text>
                            <Text style={[styles.compassText, { top: 140, left: 15 }]}>W</Text>

                            {/* Rotating Needle inside the rotating dial */}
                            {/* Since the dial is rotated by -heading (so N points North), 
                                the needle must be rotated by qiblaDirection from N.
                                That makes it point exactly to Mecca. */}
                            <View style={[styles.needleWrapper, { transform: [{ rotate: `${qiblaDirection}deg` }] }]}>
                                <Svg width="300" height="300" viewBox="0 0 300 300">
                                    {/* The green needle line  */}
                                    <Line x1="150" y1="150" x2="150" y2="60" stroke="#22C55E" strokeWidth="5" strokeLinecap="round" />
                                    
                                    {/* Base center circle */}
                                    <Circle cx="150" cy="150" r="6" fill="#EAB308" stroke="#FFFFFF" strokeWidth="2" />
                                    
                                    {/* Decorative Qaba icon at the tip */}
                                    <Rect x="135" y="30" width="30" height="30" fill="#22C55E" rx="3" />
                                    <Line x1="135" y1="36" x2="165" y2="36" stroke="#FFFFFF" strokeWidth="1.5" />
                                    <Line x1="135" y1="46" x2="165" y2="46" stroke="#FFFFFF" strokeWidth="1.5" />
                                    <Rect x="145" y="42" width="10" height="18" fill="#15803D" />
                                </Svg>
                            </View>
                        </View>
                    </View>

                    {/* Qibla Direction Readout */}
                    <View style={styles.directionReadout}>
                        <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center' }}>
                            <Text style={styles.degreesText}>{roundedQibla}° </Text>
                            <Text style={styles.cardinalText}>{getCompassShort(roundedQibla)}</Text>
                        </View>
                        <Text style={styles.qiblaSubtext}>QIBLA DIRECTION</Text>
                    </View>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <MaterialCommunityIcons name="ruler" size={22} color="#EAB308" style={styles.statIcon} />
                            <Text style={styles.statLabel}>Distance</Text>
                            <Text style={styles.statValue}>{new Intl.NumberFormat().format(distance)} km</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Ionicons name="compass" size={22} color="#22C55E" style={styles.statIcon} />
                            <Text style={styles.statLabel}>Heading</Text>
                            <Text style={styles.statValue}>{getCompassDirection(roundedHeading)}</Text>
                        </View>
                    </View>

                    {/* Bottom Actions */}
                    <TouchableOpacity style={styles.calibrateButton} onPress={handleCalibrate}>
                        <MaterialCommunityIcons name="cellphone-wireless" size={24} color="#FFFFFF" />
                        <Text style={styles.calibrateText}>Calibrate Compass</Text>
                    </TouchableOpacity>

                    {/* Decorative Pattern at the bottom */}
                    <View style={styles.decorativeContainer}>
                        {/* Improved placeholder visual taking up exact bottom space */}
                        <View style={styles.mapGraphicPlaceholder}>
                            <Svg width={width - 40} height="120" viewBox="0 0 320 120" preserveAspectRatio="none">
                                <Path d="M0,20 Q160,100 320,20 L320,120 L0,120 Z" fill="#E5E7EB" opacity={0.5} />
                                <Path d="M40,80 Q100,20 180,60 T300,40" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="4,4" />
                                <Circle cx="40" cy="80" r="4" fill="#9CA3AF" />
                                <Circle cx="300" cy="40" r="4" fill="#9CA3AF" />
                            </Svg>
                        </View>
                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 40, // Padding at bottom for scrollable content making sure nothing is cut off
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 10,
        marginBottom: 20,
    },
    titleText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    iconCircleGreen: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E8F7ED',
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconCircleYellow: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FEF9C3',
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 25,
        borderWidth: 1,
        borderColor: '#F3F4F6'
    },
    locationLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    locationIconBox: {
        width: 50,
        height: 50,
        borderRadius: 12,
        backgroundColor: '#22C55E',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    locationTextColumn: {
        flex: 1,
        justifyContent: 'center',
    },
    locationLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#22C55E',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    locationName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1F2937',
    },
    compassSection: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 320,
    },
    compassWrapper: {
        width: 300,
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
    compassText: {
        position: 'absolute',
        fontSize: 18,
        fontWeight: 'bold',
        color: '#9CA3AF',
    },
    needleWrapper: {
        position: 'absolute',
        width: 300,
        height: 300,
    },
    directionReadout: {
        alignItems: 'center',
        marginTop: 15,
        marginBottom: 25,
    },
    degreesText: {
        fontSize: 42,
        fontWeight: '800',
        color: '#1F2937',
    },
    cardinalText: {
        fontSize: 42,
        fontWeight: '800',
        color: '#EAB308',
    },
    qiblaSubtext: {
        fontSize: 12,
        fontWeight: '600',
        color: '#9CA3AF',
        letterSpacing: 1.5,
        marginTop: 4,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 25,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 1,
    },
    statIcon: {
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 13,
        color: '#9CA3AF',
        marginBottom: 6,
        fontWeight: '500',
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
    },
    calibrateButton: {
        flexDirection: 'row',
        backgroundColor: '#22C55E',
        borderRadius: 12,
        padding: 18,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#22C55E',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    calibrateText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    decorativeContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 30,
        marginBottom: 10,
    },
    mapGraphicPlaceholder: {
        width: '100%',
        height: 120,
        borderRadius: 20,
        overflow: 'hidden',
        backgroundColor: '#F3F4F6',
        justifyContent: 'center',
        alignItems: 'center',
    }
});
