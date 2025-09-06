import { DataProvider } from './provider'
import MockProvider from './mockProvider'
import SupabaseProvider from './supabaseProvider'

const getProvider = (): DataProvider => {
  const dataSource = import.meta.env.VITE_DATA_SOURCE || 'mock'

  switch (dataSource) {
    case 'supabase':
      return new SupabaseProvider()
    case 'mock':
    default:
      return new MockProvider()
  }
}

export const dataProvider = getProvider()
export * from './provider'