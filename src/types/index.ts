export type ItemType = 'event' | 'task' | 'note'
export type Priority = 'high' | 'medium' | 'low'
export type Recurrence = 'daily' | 'weekly'
export type ProcessingStatus = 'success' | 'error'

export interface Tag {
  label: string
  color: string
}

interface BaseItem {
  type: ItemType
  title: string
  content: string
  tags: Tag[]
  dueDate?: Date | null
  hasTime: boolean
  priority?: Priority
  recurrence?: Recurrence
}

export interface BrainDumpItem extends BaseItem {
  id: string
  created: Date
  updated: Date
  originalInput: string
  completed?: boolean
}

export interface AIResponse {
  mainNote: Omit<BaseItem, 'dueDate'> & {
    dueDate: string | null
  }
  status: ProcessingStatus
  message?: string
}

export interface AIAnalysis {
  mainNote: BaseItem & {
    originalInput: string
  }
  status: ProcessingStatus
  message?: string
}

export type ItemAction = 
  | { type: 'add'; item: BrainDumpItem }
  | { type: 'update'; item: BrainDumpItem }
  | { type: 'delete'; id: string }
  | { type: 'toggle_complete'; id: string }

// Moving these interfaces to a separate file since they're for the board feature
// which we haven't implemented yet
// src/types/board.ts 