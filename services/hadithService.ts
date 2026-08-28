export interface HadithCollection {
  key: string;
  name: string;
  arabic_name?: string;
  author?: string;
  reliability?: string;
  total_hadiths?: number;
}

export async function fetchRandomHadith() {
  try {
    const res = await fetch('https://ummahapi.com/api/hadith/random');
    if (!res.ok) throw new Error('Network response was not ok');
    const json = await res.json();
    return json;
  } catch (err) {
    throw err;
  }
}

export async function fetchHadithCollections(): Promise<HadithCollection[]> {
  try {
    const res = await fetch('https://ummahapi.com/api/hadith/collections');
    if (!res.ok) throw new Error('Network response was not ok');
    const json = await res.json();
    const collections = json?.data?.collections ?? json?.collections ?? json?.data ?? json;

    if (!Array.isArray(collections)) return [];

    return collections.filter(
      (collection: any): collection is HadithCollection =>
        typeof collection?.key === 'string' && typeof collection?.name === 'string',
    );
  } catch (err) {
    throw err;
  }
}

export async function fetchHadithCollectionPage(collection: string, page = 1) {
  try {
    const url = `https://ummahapi.com/api/hadith/${collection}?page=${page}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network response was not ok');
    const json = await res.json();
    return json;
  } catch (err) {
    throw err;
  }
}
