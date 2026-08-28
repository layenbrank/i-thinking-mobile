import { File, Paths } from 'expo-file-system'
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
  const file = new File(Paths.cache, `i-thinking-backup-${Date.now()}.json`)
  file.create({ overwrite: true })
  file.write(json)
  const canShare = await Sharing.isAvailableAsync()
  if (canShare) {
    await Sharing.shareAsync(file.uri, { mimeType: 'application/json', dialogTitle: 'Export backup' })
  }
  return file.uri
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
