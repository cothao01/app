import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useApp } from '../context/AppContext';
import { exportToCsv } from '../utils/export';
import { clearAllData } from '../storage/storage';

export default function SettingsScreen({ navigation }) {
  const { theme, mode, setMode } = useTheme();
  const { settings, updateSettings, activeBaby, updateBaby, babies, addBaby, switchBaby, events } = useApp();

  const [babyName, setBabyName] = useState(activeBaby?.name || '');
  const [birthDate, setBirthDate] = useState(activeBaby?.birthDate || '');
  const [showAddBaby, setShowAddBaby] = useState(false);
  const [newBabyName, setNewBabyName] = useState('');

  const handleSaveBaby = async () => {
    if (activeBaby) {
      await updateBaby(activeBaby.id, { name: babyName, birthDate: birthDate || null });
      Alert.alert('Saved', 'Baby profile updated.');
    }
  };

  const handleAddBaby = async () => {
    if (!newBabyName.trim()) return;
    const baby = await addBaby({ name: newBabyName.trim(), birthDate: null, photo: null });
    await switchBaby(baby.id);
    setNewBabyName('');
    setShowAddBaby(false);
    setBabyName(baby.name);
    Alert.alert('Added', `Switched to ${baby.name}`);
  };

  const handleExport = () => exportToCsv(events, activeBaby?.name);

  const handleClearData = () => {
    Alert.alert('Clear All Data', 'This will delete all babies, events, and settings. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete Everything', style: 'destructive', onPress: async () => {
        await clearAllData();
        Alert.alert('Cleared', 'All data has been deleted. Restart the app.');
      }},
    ]);
  };

  const darkModes = [
    { key: 'system', label: 'System' },
    { key: 'light', label: 'Light' },
    { key: 'dark', label: 'Dark' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: theme.text }]}>Settings</Text>

      <Text style={[styles.section, { color: theme.textSecondary }]}>Baby Profile</Text>
      {babies.length > 1 && (
        <View style={styles.babySelector}>
          {babies.map(b => (
            <TouchableOpacity
              key={b.id}
              style={[styles.babyChip, { backgroundColor: b.id === activeBaby?.id ? theme.primary : theme.card, borderColor: theme.border }]}
              onPress={async () => {
                await switchBaby(b.id);
                setBabyName(b.name);
                setBirthDate(b.birthDate || '');
              }}
            >
              <Text style={{ color: b.id === activeBaby?.id ? '#FFF' : theme.text, fontWeight: '600' }}>{b.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={[styles.label, { color: theme.textSecondary }]}>Name</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
        value={babyName}
        onChangeText={setBabyName}
        placeholder="Baby's name"
        placeholderTextColor={theme.textSecondary}
      />

      <Text style={[styles.label, { color: theme.textSecondary }]}>Birth Date (YYYY-MM-DD)</Text>
      <TextInput
        style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
        value={birthDate}
        onChangeText={setBirthDate}
        placeholder="2024-06-15"
        placeholderTextColor={theme.textSecondary}
      />

      <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={handleSaveBaby}>
        <Text style={styles.btnText}>Save Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.outlineBtn, { borderColor: theme.primary }]} onPress={() => setShowAddBaby(!showAddBaby)}>
        <MaterialCommunityIcons name="plus" size={18} color={theme.primary} />
        <Text style={[styles.outlineBtnText, { color: theme.primary }]}>Add Another Baby</Text>
      </TouchableOpacity>

      {showAddBaby && (
        <View style={styles.addBabyRow}>
          <TextInput
            style={[styles.input, { flex: 1, backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
            value={newBabyName}
            onChangeText={setNewBabyName}
            placeholder="New baby name"
            placeholderTextColor={theme.textSecondary}
          />
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.success }]} onPress={handleAddBaby}>
            <MaterialCommunityIcons name="check" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}

      <Text style={[styles.section, { color: theme.textSecondary }]}>Notifications</Text>

      <View style={[styles.settingRow, { borderColor: theme.border }]}>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Feed Reminders</Text>
          <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>Notify after last feed</Text>
        </View>
        <Switch
          value={settings.feedReminderEnabled}
          onValueChange={v => updateSettings({ feedReminderEnabled: v })}
          trackColor={{ true: theme.feedColor }}
        />
      </View>

      {settings.feedReminderEnabled && (
        <View style={styles.intervalRow}>
          <Text style={[styles.intervalLabel, { color: theme.text }]}>Every</Text>
          {[2, 3, 4].map(h => (
            <TouchableOpacity
              key={h}
              style={[styles.intervalBtn, {
                backgroundColor: settings.feedReminderIntervalHours === h ? theme.feedColor : theme.card,
                borderColor: theme.border
              }]}
              onPress={() => updateSettings({ feedReminderIntervalHours: h })}
            >
              <Text style={{ color: settings.feedReminderIntervalHours === h ? '#FFF' : theme.text, fontWeight: '700' }}>{h}h</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={[styles.settingRow, { borderColor: theme.border }]}>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingLabel, { color: theme.text }]}>Diaper Reminders</Text>
          <Text style={[styles.settingDesc, { color: theme.textSecondary }]}>Notify after last change</Text>
        </View>
        <Switch
          value={settings.diaperReminderEnabled}
          onValueChange={v => updateSettings({ diaperReminderEnabled: v })}
          trackColor={{ true: theme.diaperColor }}
        />
      </View>

      <Text style={[styles.section, { color: theme.textSecondary }]}>Appearance</Text>
      <View style={styles.themeRow}>
        {darkModes.map(dm => (
          <TouchableOpacity
            key={dm.key}
            style={[styles.themeBtn, { backgroundColor: mode === dm.key ? theme.primary : theme.card, borderColor: theme.border }]}
            onPress={() => { setMode(dm.key); updateSettings({ darkMode: dm.key }); }}
          >
            <Text style={{ color: mode === dm.key ? '#FFF' : theme.text, fontWeight: '600' }}>{dm.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.section, { color: theme.textSecondary }]}>Data</Text>
      <TouchableOpacity style={[styles.outlineBtn, { borderColor: theme.success }]} onPress={handleExport}>
        <MaterialCommunityIcons name="export" size={18} color={theme.success} />
        <Text style={[styles.outlineBtnText, { color: theme.success }]}>Export as CSV</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.outlineBtn, { borderColor: theme.danger }]} onPress={handleClearData}>
        <MaterialCommunityIcons name="trash-can-outline" size={18} color={theme.danger} />
        <Text style={[styles.outlineBtnText, { color: theme.danger }]}>Clear All Data</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 20 },
  section: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: 24, marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 16, marginBottom: 12 },
  btn: { padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  btnText: { color: '#FFF', fontWeight: '700', fontSize: 15 },
  outlineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, borderWidth: 1.5, marginBottom: 10, gap: 8 },
  outlineBtnText: { fontWeight: '700', fontSize: 15 },
  babySelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  babyChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  addBabyRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  addBtn: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  settingRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 15, fontWeight: '600' },
  settingDesc: { fontSize: 12, marginTop: 2 },
  intervalRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, marginTop: 8 },
  intervalLabel: { fontSize: 14, fontWeight: '600' },
  intervalBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  themeRow: { flexDirection: 'row', gap: 10 },
  themeBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
});
