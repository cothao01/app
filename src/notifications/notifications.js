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
}

export async function scheduleFeedReminder(intervalHours, babyName) {
  await cancelFeedReminder();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🍼 Feeding Time!',
      body: `It's been ${intervalHours} hours since ${babyName || 'baby'}'s last feed.`,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      type: 'timeInterval',
      seconds: intervalHours * 3600,
      channelId: 'default',
    },
    identifier: 'feed-reminder',
  });
}

export async function scheduleDiaperReminder(intervalHours, babyName) {
  await cancelDiaperReminder();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '👶 Diaper Check!',
      body: `It's been ${intervalHours} hours since ${babyName || 'baby'}'s last diaper change.`,
      sound: true,
    },
    trigger: {
      type: 'timeInterval',
      seconds: intervalHours * 3600,
      channelId: 'default',
    },
    identifier: 'diaper-reminder',
  });
}

export async function scheduleSleepReminder(intervalHours, babyName) {
  await cancelSleepReminder();
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '😴 Nap Time?',
      body: `${babyName || 'Baby'} has been awake for ${intervalHours} hours.`,
      sound: true,
    },
    trigger: {
      type: 'timeInterval',
      seconds: intervalHours * 3600,
      channelId: 'default',
    },
    identifier: 'sleep-reminder',
  });
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
