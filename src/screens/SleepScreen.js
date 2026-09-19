import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import TimerDisplay from '../components/TimerDisplay';
import { formatTime, formatDuration } from '../utils/time';

export default function SleepScreen({ navigation }) {
  const { theme } = useTheme();
  const { addEvent, updateEvent, activeSleepEvent } = useApp();
  const [notes, setNotes] = useState('');

  const handleStartSleep = async () => {
    await addEvent({ type: 'sleep', notes });
  };

  const handleStopSleep = async () => {
    if (activeSleepEvent) {
      await updateEvent(activeSleepEvent.id, { endTimestamp: new Date().toISOString(), notes });
      const duration = Date.now() - new Date(activeSleepEvent.timestamp).getTime();
      Alert.alert('Sleep Logged!', `Duration: ${formatDuration(duration)}`, [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.text }]}>Sleep Tracker</Text>

      {activeSleepEvent ? (
        <View style={[styles.statusCard, { backgroundColor: theme.sleepColor + '15', borderColor: theme.sleepColor + '40' }]}>
          <MaterialCommunityIcons name="moon-waning-crescent" size={32} color={theme.sleepColor} />
          <Text style={[styles.statusText, { color: theme.text }]}>Baby is sleeping</Text>
          <Text style={[styles.statusDetail, { color: theme.textSecondary }]}>
            Started at {formatTime(activeSleepEvent.timestamp)}
          </Text>
        </View>
      ) : (
        <View style={[styles.statusCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <MaterialCommunityIcons name="white-balance-sunny" size={32} color={theme.warning} />
          <Text style={[styles.statusText, { color: theme.text }]}>Baby is awake</Text>
        </View>
      )}

      <TimerDisplay
        running={!!activeSleepEvent}
        startTime={activeSleepEvent?.timestamp}
        onStart={handleStartSleep}
        onStop={handleStopSleep}
        color={theme.sleepColor}
        label={activeSleepEvent ? 'Sleeping Duration' : 'Start Sleep Timer'}
      />

      <Text style={[styles.label, { color: theme.textSecondary }]}>Notes</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Optional notes..."
        placeholderTextColor={theme.textSecondary}
        multiline
      />

      {!activeSleepEvent && (
        <>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Or log manually</Text>
          <ManualSleepEntry theme={theme} addEvent={addEvent} navigation={navigation} />
        </>
      )}
    </ScrollView>
  );
}

function ManualSleepEntry({ theme, addEvent, navigation }) {
  const [startHour, setStartHour] = useState('');
  const [startMin, setStartMin] = useState('');
  const [durHour, setDurHour] = useState('');
  const [durMin, setDurMin] = useState('');

  const handleManualSave = async () => {
    if (!startHour && !durHour && !durMin) {
      Alert.alert('Missing info', 'Please enter start time and duration.');
      return;
    }
    const now = new Date();
    const start = new Date(now);
    start.setHours(parseInt(startHour) || 0, parseInt(startMin) || 0, 0, 0);
    if (start > now) start.setDate(start.getDate() - 1);

    const durationMs = ((parseInt(durHour) || 0) * 60 + (parseInt(durMin) || 0)) * 60000;
    const end = new Date(start.getTime() + durationMs);

    await addEvent({
      type: 'sleep',
      timestamp: start.toISOString(),
      endTimestamp: end.toISOString(),
    });
    Alert.alert('Logged!', `Sleep: ${formatDuration(durationMs)}`, [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <View>
      <Text style={[styles.label, { color: theme.textSecondary }]}>Start Time</Text>
      <View style={styles.timeRow}>
        <TextInput
          style={[styles.timeInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
          value={startHour}
          onChangeText={setStartHour}
          placeholder="HH"
          placeholderTextColor={theme.textSecondary}
          keyboardType="number-pad"
          maxLength={2}
        />
        <Text style={[styles.timeSep, { color: theme.text }]}>:</Text>
        <TextInput
          style={[styles.timeInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
          value={startMin}
          onChangeText={setStartMin}
          placeholder="MM"
          placeholderTextColor={theme.textSecondary}
          keyboardType="number-pad"
          maxLength={2}
        />
      </View>

      <Text style={[styles.label, { color: theme.textSecondary }]}>Duration</Text>
      <View style={styles.timeRow}>
        <TextInput
          style={[styles.timeInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
          value={durHour}
          onChangeText={setDurHour}
          placeholder="Hours"
          placeholderTextColor={theme.textSecondary}
          keyboardType="number-pad"
          maxLength={2}
        />
        <Text style={[styles.timeSep, { color: theme.text }]}>h</Text>
        <TextInput
          style={[styles.timeInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
          value={durMin}
          onChangeText={setDurMin}
          placeholder="Min"
          placeholderTextColor={theme.textSecondary}
          keyboardType="number-pad"
          maxLength={2}
        />
        <Text style={[styles.timeSep, { color: theme.text }]}>m</Text>
      </View>

      <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.sleepColor }]} onPress={handleManualSave}>
        <MaterialCommunityIcons name="check" size={22} color="#FFF" />
        <Text style={styles.saveBtnText}>Save Sleep</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 20 },
  statusCard: {
    alignItems: 'center', padding: 20, borderRadius: 16, borderWidth: 1, marginBottom: 16, gap: 8,
  },
  statusText: { fontSize: 18, fontWeight: '700' },
  statusDetail: { fontSize: 14 },
  label: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: 24, marginBottom: 12 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  timeInput: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 18, width: 70, textAlign: 'center' },
  timeSep: { fontSize: 20, fontWeight: '700' },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 16, borderRadius: 14, marginTop: 24, gap: 8,
  },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
