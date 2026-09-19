import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { timeAgo } from '../utils/time';

export default function ActivityCard({ type, event, onPress, activeSleep }) {
  const { theme } = useTheme();
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const config = {
    feed: { icon: 'baby-bottle', label: 'Last Feed', color: theme.feedColor },
    diaper: { icon: 'baby-face-outline', label: 'Last Diaper', color: theme.diaperColor },
    sleep: { icon: 'moon-waning-crescent', label: 'Last Sleep', color: theme.sleepColor },
  };

  const c = config[type] || config.feed;
  const isActiveSleep = type === 'sleep' && activeSleep;

  let detail = '';
  if (event) {
    if (type === 'feed' && event.details) {
      const ft = event.details.feedType;
      if (ft === 'breast') detail = `Breast (${event.details.side || 'both'})`;
      else if (ft === 'bottle') detail = `Bottle ${event.details.amount || ''}${event.details.unit || 'oz'}`;
      else if (ft === 'solids') detail = event.details.food || 'Solids';
    } else if (type === 'diaper' && event.details) {
      detail = event.details.diaperType || '';
    } else if (type === 'sleep') {
      if (isActiveSleep) detail = 'Currently sleeping...';
      else if (event.endTimestamp) {
        const dur = Math.floor((new Date(event.endTimestamp) - new Date(event.timestamp)) / 60000);
        detail = `${Math.floor(dur / 60)}h ${dur % 60}m`;
      }
    }
  }

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, shadowColor: theme.cardShadow }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconCircle, { backgroundColor: c.color + '20' }]}>
        <MaterialCommunityIcons name={c.icon} size={28} color={c.color} />
      </View>
      <View style={styles.info}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>{c.label}</Text>
        <Text style={[styles.time, { color: theme.text }]}>
          {isActiveSleep ? 'Sleeping now' : event ? timeAgo(event.timestamp) : 'No data'}
        </Text>
        {detail ? <Text style={[styles.detail, { color: theme.textSecondary }]} numberOfLines={1}>{detail}</Text> : null}
      </View>
      {isActiveSleep && (
        <View style={[styles.pulse, { backgroundColor: c.color }]} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    elevation: 2,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  info: { flex: 1 },
  label: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  time: { fontSize: 18, fontWeight: '700', marginTop: 2 },
  detail: { fontSize: 13, marginTop: 2 },
  pulse: { width: 10, height: 10, borderRadius: 5, marginLeft: 8 },
});
