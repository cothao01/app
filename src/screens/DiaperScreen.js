import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';

const diaperTypes = [
  { key: 'Wet', icon: 'water', color: '#42A5F5' },
  { key: 'Dirty', icon: 'emoticon-poop', color: '#8D6E63' },
  { key: 'Both', icon: 'swap-horizontal', color: '#AB47BC' },
];

const colors = ['Yellow', 'Green', 'Brown', 'Black', 'Other'];

export default function DiaperScreen({ navigation }) {
  const { theme } = useTheme();
  const { addEvent } = useApp();

  const [diaperType, setDiaperType] = useState('Wet');
  const [selectedColor, setSelectedColor] = useState('');
  const [consistency, setConsistency] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = async () => {
    const details = { diaperType };
    if (diaperType !== 'Wet') {
      if (selectedColor) details.color = selectedColor;
      if (consistency) details.consistency = consistency;
    }
    await addEvent({ type: 'diaper', details, notes });
    Alert.alert('Logged!', 'Diaper change recorded.', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.text }]}>Log Diaper</Text>

      <View style={styles.typeRow}>
        {diaperTypes.map(dt => (
          <TouchableOpacity
            key={dt.key}
            style={[
              styles.typeBtn,
              { backgroundColor: diaperType === dt.key ? dt.color : theme.card, borderColor: theme.border }
            ]}
            onPress={() => setDiaperType(dt.key)}
          >
            <MaterialCommunityIcons name={dt.icon} size={28} color={diaperType === dt.key ? '#FFF' : theme.text} />
            <Text style={[styles.typeBtnText, { color: diaperType === dt.key ? '#FFF' : theme.text }]}>{dt.key}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {diaperType !== 'Wet' && (
        <>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Color (optional)</Text>
          <View style={styles.chipRow}>
            {colors.map(c => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.chip,
                  {
                    backgroundColor: selectedColor === c ? theme.diaperColor : theme.card,
                    borderColor: theme.border,
                  }
                ]}
                onPress={() => setSelectedColor(selectedColor === c ? '' : c)}
              >
                <Text style={{ color: selectedColor === c ? '#FFF' : theme.text, fontWeight: '600', fontSize: 13 }}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[styles.label, { color: theme.textSecondary }]}>Consistency (optional)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            value={consistency}
            onChangeText={setConsistency}
            placeholder="e.g. loose, firm, normal"
            placeholderTextColor={theme.textSecondary}
          />
        </>
      )}

      <Text style={[styles.label, { color: theme.textSecondary }]}>Notes</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Optional notes..."
        placeholderTextColor={theme.textSecondary}
        multiline
      />

      <TouchableOpacity style={[styles.saveBtn, { backgroundColor: theme.diaperColor }]} onPress={handleSave}>
        <MaterialCommunityIcons name="check" size={22} color="#FFF" />
        <Text style={styles.saveBtnText}>Save Diaper</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 20 },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  typeBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    padding: 20, borderRadius: 16, borderWidth: 1, gap: 8,
  },
  typeBtnText: { fontSize: 14, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 8 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 8 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 16, borderRadius: 14, marginTop: 24, gap: 8,
  },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
