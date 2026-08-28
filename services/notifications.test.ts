import * as Notifications from 'expo-notifications'

import {
  cancelItemReminder,
  reminderIdentifier,
  scheduleItemReminder
} from '@/services/notifications'
import type { ChecklistItem } from '@/types/memo'

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(async () => ({ granted: true })),
  requestPermissionsAsync: jest.fn(async () => ({ granted: true })),
  setNotificationChannelAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(async () => 'scheduled-id'),
  SchedulableTriggerInputTypes: { DATE: 'date' },
  AndroidImportance: { MAX: 5 },
  IosAuthorizationStatus: { PROVISIONAL: 2 }
}))

describe('notifications service', () => {
  const item: ChecklistItem = {
    id: 'item-1',
    title: 'Buy milk',
    completed: false,
    reminderAt: Date.now() + 60000,
    createdAt: Date.now()
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('scheduleItemReminder cancels then schedules with stable id', async () => {
    const id = await scheduleItemReminder(item)
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(reminderIdentifier('item-1'))
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled()
    expect(id).toBe(reminderIdentifier('item-1'))
  })

  test('cancelItemReminder uses stable identifier', async () => {
    await cancelItemReminder('item-1')
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('reminder-item-1')
  })
})
