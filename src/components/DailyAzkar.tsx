import { useState } from 'react';
import { 
  Sun, 
  Moon, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  BookOpen, 
  Languages, 
  Sparkles,
  ArrowLeft,
  Menu
} from 'lucide-react';
import { cn } from '../lib/utils';

type Section = 'hub' | 'azkar' | 'namaz-method' | 'namaz-translation';

interface AzkarItem {
  id: number;
  arabic: string;
  translation: string;
  target: number;
}

const MORNING_AZKAR: AzkarItem[] = [
  {
    id: 1,
    arabic: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    translation: "Ayat-ul-Kursi: Allah! There is no god but He, the Living, the Sustainer of all existence. Neither slumber nor sleep overtakes Him. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is [presently] before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
    target: 1
  },
  {
    id: 2,
    arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ . اللَّهُ الصَّمَدُ . لَمْ يَلِدْ وَلَمْ يُولَدْ . وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ (3 Times)",
    translation: "Surah Al-Ikhlas: Say, 'He is Allah, [who is] One, Allah, the Eternal Refuge. He neither begets nor is born, Nor is there to Him any equivalent.'",
    target: 3
  },
  {
    id: 3,
    arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ . مِنْ شَرِّ مَا خَلَقَ . وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ . وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ . وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ (3 Times)",
    translation: "Surah Al-Falaq: Say, 'I seek refuge in the Lord of daybreak From the evil of that which He created And from the evil of darkness when it settles And from the evil of the blowers in knots And from the evil of an envier when he envies.'",
    target: 3
  },
  {
    id: 4,
    arabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ . مَلِكِ النَّاسِ . إِلَهِ النَّاسِ . مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ . الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ . مِنَ الْجِنَّةِ وَالنَّاسِ (3 Times)",
    translation: "Surah An-Nas: Say, 'I seek refuge in the Lord of mankind, The Sovereign of mankind, The God of mankind, From the evil of the retreating whisperer - Who whispers [evil] into the breasts of mankind - From among the jinn and mankind.'",
    target: 3
  },
  {
    id: 5,
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
    translation: "We have reached the morning and at this very time unto Allah belongs all sovereignty, and all praise is for Allah. None has the right to be worshipped except Allah, alone, without any partner, to Him belong all sovereignty and praise and He is over all things omnipotent. My Lord, I ask You for the good of this day and the good of what follows it and I take refuge in You from the evil of this day and the evil of what follows it. My Lord, I take refuge in You from laziness and senility. My Lord, I take refuge in You from torment in the Fire and punishment in the grave.",
    target: 1
  },
  {
    id: 6,
    arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ",
    translation: "Sayyid-ul-Istighfar: O Allah, You are my Lord, there is no god but You. You have created me and I am Your slave and I am upon Your covenant and promise as much as I am able. I seek refuge in You from the evil of what I have done. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for surely none can forgive sins except You.",
    target: 1
  }
];

const EVENING_AZKAR: AzkarItem[] = [
  {
    id: 10,
    arabic: "اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ وَلَا يَئُودُهُ حِفْظُهُمَا وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    translation: "Ayat-ul-Kursi: Allah! There is no god but He, the Living, the Sustainer of all existence. Neither slumber nor sleep overtakes Him. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is [presently] before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
    target: 1
  },
  {
    id: 11,
    arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ . اللَّهُ الصَّمَدُ . لَمْ يَلِدْ وَلَمْ يُولَدْ . وَلَمْ يَكُنْ لَهُ كُفُوًا أَحَدٌ (3 Times)",
    translation: "Surah Al-Ikhlas",
    target: 3
  },
  {
    id: 12,
    arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ",
    translation: "We have reached the evening and at this very time unto Allah belongs all sovereignty, and all praise is for Allah.",
    target: 1
  },
  {
    id: 13,
    arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ",
    translation: "O Allah, by You we enter the evening and by You we enter the morning, by You we live and by You we die, and to You is the final return.",
    target: 1
  },
  {
    id: 14,
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ (3 Times)",
    translation: "I seek refuge in the perfect words of Allah from the evil of what He has created.",
    target: 3
  }
];

const NAMAZ_STEPS = [
  {
    title: { en: "Niyat", ur: "نیت" },
    desc: { en: "Stand facing the Qiblah and make your intention for the prayer.", ur: "قبلہ رخ ہو کر کھڑے ہوں اور دل میں اس نماز کی نیت کریں جو آپ پڑھ رہے ہیں۔" },
    arabic: "نَوَيْتُ أَنْ أُصَلِّيَ لِلَّهِ تَعَالَى رَكْعَتَيْنِ صَلَاةَ الْفَجْرِ فَرْضًا مُسْتَقْبِلَ الْقِبْلَةِ الشَّرِيفَةِ"
  },
  {
    title: { en: "Takbeer-e-Tahreema", ur: "تکبیر تحریمہ" },
    desc: { en: "Raise your hands to your ears and say Allahu Akbar to start.", ur: "دونوں ہاتھ کانوں تک اٹھائیں اور \"اللہ اکبر\" کہہ کر ہاتھ سینے یا ناف کے نیچے باندھ لیں۔" },
    arabic: "اللهُ أَكْبَرُ"
  },
  {
    title: { en: "Sana", ur: "ثنا" },
    desc: { en: "Folding hands and reciting the opening prayer.", ur: "ہاتھ باندھنے کے بعد سب سے پہلے ثنا پڑھیں۔" },
    arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَلَا إِلَهَ غَيْرُكَ"
  },
  {
    title: { en: "Surah Al-Fatiha", ur: "سورۃ الفاتحہ" },
    desc: { en: "Recite the opening chapter of the Quran.", ur: "ثنا کے بعد تعوذ، تسمیہ اور پھر پوری سورۃ الفاتحہ پڑھیں۔" },
    arabic: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ . الرَّحْمَنِ الرَّحِيمِ . مَالِكِ يَوْمِ الدِّينِ . إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ . اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ . صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ"
  },
  {
    title: { en: "Additional Surah", ur: "ضم سورۃ" },
    desc: { en: "Recite another Surah (e.g., Surah Ikhlas).", ur: "سورۃ الفاتحہ کے بعد کوئی بھی سورت پڑھیں، جیسے سورۃ الاخلاص۔" },
    arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ . اللَّهُ الصَّمَدُ . لَمْ يَلِدْ وَلَمْ يُولَدْ . وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ"
  },
  {
    title: { en: "Ruku", ur: "رکوع" },
    desc: { en: "Bow down and say the tasbeeh three times.", ur: "اللہ اکبر کہتے ہوئے رکوع میں جائیں اور کم از کم تین بار تسبیح پڑھیں۔" },
    arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ"
  },
  {
    title: { en: "Qawmah", ur: "قومہ" },
    desc: { en: "Stand back up from Ruku.", ur: "رکوع سے سیدھے کھڑے ہوں اور یہ دعا پڑھیں۔" },
    arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ . رَبَّنَا لَكَ الْحَمْدُ"
  },
  {
    title: { en: "Sajdah", ur: "سجدہ" },
    desc: { en: "Prostrate and say the tasbeeh three times.", ur: "اللہ اکبر کہتے ہوئے سجدے میں جائیں اور تین بار تسبیح پڑھیں۔" },
    arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى"
  },
  {
    title: { en: "Tashahhud", ur: "تشہد" },
    desc: { en: "Sitting in the final position to recite Attahiyat.", ur: "دوسری یا آخری رکعت کے سجدوں کے بعد بیٹھ کر التحیات پڑھیں۔" },
    arabic: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ"
  }
];

const NAMAZ_TRANSLATION = [
  {
    part: "Sana (ثنا)",
    arabic: "سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَى جَدُّكَ، وَلَا إِلَهَ غَيْرُكَ",
    translation: { 
      en: "Glory be to You, O Allah, and all praise is Yours. Blessed is Your name, and exalted is Your majesty. There is no god besides You.",
      ur: "اے اللہ! ہم تیری پاکی بیان کرتے ہیں، تیری تعریف کرتے ہیں، تیرا نام بابرکت ہے، تیری شان بلند ہے اور تیرے سوا کوئی معبود نہیں۔"
    }
  },
  {
    part: "Surat Al-Fatiha (سورۃ الفاتحہ)",
    arabic: "بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ . الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ . الرَّحْمَنِ الرَّحِيمِ . مَالِكِ يَوْمِ الدِّينِ . إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ . اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ . صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
    translation: { 
      en: "In the name of Allah, the Entirely Merciful, the Especially Merciful. All praise is due to Allah, Lord of the worlds. The Entirely Merciful, the Especially Merciful, Sovereign of the Day of Recompense. It is You we worship and You we ask for help. Guide us to the straight path - The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.",
      ur: "اللہ کے نام سے جو نہایت مہربان اور رحم والا ہے۔ سب تعریفیں اللہ ہی کے لیے ہیں جو تمام جہانوں کا پالنے والا ہے، نہایت مہربان اور رحم والا ہے، جزا کے دن کا مالک ہے۔ ہم تیری ہی عبادت کرتے ہیں اور تجھ ہی سے مدد چاہتے ہیں۔ ہمیں سیدھے راستے پر چلا، ان لوگوں کے راستے پر جن پر تو نے انعام کیا، ان کے راستے پر نہیں جن پر تیرا غصہ ہوا اور نہ گمراہوں کے راستے پر۔"
    }
  },
  {
    part: "Ruku (رکوع)",
    arabic: "سُبْحَانَ رَبِّيَ الْعَظِيمِ",
    translation: { 
      en: "Glory be to my Lord, the Almighty.",
      ur: "پاک ہے میرا پروردگار جو بڑی عظمت والا ہے۔"
    }
  },
  {
    part: "Qaumah (رکوع سے کھڑا ہونا)",
    arabic: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ . رَبَّنَا لَكَ الْحَمْدُ",
    translation: { 
      en: "Allah hears those who praise Him. Our Lord, to You belongs all praise.",
      ur: "اللہ نے اس کی سن لی جس نے اس کی تعریف کی۔ اے ہمارے رب! تمام تعریفیں تیرے ہی لیے ہیں۔"
    }
  },
  {
    part: "Sajdah (سجدہ)",
    arabic: "سُبْحَانَ رَبِّيَ الْأَعْلَى",
    translation: { 
      en: "Glory be to my Lord, the Most High.",
      ur: "پاک ہے میرا پروردگار جو سب سے بلند ہے۔"
    }
  },
  {
    part: "Attahiyat (تشہد)",
    arabic: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَى عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
    translation: { 
      en: "All compliments, prayers and pure words are due to Allah. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is no god but Allah, and I bear witness that Muhammad is His servant and messenger.",
      ur: "تمام زبانی، بدنی اور مالی عبادتیں اللہ ہی کے لیے ہیں۔ اے نبی! آپ پر سلام اور اللہ کی رحمتیں اور برکتیں ہوں۔ ہم پر اور اللہ کے نیک بندوں پر سلامتی ہو۔ میں گواہی دیتا ہوں کہ اللہ کے سوا کوئی معبود نہیں اور میں گواہی دیتا ہوں کہ محمد ﷺ اس کے بندے اور رسول ہیں۔"
    }
  },
  {
    part: "Durood Ibrahim (درود ابراہیمی)",
    arabic: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيْدٌ مَجِيْدٌ . اللَّهُمَّ بَارِكْ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيْدٌ مَجِيْدٌ",
    translation: { 
      en: "O Allah, confer favor upon Muhammad and upon the family of Muhammad as You conferred favor upon Abraham and upon the family of Abraham. Indeed, You are Praiseworthy and Majestic. O Allah, bless Muhammad and the family of Muhammad as You blessed Abraham and the family of Abraham. Indeed, You are Praiseworthy and Majestic.",
      ur: "اے اللہ! محمد ﷺ اور ان کی آل پر رحمتیں نازل فرما، جس طرح تو نے ابراہیم علیہ السلام اور ان کی آل پر رحمتیں نازل فرمائیں، بے شک تو بڑی تعریف والا اور بزرگی والا ہے۔ اے اللہ! محمد ﷺ اور ان کی آل پر برکتیں نازل فرما، جس طرح تو نے ابراہیم علیہ السلام اور ان کی آل پر برکتیں نازل فرمائیں، بے شک تو بڑی تعریف والا اور بزرگی والا ہے۔"
    }
  },
  {
    part: "Dua-e-Masura (دعا مأثورہ)",
    arabic: "اللَّهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا وَلَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ ، فَاغْفِرْ لِي مَغْفِرَةً مِنْ عِنْدِكَ وَارْحَمْنِي ، إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ",
    translation: { 
      en: "O Allah, I have greatly wronged myself, and no one forgives sins except You. So grant me forgiveness from You and have mercy on me. Indeed, You are the Forgiving, the Merciful.",
      ur: "اے اللہ! میں نے اپنی جان پر بہت ظلم کیا ہے اور تیرے سوا کوئی گناہوں کو معاف کرنے والا نہیں، پس تو اپنی خاص مغفرت سے مجھے معاف فرما دے اور مجھ پر رحم فرما، بے شک تو ہی معاف کرنے والا اور نہایت رحم والا ہے۔"
    }
  },
  {
    part: "Salam (سلام)",
    arabic: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ",
    translation: { 
      en: "Peace and mercy of Allah be upon you.",
      ur: "آپ پر سلامتی اور اللہ کی رحمت ہو۔"
    }
  }
];

export default function DailyAzkar({ language, onOpenTools, onBack }: { language: 'en' | 'ur'; onOpenTools: () => void; onBack: () => void }) {
  const [activeSection, setActiveSection] = useState<Section>('hub');
  const [activeAzkarTab, setActiveAzkarTab] = useState<'morning' | 'evening'>('morning');
  const [counts, setCounts] = useState<Record<number, number>>({});

  const t = {
    en: {
      title: 'Deen Lab',
      subtitle: 'Knowledge & Remembrance',
      azkar: 'Daily Azkar',
      azkarDesc: 'Morning and evening supplications',
      namazMethod: 'Method of Namaz',
      namazMethodDesc: 'Step by step guide to pray',
      namazTranslation: 'Namaz Translation',
      namazTranslationDesc: 'Complete 2 Rakat Urdu Translation',
      back: 'Back to Menu'
    },
    ur: {
      title: 'دین لیب',
      subtitle: 'علم اور ذکر',
      azkar: 'روزانہ اذکار',
      azkarDesc: 'صبح اور شام کی دعائیں',
      namazMethod: 'نماز کا طریقہ',
      namazMethodDesc: 'نماز پڑھنے کا مکمل طریقہ',
      namazTranslation: 'نماز کا ترجمہ',
      namazTranslationDesc: '2 رکعت نماز کا مکمل اردو ترجمہ',
      back: 'مینیو میں واپس'
    }
  }[language];

  if (activeSection === 'hub') {
    return (
      <div className="space-y-6 pb-10">
        <header className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              aria-label="Go back"
              className="p-3 glass-card rounded-2xl text-accent-gold hover:bg-white/5 transition-colors shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-accent-gold uppercase tracking-tight">{t.title}</h2>
              <p className="text-[10px] text-text-primary/40 font-bold uppercase tracking-[0.2em]">{t.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onOpenTools}
            aria-label="Open menu"
            className="p-3 glass-card rounded-2xl text-accent-gold hover:bg-white/5 transition-colors shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={() => setActiveSection('azkar')}
            className="glass-card p-6 rounded-[2.5rem] border border-accent-gold/10 hover:border-accent-gold/30 text-left group transition-transform active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent-gold/10 flex items-center justify-center text-accent-gold">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-text-primary">{t.azkar}</h3>
                <p className="text-xs text-text-primary/40">{t.azkarDesc}</p>
              </div>
              <ChevronRight className="w-5 h-5 ml-auto text-text-primary/20" />
            </div>
          </button>

          <button
            onClick={() => setActiveSection('namaz-method')}
            className="glass-card p-6 rounded-[2.5rem] border border-accent-gold/10 hover:border-accent-gold/30 text-left group transition-transform active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent-gold/10 flex items-center justify-center text-accent-gold">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-text-primary">{t.namazMethod}</h3>
                <p className="text-xs text-text-primary/40">{t.namazMethodDesc}</p>
              </div>
              <ChevronRight className="w-5 h-5 ml-auto text-text-primary/20" />
            </div>
          </button>

          <button
            onClick={() => setActiveSection('namaz-translation')}
            className="glass-card p-6 rounded-[2.5rem] border border-accent-gold/10 hover:border-accent-gold/30 text-left group transition-transform active:scale-[0.99]"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-accent-gold/10 flex items-center justify-center text-accent-gold">
                <Languages className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-text-primary">{t.namazTranslation}</h3>
                <p className="text-xs text-text-primary/40">{t.namazTranslationDesc}</p>
              </div>
              <ChevronRight className="w-5 h-5 ml-auto text-text-primary/20" />
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setActiveSection('hub')}
          className="flex items-center gap-2 text-accent-gold font-bold text-xs uppercase tracking-widest hover:translate-x-[-4px] transition-transform"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.back}
        </button>
        <button
          onClick={onOpenTools}
          aria-label="Open menu"
          className="p-3 glass-card rounded-2xl text-accent-gold hover:bg-white/5 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {activeSection === 'azkar' && (
        <div className="space-y-6">
          <div className="flex p-1 bg-bg-secondary rounded-2xl border border-border-main">
            <button 
              onClick={() => setActiveAzkarTab('morning')}
              className={cn(
                "flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors font-bold text-xs uppercase tracking-widest",
                activeAzkarTab === 'morning' ? "bg-accent-gold text-bg-primary shadow-sm" : "text-text-primary/40"
              )}
            >
              <Sun className="w-4 h-4" />
              {language === 'ur' ? 'صبح' : 'Morning'}
            </button>
            <button 
              onClick={() => setActiveAzkarTab('evening')}
              className={cn(
                "flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors font-bold text-xs uppercase tracking-widest",
                activeAzkarTab === 'evening' ? "bg-accent-gold text-bg-primary shadow-sm" : "text-text-primary/40"
              )}
            >
              <Moon className="w-4 h-4" />
              {language === 'ur' ? 'شام' : 'Evening'}
            </button>
          </div>

          <div className="space-y-4">
            {(activeAzkarTab === 'morning' ? MORNING_AZKAR : EVENING_AZKAR).map(item => (
              <div 
                key={item.id}
                onClick={() => setCounts(p => ({ ...p, [item.id]: (p[item.id] || 0) + 1 }))}
                className="glass-card p-6 rounded-[2.5rem] border border-accent-gold/10 hover:border-accent-gold/30 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-center mb-4">
                  <div className="w-8 h-8 rounded-lg bg-accent-gold/20 flex items-center justify-center text-accent-gold font-bold text-xs">
                    {counts[item.id] || 0}/{item.target}
                  </div>
                  { (counts[item.id] || 0) >= item.target && <CheckCircle2 className="w-5 h-5 text-green-500" /> }
                </div>
                <p className="arabic-text text-2xl text-right mb-4 leading-loose">{item.arabic}</p>
                <p className="text-xs text-text-primary/60 italic">{item.translation}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'namaz-method' && (
        <div className="space-y-4">
          {NAMAZ_STEPS.map((step, idx) => (
            <div key={idx} className="glass-card p-6 rounded-[2.5rem] border border-accent-gold/10">
              <span className="text-[10px] text-accent-gold font-bold uppercase tracking-widest">Step {idx + 1}</span>
              <h3 className="text-xl font-bold text-text-primary mt-1 mb-2">{language === 'ur' ? step.title.ur : step.title.en}</h3>
              <p className="arabic-text text-xl text-accent-gold mb-3 text-right">{step.arabic}</p>
              <p className="text-sm text-text-primary/60">{language === 'ur' ? step.desc.ur : step.desc.en}</p>
            </div>
          ))}
        </div>
      )}

      {activeSection === 'namaz-translation' && (
        <div className="space-y-4">
          {NAMAZ_TRANSLATION.map((item, idx) => (
            <div key={idx} className="glass-card p-6 rounded-[2.5rem] border border-accent-gold/10">
              <h3 className="text-lg font-bold text-accent-gold mb-2">{item.part}</h3>
              <p className="arabic-text text-2xl text-right mb-3 text-text-primary">{item.arabic}</p>
              <div className="p-4 bg-accent-gold/5 rounded-2xl">
                <p className={cn(
                  "text-sm text-text-primary/80 leading-relaxed",
                  language === 'ur' ? "urdu-text text-base" : ""
                )}>
                  {language === 'ur' ? item.translation.ur : item.translation.en}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

