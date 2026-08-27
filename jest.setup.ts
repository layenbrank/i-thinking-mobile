import '@/i18n'

jest.mock('react-native-mmkv', () => {
  const store = new Map<string, string>()

  return {
    createMMKV: () => ({
      set(key: string, value: string) {
        store.set(key, value)
      },
      getString(key: string) {
        return store.get(key)
      },
      remove(key: string) {
        store.delete(key)
      }
    })
  }
})
