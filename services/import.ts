import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system'

import { parseImportPayload } from '@/services/export'
import type { UserMemoData } from '@/types/memo'

async function pickAndImportBackup(): Promise<UserMemoData | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true
  })

  if (result.canceled || !result.assets[0]?.uri) {
    return null
  }

  const raw = await FileSystem.readAsStringAsync(result.assets[0].uri)
  return parseImportPayload(raw)
}

export { pickAndImportBackup }
