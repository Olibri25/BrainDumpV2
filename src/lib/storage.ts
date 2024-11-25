import { BrainDumpItem } from '@/types'

const STORAGE_KEY = 'braindump_items'

function isValidDate(date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime())
}

export function saveItems(items: BrainDumpItem[]) {
  try {
    const serializedItems = JSON.stringify(items.map(item => {
      const now = new Date().toISOString()
      return {
        ...item,
        created: isValidDate(item.created) ? item.created.toISOString() : now,
        updated: isValidDate(item.updated) ? item.updated.toISOString() : now,
        dueDate: isValidDate(item.dueDate) ? item.dueDate.toISOString() : null
      }
    }))
    localStorage.setItem(STORAGE_KEY, serializedItems)
  } catch (err: unknown) {
    const error = err as Error
    console.error('Failed to save items:', error.message)
  }
}

export function loadItems(): BrainDumpItem[] {
  try {
    const serializedItems = localStorage.getItem(STORAGE_KEY)
    if (!serializedItems) return []

    return JSON.parse(serializedItems).map((item: any) => ({
      ...item,
      created: new Date(item.created),
      updated: new Date(item.updated),
      dueDate: item.dueDate ? new Date(item.dueDate) : null
    }))
  } catch (err: unknown) {
    const error = err as Error
    console.error('Failed to load items:', error.message)
    return []
  }
} 