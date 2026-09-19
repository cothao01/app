import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import TimerDisplay from '../components/TimerDisplay';

const feedTypes = [
  { key: 'breast', label: 'Breast', icon: 'mother-nurse' },
  { key: 'bottle', label: 'Bottle', icon: 'baby-bottle' },
  { key: 'solids', label: 'Solids', icon: 'food-apple' },
];

const sides = ['Left', 'Right', 'Both'];

export default function FeedingScreen({ navigation }) {
  const { theme } = useTheme();
  const { addEvent, activeBreastTimer } = useApp();

  const [feedType, setFeedType] = useState('bottle');
  const [side, setSide] = useState('Both');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('oz');
  const [food, setFood] = useState('');
  const [notes, setNotes] = useState('');
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerStart, setTimerStart] = useState(null);

  const handleStartTimer = () => {
    setTimerStart(new Date().toISOString());
    setTimerRunning(true);
  };

  const handleStopTimer = () => {
    setTimerRunning(false);
  };

  const handleSave = async () => {
    const details = { feedType };
    if (feedType === 'breast') {
      details.side = side;
      if (timerStart) {
        details.durationMs = Date.now() - new Date(timerStart).getTime();
      }
    } else if (feedType === 'bottle') {
      details.amount = amount;
      details.unit = unit;
    } else if (feedType === 'solids') {
      details.food = food;
    }

    await addEvent({ type: 'feed', details, notes });
    Alert.alert('Logged!', 'Feed recorded successfully.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.text }]}>Log Feed</Text>

      <View style={styles.typeRow}>
        {feedTypes.map(ft => (
          <TouchableOpacity
            key={ft.key}
            style={[
              styles.typeBtn,
              { backgroundColor: feedType === ft.key ? theme.feedColor : theme.card, borderColor: theme.border }
            ]}
            onPress={() => setFeedType(ft.key)}
          >
            <MaterialCommunityIcons name={ft.icon} size={24} color={feedType === ft.key ? '#FFF' : theme.text} />
            <Text style={[styles.typeBtnText, { color: feedType === ft.key ? '#FFF' : theme.text }]}>{ft.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {feedType === 'breast' && (
        <>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Side</Text>
          <View style={styles.typeRow}>
            {sides.map(s => (
              <TouchableOpacity
                key={s}
                style={[
                  styles.sideBtn,
                  { backgroundColor: side === s ? theme.feedColor : theme.card, borderColor: theme.border }
                ]}
                onPress={() => setSide(s)}
              >
                <Text style={[styles.sideBtnText, { color: side === s ? '#FFF' : theme.text }]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TimerDisplay
            running={timerRunning}
            startTime={timerStart}
            onStart={handleStartTimer}
            onStop={handleStopTimer}
            color={theme.feedColor}
            label="Nursing Timer"
          />
        </>
      )}

      {feedType === 'bottle' && (
        <>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Amount</Text>
          <View style={styles.amountRow}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={theme.textSecondary}
            />
            <View style={styles.unitRow}>
              {['oz', 'ml'].map(u => (
                <TouchableOpacity
                  key={u}
                  style={[styles.unitBtn, { backgroundColor: unit === u ? theme.feedColor : theme.card, borderColor: theme.border }]}
                  onPress={() => setUnit(u)}
                >
                  <Text style={{ color: unit === u ? '#FFF' : theme.text, fontWeight: '700' }}>{u}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </>
      )}

      {feedType === 'solids' && (
        <>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Food</Text>
          <TextInput
            style={[styles.input, styles.fullInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            value={food}
            onChangeText={setFood}
            placeholder="What did baby eat?"
            placeholderTextColor={theme.textSecondary}
          />
        </>
      )}

      <Text style={[styles.label, { color: theme.textSecondary }]}>Notes</Text>
      <TextInput
        style={[styles.input, styles.fullInput, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Optional notes..."
        placeholderTextColor={theme.textSecondary}
        multiline
      />

      <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.feedColor }]} onPress={handleSave}>
        <MaterialCommunityIcons name="check" size={22} color="#FFF" />
        <Text style={styles.saveBtnText}>Save Feed</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 20 },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  typeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 14, borderRadius: 12, borderWidth: 1, gap: 8,
  },
  typeBtnText: { fontSize: 14, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  sideBtn: { flex: 1, padding: 12, borderRadius: 10, borderWidth: 1, alignItems: 'center' },
  sideBtnText: { fontWeight: '700' },
  amountRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16, flex: 1 },
  fullInput: { minHeight: 48 },
  unitRow: { flexDirection: 'row', gap: 6 },
  unitBtn: { padding: 14, borderRadius: 10, borderWidth: 1, width: 50, alignItems: 'center' },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 16, borderRadius: 14, marginTop: 24, gap: 8,
  },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
