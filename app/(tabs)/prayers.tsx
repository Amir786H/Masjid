import React, { useMemo, useState } from 'react';
import { FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from '../../components/useColorScheme';
import { Colors } from '../../constants/Colors';
import { Icons } from '../../constants/Icons';
import { useTabBarScroll } from '../../hooks/useTabBarVisibility';

const SURAH_ITEMS = [
    {
        id: 'al-fatiha',
        title: 'Al-Fatiha',
        subtitle: 'The Opening',
        arabic:
            'بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ\nالْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ\nالرَّحْمَـٰنِ الرَّحِيمِ\nمَالِكِ يَوْمِ الدِّينِ',
        translation:
            'In the name of Allah, the Most Gracious, the Most Merciful. Praise be to Allah, Lord of all worlds. The Most Gracious, the Most Mercificent. Master of the Day of Judgment.',
        source: 'Quran 1:1-4',
    },
    {
        id: 'al-ikhlas',
        title: 'Al-Ikhlas',
        subtitle: 'The Sincerity',
        arabic:
            'قُلْ هُوَ اللَّهُ أَحَدٌ\nاللَّهُ الصَّمَدُ\nلَمْ يَلِدْ وَلَمْ يُولَدْ\nوَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
        translation:
            'Say, He is Allah, [Who is] One, Allah, the Eternal Refuge. He neither begets nor is born, nor is there to Him any equivalent.',
        source: 'Quran 112:1-4',
    },
    {
        id: 'al-falaq',
        title: 'Al-Falaq',
        subtitle: 'The Daybreak',
        arabic:
            'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ\nمِن شَرِّ مَا خَلَقَ\nوَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ\nوَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ',
        translation:
            'Say, I seek refuge in the Lord of daybreak from the evil of that which He created, and from the evil of darkness when it settles, and from the evil of the blowers in knots.',
        source: 'Quran 113:1-4',
    },
    {
        id: 'an-nas',
        title: 'An-Nas',
        subtitle: 'Mankind',
        arabic:
            'قُلْ أَعُوذُ بِرَبِّ النَّاسِ\nمَلِكِ النَّاسِ\nإِلَـٰهِ النَّاسِ\nمِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ',
        translation:
            'Say, I seek refuge in the Lord of mankind, the Sovereign of mankind, the God of mankind, from the evil of the whisperer who withdraws.',
        source: 'Quran 114:1-4',
    },
];

const DUA_ITEMS = [
    {
        id: 'dua-sleep',
        title: 'Dua Before Sleep',
        subtitle: 'Protection & trust',
        arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
        translation: 'In Your name, O Allah, I die and I live.',
        source: 'Prophetic Supplication',
    },
    {
        id: 'dua-travel',
        title: 'Dua for Travel',
        subtitle: 'Seek ease in journey',
        arabic:
            'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ\nوَإِنَّا إِلَى رَبِّنَا لَمُنقَلِبُونَ',
        translation: 'Glory to Him who has subjected this to us, and we could never have done it by ourselves, and surely to our Lord we are returning.',
        source: 'Prophetic Supplication',
    },
    {
        id: 'dua-forgiveness',
        title: 'Dua of Forgiveness',
        subtitle: 'Turn to Allah',
        arabic: 'أَسْتَغْفِرُ اللَّهَ رَبِّي مِنْ كُلِّ ذَنْبٍ وَأَتُوبُ إِلَيْهِ',
        translation: 'I seek forgiveness from Allah, my Lord, from every sin I committed and I turn to Him in repentance.',
        source: 'Common Supplication',
    },
];

type ReaderItem = (typeof SURAH_ITEMS)[number];

type SectionKey = 'surah' | 'dua';

const SECTION_TAB = {
    surah: 'Surahs',
    dua: 'Duas',
} as const;

export default function PrayersScreen() {
    const scheme = useColorScheme();
    const palette = Colors[scheme === 'dark' ? 'dark' : 'light'];
    const [section, setSection] = useState<SectionKey>('surah');
    const items = section === 'surah' ? SURAH_ITEMS : DUA_ITEMS;
    const [activeItem, setActiveItem] = useState<ReaderItem>(items[0]);

    const selectedItem = useMemo(() => {
        if (!items.find((item) => item.id === activeItem.id)) {
            return items[0];
        }
        return activeItem;
    }, [activeItem, items]);

    const onScroll = useTabBarScroll();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: palette.background }]}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16}>
                <View style={styles.header}>
                    <View style={styles.titleBlock}>
                        <Text style={[styles.title, { color: palette.text }]}>Surahs & Duas</Text>
                        <Text style={[styles.subtitle, { color: palette.textSecondary }]}>Read Arabic text with translation and access daily supplications from one place.</Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: palette.lightGreen }]}>
                        <Text style={styles.statusPillText}>Read</Text>
                    </View>
                </View>

                <View style={[styles.readerCard, { backgroundColor: palette.cardBackground, borderColor: palette.border }]}>
                    <View style={styles.readerHeader}>
                        <Text style={[styles.readerTitle, { color: palette.text }]}>{selectedItem.title}</Text>
                        <Text style={[styles.readerSubtitle, { color: palette.textSecondary }]}>{selectedItem.subtitle}</Text>
                    </View>
                    <View style={styles.readerBody}>
                        <Text style={[styles.arabicText, { color: palette.text }]}>{selectedItem.arabic}</Text>
                        <Text style={[styles.translationText, { color: palette.textSecondary }]}>{selectedItem.translation}</Text>
                    </View>
                    <Text style={[styles.sourceText, { color: palette.textSecondary }]}>Source: {selectedItem.source}</Text>
                </View>

                <View style={styles.sectionControl}>
                    {Object.entries(SECTION_TAB).map(([key, label]) => {
                        const active = key === section;
                        return (
                            <TouchableOpacity
                                key={key}
                                onPress={() => {
                                    const nextSection = key as SectionKey;
                                    setSection(nextSection);
                                    setActiveItem(nextSection === 'surah' ? SURAH_ITEMS[0] : DUA_ITEMS[0]);
                                }}
                                style={[styles.sectionButton, active && { backgroundColor: palette.primary }]}
                            >
                                <Text style={[styles.sectionButtonLabel, { color: active ? '#fff' : palette.text }]}>{label}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={styles.listIntro}>
                    <Text style={[styles.listTitle, { color: palette.text }]}>All {SECTION_TAB[section]}</Text>
                    <Text style={[styles.listSubtitle, { color: palette.textSecondary }]}>Tap any item to read the full Arabic and translation below.</Text>
                </View>

                <View style={styles.listContainer}>
                    <FlatList
                        data={items}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                        renderItem={({ item }) => {
                            const active = item.id === selectedItem.id;
                            return (
                                <TouchableOpacity
                                    onPress={() => setActiveItem(item)}
                                    style={[styles.itemCard, { backgroundColor: active ? palette.primary : palette.cardBackground, borderColor: palette.border }]}
                                >
                                    <View style={styles.itemRow}>
                                        <View style={styles.itemTextBlock}>
                                            <Text style={[styles.itemTitle, { color: active ? '#fff' : palette.text }]}>{item.title}</Text>
                                            <Text style={[styles.itemSubtitle, { color: active ? '#F3F4F6' : palette.textSecondary }]} numberOfLines={1}>{item.subtitle}</Text>
                                        </View>
                                        <Icons.Ionicons
                                            name={active ? 'checkmark-circle' : 'chevron-forward'}
                                            size={18}
                                            color={active ? '#fff' : palette.primary}
                                        />
                                    </View>
                                    <Text style={[styles.itemPreview, { color: active ? '#EEF2FF' : palette.textSecondary }]} numberOfLines={2}>{item.translation}</Text>
                                </TouchableOpacity>
                            );
                        }}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        margin: 10,
    },
    content: {
        padding: 20,
        paddingBottom: 32,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 20,
    },
    titleBlock: {
        flex: 1,
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        lineHeight: 36,
    },
    subtitle: {
        marginTop: 6,
        fontSize: 14,
        lineHeight: 20,
    },
    statusPill: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 999,
        alignSelf: 'flex-start',
    },
    statusPillText: {
        fontSize: 12,
        fontWeight: '700',
        color: Colors.light.text,
    },
    readerCard: {
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 22,
        padding: 20,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 10 },
        shadowRadius: 22,
        elevation: 3,
    },
    readerHeader: {
        marginBottom: 14,
    },
    readerTitle: {
        fontSize: 20,
        fontWeight: '800',
    },
    readerSubtitle: {
        marginTop: 4,
        fontSize: 13,
    },
    readerBody: {
        marginBottom: 18,
    },
    arabicText: {
        fontSize: 19,
        lineHeight: 28,
        textAlign: 'right',
        marginBottom: 18,
        writingDirection: 'rtl',
        fontWeight: '700',
    },
    translationText: {
        fontSize: 14,
        lineHeight: 22,
    },
    sourceText: {
        fontSize: 12,
        lineHeight: 18,
        opacity: 0.75,
    },
    sectionControl: {
        flexDirection: 'row',
        marginBottom: 18,
    },
    sectionButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 14,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    sectionButtonLabel: {
        fontSize: 13,
        fontWeight: '700',
    },
    listIntro: {
        marginBottom: 14,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: 4,
    },
    listSubtitle: {
        fontSize: 13,
        lineHeight: 20,
    },
    listContainer: {
    },
    itemCard: {
        borderWidth: StyleSheet.hairlineWidth,
        borderRadius: 18,
        padding: 16,
        marginBottom: 12,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    itemTextBlock: {
        flex: 1,
        paddingRight: 10,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '700',
    },
    itemSubtitle: {
        marginTop: 4,
        fontSize: 12,
    },
    itemPreview: {
        fontSize: 13,
        lineHeight: 20,
    },
});
