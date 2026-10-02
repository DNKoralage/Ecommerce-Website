'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'si';

interface Translations {
  [key: string]: {
    en: string;
    si: string;
  };
}

export const translations: Translations = {
  // Brand & Navigation
  siteName: {
    en: 'Ceylon Times',
    si: 'සිලෝන් ටයිම්ස්',
  },
  tagline: {
    en: 'Challenging Ideology · Authentic Sri Lankan Living Heritage',
    si: 'මතවාදයට අභියෝග කරමින් · සැබෑ ශ්‍රී ලාංකීය උරුමය',
  },
  shopAll: {
    en: 'Shop All',
    si: 'සියලු නිර්මාණ',
  },
  jewellery: {
    en: 'Ceylon Jewellery',
    si: 'සිලෝන් ස්වර්ණාභරණ',
  },
  textiles: {
    en: 'Handlooms',
    si: 'අත්යන්ත්‍ර රෙදිපිළි',
  },
  sacredLiving: {
    en: 'Sacred Living',
    si: 'පුදබිම් කලාව',
  },
  ayurveda: {
    en: 'Ayurveda',
    si: 'ආයුර්වේදය',
  },
  tea: {
    en: 'Ceylon Tea',
    si: 'සිලෝන් තේ',
  },
  about: {
    en: 'Heritage',
    si: 'අපගේ උරුමය',
  },
  admin: {
    en: 'Admin',
    si: 'පරිපාලක',
  },
  searchPlaceholder: {
    en: 'Search Ceylon sapphires, handlooms, temple brass, pure tea...',
    si: 'සිලෝන් නිල් මැණික්, උඩරට අත්යන්ත්‍ර, පිත්තල පහන් සොයන්න...',
  },
  cart: {
    en: 'Bag',
    si: 'මල්ල',
  },
  account: {
    en: 'Account',
    si: 'ගිණුම',
  },
  announcement: {
    en: 'Complimentary island-wide delivery on orders over Rs.7,500 — Use code CEYLON22 ✦ Free gift wrapping',
    si: 'රු. 7,500 ට වැඩි ඇණවුම් සඳහා දිවයින පුරා නොමිලේ බෙදාහැරීම — CEYLON22 කේතය භාවිත කරන්න ✦ නොමිලේ ඇසුරුම්',
  },

  // Header Widgets
  slTime: {
    en: 'Sri Lanka Time',
    si: 'ශ්‍රී ලංකා වේලාව',
  },
  colomboWeather: {
    en: 'Colombo',
    si: 'කොළඹ',
  },
  kandyWeather: {
    en: 'Kandy',
    si: 'මහනුවර',
  },
  galleWeather: {
    en: 'Galle',
    si: 'ගාල්ල',
  },
  nuwaraEliyaWeather: {
    en: 'Nuwara Eliya',
    si: 'නුවරඑළිය',
  },
  tropicalBreeze: {
    en: 'Tropical Breeze',
    si: 'නිවර්තන සුළං',
  },
  mistyHills: {
    en: 'Misty Highlands',
    si: 'මීදුම් සහිත කඳුකරය',
  },
  sunshine: {
    en: 'Coastal Sunshine',
    si: 'දීප්තිමත් හිරු එළිය',
  },

  // Categories
  'Ceylon Jewellery': {
    en: 'Ceylon Jewellery',
    si: 'සිලෝන් ස්වර්ණාභරණ',
  },
  'Handloom Textiles': {
    en: 'Handloom Textiles',
    si: 'අත්යන්ත්‍ර රෙදිපිළි',
  },
  'Sacred Living': {
    en: 'Sacred Living',
    si: 'පුදබිම් කලාව',
  },
  'Ayurveda & Botanicals': {
    en: 'Ayurveda & Botanicals',
    si: 'ආයුර්වේද ඖෂධ හා සුවය',
  },
  'Ceylon Tea Reserve': {
    en: 'Ceylon Tea Reserve',
    si: 'සිලෝන් තේ අස්වැන්න',
  },
  catDescJewellery: {
    en: 'Hand-set Ceylon sapphires and alexandrites in oxidised silver from Galle Fort craftsmen.',
    si: 'ගාල්ල කොටුවේ රිදී නිර්මාණ ශිල්පීන් අතින් නිමවූ සහතික කළ රත්නපුර නිල් මැණික් පළඳනා.',
  },
  catDescTextiles: {
    en: 'Kandyan silk sarees, Beeralu lace, and hand-batik sarongs woven on traditional frame looms.',
    si: 'පාරම්පරික අත්යන්ත්‍ර මඟින් වියන ලද උඩරට සේද සාරි, බීරළු රේන්ද සහ බතික් නිර්මාණ.',
  },
  catDescSacred: {
    en: 'Temple brass oil lamps, Kolam pottery vessels, and hand-carved ebony ceremonial pieces.',
    si: 'පූජනීය පිත්තල පහන්, කෝලම් වෙස්මුහුණු සහ කළුවර දැවයෙන් කළ සාම්ප්‍රදායික කැටයම්.',
  },
  catDescAyurveda: {
    en: 'Cold-pressed coconut oil serums, Ceylon cinnamon extracts, and hand-rolled herbal elixirs.',
    si: 'ස්වභාවික පොල්තෙල්, සිලෝන් කුරුඳු සාරය සහ පාරම්පරික හෙළ ඔසු සත්කාරක.',
  },
  catDescTea: {
    en: 'Single-estate Silver Tips, aged Pu-erh blends, and ceremonial first-flush Nuwara Eliya.',
    si: 'නුවරඑළිය සහ ඇල්ල කඳුකරයේ අතින් නෙළූ සුවඳවත් රිදී තේ දළු සහ කළු තේ එකතුව.',
  },
  featuredDisciplines: {
    en: 'Featured Disciplines',
    si: 'ප්‍රමුඛ ශිල්ප අංශ',
  },
  guildsHeading: {
    en: 'Ceylon Heritage Guilds & Living Craft',
    si: 'දේශීය ශිල්ප ශ්‍රේණි සහ පාරම්පරික කලාව',
  },
  exploreTreasury: {
    en: 'Explore Treasury',
    si: 'නිර්මාණ එකතුව බලන්න',
  },
  exploreDiscipline: {
    en: 'Explore Discipline',
    si: 'අංශය පරීක්ෂා කරන්න',
  },

  // Sections
  latestIslandCreations: {
    en: 'Latest Island Creations',
    si: 'නවතම ශ්‍රී ලාංකීය නිර්මාණ',
  },
  freshFromWorkshops: {
    en: 'Fresh From The Workshops',
    si: 'නැවුම් කලා නිර්මාණ',
  },
  exploreAllCreations: {
    en: 'Explore All Creations',
    si: 'සියලු නිර්මාණ නරඹන්න',
  },
  patronTreasured: {
    en: 'Patron Treasured Pieces',
    si: 'වැඩිම පිරිසක් ඇණවුම් කළ නිර්මාණ',
  },
  curatedTreasures: {
    en: 'Curated Heritage Treasures',
    si: 'සුවිශේෂී උරුම එකතුව',
  },

  // Product Titles
  'Ceylon Blue Sapphire Pendant — Galle Fort Silver': {
    en: 'Ceylon Blue Sapphire Pendant — Galle Fort Silver',
    si: 'සිලෝන් නිල් මැණික් පෙන්ඩනය — ගාල්ල කොටුවේ රිදී නිර්මාණය',
  },
  'Kandyan Silk Saree — Royal Midnight Weave': {
    en: 'Kandyan Silk Saree — Royal Midnight Weave',
    si: 'උඩරට සේද සාරිය — රාජකීය නිල් පැහැති රන් නූල් වියමන',
  },
  'Hand-batik Linen Kurta — Elephant Motif Collection': {
    en: 'Hand-batik Linen Kurta — Elephant Motif Collection',
    si: 'අතින් නිමවූ බතික් ලිනන් කුර්තාව — ඇත් රූ රටා එකතුව',
  },
  'Sacred Temple Brass Oil Lamp (Pahan Ruwa)': {
    en: 'Sacred Temple Brass Oil Lamp (Pahan Ruwa)',
    si: 'පාරම්පරික පිත්තල පහන (පහන් රුව) — මහනුවර කලාව',
  },
  'Nuwara Eliya Single-Estate Silver Tips White Tea': {
    en: 'Nuwara Eliya Single-Estate Silver Tips White Tea',
    si: 'නුවරඑළිය සිල්වර් ටිප්ස් සුදු තේ — තනි වතු අස්වැන්න',
  },
  'Hand-Carved Ambalangoda Mayura Raksha Mask': {
    en: 'Hand-Carved Ambalangoda Mayura Raksha Mask',
    si: 'අම්බලන්ගොඩ අතින් කැටයම් කළ මයුර රාක්ෂ වෙස්මුහුණ',
  },
  'Ratnapura Padparadscha Sapphire Ring (18K Gold)': {
    en: 'Ratnapura Padparadscha Sapphire Ring (18K Gold)',
    si: 'රත්නපුර පද්මරාග මැණික් මුදුව (කැරට් 18 රන්)',
  },
  'Dumbara Handwoven Geometric Runner': {
    en: 'Dumbara Handwoven Geometric Runner',
    si: 'දුම්බර අත්යන්ත්‍ර ජ්‍යාමිතික මේස සැරසිලි වියමන',
  },

  // Product Card & Actions
  acquirePiece: {
    en: 'Acquire Piece',
    si: 'මල්ලට එක් කරන්න',
  },
  quickView: {
    en: 'Quick View',
    si: 'ඉක්මන් බැල්ම',
  },
  ceylonNew: {
    en: 'Ceylon New',
    si: 'නව නිර්මාණ',
  },
  sale: {
    en: 'Privilege',
    si: 'විශේෂ වට්ටම්',
  },

  // Promotional Banner
  privilegeTag: {
    en: 'Island Privilege',
    si: 'දිවයිනේ වරප්‍රසාදය',
  },
  privilegeTitle: {
    en: 'The Sovereign Solstice Privilege',
    si: 'රාජකීය සිලෝන් වට්ටම් වරප්‍රසාදය',
  },
  privilegeDesc: {
    en: 'Enjoy 20% privilege across all temple living crafts and handloom silks with code SOLSTICE20 at checkout.',
    si: 'SOLSTICE20 කේතය භාවිත කරමින් පුදබිම් කලාව සහ අත්යන්ත්‍ර රෙදිපිළි සඳහා 20% ක විශේෂ වට්ටමක් ලබාගන්න.',
  },
  useCode: {
    en: 'Use Code',
    si: 'කේතය භාවිත කරන්න',
  },
  copiedCode: {
    en: 'Code Copied!',
    si: 'කේතය පිටපත් විය!',
  },
  claimPrivilege: {
    en: 'Claim Privilege',
    si: 'වරප්‍රසාදය ලබාගන්න',
  },
  days: { en: 'Days', si: 'දින' },
  hours: { en: 'Hours', si: 'පැය' },
  minutes: { en: 'Mins', si: 'මිනිත්තු' },
  seconds: { en: 'Secs', si: 'තත්පර' },

  // Trust Badges
  gemProvenance: {
    en: 'Certified Ceylon Provenance',
    si: 'සහතික කළ දේශීය සම්භවය',
  },
  gemDesc: {
    en: 'Direct unheated sapphires & gemstones from Ratnapura and Galle Fort artisan guilds with gemmologist seal.',
    si: 'රත්නපුර සහ ගාල්ලෙන් සෘජුව ලබාගත් ස්වභාවික නිල් මැණික් හා ස්වර්ණාභරණ.',
  },
  islandCourier: {
    en: 'Island-Wide Insured Courier',
    si: 'දිවයින පුරා විශ්වාසනීය බෙදාහැරීම',
  },
  islandCourierDesc: {
    en: 'Complimentary on orders over Rs. 7,500. Door-to-door transit via tracked courier across all 9 provinces.',
    si: 'රු. 7,500 ට වැඩි ඇණවුම් සඳහා නොමිලේ. පළාත් 9 ම ආවරණය වන පරිදි ආරක්ෂිතව ඔබ අතට.',
  },
  templeCraft: {
    en: 'Master Artisan Lineage',
    si: 'පාරම්පරික ශිල්පීය අභිමානය',
  },
  templeCraftDesc: {
    en: 'Hand-loomed Kandyan textiles and ceremonial cast brass supporting generational craft communities.',
    si: 'උඩරට අත්යන්ත්‍ර රෙදිපිළි සහ පාරම්පරික පිත්තල නිර්මාණකරුවන් සවිබල ගන්වමින්.',
  },

  // Testimonials
  patronVoices: {
    en: 'Patron Voices',
    si: 'පාරිභෝගික පැසසුම්',
  },
  chroniclesHeading: {
    en: 'Patron Chronicles & Reflections',
    si: 'පාරිභෝගික පැසසුම් සහ අදහස්',
  },
  chroniclesDesc: {
    en: 'Reflections from custodians across the island and around the world who cherish authentic Sri Lankan living heritage.',
    si: 'සැබෑ ශ්‍රී ලාංකීය උරුමය අගය කරන දේශීය සහ විදේශීය පාරිභෝගිකයින්ගේ අවංක අදහස්.',
  },

  // Newsletter
  atelierDispatch: {
    en: 'Atelier Dispatch',
    si: 'සිලෝන් ටයිම්ස් පුවත් පත්‍රිකාව',
  },
  joinAtelier: {
    en: 'Join The Ceylon Times Atelier Dispatch',
    si: 'සිලෝන් ටයිම්ස් පුවත් පත්‍රිකාවට එක්වන්න',
  },
  newsletterDesc: {
    en: 'Receive private invitations to gemstone auctions, seasonal tea harvests, and bespoke handloom drops directly from our Colombo workshop.',
    si: 'කොළඹ අපගේ නිර්මාණාගාරයෙන් සෘජුවම පැවැත්වෙන මැණික් වෙන්දේසි, සුවිශේෂී තේ අස්වැන්න සහ නවතම අත්යන්ත්‍ර නිර්මාණ පිළිබඳ තොරතුරු ලබාගන්න.',
  },
  emailPlaceholder: {
    en: 'Enter your email address',
    si: 'ඔබගේ විද්‍යුත් තැපැල් ලිපිනය ඇතුළත් කරන්න',
  },
  subscribe: {
    en: 'Subscribe to Atelier',
    si: 'දැන්ම ලියාපදිංචි වන්න',
  },
  newsletterSuccess: {
    en: 'Welcome to the Ceylon Times Atelier Dispatch.',
    si: 'සිලෝන් ටයිම්ස් පුවත් පත්‍රිකාවට ඔබව සාදරයෙන් පිළිගනිමු.',
  },

  // Footer
  footerAbout: {
    en: 'Ceylon Times (ceylon-times.lk) is the sovereign digital atelier celebrating timeless Sri Lankan craftsmanship, certified Ratnapura sapphires, Kandyan handlooms, and sacred temple living arts.',
    si: 'සිලෝන් ටයිම්ස් (ceylon-times.lk) යනු සැබෑ ශ්‍රී ලාංකීය උරුමය, සහතිකලත් රත්නපුර නිල් මැණික්, උඩරට අත්යන්ත්‍ර රෙදිපිළි සහ පූජනීය පිත්තල කලාව ලොවට ගෙන යන ඩිජිටල් නිර්මාණ කේන්ද්‍රස්ථානයයි.',
  },
  quickLinks: {
    en: 'Quick Links',
    si: 'ප්‍රධාන සබැඳි',
  },
  disciplines: {
    en: 'Craft Disciplines',
    si: 'කලා අංශ',
  },
  clientConcierge: {
    en: 'Client Concierge',
    si: 'පාරිභෝගික සේවය',
  },
  contactUs: {
    en: 'Contact Us',
    si: 'අප අමතන්න',
  },
  shippingDelivery: {
    en: 'Shipping & Island Delivery',
    si: 'බෙදාහැරීම් තොරතුරු',
  },
  returnsProvenance: {
    en: 'Returns & Authenticity Certificate',
    si: 'ආපසු භාරගැනීම් සහ සහතික',
  },
  privacyPolicy: {
    en: 'Privacy Policy',
    si: 'පෞද්ගලිකත්ව ප්‍රතිපත්තිය',
  },
  termsService: {
    en: 'Terms of Heritage',
    si: 'සේවා කොන්දේසි',
  },
  addressText: {
    en: '42 Galle Face Promenade, Colombo 03, Sri Lanka 00300',
    si: 'අංක 42, ගාලු මුවදොර මාවත, කොළඹ 03, ශ්‍රී ලංකාව',
  },
  allRightsReserved: {
    en: 'All rights reserved. Powered by Sovereign Sri Lankan Heritage.',
    si: 'සියලු හිමිකම් ඇවිරිණි. ශ්‍රී ලාංකීය පෞරාණික උරුමයේ අභිමානය.',
  },

  // Cart & Checkout
  yourBag: {
    en: 'Your Archival Bag',
    si: 'ඔබේ භාණ්ඩ මල්ල',
  },
  emptyBag: {
    en: 'Your bag is empty',
    si: 'ඔබේ මල්ල හිස්ව පවතී',
  },
  subtotal: {
    en: 'Subtotal',
    si: 'උප එකතුව',
  },
  shipping: {
    en: 'Island Delivery',
    si: 'බෙදාහැරීමේ ගාස්තු',
  },
  total: {
    en: 'Total (LKR)',
    si: 'මුළු මුදල (රු.)',
  },
  checkout: {
    en: 'Proceed to Secure Checkout',
    si: 'ආරක්ෂිත ගෙවීමට පිවිසෙන්න',
  },
  complimentary: {
    en: 'Complimentary',
    si: 'නොමිලේ',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ceylon_times_lang') as Language;
      if (stored === 'en' || stored === 'si') {
        setLanguageState(stored);
      }
    } catch (_e) {}
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('ceylon_times_lang', lang);
      document.documentElement.lang = lang;
      if (lang === 'si') {
        document.body.classList.add('font-sinhala');
      } else {
        document.body.classList.remove('font-sinhala');
      }
    } catch (_e) {}
  };

  useEffect(() => {
    if (language === 'si') {
      document.body.classList.add('font-sinhala');
      document.documentElement.lang = 'si';
    } else {
      document.body.classList.remove('font-sinhala');
      document.documentElement.lang = 'en';
    }
  }, [language]);

  const t = (key: string): string => {
    if (translations[key] && translations[key][language]) {
      return translations[key][language];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
