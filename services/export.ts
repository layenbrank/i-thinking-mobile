import * as FileSystem from 'expo-file-system'
import * as Sharing from 'expo-sharing'

import type { UserMemoData } from '@/types/memo'

interface ExportPayload extends UserMemoData {
  exportedAt: number
  app: 'i-thinking'
}

async function exportUserData(data: UserMemoData) {
  const payload: ExportPayload = {
    ...data,
    exportedAt: Date.now(),
    app: 'i-thinking'
  }
  const json = JSON.stringify(payload, null, 2)
  const path = `${FileSystem.cacheDirectory}i-thinking-backup-${Date.now()}.json`
  await FileSystem.writeAsStringAsync(path, json)
  const canShare = await Sharing.isAvailableAsync()
  if (canShare) {
    await Sharing.shareAsync(path, { mimeType: 'application/json', dialogTitle: 'Export backup' })
  }
  return path
}

function parseImportPayload(raw: string): UserMemoData | null {
  try {
    const parsed = JSON.parse(raw) as Partial<ExportPayload>
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.memos) || !Array.isArray(parsed.items)) {
      return null
    }
    return {
      version: parsed.version ?? 2,
      memos: parsed.memos,
      items: parsed.items,
      lists: parsed.lists ?? []
    }
  } catch {
    return null
  }
}

export { exportUserData, parseImportPayload }
