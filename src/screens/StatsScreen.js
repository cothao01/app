import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

const screenWidth = Dimensions.get('window').width - 40;

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
}

function dayLabel(d) {
  const names = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  return names[d.getDay()];
}

export default function StatsScreen() {
  const { theme } = useTheme();
  const { events } = useApp();
  const [tab, setTab] = useState('feeds');

  const days = useMemo(() => getLast7Days(), []);

  const feedCounts = useMemo(() => {
    return days.map(d => {
      const next = new Date(d); next.setDate(next.getDate() + 1);
      return events.filter(e => e.type === 'feed' && new Date(e.timestamp) >= d && new Date(e.timestamp) < next).length;
    });
  }, [events, days]);

  const diaperCounts = useMemo(() => {
    return days.map(d => {
      const next = new Date(d); next.setDate(next.getDate() + 1);
      return events.filter(e => e.type === 'diaper' && new Date(e.timestamp) >= d && new Date(e.timestamp) < next).length;
    });
  }, [events, days]);

  const sleepHours = useMemo(() => {
    return days.map(d => {
      const next = new Date(d); next.setDate(next.getDate() + 1);
      const sleepEvents = events.filter(e => e.type === 'sleep' && e.endTimestamp && new Date(e.timestamp) >= d && new Date(e.timestamp) < next);
      const totalMs = sleepEvents.reduce((sum, e) => sum + (new Date(e.endTimestamp) - new Date(e.timestamp)), 0);
      return Math.round((totalMs / 3600000) * 10) / 10;
    });
  }, [events, days]);

  const avgTimeBetweenFeeds = useMemo(() => {
    const feedEvents = events.filter(e => e.type === 'feed').slice(0, 20);
    if (feedEvents.length < 2) return null;
    let totalDiff = 0;
    for (let i = 0; i < feedEvents.length - 1; i++) {
      totalDiff += new Date(feedEvents[i].timestamp) - new Date(feedEvents[i + 1].timestamp);
    }
    const avgMs = totalDiff / (feedEvents.length - 1);
    const hrs = Math.floor(avgMs / 3600000);
    const mins = Math.floor((avgMs % 3600000) / 60000);
    return `${hrs}h ${mins}m`;
  }, [events]);

  const labels = days.map(dayLabel);

  const chartConfig = {
    backgroundColor: theme.card,
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalCount: 0,
    color: (opacity = 1) => {
      if (tab === 'feeds') return `rgba(255, 105, 180, ${opacity})`;
      if (tab === 'diapers') return `rgba(66, 165, 245, ${opacity})`;
      return `rgba(124, 77, 255, ${opacity})`;
    },
    labelColor: () => theme.textSecondary,
    style: { borderRadius: 16 },
    propsForBackgroundLines: { stroke: theme.border },
  };

  const tabs = [
    { key: 'feeds', label: 'Feeds', color: theme.feedColor },
    { key: 'diapers', label: 'Diapers', color: theme.diaperColor },
    { key: 'sleep', label: 'Sleep', color: theme.sleepColor },
  ];

  const currentData = tab === 'feeds' ? feedCounts : tab === 'diapers' ? diaperCounts : sleepHours;
  const chartLabel = tab === 'sleep' ? 'Hours' : 'Count';

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.text }]}>Statistics</Text>

      {avgTimeBetweenFeeds && (
        <View style={[styles.avgCard, { backgroundColor: theme.feedColor + '15', borderColor: theme.feedColor + '40' }]}>
          <Text style={[styles.avgLabel, { color: theme.textSecondary }]}>Avg. Time Between Feeds</Text>
          <Text style={[styles.avgValue, { color: theme.feedColor }]}>{avgTimeBetweenFeeds}</Text>
        </View>
      )}

      <View style={styles.tabRow}>
        {tabs.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, { backgroundColor: tab === t.key ? t.color : theme.card, borderColor: theme.border }]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, { color: tab === t.key ? '#FFF' : theme.text }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.chartTitle, { color: theme.text }]}>Last 7 Days — {chartLabel}</Text>
      <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <BarChart
          data={{ labels, datasets: [{ data: currentData.map(v => v || 0) }] }}
          width={screenWidth - 20}
          height={220}
          chartConfig={chartConfig}
          fromZero
          showValuesOnTopOfBars
          withInnerLines={false}
          style={styles.chart}
        />
      </View>

      {tab === 'sleep' && (
        <>
          <Text style={[styles.chartTitle, { color: theme.text }]}>Sleep Trend</Text>
          <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <LineChart
              data={{ labels, datasets: [{ data: sleepHours.map(v => v || 0) }] }}
              width={screenWidth - 20}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 16 },
  avgCard: { padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 20, alignItems: 'center' },
  avgLabel: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  avgValue: { fontSize: 28, fontWeight: '800', marginTop: 4 },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  tabText: { fontWeight: '700', fontSize: 14 },
  chartTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  chartCard: { borderRadius: 16, borderWidth: 1, padding: 10, marginBottom: 20, overflow: 'hidden' },
  chart: { borderRadius: 12, marginLeft: -10 },
});
