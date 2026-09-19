import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { defaultMilestones } from '../data/milestones';
import { getMilestones, saveMilestones } from '../storage/storage';
import { formatDate } from '../utils/time';

const categories = ['All', 'Motor', 'Language', 'Social', 'Health', 'Feeding'];

export default function MilestonesScreen() {
  const { theme } = useTheme();
  const { activeBabyId } = useApp();
  const [milestones, setMilestones] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    loadMilestones();
  }, [activeBabyId]);

  async function loadMilestones() {
    let data = await getMilestones(activeBabyId);
    if (!data) {
      data = defaultMilestones.map(m => ({ ...m }));
      await saveMilestones(activeBabyId, data);
    }
    setMilestones(data);
  }

  const toggleMilestone = async (id) => {
    const updated = milestones.map(m => {
      if (m.id === id) {
        return { ...m, achieved: !m.achieved, date: !m.achieved ? new Date().toISOString() : null };
      }
      return m;
    });
    setMilestones(updated);
    await saveMilestones(activeBabyId, updated);
  };

  const filtered = filter === 'All' ? milestones : milestones.filter(m => m.category === filter);
  const achievedCount = milestones.filter(m => m.achieved).length;

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>Milestones</Text>

        <View style={[styles.progressCard, { backgroundColor: theme.accent + '15', borderColor: theme.accent + '40' }]}>
          <Text style={[styles.progressText, { color: theme.accent }]}>
            {achievedCount} / {milestones.length} achieved
          </Text>
          <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
            <View style={[styles.progressFill, { backgroundColor: theme.accent, width: `${(achievedCount / milestones.length) * 100}%` }]} />
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterRow}>
            {categories.map(c => (
              <TouchableOpacity
                key={c}
                style={[styles.filterBtn, { backgroundColor: filter === c ? theme.accent : theme.card, borderColor: theme.border }]}
                onPress={() => setFilter(c)}
              >
                <Text style={{ color: filter === c ? '#FFF' : theme.text, fontWeight: '600', fontSize: 13 }}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {filtered.map(m => (
          <TouchableOpacity
            key={m.id}
            style={[styles.milestoneItem, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => toggleMilestone(m.id)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, { borderColor: m.achieved ? theme.accent : theme.border, backgroundColor: m.achieved ? theme.accent : 'transparent' }]}>
              {m.achieved && <MaterialCommunityIcons name="check" size={16} color="#FFF" />}
            </View>
            <View style={styles.milestoneInfo}>
              <Text style={[styles.milestoneLabel, { color: theme.text, textDecorationLine: m.achieved ? 'line-through' : 'none' }]}>
                {m.label}
              </Text>
              <Text style={[styles.milestoneCategory, { color: theme.textSecondary }]}>{m.category}</Text>
              {m.achieved && m.date && (
                <Text style={[styles.milestoneDate, { color: theme.accent }]}>{formatDate(m.date)}</Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 16 },
  progressCard: { padding: 16, borderRadius: 14, borderWidth: 1, marginBottom: 16, alignItems: 'center' },
  progressText: { fontSize: 18, fontWeight: '800', marginBottom: 10 },
  progressBar: { width: '100%', height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  filterScroll: { marginBottom: 16 },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  milestoneItem: {
    flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8,
  },
  checkbox: { width: 28, height: 28, borderRadius: 8, borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  milestoneInfo: { flex: 1 },
  milestoneLabel: { fontSize: 15, fontWeight: '600' },
  milestoneCategory: { fontSize: 12, marginTop: 2 },
  milestoneDate: { fontSize: 11, marginTop: 2, fontWeight: '600' },
});
