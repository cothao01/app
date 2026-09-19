import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestPermissions() {
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return false;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Baby Tracker',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF69B4',
      });
    }
    return true;
  } catch (e) {
    console.warn('Notification permission error:', e);
    return false;
  }
}

export async function scheduleFeedReminder(intervalHours, babyName) {
  try {
    await cancelFeedReminder();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Feeding Time!',
        body: `It's been ${intervalHours} hours since ${babyName || 'baby'}'s last feed.`,
        sound: true,
      },
      trigger: { seconds: intervalHours * 3600 },
      identifier: 'feed-reminder',
    });
  } catch (e) {
    console.warn('Feed reminder error:', e);
  }
}

export async function scheduleDiaperReminder(intervalHours, babyName) {
  try {
    await cancelDiaperReminder();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Diaper Check!',
        body: `It's been ${intervalHours} hours since ${babyName || 'baby'}'s last diaper change.`,
        sound: true,
      },
      trigger: { seconds: intervalHours * 3600 },
      identifier: 'diaper-reminder',
    });
  } catch (e) {
    console.warn('Diaper reminder error:', e);
  }
}

export async function scheduleSleepReminder(intervalHours, babyName) {
  try {
    await cancelSleepReminder();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Nap Time?',
        body: `${babyName || 'Baby'} has been awake for ${intervalHours} hours.`,
        sound: true,
      },
      trigger: { seconds: intervalHours * 3600 },
      identifier: 'sleep-reminder',
    });
  } catch (e) {
    console.warn('Sleep reminder error:', e);
  }
}

export async function cancelFeedReminder() {
  await Notifications.cancelScheduledNotificationAsync('feed-reminder').catch(() => {});
}

export async function cancelDiaperReminder() {
  await Notifications.cancelScheduledNotificationAsync('diaper-reminder').catch(() => {});
}

export async function cancelSleepReminder() {
  await Notifications.cancelScheduledNotificationAsync('sleep-reminder').catch(() => {});
}

export async function cancelAllReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
