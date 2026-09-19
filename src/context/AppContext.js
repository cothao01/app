import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import * as Storage from '../storage/storage';
import { generateId } from '../utils/time';
import { scheduleFeedReminder, scheduleDiaperReminder, cancelFeedReminder, cancelDiaperReminder, requestPermissions } from '../notifications/notifications';

const AppContext = createContext();

const initialState = {
  babies: [],
  activeBabyId: null,
  events: [],
  settings: Storage.defaultSettings,
  activeSleepEvent: null,
  activeBreastTimer: null,
  loading: true,
};

function reducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return { ...state, ...action.payload, loading: false };
    case 'SET_BABIES':
      return { ...state, babies: action.payload };
    case 'SET_ACTIVE_BABY':
      return { ...state, activeBabyId: action.payload };
    case 'SET_EVENTS':
      return { ...state, events: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'SET_ACTIVE_SLEEP':
      return { ...state, activeSleepEvent: action.payload };
    case 'SET_ACTIVE_BREAST_TIMER':
      return { ...state, activeBreastTimer: action.payload };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [babies, activeBabyId, settings] = await Promise.all([
        Storage.getBabies(),
        Storage.getActiveBabyId(),
        Storage.getSettings(),
      ]);

      let finalBabyId = activeBabyId;
      let finalBabies = babies;

      if (finalBabies.length === 0) {
        const defaultBaby = { id: generateId(), name: 'Baby', birthDate: null, photo: null };
        finalBabies = [defaultBaby];
        finalBabyId = defaultBaby.id;
        await Storage.saveBabies(finalBabies);
        await Storage.setActiveBabyId(finalBabyId);
      } else if (!finalBabyId) {
        finalBabyId = finalBabies[0].id;
        await Storage.setActiveBabyId(finalBabyId);
      }

      const events = await Storage.getEvents(finalBabyId);
      const activeSleep = events.find(e => e.type === 'sleep' && !e.endTimestamp) || null;

      dispatch({
        type: 'INIT',
        payload: {
          babies: finalBabies,
          activeBabyId: finalBabyId,
          events,
          settings: { ...Storage.defaultSettings, ...settings },
          activeSleepEvent: activeSleep,
        },
      });

      requestPermissions().catch(() => {});
    } catch (e) {
      console.error('Failed to load data:', e);
      const defaultBaby = { id: generateId(), name: 'Baby', birthDate: null, photo: null };
      dispatch({
        type: 'INIT',
        payload: {
          babies: [defaultBaby],
          activeBabyId: defaultBaby.id,
          events: [],
          settings: Storage.defaultSettings,
          activeSleepEvent: null,
        },
      });
    }
  }

  const activeBaby = state.babies.find(b => b.id === state.activeBabyId) || state.babies[0];

  const switchBaby = useCallback(async (babyId) => {
    await Storage.setActiveBabyId(babyId);
    const events = await Storage.getEvents(babyId);
    const activeSleep = events.find(e => e.type === 'sleep' && !e.endTimestamp) || null;
    dispatch({ type: 'SET_ACTIVE_BABY', payload: babyId });
    dispatch({ type: 'SET_EVENTS', payload: events });
    dispatch({ type: 'SET_ACTIVE_SLEEP', payload: activeSleep });
  }, []);

  const addBaby = useCallback(async (baby) => {
    const newBaby = { id: generateId(), ...baby };
    const updated = [...state.babies, newBaby];
    await Storage.saveBabies(updated);
    dispatch({ type: 'SET_BABIES', payload: updated });
    return newBaby;
  }, [state.babies]);

  const updateBaby = useCallback(async (babyId, updates) => {
    const updated = state.babies.map(b => b.id === babyId ? { ...b, ...updates } : b);
    await Storage.saveBabies(updated);
    dispatch({ type: 'SET_BABIES', payload: updated });
  }, [state.babies]);

  const addEvent = useCallback(async (event) => {
    const newEvent = { id: generateId(), timestamp: new Date().toISOString(), notes: '', ...event };
    const events = await Storage.addEvent(state.activeBabyId, newEvent);
    dispatch({ type: 'SET_EVENTS', payload: events });

    if (event.type === 'sleep' && !event.endTimestamp) {
      dispatch({ type: 'SET_ACTIVE_SLEEP', payload: newEvent });
    }

    if (event.type === 'feed' && state.settings.feedReminderEnabled) {
      await scheduleFeedReminder(state.settings.feedReminderIntervalHours, activeBaby?.name);
    }
    if (event.type === 'diaper' && state.settings.diaperReminderEnabled) {
      await scheduleDiaperReminder(state.settings.diaperReminderIntervalHours, activeBaby?.name);
    }

    return newEvent;
  }, [state.activeBabyId, state.settings, activeBaby]);

  const updateEvent = useCallback(async (eventId, updates) => {
    const events = await Storage.updateEvent(state.activeBabyId, eventId, updates);
    dispatch({ type: 'SET_EVENTS', payload: events });

    if (updates.endTimestamp && state.activeSleepEvent?.id === eventId) {
      dispatch({ type: 'SET_ACTIVE_SLEEP', payload: null });
    }
  }, [state.activeBabyId, state.activeSleepEvent]);

  const deleteEvent = useCallback(async (eventId) => {
    const events = await Storage.deleteEvent(state.activeBabyId, eventId);
    dispatch({ type: 'SET_EVENTS', payload: events });
    if (state.activeSleepEvent?.id === eventId) {
      dispatch({ type: 'SET_ACTIVE_SLEEP', payload: null });
    }
  }, [state.activeBabyId, state.activeSleepEvent]);

  const updateSettings = useCallback(async (updates) => {
    const newSettings = { ...state.settings, ...updates };
    await Storage.saveSettings(newSettings);
    dispatch({ type: 'SET_SETTINGS', payload: newSettings });

    if ('feedReminderEnabled' in updates || 'feedReminderIntervalHours' in updates) {
      if (newSettings.feedReminderEnabled) {
        await scheduleFeedReminder(newSettings.feedReminderIntervalHours, activeBaby?.name);
      } else {
        await cancelFeedReminder();
      }
    }
    if ('diaperReminderEnabled' in updates || 'diaperReminderIntervalHours' in updates) {
      if (newSettings.diaperReminderEnabled) {
        await scheduleDiaperReminder(newSettings.diaperReminderIntervalHours, activeBaby?.name);
      } else {
        await cancelDiaperReminder();
      }
    }
  }, [state.settings, activeBaby]);

  const getLastEvent = useCallback((type) => {
    return state.events.find(e => e.type === type);
  }, [state.events]);

  const getTodayEvents = useCallback((type) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return state.events.filter(e => {
      if (type && e.type !== type) return false;
      return new Date(e.timestamp) >= today;
    });
  }, [state.events]);

  const getTodaySleepMinutes = useCallback(() => {
    const sleepEvents = getTodayEvents('sleep');
    return sleepEvents.reduce((sum, e) => {
      if (!e.endTimestamp) return sum;
      return sum + (new Date(e.endTimestamp) - new Date(e.timestamp)) / 60000;
    }, 0);
  }, [getTodayEvents]);

  const value = {
    ...state,
    activeBaby,
    switchBaby,
    addBaby,
    updateBaby,
    addEvent,
    updateEvent,
    deleteEvent,
    updateSettings,
    getLastEvent,
    getTodayEvents,
    getTodaySleepMinutes,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
