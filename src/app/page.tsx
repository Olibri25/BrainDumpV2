'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { Brain, Calendar, CheckSquare, MessageSquare } from 'lucide-react'
import { BrainDumpInput } from '@/components/BrainDumpInput'
import { BrainDumpList } from '@/components/BrainDumpList'
import { BrainDumpItem, ItemType } from '@/types'
import { loadItems, saveItems } from '@/lib/storage'
import { FilterButtons } from '@/components/FilterButtons'

export default function Home() {
  const [items, setItems] = useState<BrainDumpItem[]>([])
  const [filter, setFilter] = useState<'everything' | ItemType>('everything')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Load items on mount
  useEffect(() => {
    const savedItems = loadItems()
    setItems(savedItems)
  }, [])

  // Save items when they change
  useEffect(() => {
    saveItems(items)
  }, [items])

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Only filter by type if not showing everything
      if (filter !== 'everything' && item.type !== filter) {
        return false
      }

      // Apply search filter if there's a search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        return (
          item.content.toLowerCase().includes(query) ||
          item.originalInput.toLowerCase().includes(query) ||
          item.tags?.some(tag => tag.label.toLowerCase().includes(query))
        )
      }

      return true
    })
  }, [items, filter, searchQuery])

  const handleNewItem = useCallback((item: BrainDumpItem) => {
    setItems(prev => [item, ...prev])
  }, [])

  const handleUpdateItem = useCallback((updatedItem: BrainDumpItem) => {
    setItems(prev => prev.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ))
  }, [])

  const handleDeleteItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }, [])

  const handleToggleComplete = useCallback((id: string) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { 
        ...item, 
        completed: !item.completed,
        updated: new Date() // Add updated timestamp
      } : item
    ))
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-3xl mx-auto p-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <Brain className="w-12 h-12 text-blue-500 animate-pulse" />
            <h1 className="text-4xl font-bold">BrainDump</h1>
          </div>
          
          <p className="text-gray-600 mb-8">
            Just dump your thoughts, tasks, and events here. AI will organize them for you.
          </p>

          <BrainDumpInput onNewItem={handleNewItem} />

          <div className="my-6">
            <FilterButtons currentFilter={filter} onFilterChange={setFilter} />
          </div>

          <div className="relative mb-6">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search thoughts, tasks, events..."
              className="w-full p-3 pl-10 rounded-lg border border-gray-200 bg-gray-50
                       placeholder:text-gray-500 focus:outline-none focus:ring-2 
                       focus:ring-black focus:ring-opacity-20"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                         hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>

          <BrainDumpList 
            items={filteredItems} 
            searchQuery={searchQuery}
            onUpdate={handleUpdateItem}
            onDelete={handleDeleteItem}
            onToggleComplete={handleToggleComplete}
          />
        </div>
      </main>
    </div>
  )
} 