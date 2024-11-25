import { Clock } from 'lucide-react'
import { useState } from 'react'

interface TimePickerProps {
  value?: Date
  onChange: (date: Date) => void
  onClose: () => void
}

export function TimePicker({ value, onChange, onClose }: TimePickerProps) {
  const [hours, setHours] = useState(value?.getHours() || 12)
  const [minutes, setMinutes] = useState(value?.getMinutes() ?? 0)
  const [period, setPeriod] = useState<'AM' | 'PM'>(
    (value?.getHours() ?? 0) >= 12 ? 'PM' : 'AM'
  )

  const handleTimeSelect = () => {
    const date = value ?? new Date()
    let hour = hours
    if (period === 'PM' && hours !== 12) hour += 12
    if (period === 'AM' && hours === 12) hour = 0
    
    date.setHours(hour)
    date.setMinutes(minutes)
    onChange(date)
    onClose()
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border p-4 w-64 animate-fadeIn">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4" />
        <span className="font-medium">Select Time</span>
      </div>

      <div className="flex justify-center gap-2 mb-4">
        <select
          value={hours}
          onChange={(e) => setHours(parseInt(e.target.value))}
          className="p-2 border rounded-md"
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map(h => (
            <option key={h} value={h}>{h.toString().padStart(2, '0')}</option>
          ))}
        </select>
        <span className="self-center">:</span>
        <select
          value={minutes}
          onChange={(e) => setMinutes(parseInt(e.target.value))}
          className="p-2 border rounded-md"
        >
          {Array.from({ length: 60 }, (_, i) => i).map(m => (
            <option key={m} value={m}>{m.toString().padStart(2, '0')}</option>
          ))}
        </select>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value as 'AM' | 'PM')}
          className="p-2 border rounded-md"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={onClose}
          className="px-3 py-1 text-sm hover:bg-gray-100 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleTimeSelect}
          className="px-3 py-1 text-sm bg-black text-white rounded hover:bg-gray-900"
        >
          Set Time
        </button>
      </div>
    </div>
  )
} 