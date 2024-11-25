// Simple analytics to track usage without personal data
type EventType = 'item_created' | 'item_completed' | 'item_deleted' | 'search_performed'

interface AnalyticsEvent {
  type: EventType
  timestamp: number
  metadata?: {
    itemType?: 'task' | 'event' | 'note'
    hasDate?: boolean
    hasTags?: boolean
  }
}

const ANALYTICS_KEY = 'braindump_analytics'

export function trackEvent(type: EventType, metadata?: AnalyticsEvent['metadata']) {
  try {
    const events: AnalyticsEvent[] = JSON.parse(localStorage.getItem(ANALYTICS_KEY) || '[]')
    
    events.push({
      type,
      timestamp: Date.now(),
      metadata
    })

    // Keep only last 100 events
    if (events.length > 100) {
      events.shift()
    }

    localStorage.setItem(ANALYTICS_KEY, JSON.stringify(events))
  } catch (err) {
    // Fail silently - analytics shouldn't affect app functionality
    console.debug('Analytics error:', err)
  }
} 