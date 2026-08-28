import * as DocumentPicker from 'expo-document-picker'
import { File } from 'expo-file-system'

import { parseImportPayload } from '@/services/export'
import type { UserMemoData } from '@/types/memo'

async function pickAndImportBackup(): Promise<UserMemoData | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: 'application/json',
    copyToCacheDirectory: true
  })

  if (result.canceled || !result.assets[0]) {
    return null
  }

  const file = new File(result.assets[0].uri)
  const raw = await file.text()
  return parseImportPayload(raw)
}

export { pickAndImportBackup }
