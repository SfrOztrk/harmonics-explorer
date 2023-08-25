import i18n from "i18next";
import { initReactI18next } from "react-i18next";   

const browserLang = (navigator.language == "tr") ? 'tr' : 'en';

i18n.use(initReactI18next).init({
  lng: browserLang,
  fallbackLng: browserLang,
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: {
      translation: {
        title: "Waveform Generator",
        freq: "Fundamental Frequency",
        nc: "Number of Cycles",
        p2p: "Peak-to-Peak",
        peak: "Peak",
        rms: "Root Mean Square",
        zcp: "Zero Crossing Points",
        sec: "seconds",
        harmonics: "Harmonics",
        addHarmonic: "Add Harmonic",
        harmFreq: "Harmonic Frequency",
        amplitude: "Amplitude",
        phaseAngle: "Phase Angle",
        degree: "Degree",
        waveform: "Waveform",
        time: "Time",
        copyUrl: "Copy URL",
        copied: "Copied",
        export: "Export",
        language: "Language",
        eng: "English",
        tur: "Turkish",
        freqAlert: "Fundamental Frequency should be a positive number.",
        cycleAlert: "Number of Cycles should be a positive number.",
      },
    },

    tr: {
      translation: {
        title: "Dalga Formu Üreteci",
        freq: "Temel Frekans",
        nc: "Döngü Sayısı",
        p2p: "Tepeden Tepeye",
        peak: "Tepe",
        rms: "Kök Kare Ortalama",
        zcp: "Sıfırdan Geçiş Noktaları",
        sec: "saniye",
        harmonics: "Harmonikler",
        addHarmonic: "Harmonİk Ekle",
        harmFreq: "Harmonik Frekansı",
        amplitude: "Genlik",
        phaseAngle: "Faz Açısı",
        degree: "Derece",
        waveform: "Dalga Formu",
        time: "Zaman",
        copyUrl: "URL'yİ Kopyala",
        copied: "Kopyalandı",
        export: "İndİr",
        language: "Dil",
        eng: "İngilizce",
        tur: "Türkçe",
        freqAlert: "Temel Frekans positif sayı olmalıdır.",
        cycleAlert: "Döngü Sayısı positif sayı olmalıdır.",
      },
    },
  },
});

export default i18n;
