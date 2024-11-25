import { Brain, Calendar, CheckSquare, MessageSquare } from 'lucide-react'
import { ItemType } from '@/types'

interface FilterButtonsProps {
  currentFilter: 'everything' | ItemType
  onFilterChange: (filter: 'everything' | ItemType) => void
}

export function FilterButtons({ currentFilter, onFilterChange }: FilterButtonsProps) {
  const filters = [
    { id: 'everything', label: 'Everything', icon: Brain },
    { id: 'event', label: 'Events', icon: Calendar },
    { id: 'task', label: 'Tasks', icon: CheckSquare },
    { id: 'note', label: 'Notes', icon: MessageSquare }
  ] as const

  return (
    <div className="flex gap-2">
      {filters.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onFilterChange(id as typeof currentFilter)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors
            ${currentFilter === id 
              ? 'bg-black text-white' 
              : 'bg-gray-50 hover:bg-gray-100'}`}
        >
          <Icon className="w-4 h-4" /> {label}
        </button>
      ))}
    </div>
  )
} 