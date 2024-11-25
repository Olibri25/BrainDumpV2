import { Pencil, Trash2, Check, X, Brain, CheckSquare, MessageSquare, ChevronUp, ChevronDown } from 'lucide-react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { BrainDumpItem, ItemType } from '@/types'
import { format, addDays } from 'date-fns'
import { useState } from 'react'
import { organizeItems } from '@/lib/organizeItems'
import { Clock, Info } from 'lucide-react'
import { Calendar as DatePicker } from '@/components/Calendar'

interface BrainDumpListProps {
  items: BrainDumpItem[]
  searchQuery?: string
  onUpdate: (item: BrainDumpItem) => void
  onDelete: (id: string) => void
  onToggleComplete: (id: string) => void
  isLoading?: boolean
}

function highlightText(text: string, query: string) {
  if (!query.trim()) return text

  const regex = new RegExp(`(${query})`, 'gi')
  const parts = text.split(regex)

  return parts.map((part, i) => 
    regex.test(part) ? (
      <span key={i} className="bg-yellow-200">{part}</span>
    ) : part
  )
}

function BrainDumpListItem({ 
  item, 
  searchQuery = '',
  onUpdate,
  onDelete,
  onToggleComplete,
  index
}: { 
  item: BrainDumpItem
  searchQuery?: string
  onUpdate: (item: BrainDumpItem) => void
  onDelete: (id: string) => void
  onToggleComplete: (id: string) => void
  index: number
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(item.content)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)

  const handleSave = () => {
    if (editedContent.trim() !== item.content) {
      onUpdate({
        ...item,
        content: editedContent.trim(),
        updated: new Date()
      })
    }
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      setEditedContent(item.content)
      setIsEditing(false)
    }
  }

  const handleDateChange = (date: Date | null) => {
    onUpdate({
      ...item,
      dueDate: date || undefined,
      updated: new Date()
    })
    setIsDatePickerOpen(false)
  }

  const ItemIcon = {
    event: CalendarIcon,
    task: CheckSquare,
    note: MessageSquare,
    unspecified: MessageSquare
  }[item.type] || MessageSquare;

  const formatDate = (date: Date, type: ItemType, hasTime?: boolean) => {
    if (type === 'event' && hasTime) {
      return format(date, 'MMM d, yyyy h:mm a')
    }
    return format(date, 'MMM d, yyyy')
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if (
      isEditing ||
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('.actions-container') ||
      (e.target as HTMLElement).closest('textarea')
    ) {
      return
    }
    setIsExpanded(!isExpanded)
  }

  // Helper function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength).trim() + '...'
  }

  return (
    <div className="relative">
      <div 
        className="bg-white rounded-lg border border-gray-100 transition-all
                   hover:shadow-sm animate-slideIn group cursor-pointer"
        onClick={handleCardClick}
      >
        {isEditing ? (
          <div className="p-3" onClick={e => e.stopPropagation()}>
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full p-2 text-base bg-white border rounded-md
                       focus:outline-none focus:ring-2 focus:ring-black focus:ring-opacity-20"
              autoFocus
              rows={3}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => {
                  setEditedContent(item.content)
                  setIsEditing(false)
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 text-sm bg-black text-white rounded hover:bg-gray-900"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {item.type === 'task' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleComplete(item.id)
                      }}
                      className={`w-5 h-5 flex items-center justify-center rounded-sm 
                        border transition-colors
                        ${item.completed 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : 'border-gray-300 hover:border-gray-400'}`}
                    >
                      {item.completed && <Check className="w-3 h-3" />}
                    </button>
                  ) : (
                    <ItemIcon className="w-5 h-5 text-gray-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={`text-base font-medium
                      ${item.completed ? 'line-through text-gray-500' : ''}`}>
                      {item.title}
                    </h3>
                    {item.dueDate && (
                      <span className="flex items-center gap-1 text-sm text-gray-500 whitespace-nowrap">
                        <CalendarIcon className="w-4 h-4" />
                        {format(item.dueDate, item.hasTime ? 'MMM d, h:mm a' : 'MMM d')}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    {truncateText(item.content, 100)}
                  </p>

                  <div className="flex items-end justify-between gap-2">
                    <div className="flex-1 flex flex-wrap gap-1">
                      {item.tags?.map((tag, index) => (
                        <span
                          key={`${item.id}-${tag.label}-${index}`}
                          className="px-1.5 py-0.5 text-xs rounded-full"
                          style={{ 
                            backgroundColor: `${tag.color}15`,
                            color: tag.color
                          }}
                        >
                          {tag.label}
                        </span>
                      ))}
                    </div>
                    
                    <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                      created {format(item.created, 'MMM d')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsExpanded(!isExpanded)
                    }}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100
                             rounded-full transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {isExpanded && (
              <div className="px-4 pb-4 border-t border-gray-100 animate-fadeIn">
                <div className="pt-4 space-y-3">
                  <p className="text-sm text-gray-600">
                    {item.content}
                  </p>
                  <div className="text-xs text-gray-500">
                    Original input: {item.originalInput}
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setIsEditing(true)
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1 
                               rounded hover:bg-gray-100 transition-colors"
                    >
                      <Pencil className="w-4 h-4 inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(item.id)
                      }}
                      className="text-sm text-red-500 hover:text-red-600 px-2 py-1 
                               rounded hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 inline mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {isDatePickerOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-20 z-40"
            onClick={() => setIsDatePickerOpen(false)}
          />
          <div className="absolute right-0 mt-2 z-50 animate-fadeIn">
            <div className="bg-white rounded-lg shadow-xl border p-1">
              <DatePicker
                selectedDate={item.dueDate || undefined}
                onSelect={handleDateChange}
                onClose={() => setIsDatePickerOpen(false)}
                showTime={item.type === 'event'}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export function BrainDumpList({ 
  items, 
  searchQuery = '', 
  onUpdate, 
  onDelete, 
  onToggleComplete,
  isLoading = false
}: BrainDumpListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 
                      flex items-center justify-center">
          <Brain className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500">
          {searchQuery 
            ? 'No matches found. Try a different search term.'
            : 'No items yet. Start by typing something above!'}
        </p>
      </div>
    )
  }

  const groupedItems = organizeItems(items)

  if (items === groupedItems.all) {
    return (
      <div className="space-y-4">
        {items.map((item, index) => (
          <BrainDumpListItem 
            key={item.id} 
            item={item} 
            searchQuery={searchQuery}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onToggleComplete={onToggleComplete}
            index={index}
          />
        ))}
      </div>
    )
  }

  const renderGroup = (title: string, items: BrainDumpItem[], icon: React.ReactNode, className?: string) => {
    if (items.length === 0) return null

    return (
      <div className="space-y-2">
        <div className={`flex items-center gap-2 px-2 py-1 rounded-lg text-sm font-medium ${className}`}>
          {icon}
          <h2>{title}</h2>
          <span className="ml-1 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-xs">
            {items.length}
          </span>
        </div>
        <div className="space-y-4">
          {items.map((item, index) => (
            <BrainDumpListItem 
              key={item.id} 
              item={item} 
              searchQuery={searchQuery}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onToggleComplete={onToggleComplete}
              index={index}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {renderGroup(
        'Today', 
        groupedItems.today,
        <Clock className="w-4 h-4" />,
        'text-blue-600'
      )}
      {renderGroup(
        'Upcoming', 
        groupedItems.upcoming,
        <CalendarIcon className="w-4 h-4" />,
        'text-purple-600'
      )}
      {groupedItems.completed.length > 0 && (
        <div className="border-t pt-8">
          {renderGroup(
            'Completed', 
            groupedItems.completed,
            <Check className="w-4 h-4" />,
            'text-green-600'
          )}
        </div>
      )}
    </div>
  )
} 