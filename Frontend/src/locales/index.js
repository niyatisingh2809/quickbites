import en from './en.js';
import hi from './hi.js';
import bn from './bn.js';
import mr from './mr.js';
import gu from './gu.js';
import ta from './ta.js';
import te from './te.js';
import kn from './kn.js';
import ml from './ml.js';
import pa from './pa.js';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', script: 'Latin' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', script: 'Devanagari' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', script: 'Bengali' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', script: 'Devanagari' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', script: 'Gujarati' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', script: 'Tamil' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', script: 'Telugu' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', script: 'Kannada' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', script: 'Malayalam' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', script: 'Gurmukhi' }
];

export const translations = {
  en,
  hi,
  bn,
  mr,
  gu,
  ta,
  te,
  kn,
  ml,
  pa
};

export const getTranslation = (langCode, key) => {
  return translations[langCode]?.[key] || translations['en']?.[key] || key;
};
