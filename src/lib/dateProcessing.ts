import { parse, addDays, addWeeks, startOfTomorrow } from 'date-fns'

export function extractDateTime(text: string): Date | undefined {
  const patterns = [
    // Tomorrow
    { regex: /\btomorrow\b/i, handler: () => startOfTomorrow() },
    
    // Next week/month
    { 
      regex: /\bnext (week|month)\b/i, 
      handler: (match: string) => 
        match.toLowerCase().includes('week') ? addWeeks(new Date(), 1) : addDays(new Date(), 30) 
    },
    
    // Next day of week (e.g., "next Tuesday")
    { 
      regex: /\bnext (monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i,
      handler: (match: string) => {
        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        const targetDay = days.indexOf(match.toLowerCase().split(' ')[1])
        const today = new Date().getDay()
        const daysToAdd = (targetDay + 7 - today) % 7 + 7
        return addDays(new Date(), daysToAdd)
      }
    },
    
    // Specific date (e.g., "Dec 25", "December 25th")
    {
      regex: /\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]* \d{1,2}(?:st|nd|rd|th)?\b/i,
      handler: (match: string) => parse(match, 'MMM d', new Date())
    }
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern.regex)
    if (match) {
      return pattern.handler(match[0])
    }
  }

  return undefined
} 