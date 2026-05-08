import { PrayerTimes, HijriDate, Surah, Ayah } from '../types';

const ALADHAN_BASE = 'https://api.aladhan.com/v1';
const QURAN_CLOUD_BASE = 'https://api.alquran.cloud/v1';

export const getPrayerTimes = async (latitude: number, longitude: number): Promise<{ timings: PrayerTimes; date: HijriDate } | null> => {
  try {
    const response = await fetch(`${ALADHAN_BASE}/timings?latitude=${latitude}&longitude=${longitude}&method=2`);
    const data = await response.json();
    if (data.code === 200) {
      return {
        timings: data.data.timings,
        date: data.data.date.hijri
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return null;
  }
};

export const getSurahs = async (): Promise<Surah[]> => {
  try {
    const response = await fetch(`${QURAN_CLOUD_BASE}/surah`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching surahs:', error);
    return [];
  }
};

export const getSurahDetail = async (number: number, language: 'en' | 'ur' = 'ur'): Promise<Ayah[]> => {
  try {
    const translationEdition = language === 'ur' ? 'ur.jalandhry' : 'en.sahih';
    
    // Try multi-edition fetch
    try {
      const response = await fetch(`${QURAN_CLOUD_BASE}/surah/${number}/editions/quran-uthmani,${translationEdition},ar.alafasy`);
      const data = await response.json();
      
      if (data.code === 200 && data.data && Array.isArray(data.data)) {
        const [arabic, translation, audio] = data.data;
        return arabic.ayahs.map((ayah: any, index: number) => ({
          ...ayah,
          translation: translation.ayahs[index]?.text || '',
          audio: audio.ayahs[index]?.audio || undefined
        }));
      }
    } catch (e) {
      console.warn("Combined Surah fetch failed, trying separate fetch");
    }

    // Fallback: Fetch separately
    const arabicRes = await fetch(`${QURAN_CLOUD_BASE}/surah/${number}/quran-uthmani`);
    const transRes = await fetch(`${QURAN_CLOUD_BASE}/surah/${number}/${translationEdition}`);
    const audioRes = await fetch(`${QURAN_CLOUD_BASE}/surah/${number}/ar.alafasy`);
    const arabicData = await arabicRes.json();
    const transData = await transRes.json();
    const audioData = await audioRes.json();

    if (arabicData.code === 200 && transData.code === 200 && arabicData.data?.ayahs && transData.data?.ayahs) {
      return arabicData.data.ayahs.map((ayah: any, index: number) => ({
        ...ayah,
        translation: transData.data.ayahs[index]?.text || '',
        audio: audioData.code === 200 ? audioData.data.ayahs[index]?.audio : undefined
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching surah content:', error);
    return [];
  }
};

export const getQiblaDirection = async (latitude: number, longitude: number): Promise<number | null> => {
  try {
    const response = await fetch(`${ALADHAN_BASE}/qibla/${latitude}/${longitude}`);
    const data = await response.json();
    return data.data.direction || null;
  } catch (error) {
    console.error('Error fetching qibla:', error);
    return null;
  }
};

export const getAsmaAlHusna = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${ALADHAN_BASE}/asmaAlHusna`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching Asma Al Husna:', error);
    return [];
  }
};

export const getVerseOfTheDay = async (language: 'en' | 'ur' = 'en'): Promise<{ arabic: string; translation: string; surah: string; surahNumber: number; number: number } | null> => {
  try {
    // Generate a daily index based on date (1 to 6236)
    const now = new Date();
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    const verseIndex = ((dayOfYear + now.getFullYear()) % 6236) + 1;
    
    const translationEdition = language === 'ur' ? 'ur.jalandhry' : 'en.sahih';
    const response = await fetch(`${QURAN_CLOUD_BASE}/ayah/${verseIndex}/editions/quran-uthmani,${translationEdition}`);
    const data = await response.json();
    
    if (data.code === 200 && data.data && Array.isArray(data.data)) {
      const arabic = data.data[0];
      const trans = data.data[1];
      return {
        arabic: arabic.text,
        translation: trans.text,
        surah: language === 'ur' ? arabic.surah.name : arabic.surah.englishName,
        surahNumber: arabic.surah.number,
        number: arabic.numberInSurah
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching verse of the day:', error);
    return null;
  }
};

export const getJuzDetail = async (number: number, language: 'en' | 'ur' = 'ur'): Promise<Ayah[]> => {
  try {
    const translationEdition = language === 'ur' ? 'ur.jalandhry' : 'en.sahih';
    
    // Multiple editions endpoint for juz
    try {
      const url = `${QURAN_CLOUD_BASE}/juz/${number}/editions/quran-uthmani,${translationEdition},ar.alafasy`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.code === 200 && data.data && Array.isArray(data.data) && data.data.length >= 2) {
        const arabic = data.data[0];
        const translation = data.data[1];
        const audio = data.data[2] || { ayahs: [] };
        
        return arabic.ayahs.map((ayah: any, index: number) => ({
          ...ayah,
          translation: translation.ayahs[index]?.text || '',
          audio: audio.ayahs[index]?.audio || undefined
        }));
      }
    } catch (e) {
      console.warn("Combined Juz fetch failed, trying separate fetch");
    }

    // Fallback: Fetch separately
    const arabicRes = await fetch(`${QURAN_CLOUD_BASE}/juz/${number}/quran-uthmani`);
    const transRes = await fetch(`${QURAN_CLOUD_BASE}/juz/${number}/${translationEdition}`);
    const audioRes = await fetch(`${QURAN_CLOUD_BASE}/juz/${number}/ar.alafasy`);
    const arabicData = await arabicRes.json();
    const transData = await transRes.json();
    const audioData = await audioRes.json();

    if (arabicData.code === 200 && transData.code === 200 && arabicData.data?.ayahs && transData.data?.ayahs) {
      return arabicData.data.ayahs.map((ayah: any, index: number) => ({
        ...ayah,
        translation: transData.data.ayahs[index]?.text || '',
        audio: audioData.code === 200 ? audioData.data.ayahs[index]?.audio : undefined
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching juz content:', error);
    return [];
  }
};
