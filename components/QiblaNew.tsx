import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useEffect, useState, useRef } from 'react';
import { ActivityIndicator, Alert, Dimensions, StyleSheet, Text, TouchableOpacity, View, Vibration, Platform, SafeAreaView } from 'react-native';
import Svg, { Circle, Line, Polygon } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const MECCA_LAT = 21.422487;
const MECCA_LON = 39.826206;

export default function QiblaNew() {
    const [cameraPermission, requestCameraPermission] = useCameraPermissions();
    const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
    
    const [locationName, setLocationName] = useState('Finding location...');
    const [heading, setHeading] = useState(0);
    const [qiblaDirection, setQiblaDirection] = useState(0);
    
    const [isArMode, setIsArMode] = useState(true);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    
    // For vibration throttle so it doesn't vibrate constantly
    const lastVibration = useRef(0);

    const checkPermissionsAndLocation = async () => {
        setLoading(true);
        setErrorMsg('');
        try {
            // Location
            let { status: locStatus } = await Location.requestForegroundPermissionsAsync();
            setLocationPermission(locStatus);
            if (locStatus !== 'granted') {
                setErrorMsg('Location permission denied');
                setLoading(false);
                return;
            }

            // Camera
            if (!cameraPermission?.granted) {
                await requestCameraPermission();
            }

            let loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
            
            // Reverse geocode
            let geocode = await Location.reverseGeocodeAsync({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude
            });
            if (geocode.length > 0) {
                const geo = geocode[0];
                setLocationName(`${geo.city || geo.region || 'Unknown'}, ${geo.isoCountryCode}`);
            } else {
                setLocationName('Location found');
            }

            const q = calculateQibla(loc.coords.latitude, loc.coords.longitude);
            setQiblaDirection(q);

        } catch (err) {
            setErrorMsg('Error fetching location data.');
            console.log(err);
        }
        setLoading(false);
    };

    useEffect(() => {
        checkPermissionsAndLocation();

        let sub: Location.LocationSubscription | undefined;
        let isMounted = true;

        const startHeading = async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                sub = await Location.watchHeadingAsync((headingData) => {
                    if (!isMounted) return;
                    const h = headingData.trueHeading >= 0 ? headingData.trueHeading : headingData.magHeading;
                    setHeading(h);
                });
            }
        };
        startHeading();

        return () => {
            isMounted = false;
            if (sub) sub.remove();
        };
    }, []);

    // Vibrate when aligned
    useEffect(() => {
        if (qiblaDirection > 0 && heading > 0) {
            // Calculate absolute difference
            let diff = Math.abs(qiblaDirection - heading);
            if (diff > 180) diff = 360 - diff;
            
            if (diff < 3) {
                const now = Date.now();
                if (now - lastVibration.current > 2000) { // Vibrate at most every 2 seconds
                    Vibration.vibrate(50);
                    lastVibration.current = now;
                }
            }
        }
    }, [heading, qiblaDirection]);

    const calculateQibla = (lat: number, lon: number) => {
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

    const handleCalibrate = () => {
        Alert.alert("Calibrate Compass", "Move your phone in a figure 8 motion to calibrate the compass sensors.", [{ text: "OK" }]);
    };

    // Calculate rotation of the pointer
    // If the phone points exactly at Qibla (heading == qibla), we want pointer to be straight UP (0 deg)
    // Pointer rotation should be (qibla - heading)
    let pointerRotation = qiblaDirection - heading;
    if (pointerRotation < 0) pointerRotation += 360;

    const roundedHeading = Math.round(heading);
    const roundedQibla = Math.round(qiblaDirection);
    
    const getDirectionStr = (deg: number) => {
        const d = (deg % 360 + 360) % 360; // Normalize
        if (d >= 337.5 || d < 22.5) return 'N';
        if (d >= 22.5 && d < 67.5) return 'NE';
        if (d >= 67.5 && d < 112.5) return 'E';
        if (d >= 112.5 && d < 157.5) return 'SE';
        if (d >= 157.5 && d < 202.5) return 'S';
        if (d >= 202.5 && d < 247.5) return 'SW';
        if (d >= 247.5 && d < 292.5) return 'W';
        if (d >= 292.5 && d < 337.5) return 'NW';
        return 'N';
    };

    const isAligned = Math.abs(pointerRotation) < 3 || Math.abs(pointerRotation - 360) < 3;

    if (loading && !qiblaDirection) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#22C55E" />
                <Text style={styles.loadingText}>Calibrating sensors...</Text>
            </View>
        );
    }

    if (errorMsg) {
        return (
            <View style={styles.loadingContainer}>
                <Ionicons name="warning" size={48} color="#EF4444" />
                <Text style={[styles.loadingText, {color: '#EF4444'}]}>{errorMsg}</Text>
                <TouchableOpacity style={styles.retryBtn} onPress={checkPermissionsAndLocation}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderARView = () => (
        <View style={StyleSheet.absoluteFillObject}>
            {cameraPermission?.granted ? (
                <CameraView style={StyleSheet.absoluteFillObject} facing="back" />
            ) : (
                <View style={[StyleSheet.absoluteFillObject, { backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{color: '#fff'}}>Camera permission required for AR</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={requestCameraPermission}>
                        <Text style={styles.retryText}>Grant Permission</Text>
                    </TouchableOpacity>
                </View>
            )}
            
            {/* AR Overlay - Dark gradient or slight overlay could go here 
                We keep the center transparent for the real world.
            */}
            
            {/* Central Pointer Container */}
            <View style={styles.arPointerContainer}>
                <View style={[styles.arrowWrapper, { transform: [{ rotate: `${pointerRotation}deg` }] }]}>
                    <Svg width="200" height="200" viewBox="0 0 200 200">
                        {/* A nice large 3D-ish arrow pointing up */}
                        <Polygon points="100,20 160,160 100,130 40,160" fill={isAligned ? "#22C55E" : "#EAB308"} stroke="#FFF" strokeWidth="4" />
                    </Svg>
                </View>
                
                {/* Fixed center ring or crosshair to help align */}
                <View style={styles.crosshair}>
                    <View style={styles.crosshairCenter} />
                </View>
            </View>
        </View>
    );

    const render2DCompass = () => (
        <View style={styles.compassContainer}>
            {/* 2D Compass */}
            <View style={[styles.compassWrapper, { transform: [{ rotate: `${-heading}deg` }] }]}>
                {/* Outer styling */}
                <Svg width="300" height="300" viewBox="0 0 300 300">
                    <Circle cx="150" cy="150" r="140" stroke="#E5E7EB" strokeWidth="2" fill="none" opacity={0.6} />
                    <Circle cx="150" cy="150" r="120" stroke="#F3F4F6" strokeWidth="4" fill="#FFFFFF" />
                    
                    {/* Tick marks */}
                    {[...Array(24)].map((_, i) => {
                        const angle = (i * 15 * Math.PI) / 180;
                        const isMain = i % 6 === 0;
                        const innerR = isMain ? 100 : 110;
                        const x1 = 150 + Math.cos(angle) * 120;
                        const y1 = 150 + Math.sin(angle) * 120;
                        const x2 = 150 + Math.cos(angle) * innerR;
                        const y2 = 150 + Math.sin(angle) * innerR;
                        return (
                            <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#D1D5DB" strokeWidth={isMain ? "3" : "1"} />
                        );
                    })}
                </Svg>
                
                <Text style={[styles.compassText, { top: 30, left: 142 }]}>N</Text>
                <Text style={[styles.compassText, { bottom: 30, left: 144 }]}>S</Text>
                <Text style={[styles.compassText, { top: 140, right: 30 }]}>E</Text>
                <Text style={[styles.compassText, { top: 140, left: 30 }]}>W</Text>

                {/* Qibla Indicator Line */}
                <View style={[styles.needleWrapper, { transform: [{ rotate: `${qiblaDirection}deg` }] }]}>
                    <Svg width="300" height="300" viewBox="0 0 300 300">
                        {/* Qibla Direction Line */}
                        <Line x1="150" y1="150" x2="150" y2="40" stroke="#22C55E" strokeWidth="5" strokeLinecap="round" />
                        <Circle cx="150" cy="150" r="10" fill="#EAB308" stroke="#FFFFFF" strokeWidth="3" />
                        <Polygon points="150,20 160,40 140,40" fill="#22C55E" />
                    </Svg>
                </View>

                {/* Optional North Needle */}
                <View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center' }]}>
                   <Svg width="300" height="300" viewBox="0 0 300 300">
                       <Polygon points="150,150 145,150 150,90 155,150" fill="#EF4444" opacity={0.7} />
                       <Polygon points="150,150 145,150 150,210 155,150" fill="#9CA3AF" opacity={0.7} />
                   </Svg>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                {/* Content Area */}
                <View style={styles.viewLayer}>
                    {isArMode ? renderARView() : render2DCompass()}
                </View>

                {/* Overlay UI (Top) */}
                <View style={styles.topOverlay}>
                    <View style={styles.locationHeader}>
                        <Ionicons name="location" size={20} color="#22C55E" />
                        <Text style={styles.locationText} numberOfLines={1}>{locationName}</Text>
                    </View>
                    
                    <View style={styles.toggleContainer}>
                        <TouchableOpacity 
                            style={[styles.toggleBtn, isArMode && styles.toggleBtnActive]} 
                            onPress={() => setIsArMode(true)}>
                            <Ionicons name="camera" size={18} color={isArMode ? '#FFF' : '#4B5563'} />
                            <Text style={[styles.toggleText, isArMode && styles.toggleTextActive]}>AR</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.toggleBtn, !isArMode && styles.toggleBtnActive]} 
                            onPress={() => setIsArMode(false)}>
                            <Ionicons name="compass" size={18} color={!isArMode ? '#FFF' : '#4B5563'} />
                            <Text style={[styles.toggleText, !isArMode && styles.toggleTextActive]}>2D</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Overlay UI (Bottom) */}
                <View style={styles.bottomOverlay}>
                    <View style={styles.readoutCard}>
                        {isAligned && (
                            <View style={styles.alignedBadge}>
                                <Text style={styles.alignedText}>ALIGNED WITH QIBLA</Text>
                            </View>
                        )}
                        
                        <View style={styles.degreeRow}>
                            <Text style={styles.bigDegree}>{Math.round(pointerRotation)}°</Text>
                            <View style={styles.dirCol}>
                                <Text style={styles.qiblaLabel}>To Qibla</Text>
                                <Text style={styles.dirText}>{getDirectionStr(qiblaDirection)}</Text>
                            </View>
                        </View>
                        
                        <View style={styles.bottomActions}>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Heading:</Text>
                                <Text style={styles.infoValue}>{Math.round(heading)}° {getDirectionStr(heading)}</Text>
                            </View>
                            <TouchableOpacity style={styles.calibrateBtn} onPress={handleCalibrate}>
                                <MaterialCommunityIcons name="axis-z-rotate-clockwise" size={20} color="#22C55E" />
                                <Text style={styles.calibrateText}>Calibrate</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#111827' },
    container: { flex: 1, backgroundColor: '#F8F9FA', position: 'relative' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA', padding: 20 },
    loadingText: { marginTop: 15, fontSize: 16, color: '#4B5563', fontWeight: '500' },
    retryBtn: { marginTop: 20, backgroundColor: '#22C55E', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    retryText: { color: '#FFF', fontWeight: '600' },
    
    viewLayer: { flex: 1, backgroundColor: '#E5E7EB' },
    
    // AR
    arPointerContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
    arrowWrapper: { width: 200, height: 200, justifyContent: 'center', alignItems: 'center' },
    crosshair: { position: 'absolute', width: 240, height: 240, borderRadius: 120, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.3)', justifyContent: 'center', alignItems: 'center', borderStyle: 'dashed' },
    crosshairCenter: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'rgba(255, 255, 255, 0.8)' },
    
    // 2D Compass
    compassContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA' },
    compassWrapper: { width: 300, height: 300, justifyContent: 'center', alignItems: 'center' },
    compassText: { position: 'absolute', fontSize: 18, fontWeight: 'bold', color: '#6B7280' },
    needleWrapper: { position: 'absolute', width: 300, height: 300 },

    // Top Overlay UI
    topOverlay: { position: 'absolute', top: Platform.OS === 'android' ? 20 : 10, left: 0, right: 0, zIndex: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingHorizontal: 20 },
    locationHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, maxWidth: '60%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    locationText: { marginLeft: 6, fontSize: 14, fontWeight: '600', color: '#1F2937' },
    
    toggleContainer: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 20, padding: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    toggleBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    toggleBtnActive: { backgroundColor: '#22C55E' },
    toggleText: { marginLeft: 4, fontSize: 12, fontWeight: '600', color: '#4B5563' },
    toggleTextActive: { color: '#FFF' },

    // Bottom Overlay UI
    bottomOverlay: { position: 'absolute', bottom: 30, left: 20, right: 20, zIndex: 10 },
    readoutCard: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 24, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
    alignedBadge: { position: 'absolute', top: -14, alignSelf: 'center', backgroundColor: '#22C55E', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12, shadowColor: '#22C55E', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 2 },
    alignedText: { color: '#FFF', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
    
    degreeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 5 },
    bigDegree: { fontSize: 56, fontWeight: '800', color: '#1F2937', letterSpacing: -2, width: 140, textAlign: 'right' },
    dirCol: { marginLeft: 15, justifyContent: 'center' },
    qiblaLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
    dirText: { fontSize: 24, fontWeight: 'bold', color: '#EAB308' },
    
    bottomActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 15 },
    infoRow: { flexDirection: 'row', alignItems: 'center' },
    infoLabel: { fontSize: 13, color: '#6B7280', marginRight: 5 },
    infoValue: { fontSize: 14, fontWeight: '600', color: '#1F2937' },
    
    calibrateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0FDF4', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#DCFCE7' },
    calibrateText: { marginLeft: 6, color: '#22C55E', fontSize: 12, fontWeight: '700' },
});
