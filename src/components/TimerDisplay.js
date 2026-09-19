import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function TimerDisplay({ running, startTime, onStart, onStop, color, label }) {
  const { theme } = useTheme();
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running && startTime) {
      const update = () => setElapsed(Date.now() - new Date(startTime).getTime());
      update();
      intervalRef.current = setInterval(update, 1000);
      return () => clearInterval(intervalRef.current);
    } else {
      setElapsed(0);
    }
  }, [running, startTime]);

  const hours = Math.floor(elapsed / 3600000);
  const mins = Math.floor((elapsed % 3600000) / 60000);
  const secs = Math.floor((elapsed % 60000) / 1000);

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>}
      <Text style={[styles.timer, { color: color || theme.primary }]}>
        {hours > 0 ? `${hours}:` : ''}{mins.toString().padStart(2, '0')}:{secs.toString().padStart(2, '0')}
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: running ? theme.danger : (color || theme.primary) }]}
        onPress={running ? onStop : onStart}
      >
        <MaterialCommunityIcons name={running ? 'stop' : 'play'} size={24} color="#FFF" />
        <Text style={styles.buttonText}>{running ? 'Stop' : 'Start'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: 16 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  timer: { fontSize: 48, fontWeight: '200', fontVariant: ['tabular-nums'], marginBottom: 16 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 30,
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '700', marginLeft: 8 },
});
