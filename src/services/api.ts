import { PrayerTimes, HijriDate, Surah, Ayah } from '../types';

const ALADHAN_BASE = 'https://api.aladhan.com/v1';
const QURAN_CLOUD_BASE = 'https://api.alquran.cloud/v1';

const memoryCache = new Map<string, unknown>();
const inflightRequests = new Map<string, Promise<unknown>>();

const getTodayKey = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

function readCache<T>(key: string): T | null {
  if (memoryCache.has(key)) {
    return memoryCache.get(key) as T;
  }
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as T;
    memoryCache.set(key, parsed);
    return parsed;
  } catch {
    return null;
  }
}

function writeCache<T>(key: string, value: T): void {
  memoryCache.set(key, value);
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Evict older cached Surah/Juz entries if localStorage quota is reached
    try {
      const evictable: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith('kaifiyat_surah_') || k.startsWith('kaifiyat_juz_'))) {
          evictable.push(k);
        }
      }
      for (const k of evictable.slice(0, Math.max(3, Math.ceil(evictable.length / 2)))) {
        localStorage.removeItem(k);
      }
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore if storage is disabled or full
    }
  }
}

function dedupeRequest<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const existing = inflightRequests.get(key) as Promise<T> | undefined;
  if (existing) return existing;

  const promise = fetcher().finally(() => {
    inflightRequests.delete(key);
  });
  inflightRequests.set(key, promise);
  return promise;
}

async function fetchJsonWithTimeout(url: string, timeoutMs = 12000): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

export interface PrayerData {
  timings: PrayerTimes;
  date: HijriDate;
}

export const getCachedPrayerTimes = (): PrayerData | null => {
  return readCache<PrayerData>('kaifiyat_prayer_last');
};

export const getPrayerTimes = async (latitude: number, longitude: number): Promise<PrayerData> => {
  const todayKey = getTodayKey();
  const cacheKey = `kaifiyat_prayer_${todayKey}_${latitude.toFixed(2)}_${longitude.toFixed(2)}`;
  const cached = readCache<PrayerData>(cacheKey);
  if (cached) return cached;

  return dedupeRequest(cacheKey, async () => {
    try {
      const data = await fetchJsonWithTimeout(
        `${ALADHAN_BASE}/timings?latitude=${latitude}&longitude=${longitude}&method=2`
      );
      if (data?.code === 200 && data.data?.timings) {
        const result: PrayerData = {
          timings: data.data.timings,
          date: data.data.date.hijri,
        };
        writeCache(cacheKey, result);
        writeCache('kaifiyat_prayer_last', result);
        return result;
      }
      throw new Error('Invalid prayer times response');
    } catch (error) {
      const offlineFallback = readCache<PrayerData>('kaifiyat_prayer_last');
      if (offlineFallback) return offlineFallback;
      throw error;
    }
  });
};

export const getCachedSurahs = (): Surah[] => {
  return readCache<Surah[]>('kaifiyat_surahs_v1') || [];
};

export const getSurahs = async (): Promise<Surah[]> => {
  const cacheKey = 'kaifiyat_surahs_v1';
  const cached = readCache<Surah[]>(cacheKey);
  if (cached && cached.length > 0) return cached;

  return dedupeRequest(cacheKey, async () => {
    const data = await fetchJsonWithTimeout(`${QURAN_CLOUD_BASE}/surah`);
    if (data?.code === 200 && Array.isArray(data.data) && data.data.length > 0) {
      writeCache(cacheKey, data.data);
      return data.data as Surah[];
    }
    throw new Error('Failed to load Surah list');
  });
};

export const getSurahDetail = async (number: number, language: 'en' | 'ur' = 'ur'): Promise<Ayah[]> => {
  const cacheKey = `kaifiyat_surah_${number}_${language}_v1`;
  const cached = readCache<Ayah[]>(cacheKey);
  if (cached && cached.length > 0) return cached;

  return dedupeRequest(cacheKey, async () => {
    const translationEdition = language === 'ur' ? 'ur.jalandhry' : 'en.asad';

    // Try combined fetch with audio first
    try {
      const data = await fetchJsonWithTimeout(
        `${QURAN_CLOUD_BASE}/surah/${number}/editions/quran-uthmani,${translationEdition},ar.alafasy`
      );
      if (data?.code === 200 && Array.isArray(data.data) && data.data.length >= 2) {
        const [arabic, translation, audio] = data.data;
        const ayahs: Ayah[] = arabic.ayahs.map((ayah: any, index: number) => ({
          number: ayah.number,
          numberInSurah: ayah.numberInSurah,
          text: ayah.text,
          translation: translation?.ayahs?.[index]?.text || '',
          audio: audio?.ayahs?.[index]?.audio || undefined,
        }));
        if (ayahs.length > 0) {
          writeCache(cacheKey, ayahs);
          return ayahs;
        }
      }
    } catch {
      // Fall through to 2-edition fetch
    }

    // Fallback: 2-edition fetch without audio
    const [arabicData, transData] = await Promise.all([
      fetchJsonWithTimeout(`${QURAN_CLOUD_BASE}/surah/${number}/quran-uthmani`),
      fetchJsonWithTimeout(`${QURAN_CLOUD_BASE}/surah/${number}/${translationEdition}`),
    ]);

    if (
      arabicData?.code === 200 &&
      transData?.code === 200 &&
      Array.isArray(arabicData.data?.ayahs) &&
      Array.isArray(transData.data?.ayahs)
    ) {
      const ayahs: Ayah[] = arabicData.data.ayahs.map((ayah: any, index: number) => ({
        number: ayah.number,
        numberInSurah: ayah.numberInSurah,
        text: ayah.text,
        translation: transData.data.ayahs[index]?.text || '',
      }));
      if (ayahs.length > 0) {
        writeCache(cacheKey, ayahs);
        return ayahs;
      }
    }

    throw new Error('Failed to load Surah verses');
  });
};

export const getQiblaDirection = async (latitude: number, longitude: number): Promise<number | null> => {
  try {
    const data = await fetchJsonWithTimeout(`${ALADHAN_BASE}/qibla/${latitude}/${longitude}`);
    return data?.data?.direction ?? null;
  } catch {
    return null;
  }
};

export const getAsmaAlHusna = async (): Promise<any[]> => {
  const cacheKey = 'kaifiyat_asma_v1';
  const cached = readCache<any[]>(cacheKey);
  if (cached && cached.length > 0) return cached;

  return dedupeRequest(cacheKey, async () => {
    const data = await fetchJsonWithTimeout(`${ALADHAN_BASE}/asmaAlHusna`);
    if (data?.code === 200 && Array.isArray(data.data) && data.data.length > 0) {
      writeCache(cacheKey, data.data);
      return data.data;
    }
    throw new Error('Failed to load Asma-ul-Husna');
  });
};

export interface VerseOfTheDay {
  arabic: string;
  translation: string;
  surah: string;
  surahNumber: number;
  number: number;
}

export const getCachedVerseOfTheDay = (language: 'en' | 'ur' = 'en'): VerseOfTheDay | null => {
  const todayKey = getTodayKey();
  return (
    readCache<VerseOfTheDay>(`kaifiyat_votd_${todayKey}_${language}_v1`) ||
    readCache<VerseOfTheDay>(`kaifiyat_votd_last_${language}`)
  );
};

export const getVerseOfTheDay = async (language: 'en' | 'ur' = 'en'): Promise<VerseOfTheDay | null> => {
  const todayKey = getTodayKey();
  const cacheKey = `kaifiyat_votd_${todayKey}_${language}_v1`;
  const cached = readCache<VerseOfTheDay>(cacheKey);
  if (cached) return cached;

  return dedupeRequest(cacheKey, async () => {
    try {
      const now = new Date();
      const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
      const verseIndex = ((dayOfYear + now.getFullYear()) % 6236) + 1;
      const translationEdition = language === 'ur' ? 'ur.jalandhry' : 'en.asad';

      const data = await fetchJsonWithTimeout(
        `${QURAN_CLOUD_BASE}/ayah/${verseIndex}/editions/quran-uthmani,${translationEdition}`
      );

      if (data?.code === 200 && Array.isArray(data.data) && data.data.length >= 2) {
        const arabic = data.data[0];
        const trans = data.data[1];
        const result: VerseOfTheDay = {
          arabic: arabic.text,
          translation: trans.text,
          surah: language === 'ur' ? arabic.surah.name : arabic.surah.englishName,
          surahNumber: arabic.surah.number,
          number: arabic.numberInSurah,
        };
        writeCache(cacheKey, result);
        writeCache(`kaifiyat_votd_last_${language}`, result);
        return result;
      }
      return readCache<VerseOfTheDay>(`kaifiyat_votd_last_${language}`);
    } catch {
      return readCache<VerseOfTheDay>(`kaifiyat_votd_last_${language}`);
    }
  });
};

export const getJuzDetail = async (number: number, language: 'en' | 'ur' = 'ur'): Promise<Ayah[]> => {
  const cacheKey = `kaifiyat_juz_${number}_${language}_v1`;
  const cached = readCache<Ayah[]>(cacheKey);
  if (cached && cached.length > 0) return cached;

  return dedupeRequest(cacheKey, async () => {
    const translationEdition = language === 'ur' ? 'ur.jalandhry' : 'en.asad';

    try {
      const data = await fetchJsonWithTimeout(
        `${QURAN_CLOUD_BASE}/juz/${number}/editions/quran-uthmani,${translationEdition},ar.alafasy`
      );
      if (data?.code === 200 && Array.isArray(data.data) && data.data.length >= 2) {
        const arabic = data.data[0];
        const translation = data.data[1];
        const audio = data.data[2] || { ayahs: [] };
        const ayahs: Ayah[] = arabic.ayahs.map((ayah: any, index: number) => ({
          number: ayah.number,
          numberInSurah: ayah.numberInSurah,
          text: ayah.text,
          translation: translation?.ayahs?.[index]?.text || '',
          audio: audio?.ayahs?.[index]?.audio || undefined,
        }));
        if (ayahs.length > 0) {
          writeCache(cacheKey, ayahs);
          return ayahs;
        }
      }
    } catch {
      // Fall through to separate fetch
    }

    const [arabicData, transData] = await Promise.all([
      fetchJsonWithTimeout(`${QURAN_CLOUD_BASE}/juz/${number}/quran-uthmani`),
      fetchJsonWithTimeout(`${QURAN_CLOUD_BASE}/juz/${number}/${translationEdition}`),
    ]);

    if (
      arabicData?.code === 200 &&
      transData?.code === 200 &&
      Array.isArray(arabicData.data?.ayahs) &&
      Array.isArray(transData.data?.ayahs)
    ) {
      const ayahs: Ayah[] = arabicData.data.ayahs.map((ayah: any, index: number) => ({
        number: ayah.number,
        numberInSurah: ayah.numberInSurah,
        text: ayah.text,
        translation: transData.data.ayahs[index]?.text || '',
      }));
      if (ayahs.length > 0) {
        writeCache(cacheKey, ayahs);
        return ayahs;
      }
    }

    throw new Error('Failed to load Juz verses');
  });
};
