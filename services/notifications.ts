import { Platform } from 'react-native'
import cancelScheduledNotificationAsync from 'expo-notifications/build/cancelScheduledNotificationAsync'
import { addNotificationResponseReceivedListener } from 'expo-notifications/build/NotificationsEmitter'
import { setNotificationHandler } from 'expo-notifications/build/NotificationsHandler'
import { AndroidImportance } from 'expo-notifications/build/NotificationChannelManager.types'
import {
  getPermissionsAsync,
  requestPermissionsAsync
} from 'expo-notifications/build/NotificationPermissions'
import { IosAuthorizationStatus } from 'expo-notifications/build/NotificationPermissions.types'
import { SchedulableTriggerInputTypes } from 'expo-notifications/build/Notifications.types'
import scheduleNotificationAsync from 'expo-notifications/build/scheduleNotificationAsync'
import setNotificationChannelAsync from 'expo-notifications/build/setNotificationChannelAsync'

import type { ChecklistItem } from '@/types/memo'

const REMINDER_CHANNEL_ID = 'reminders'

setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
})

/**
 * Builds a stable notification identifier for a checklist item.
 */
function reminderIdentifier(itemId: string) {
  return `reminder-${itemId}`
}

/**
 * Ensures the Android reminder notification channel exists.
 */
async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') {
    return
  }
  await setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: 'Reminders',
    importance: AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#D97706',
    sound: 'default',
    enableVibrate: true
  })
}

/**
 * Requests notification permissions when not already granted.
 */
async function requestNotificationPermissions(): Promise<boolean> {
  await ensureAndroidChannel()
  const settings = await getPermissionsAsync()
  if (settings.granted || settings.ios?.status === IosAuthorizationStatus.PROVISIONAL) {
    return true
  }
  const result = await requestPermissionsAsync()
  return Boolean(result.granted || result.ios?.status === IosAuthorizationStatus.PROVISIONAL)
}

/**
 * Returns the current notification permission status.
 */
async function findNotificationPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
  const settings = await getPermissionsAsync()
  if (settings.granted) {
    return 'granted'
  }
  if (settings.canAskAgain === false) {
    return 'denied'
  }
  return 'undetermined'
}

/**
 * Exact-alarm capability probe. Returns null until the native API is exposed.
 */
async function canScheduleExactNotifications(): Promise<boolean | null> {
  if (Platform.OS !== 'android') {
    return null
  }
  // expo-notifications 0.32 does not expose AlarmManager.canScheduleExactAlarms on JS side.
  return null
}

/**
 * Schedules a local reminder for a checklist item.
 */
async function scheduleItemReminder(item: ChecklistItem): Promise<string | undefined> {
  if (!item.reminderAt || item.reminderAt <= Date.now()) {
    return undefined
  }

  const granted = await requestNotificationPermissions()
  if (!granted) {
    return undefined
  }

  const identifier = reminderIdentifier(item.id)
  await cancelScheduledNotificationAsync(identifier)

  await scheduleNotificationAsync({
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
      type: SchedulableTriggerInputTypes.DATE,
      date: new Date(item.reminderAt),
      channelId: REMINDER_CHANNEL_ID
    }
  })

  return identifier
}

/**
 * Cancels a scheduled reminder for a checklist item.
 */
async function cancelItemReminder(itemId: string) {
  await cancelScheduledNotificationAsync(reminderIdentifier(itemId))
}

/**
 * Cancels reminders for all given checklist items.
 */
async function cancelAllReminders(items: ChecklistItem[]) {
  await Promise.all(items.map((item) => cancelItemReminder(item.id)))
}

/**
 * Re-schedules pending reminders after hydrate.
 */
async function rescheduleAllPending(items: ChecklistItem[]) {
  const pending = items.filter((item) => item.reminderAt && item.reminderAt > Date.now() && !item.completed)
  for (const item of pending) {
    await scheduleItemReminder(item)
  }
}

/**
 * Subscribes to notification tap responses. Returns an unsubscribe function.
 */
function subscribeNotificationResponse(
  onResponse: (payload: { itemId?: string; memoId?: string | null }) => void
) {
  const subscription = addNotificationResponseReceivedListener((response) => {
    const itemId = response.notification.request.content.data?.itemId as string | undefined
    const memoId = response.notification.request.content.data?.memoId as string | null | undefined
    onResponse({ itemId, memoId })
  })
  return () => subscription.remove()
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
  scheduleItemReminder,
  subscribeNotificationResponse
}
