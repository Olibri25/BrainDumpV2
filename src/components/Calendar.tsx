import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TimePicker } from './TimePicker'

interface CalendarProps {
  selectedDate?: Date
  onSelect: (date: Date | null) => void
  onClose: () => void
  showTime?: boolean
}

export function Calendar({ selectedDate, onSelect, onClose, showTime = false }: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showTimePicker, setShowTimePicker] = useState(false)
  const [selectedTime, setSelectedTime] = useState<Date | undefined>(selectedDate)
  
  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  })

  const handleDateSelect = (date: Date) => {
    if (showTime) {
      setSelectedTime(date)
      setShowTimePicker(true)
    } else {
      onSelect(date)
      onClose()
    }
  }

  const handleTimeSelect = (date: Date) => {
    onSelect(date)
    onClose()
  }

  return (
    <div className="relative">
      {!showTimePicker ? (
        <div className="bg-white rounded-lg shadow-lg border p-3 w-64 animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button
              onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
              className="p-1 hover:bg-gray-100 rounded-full"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="text-xs text-gray-500 text-center py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map(day => (
              <button
                key={day.toISOString()}
                onClick={() => handleDateSelect(day)}
                className={`
                  p-1 text-sm rounded-full hover:bg-gray-100 
                  ${!isSameMonth(day, currentMonth) ? 'text-gray-300' : ''}
                  ${selectedDate && isSameDay(day, selectedDate) ? 'bg-black text-white hover:bg-gray-800' : ''}
                `}
              >
                {format(day, 'd')}
              </button>
            ))}
          </div>

          <div className="mt-2 pt-2 border-t grid grid-cols-2 gap-1">
            <button
              onClick={() => handleDateSelect(new Date())}
              className="text-sm py-1 px-2 rounded hover:bg-gray-100"
            >
              Today
            </button>
            <button
              onClick={() => {
                onSelect(new Date(Date.now() + 24 * 60 * 60 * 1000))
                onClose()
              }}
              className="text-sm py-1 px-2 rounded hover:bg-gray-100"
            >
              Tomorrow
            </button>
          </div>
        </div>
      ) : (
        <TimePicker
          value={selectedTime}
          onChange={handleTimeSelect}
          onClose={() => setShowTimePicker(false)}
        />
      )}
    </div>
  )
} 