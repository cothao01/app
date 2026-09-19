import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { formatTime, formatDate, formatDuration, isToday } from '../utils/time';

const typeConfig = {
  feed: { icon: 'baby-bottle', label: 'Feed' },
  diaper: { icon: 'baby-face-outline', label: 'Diaper' },
  sleep: { icon: 'moon-waning-crescent', label: 'Sleep' },
  growth: { icon: 'human-male-height', label: 'Growth' },
};

export default function LogEntryItem({ event, onPress, onDelete }) {
  const { theme } = useTheme();
  const config = typeConfig[event.type] || typeConfig.feed;

  const colorMap = { feed: theme.feedColor, diaper: theme.diaperColor, sleep: theme.sleepColor, growth: theme.growthColor };
  const color = colorMap[event.type] || theme.primary;

  let detail = '';
  if (event.type === 'feed' && event.details) {
    const ft = event.details.feedType;
    if (ft === 'breast') detail = `Breast (${event.details.side || 'both'})`;
    else if (ft === 'bottle') detail = `Bottle ${event.details.amount || ''}${event.details.unit || 'oz'}`;
    else if (ft === 'solids') detail = event.details.food || 'Solids';
    if (event.details.durationMs) detail += ` - ${formatDuration(event.details.durationMs)}`;
  } else if (event.type === 'diaper') {
    detail = event.details?.diaperType || '';
    if (event.details?.color) detail += ` (${event.details.color})`;
  } else if (event.type === 'sleep') {
    if (event.endTimestamp) {
      detail = formatDuration(new Date(event.endTimestamp) - new Date(event.timestamp));
    } else {
      detail = 'In progress...';
    }
  } else if (event.type === 'growth') {
    const parts = [];
    if (event.details?.weight) parts.push(`${event.details.weight} ${event.details.weightUnit || 'lbs'}`);
    if (event.details?.height) parts.push(`${event.details.height} ${event.details.heightUnit || 'in'}`);
    detail = parts.join(', ');
  }

  const ts = new Date(event.timestamp);
  const dateStr = isToday(ts) ? 'Today' : formatDate(ts);

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconCircle, { backgroundColor: color + '15' }]}>
        <MaterialCommunityIcons name={config.icon} size={22} color={color} />
      </View>
      <View style={styles.info}>
        <View style={styles.row}>
          <Text style={[styles.type, { color: theme.text }]}>{config.label}</Text>
          <Text style={[styles.time, { color: theme.textSecondary }]}>{dateStr} {formatTime(ts)}</Text>
        </View>
        {detail ? <Text style={[styles.detail, { color: theme.textSecondary }]} numberOfLines={1}>{detail}</Text> : null}
        {event.notes ? <Text style={[styles.notes, { color: theme.textSecondary }]} numberOfLines={1}>📝 {event.notes}</Text> : null}
      </View>
      {onDelete && (
        <TouchableOpacity onPress={() => onDelete(event.id)} style={styles.deleteBtn}>
          <MaterialCommunityIcons name="trash-can-outline" size={18} color={theme.danger} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  type: { fontSize: 15, fontWeight: '700' },
  time: { fontSize: 12 },
  detail: { fontSize: 13, marginTop: 2 },
  notes: { fontSize: 12, marginTop: 2, fontStyle: 'italic' },
  deleteBtn: { padding: 8, marginLeft: 4 },
});
