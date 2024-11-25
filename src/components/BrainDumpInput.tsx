'use client'

import { useState, useRef, useEffect } from 'react'
import { BrainDumpItem } from '@/types'
import { processInputText } from '@/lib/processInput'
import { LoadingSpinner } from './LoadingSpinner'
import { Send, X, GripVertical } from 'lucide-react'

interface BrainDumpInputProps {
  onNewItem: (item: BrainDumpItem) => void
}

export function BrainDumpInput({ onNewItem }: BrainDumpInputProps) {
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const resizeRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startHeight, setStartHeight] = useState(0)
  const [startY, setStartY] = useState(0)

  // Handle resize drag
  useEffect(() => {
    if (!isDragging) return

    function handleMouseMove(e: MouseEvent) {
      if (!textareaRef.current) return
      const deltaY = e.clientY - startY
      const newHeight = Math.max(48, Math.min(500, startHeight + deltaY))
      textareaRef.current.style.height = `${newHeight}px`
    }

    function handleMouseUp() {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, startHeight, startY])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!textareaRef.current) return
    setIsDragging(true)
    setStartHeight(textareaRef.current.offsetHeight)
    setStartY(e.clientY)
  }

  const handleSubmit = async (text: string) => {
    if (!text.trim() || isProcessing) return
    
    setIsProcessing(true)
    setError(null)

    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out')), 10000)
      })

      const item = await Promise.race([
        processInputText(text.trim()),
        timeoutPromise
      ]) as BrainDumpItem

      onNewItem(item)
      setInput('')
    } catch (err) {
      let errorMessage = 'Failed to process input'
      
      if (err instanceof Error) {
        if (err.message.includes('timed out')) {
          errorMessage = 'Request took too long. Please try again.'
        } else if (err.message.includes('Too many requests')) {
          errorMessage = 'Please wait a moment before trying again.'
        } else if (err.message.includes('API key')) {
          errorMessage = 'Service configuration error. Please contact support.'
        }
      }
      
      setError(errorMessage)
      console.error('Input processing error:', err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow new line with Shift+Enter
        return
      }
      e.preventDefault()
      handleSubmit(input)
    }
  }

  return (
    <div className="space-y-2">
      <div className={`flex gap-2 p-1 rounded-xl transition-all duration-200
        ${isFocused ? 'bg-gray-50 shadow-lg' : 'bg-transparent'}`}>
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Type anything... e.g. 'meeting with Jane about project tomorrow at 3'"
            className="w-full p-3 rounded-lg border border-gray-200 
                     bg-white placeholder:text-gray-400 
                     focus:outline-none focus:ring-2 focus:ring-black
                     focus:ring-opacity-10 transition-all resize-none min-h-[48px]"
            disabled={isProcessing}
            rows={1}
          />
          {input && !isProcessing && (
            <button
              onClick={() => setInput('')}
              className="absolute right-3 top-3 text-gray-400 
                       hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {/* Resize handle */}
          <div
            ref={resizeRef}
            onMouseDown={handleMouseDown}
            className="absolute bottom-1 right-1 w-4 h-4 
                     cursor-se-resize opacity-50 hover:opacity-100
                     transition-opacity group"
          >
            <div className="absolute bottom-0 right-0 w-2 h-2 
                          bg-gray-400 group-hover:bg-gray-600 rounded-bl" />
            <div className="absolute bottom-1.5 right-0 w-2 h-2 
                          bg-gray-400 group-hover:bg-gray-600 rounded-bl" />
            <div className="absolute bottom-0 right-1.5 w-2 h-2 
                          bg-gray-400 group-hover:bg-gray-600 rounded-bl" />
          </div>
        </div>
        <button
          onClick={() => handleSubmit(input)}
          disabled={!input.trim() || isProcessing}
          className="px-6 py-2 bg-black text-white rounded-lg 
                   disabled:opacity-50 disabled:cursor-not-allowed
                   hover:bg-gray-900 transition-all duration-200
                   active:scale-95 self-start"
        >
          {isProcessing ? <LoadingSpinner /> : <Send className="w-4 h-4" />}
        </button>
      </div>
      {error && (
        <div className="flex items-center gap-2 text-red-500 
                     text-sm p-2 bg-red-50 rounded-lg animate-fadeIn">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
          {error}
        </div>
      )}
      <div className="text-xs text-gray-500 px-1">
        Press Enter to submit • Shift + Enter for new line
      </div>
    </div>
  )
} 