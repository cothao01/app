import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { formatDate } from '../utils/time';

const screenWidth = Dimensions.get('window').width - 40;

export default function GrowthScreen() {
  const { theme } = useTheme();
  const { events, addEvent, settings } = useApp();

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [notes, setNotes] = useState('');

  const weightUnit = settings.units === 'metric' ? 'kg' : 'lbs';
  const heightUnit = settings.units === 'metric' ? 'cm' : 'in';

  const growthEvents = events.filter(e => e.type === 'growth').reverse();

  const handleSave = async () => {
    if (!weight && !height) {
      Alert.alert('Enter data', 'Please enter weight or height.');
      return;
    }
    await addEvent({
      type: 'growth',
      details: {
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        weightUnit,
        heightUnit,
      },
      notes,
    });
    setWeight('');
    setHeight('');
    setNotes('');
    Alert.alert('Logged!', 'Growth data recorded.');
  };

  const weightData = growthEvents.filter(e => e.details?.weight).slice(-10);
  const heightData = growthEvents.filter(e => e.details?.height).slice(-10);

  const chartConfig = {
    backgroundColor: theme.card,
    backgroundGradientFrom: theme.card,
    backgroundGradientTo: theme.card,
    decimalCount: 1,
    color: (opacity = 1) => `rgba(102, 187, 106, ${opacity})`,
    labelColor: () => theme.textSecondary,
    propsForBackgroundLines: { stroke: theme.border },
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.text }]}>Growth Tracker</Text>

      <View style={[styles.inputCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>Weight ({weightUnit})</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }]}
          value={weight}
          onChangeText={setWeight}
          keyboardType="decimal-pad"
          placeholder={`e.g. ${weightUnit === 'lbs' ? '8.5' : '3.8'}`}
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Height ({heightUnit})</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }]}
          value={height}
          onChangeText={setHeight}
          keyboardType="decimal-pad"
          placeholder={`e.g. ${heightUnit === 'in' ? '20.5' : '52'}`}
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={[styles.label, { color: theme.textSecondary }]}>Notes</Text>
        <TextInput
          style={[styles.input, { backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Doctor visit, etc."
          placeholderTextColor={theme.textSecondary}
        />

        <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.growthColor }]} onPress={handleSave}>
          <MaterialCommunityIcons name="check" size={20} color="#FFF" />
          <Text style={styles.saveBtnText}>Log Growth</Text>
        </TouchableOpacity>
      </View>

      {weightData.length >= 2 && (
        <>
          <Text style={[styles.chartTitle, { color: theme.text }]}>Weight ({weightUnit})</Text>
          <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <LineChart
              data={{
                labels: weightData.map((e, i) => i === 0 || i === weightData.length - 1 ? formatDate(e.timestamp).split(',')[0] : ''),
                datasets: [{ data: weightData.map(e => e.details.weight) }],
              }}
              width={screenWidth - 20}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </View>
        </>
      )}

      {heightData.length >= 2 && (
        <>
          <Text style={[styles.chartTitle, { color: theme.text }]}>Height ({heightUnit})</Text>
          <View style={[styles.chartCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <LineChart
              data={{
                labels: heightData.map((e, i) => i === 0 || i === heightData.length - 1 ? formatDate(e.timestamp).split(',')[0] : ''),
                datasets: [{ data: heightData.map(e => e.details.height) }],
              }}
              width={screenWidth - 20}
              height={200}
              chartConfig={{ ...chartConfig, color: (o = 1) => `rgba(66, 165, 245, ${o})` }}
              bezier
              style={styles.chart}
            />
          </View>
        </>
      )}

      {growthEvents.length > 0 && (
        <>
          <Text style={[styles.chartTitle, { color: theme.text }]}>Recent Entries</Text>
          {growthEvents.slice(-10).reverse().map(e => (
            <View key={e.id} style={[styles.entry, { borderColor: theme.border }]}>
              <Text style={[styles.entryDate, { color: theme.textSecondary }]}>{formatDate(e.timestamp)}</Text>
              <View style={styles.entryValues}>
                {e.details?.weight && <Text style={[styles.entryVal, { color: theme.text }]}>{e.details.weight} {e.details.weightUnit}</Text>}
                {e.details?.height && <Text style={[styles.entryVal, { color: theme.text }]}>{e.details.height} {e.details.heightUnit}</Text>}
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 20 },
  inputCard: { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6, marginTop: 8 },
  input: { borderWidth: 1, borderRadius: 10, padding: 12, fontSize: 16 },
  saveBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, marginTop: 16, gap: 8 },
  saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: '700' },
  chartTitle: { fontSize: 16, fontWeight: '700', marginBottom: 10, marginTop: 8 },
  chartCard: { borderRadius: 16, borderWidth: 1, padding: 10, marginBottom: 20, overflow: 'hidden' },
  chart: { borderRadius: 12, marginLeft: -10 },
  entry: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1 },
  entryDate: { fontSize: 13 },
  entryValues: { flexDirection: 'row', gap: 16 },
  entryVal: { fontSize: 14, fontWeight: '600' },
});
