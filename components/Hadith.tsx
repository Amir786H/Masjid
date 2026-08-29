import { useColorScheme } from '@/components/useColorScheme';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '../constants/Colors';
import {
  fetchHadithCollectionPage,
  fetchHadithCollections,
  fetchRandomHadith,
  HadithCollection,
} from '../services/hadithService';

const { width } = Dimensions.get('window');

function safeExtractHadith(json: any) {
  if (!json) return null;
  // common shapes: { data: {...} } or { hadith: {...} } or array
  const maybe = json.data ?? json.hadith ?? json;
  if (Array.isArray(maybe)) return maybe[0] ?? null;
  return maybe;
}

export default function Hadith() {
  const scheme = useColorScheme();
  const theme = Colors[scheme] ?? Colors.light;

  const [loading, setLoading] = useState(false);
  const [randomHadith, setRandomHadith] = useState<any>(null);

  const [collections, setCollections] = useState<HadithCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [collectionHadiths, setCollectionHadiths] = useState<any[]>([]);
  const [pageLoading, setPageLoading] = useState(false);

  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadCollections();
    loadRandom();
  }, []);

  useEffect(() => {
    if (selectedCollection) {
      loadCollectionPage(selectedCollection, page);
    }
  }, [selectedCollection, page]);

  function fadeIn() {
    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }

  async function loadRandom() {
    setLoading(true);
    try {
      const json = await fetchRandomHadith();
      const h = safeExtractHadith(json);
      setRandomHadith(h);
      fadeIn();
    } catch (err) {
      console.warn('Failed to load random hadith', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadCollections() {
    try {
      const items = await fetchHadithCollections();
      setCollections(items);
      setSelectedCollection(items[0]?.key ?? null);
    } catch (err) {
      console.warn('Failed to load collections', err);
    }
  }

  async function loadCollectionPage(collection: string, p: number) {
    setPageLoading(true);
    try {
      const json = await fetchHadithCollectionPage(collection, p);
      // try different shapes
      let list: any[] = [];
      if (Array.isArray(json)) list = json;
      else if (Array.isArray(json?.data?.hadiths)) list = json.data.hadiths;
      else if (Array.isArray(json?.data)) list = json.data;
      else if (Array.isArray(json.hadiths)) list = json.hadiths;
      else if (Array.isArray(json.collection)) list = json.collection;
      else if (json.items && Array.isArray(json.items)) list = json.items;

      setCollectionHadiths(list || []);
      fadeIn();
    } catch (err) {
      console.warn('Failed to load collection page', err);
    } finally {
      setPageLoading(false);
    }
  }

  function renderHadithCard(item: any) {
    const text = item?.text ?? item?.hadith ?? item?.body ?? item?.arab ?? item?.english ?? JSON.stringify(item);
    const ref = item?.reference ?? item?.book ?? item?.id ?? item?.grade;
    return (
      <Animated.View style={[styles.card, { backgroundColor: theme.cardBackground, opacity }]}>
        <ScrollView>
          <Text style={[styles.hadithText, { color: theme.text }]}>{text}</Text>
          {ref ? <Text style={[styles.refText, { color: theme.textSecondary }]}> {ref}</Text> : null}
        </ScrollView>
      </Animated.View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.background }}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.text }]}>Hadith</Text>
          <TouchableOpacity onPress={loadRandom} style={[styles.randomBtn, { backgroundColor: theme.primary }]}>
            <Text style={styles.randomBtnText}>Random</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          {loading ? (
            <ActivityIndicator />
          ) : randomHadith ? (
            renderHadithCard(randomHadith)
          ) : (
            <Text style={{ color: theme.textSecondary }}>No hadith loaded</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.subtitle, { color: theme.text }]}>Collections</Text>
          <FlatList
            data={collections}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.key}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedCollection(item.key);
                  setPage(1);
                }}
                style={[
                  styles.collectionBtn,
                  { backgroundColor: item.key === selectedCollection ? theme.lightGreen : theme.cardBackground, borderColor: theme.border },
                ]}
              >
                <Text style={{ color: item.key === selectedCollection ? theme.text : theme.textSecondary }}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />

          <View style={{ height: 12 }} />

          <View style={styles.paginationRow}>
            <TouchableOpacity disabled={page <= 1 || pageLoading} onPress={() => setPage((p) => Math.max(1, p - 1))} style={[styles.pageBtn, { borderColor: theme.border }]}>
              <Text style={{ color: theme.text }}>Previous</Text>
            </TouchableOpacity>

            <Text style={{ color: theme.textSecondary }}>Page {page}</Text>

            <TouchableOpacity disabled={pageLoading} onPress={() => setPage((p) => p + 1)} style={[styles.pageBtn, { borderColor: theme.border }]}>
              <Text style={{ color: theme.text }}>Next</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 12 }} />

          {pageLoading ? (
            <ActivityIndicator />
          ) : (
            <FlatList
              data={collectionHadiths}
              keyExtractor={(it, idx) => String(it?.id ?? idx)}
              renderItem={({ item }) => renderHadithCard(item)}
              ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  randomBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  randomBtnText: {
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    marginBottom: 18,
  },
  card: {
    padding: 14,
    borderRadius: 12,
    minHeight: 100,
    maxWidth: width - 32,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  hadithText: {
    fontSize: 15,
    lineHeight: 22,
  },
  refText: {
    marginTop: 8,
    fontSize: 13,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  collectionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
});
