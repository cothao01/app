import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { getSettings } from '../storage/storage';

const ThemeContext = createContext();

const lightTheme = {
  dark: false,
  bg: '#FFF5F7',
  card: '#FFFFFF',
  text: '#2D2D2D',
  textSecondary: '#888888',
  primary: '#FF69B4',
  primaryLight: '#FFB6D5',
  accent: '#7C4DFF',
  border: '#F0E0E6',
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#F44336',
  feedColor: '#FF69B4',
  diaperColor: '#42A5F5',
  sleepColor: '#7C4DFF',
  growthColor: '#66BB6A',
  cardShadow: '#00000015',
  statusBar: 'dark-content',
};

const darkTheme = {
  dark: true,
  bg: '#1A1A2E',
  card: '#25253E',
  text: '#F0F0F0',
  textSecondary: '#A0A0B0',
  primary: '#FF69B4',
  primaryLight: '#4A3040',
  accent: '#B388FF',
  border: '#35354E',
  success: '#66BB6A',
  warning: '#FFB74D',
  danger: '#EF5350',
  feedColor: '#FF69B4',
  diaperColor: '#64B5F6',
  sleepColor: '#B388FF',
  growthColor: '#81C784',
  cardShadow: '#00000040',
  statusBar: 'light-content',
};

export function ThemeProvider({ children }) {
  const systemScheme = useColorScheme();
  const [mode, setMode] = useState('system');

  useEffect(() => {
    getSettings().then(s => { if (s?.darkMode) setMode(s.darkMode); });
  }, []);

  const isDark = mode === 'dark' || (mode === 'system' && systemScheme === 'dark');
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
