import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'

import type { ChecklistItem } from '@/types/memo'

const REMINDER_CHANNEL_ID = 'reminders'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
})

function reminderIdentifier(itemId: string) {
  return `reminder-${itemId}`
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') {
    return
  }
  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: 'Reminders',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#D97706',
    sound: 'default',
    enableVibrate: true
  })
}

async function requestNotificationPermissions(): Promise<boolean> {
  await ensureAndroidChannel()
  const settings = await Notifications.getPermissionsAsync()
  if (settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL) {
    return true
  }
  const result = await Notifications.requestPermissionsAsync()
  return Boolean(result.granted || result.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL)
}

async function findNotificationPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
  const settings = await Notifications.getPermissionsAsync()
  if (settings.granted) {
    return 'granted'
  }
  if (settings.canAskAgain === false) {
    return 'denied'
  }
  return 'undetermined'
}

async function canScheduleExactNotifications(): Promise<boolean | null> {
  if (Platform.OS !== 'android') {
    return null
  }
  // expo-notifications 0.32 does not expose AlarmManager.canScheduleExactAlarms on JS side.
  return null
}

async function scheduleItemReminder(item: ChecklistItem): Promise<string | undefined> {
  if (!item.reminderAt || item.reminderAt <= Date.now()) {
    return undefined
  }

  const granted = await requestNotificationPermissions()
  if (!granted) {
    return undefined
  }

  const identifier = reminderIdentifier(item.id)
  await Notifications.cancelScheduledNotificationAsync(identifier)

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: 'Reminder',
      body: item.title,
      sound: 'default',
      data: {
        itemId: item.id,
        memoId: item.memoId ?? null
      }
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: new Date(item.reminderAt),
      channelId: REMINDER_CHANNEL_ID
    }
  })

  return identifier
}

async function cancelItemReminder(itemId: string) {
  await Notifications.cancelScheduledNotificationAsync(reminderIdentifier(itemId))
}

async function cancelAllReminders(items: ChecklistItem[]) {
  await Promise.all(items.map((item) => cancelItemReminder(item.id)))
}

async function rescheduleAllPending(items: ChecklistItem[]) {
  const pending = items.filter((item) => item.reminderAt && item.reminderAt > Date.now() && !item.completed)
  for (const item of pending) {
    await scheduleItemReminder(item)
  }
}

export {
  cancelAllReminders,
  cancelItemReminder,
  canScheduleExactNotifications,
  ensureAndroidChannel,
  findNotificationPermissionStatus,
  reminderIdentifier,
  requestNotificationPermissions,
  rescheduleAllPending,
  scheduleItemReminder
}
