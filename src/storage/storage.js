import AsyncStorage from '@react-native-async-storage/async-storage';

const BABIES_KEY = 'babies';
const ACTIVE_BABY_KEY = 'activeBaby';
const SETTINGS_KEY = 'settings';

function eventsKey(babyId) { return `events_${babyId}`; }
function milestonesKey(babyId) { return `milestones_${babyId}`; }

export const defaultSettings = {
  feedReminderEnabled: true,
  feedReminderIntervalHours: 3,
  diaperReminderEnabled: false,
  diaperReminderIntervalHours: 4,
  sleepReminderEnabled: false,
  sleepReminderIntervalHours: 2,
  darkMode: 'system',
  units: 'imperial',
};

async function getJSON(key, fallback = null) {
  const raw = await AsyncStorage.getItem(key);
  return raw ? JSON.parse(raw) : fallback;
}

async function setJSON(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getBabies() {
  return await getJSON(BABIES_KEY, []);
}

export async function saveBabies(babies) {
  await setJSON(BABIES_KEY, babies);
}

export async function getActiveBabyId() {
  return await AsyncStorage.getItem(ACTIVE_BABY_KEY);
}

export async function setActiveBabyId(id) {
  await AsyncStorage.setItem(ACTIVE_BABY_KEY, id);
}

export async function getSettings() {
  return await getJSON(SETTINGS_KEY, defaultSettings);
}

export async function saveSettings(settings) {
  await setJSON(SETTINGS_KEY, settings);
}

export async function getEvents(babyId) {
  return await getJSON(eventsKey(babyId), []);
}

export async function saveEvents(babyId, events) {
  await setJSON(eventsKey(babyId), events);
}

export async function addEvent(babyId, event) {
  const events = await getEvents(babyId);
  events.unshift(event);
  await saveEvents(babyId, events);
  return events;
}

export async function updateEvent(babyId, eventId, updates) {
  const events = await getEvents(babyId);
  const idx = events.findIndex(e => e.id === eventId);
  if (idx !== -1) {
    events[idx] = { ...events[idx], ...updates };
    await saveEvents(babyId, events);
  }
  return events;
}

export async function deleteEvent(babyId, eventId) {
  const events = await getEvents(babyId);
  const filtered = events.filter(e => e.id !== eventId);
  await saveEvents(babyId, filtered);
  return filtered;
}

export async function getMilestones(babyId) {
  return await getJSON(milestonesKey(babyId), null);
}

export async function saveMilestones(babyId, milestones) {
  await setJSON(milestonesKey(babyId), milestones);
}

export async function clearAllData() {
  await AsyncStorage.clear();
}
