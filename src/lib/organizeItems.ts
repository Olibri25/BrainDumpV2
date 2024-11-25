import { BrainDumpItem } from '@/types'
import { isToday, isAfter, isBefore, startOfToday } from 'date-fns'

type GroupedItems = {
  today: BrainDumpItem[]
  upcoming: BrainDumpItem[]
  completed: BrainDumpItem[]
  all: BrainDumpItem[]
}

export function organizeItems(items: BrainDumpItem[]): GroupedItems {
  const now = new Date()
  const groups: GroupedItems = {
    today: [],
    upcoming: [],
    completed: [],
    all: [...items].sort((a, b) => b.created.getTime() - a.created.getTime())
  }

  items.forEach(item => {
    // Handle completed items first
    if (item.completed) {
      groups.completed.push(item)
      return
    }

    // If no due date, it goes to today
    if (!item.dueDate) {
      groups.today.push(item)
      return
    }

    // Handle items with dates
    if (isToday(item.dueDate) || isBefore(item.dueDate, startOfToday())) {
      groups.today.push(item)
    } else {
      groups.upcoming.push(item)
    }
  })

  // Sort items within each group by due date first, then creation date
  const sortItems = (a: BrainDumpItem, b: BrainDumpItem) => {
    if (a.dueDate && b.dueDate) {
      return a.dueDate.getTime() - b.dueDate.getTime()
    }
    if (a.dueDate) return -1
    if (b.dueDate) return 1
    return b.created.getTime() - a.created.getTime()
  }

  groups.today.sort(sortItems)
  groups.upcoming.sort(sortItems)
  groups.completed.sort((a, b) => b.created.getTime() - a.created.getTime())

  return groups
} 