'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Sun, CloudRain, CloudSun } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { sound } from '@/lib/sound';

interface WeatherCity {
  nameEn: string;
  nameSi: string;
  temp: number;
  conditionEn: string;
  conditionSi: string;
  type: 'sunny' | 'partly' | 'rainy';
}

const CITIES: WeatherCity[] = [
  {
    nameEn: 'Colombo',
    nameSi: 'කොළඹ',
    temp: 29,
    conditionEn: 'Tropical Breeze',
    conditionSi: 'නිවර්තන සුළං',
    type: 'sunny',
  },
  {
    nameEn: 'Kandy',
    nameSi: 'මහනුවර',
    temp: 24,
    conditionEn: 'Misty Highlands',
    conditionSi: 'මීදුම් කඳුකරය',
    type: 'partly',
  },
  {
    nameEn: 'Galle Fort',
    nameSi: 'ගාල්ල කොටුව',
    temp: 28,
    conditionEn: 'Coastal Sun',
    conditionSi: 'මුහුදු තීරය',
    type: 'sunny',
  },
  {
    nameEn: 'Nuwara Eliya',
    nameSi: 'නුවරඑළිය',
    temp: 18,
    conditionEn: 'Highland Mist',
    conditionSi: 'සිසිල් මීදුම',
    type: 'rainy',
  },
];

export default function SriLankaWidgets() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [cityIndex, setCityIndex] = useState(0);

  // Live Clock for Asia/Colombo (UTC+5:30)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeFormatter = new Intl.DateTimeFormat(language === 'si' ? 'si-LK' : 'en-US', {
        timeZone: 'Asia/Colombo',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });

      const dateFormatter = new Intl.DateTimeFormat(language === 'si' ? 'si-LK' : 'en-US', {
        timeZone: 'Asia/Colombo',
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });

      setTimeStr(timeFormatter.format(now));
      setDateStr(dateFormatter.format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [language]);

  const currentCity = CITIES[cityIndex];

  const handleNextCity = () => {
    sound.playClick();
    setCityIndex((prev) => (prev + 1) % CITIES.length);
  };

  const isLight = theme === 'light';

  return (
    <div
      className="flex items-center gap-2 sm:gap-3 text-xs font-medium"
      style={{ color: isLight ? '#0F172A' : '#E8E3D8' }}
    >
      {/* 1. Live Sri Lanka Time & Date Display */}
      <div
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 rounded backdrop-blur-md shadow-xs transition-colors"
        style={{
          background: isLight ? '#FFFFFF' : 'rgba(9, 14, 29, 0.85)',
          border: isLight ? '1px solid rgba(212, 175, 55, 0.45)' : '1px solid rgba(255, 215, 0, 0.25)',
          boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.04)' : '0 0 10px rgba(255,215,0,0.06)',
        }}
      >
        <Clock className={`w-3.5 h-3.5 ${isLight ? 'text-amber-600' : 'text-[#FFD700] animate-pulse'}`} />
        <div className="flex items-center gap-1.5 font-bold tracking-wider" style={{ fontFamily: 'var(--font-rajdhani)' }}>
          <span style={{ color: isLight ? '#996515' : '#FFD700' }}>
            {timeStr || '03:45:00 PM'}
          </span>
          <span className={isLight ? 'text-slate-300' : 'text-white/30'}>|</span>
          <span className={`text-[11px] hidden sm:inline ${isLight ? 'text-slate-700 font-semibold' : 'text-[#00FFFF]'}`}>
            {dateStr || 'Fri, 2 Oct'}
          </span>
          <span
            className="text-[9px] uppercase px-1 py-0.2 rounded-xs font-mono ml-0.5"
            style={{
              background: isLight ? 'rgba(212, 175, 55, 0.2)' : 'rgba(255, 215, 0, 0.15)',
              color: isLight ? '#996515' : '#FFD700',
            }}
          >
            SL
          </span>
        </div>
      </div>

      {/* 2. Live Sri Lanka Weather Widget */}
      <motion.button
        type="button"
        onClick={handleNextCity}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        title="Click to cycle cities (Colombo, Kandy, Galle, Nuwara Eliya)"
        className="group flex items-center gap-2 px-2.5 py-1 rounded backdrop-blur-md transition-all cursor-pointer"
        style={{
          background: isLight ? '#FFFFFF' : 'rgba(9, 14, 29, 0.85)',
          border: isLight ? '1px solid rgba(212, 175, 55, 0.45)' : '1px solid rgba(0, 255, 255, 0.25)',
          boxShadow: isLight ? '0 2px 8px rgba(0,0,0,0.04)' : '0 0 12px rgba(0,255,255,0.08)',
        }}
      >
        {/* Animated Weather Icon */}
        <div className="relative w-4 h-4 flex items-center justify-center">
          {currentCity.type === 'sunny' && (
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}>
              <Sun className={`w-4 h-4 ${isLight ? 'text-amber-500' : 'text-[#FFD700] filter drop-shadow-[0_0_6px_rgba(255,215,0,0.9)]'}`} />
            </motion.div>
          )}

          {currentCity.type === 'partly' && (
            <motion.div animate={{ y: [0, -1.5, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
              <CloudSun className={`w-4 h-4 ${isLight ? 'text-sky-600' : 'text-[#00FFFF] filter drop-shadow-[0_0_6px_rgba(0,255,255,0.8)]'}`} />
            </motion.div>
          )}

          {currentCity.type === 'rainy' && (
            <motion.div animate={{ y: [0, -1, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
              <CloudRain className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-emerald-400'}`} />
            </motion.div>
          )}
        </div>

        {/* City & Temperature Info */}
        <div className="flex items-center gap-1.5 text-left text-[11px]" style={{ fontFamily: 'var(--font-rajdhani)' }}>
          <span className="font-bold" style={{ color: isLight ? '#0F172A' : '#FFFFFF' }}>
            {language === 'si' ? currentCity.nameSi : currentCity.nameEn}
          </span>
          <span className="font-extrabold" style={{ color: isLight ? '#996515' : '#FFD700' }}>
            {currentCity.temp}°C
          </span>
          <span className={`text-[10px] hidden md:inline ${isLight ? 'text-slate-500' : 'text-white/60'}`}>
            ({language === 'si' ? currentCity.conditionSi : currentCity.conditionEn})
          </span>
        </div>
      </motion.button>
    </div>
  );
}
