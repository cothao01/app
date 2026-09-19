import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { formatAge } from '../utils/time';
import ActivityCard from '../components/ActivityCard';
import QuickAction from '../components/QuickAction';

export default function DashboardScreen({ navigation }) {
  const { theme } = useTheme();
  const {
    activeBaby, getLastEvent, getTodayEvents, getTodaySleepMinutes, activeSleepEvent, addEvent, updateBaby
  } = useApp();

  const [editingName, setEditingName] = useState(false);
  const [nameText, setNameText] = useState('');
  const nameInputRef = useRef(null);

  const startEditing = () => {
    setNameText(activeBaby?.name || '');
    setEditingName(true);
    setTimeout(() => nameInputRef.current?.focus(), 50);
  };

  const saveName = () => {
    const trimmed = nameText.trim();
    if (trimmed && activeBaby && trimmed !== activeBaby.name) {
      updateBaby(activeBaby.id, { name: trimmed });
    }
    setEditingName(false);
  };

  const lastFeed = getLastEvent('feed');
  const lastDiaper = getLastEvent('diaper');
  const lastSleep = getLastEvent('sleep');
  const todayFeeds = getTodayEvents('feed').length;
  const todayDiapers = getTodayEvents('diaper').length;
  const sleepMins = getTodaySleepMinutes();
  const sleepHrs = Math.floor(sleepMins / 60);
  const sleepRem = Math.round(sleepMins % 60);

  const quickLogDiaper = async (diaperType) => {
    await addEvent({ type: 'diaper', details: { diaperType } });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          {editingName ? (
            <TextInput
              ref={nameInputRef}
              style={[styles.babyName, styles.nameInput, { color: theme.text, borderBottomColor: theme.accent }]}
              value={nameText}
              onChangeText={setNameText}
              onBlur={saveName}
              onSubmitEditing={saveName}
              returnKeyType="done"
              selectTextOnFocus
              maxLength={30}
            />
          ) : (
            <TouchableOpacity onPress={startEditing} activeOpacity={0.6}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.babyName, { color: theme.text }]}>{activeBaby?.name || 'Baby'}</Text>
                <MaterialCommunityIcons name="pencil-outline" size={16} color={theme.textSecondary} style={{ marginLeft: 6, marginTop: 2 }} />
              </View>
            </TouchableOpacity>
          )}
          {activeBaby?.birthDate && (
            <Text style={[styles.age, { color: theme.textSecondary }]}>{formatAge(activeBaby.birthDate)}</Text>
          )}
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.settingsBtn}>
          <MaterialCommunityIcons name="cog-outline" size={24} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.summaryRow, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="baby-bottle" size={20} color={theme.feedColor} />
          <Text style={[styles.summaryValue, { color: theme.text }]}>{todayFeeds}</Text>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Feeds</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="baby-face-outline" size={20} color={theme.diaperColor} />
          <Text style={[styles.summaryValue, { color: theme.text }]}>{todayDiapers}</Text>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Diapers</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="moon-waning-crescent" size={20} color={theme.sleepColor} />
          <Text style={[styles.summaryValue, { color: theme.text }]}>{sleepHrs}h {sleepRem}m</Text>
          <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>Sleep</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Activity</Text>
      <ActivityCard type="feed" event={lastFeed} onPress={() => navigation.navigate('Feeding')} />
      <ActivityCard type="diaper" event={lastDiaper} onPress={() => navigation.navigate('Diaper')} />
      <ActivityCard type="sleep" event={lastSleep} onPress={() => navigation.navigate('Sleep')} activeSleep={activeSleepEvent} />

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Log</Text>
      <View style={styles.quickActions}>
        <QuickAction icon="baby-bottle" label="Feed" color={theme.feedColor} onPress={() => navigation.navigate('Feeding')} />
        <QuickAction icon="water" label="Wet" color={theme.diaperColor} onPress={() => quickLogDiaper('Wet')} />
        <QuickAction icon="emoticon-poop" label="Dirty" color="#8D6E63" onPress={() => quickLogDiaper('Dirty')} />
        <QuickAction icon="moon-waning-crescent" label="Sleep" color={theme.sleepColor} onPress={() => navigation.navigate('Sleep')} />
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>More</Text>
      <View style={styles.quickActions}>
        <QuickAction icon="chart-line" label="Stats" color={theme.success} onPress={() => navigation.navigate('Stats')} />
        <QuickAction icon="history" label="History" color={theme.warning} onPress={() => navigation.navigate('History')} />
        <QuickAction icon="human-male-height" label="Growth" color={theme.growthColor} onPress={() => navigation.navigate('Growth')} />
        <QuickAction icon="star-outline" label="Milestones" color={theme.accent} onPress={() => navigation.navigate('Milestones')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  babyName: { fontSize: 28, fontWeight: '800' },
  nameInput: { borderBottomWidth: 2, paddingVertical: 2, paddingHorizontal: 0, margin: 0 },
  age: { fontSize: 14, marginTop: 2 },
  settingsBtn: { padding: 8 },
  summaryRow: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    elevation: 1,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 20, fontWeight: '800', marginTop: 4 },
  summaryLabel: { fontSize: 11, fontWeight: '600', marginTop: 2, textTransform: 'uppercase' },
  divider: { width: 1, marginVertical: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  quickActions: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
});
