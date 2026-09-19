import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import LogEntryItem from '../components/LogEntryItem';

const filters = ['All', 'Feed', 'Diaper', 'Sleep', 'Growth'];

export default function HistoryScreen() {
  const { theme } = useTheme();
  const { events, deleteEvent, refreshFromCloud } = useApp();
  const [filter, setFilter] = useState('All');
  const [cloudEvents, setCloudEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCloudData = useCallback(async () => {
    setLoading(true);
    const data = await refreshFromCloud();
    setCloudEvents(data);
    setLoading(false);
  }, [refreshFromCloud]);

  useEffect(() => {
    loadCloudData();
  }, [loadCloudData]);

  const mergedEvents = useMemo(() => {
    const localIds = new Set(events.map(e => e.id));
    const combined = [...events];
    cloudEvents.forEach(ce => {
      if (!localIds.has(ce.id)) combined.push(ce);
    });
    combined.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    return combined;
  }, [events, cloudEvents]);

  const filtered = useMemo(() => {
    if (filter === 'All') return mergedEvents;
    return mergedEvents.filter(e => e.type === filter.toLowerCase());
  }, [mergedEvents, filter]);

  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(e => {
      const d = new Date(e.timestamp);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!groups[key]) {
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        let label;
        if (d.toDateString() === today.toDateString()) label = 'Today';
        else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday';
        else {
          const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          label = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
        }
        groups[key] = { label, data: [] };
      }
      groups[key].data.push(e);
    });
    return Object.values(groups);
  }, [filtered]);

  const handleDelete = (eventId) => {
    Alert.alert('Delete', 'Remove this entry?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteEvent(eventId) },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text style={[styles.title, { color: theme.text }]}>History</Text>

      <View style={styles.filterRow}>
        {filters.map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, { backgroundColor: filter === f ? theme.primary : theme.card, borderColor: theme.border }]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, { color: filter === f ? '#FFF' : theme.text }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ color: theme.textSecondary, marginTop: 8 }}>Loading from cloud...</Text>
        </View>
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={(item, i) => item.label + i}
          renderItem={({ item: group }) => (
            <View>
              <Text style={[styles.dateHeader, { color: theme.textSecondary }]}>{group.label}</Text>
              {group.data.map(event => (
                <LogEntryItem key={event.id} event={event} onDelete={handleDelete} />
              ))}
            </View>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.textSecondary }]}>No entries yet. Start tracking!</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: '800', paddingHorizontal: 20, paddingTop: 20 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  filterText: { fontSize: 13, fontWeight: '600' },
  list: { paddingHorizontal: 20, paddingBottom: 40 },
  dateHeader: { fontSize: 14, fontWeight: '700', marginTop: 16, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  empty: { textAlign: 'center', marginTop: 60, fontSize: 16 },
});
