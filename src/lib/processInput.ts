import { BrainDumpItem } from '@/types'

export async function processInputText(text: string): Promise<BrainDumpItem> {
  const response = await fetch('/api/process', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text })
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to process input')
  }

  const { item } = data
  return {
    ...item,
    created: new Date(item.created),
    dueDate: item.dueDate ? new Date(item.dueDate) : undefined
  }
} 