import { AIResponse, AIAnalysis, Tag } from '@/types'

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'
const API_TIMEOUT = 10000 // 10 seconds
const MAX_INPUT_LENGTH = 1000

// Define tag colors as constants
export const TAG_COLORS: Record<string, string> = {
  work: '#3b82f6',      // blue
  personal: '#8b5cf6',  // purple
  urgent: '#ef4444',    // red
  important: '#f59e0b', // amber
  meeting: '#10b981',   // emerald
  idea: '#6366f1',      // indigo
} as const

// Add rate limiting constants
const MAX_REQUESTS_PER_MINUTE = 20
const REQUESTS = new Map<string, number>()

function sanitizeInput(input: string): string {
  return input
    .replace(/`/g, "'")        // Replace backticks with single quotes
    .replace(/\\/g, "\\\\")    // Escape backslashes
    .replace(/"/g, '\\"')      // Escape quotes
    .trim()                    // Remove extra whitespace
}

export async function analyzeText(input: string): Promise<AIAnalysis> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not configured')
  }

  // Simple rate limiting
  const now = Date.now()
  const minute = Math.floor(now / 60000)
  const currentRequests = REQUESTS.get(minute.toString()) || 0

  if (currentRequests >= MAX_REQUESTS_PER_MINUTE) {
    throw new Error('Too many requests. Please try again in a minute.')
  }

  REQUESTS.set(minute.toString(), currentRequests + 1)
  // Clear old entries
  for (const [key] of Array.from(REQUESTS.entries())) {
    if (parseInt(key) < minute) {
      REQUESTS.delete(key)
    }
  }

  try {
    if (input.length > MAX_INPUT_LENGTH) {
      return {
        mainNote: {
          type: 'note',
          title: 'Input Too Long',
          content: input.slice(0, MAX_INPUT_LENGTH) + '...',
          originalInput: input,
          tags: [],
          hasTime: false,
          dueDate: null
        },
        status: 'error',
        message: 'Input exceeds maximum length'
      }
    }

    const sanitizedInput = sanitizeInput(input)
    const currentDate = new Date()

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview',
        temperature: 0.3, // Lower temperature for more consistent results
        messages: [{
          role: 'system',
          content: `You are a smart personal assistant that organizes input text.
                   Return only a valid JSON object with no markdown formatting or code blocks.

                   Type Classification Rules:
                   1. EVENT if:
                      - Contains a specific date or time
                      - Mentions meeting, appointment, call, sync
                      - Uses words like "at", "on", "during"
                   
                   2. TASK if:
                      - Starts with action verbs
                      - Contains words like "need to", "must", "should"
                      - Represents something that needs completion
                   
                   3. NOTE if:
                      - General information or thoughts
                      - No specific action or time

                   Return format:
                   {
                     "mainNote": {
                       "type": "event" | "task" | "note",
                       "title": "Clear, concise title",
                       "content": "Original content",
                       "tags": [{ "label": "work", "color": "#3b82f6" }],
                       "dueDate": "2024-01-25T15:00:00.000Z" | null,
                       "hasTime": boolean,
                       "priority": "high" | "medium" | "low" | null,
                       "recurrence": "daily" | "weekly" | null
                     },
                     "status": "success"
                   }

                   Available tags: ${Object.entries(TAG_COLORS)
                     .map(([tag, color]) => `${tag}: ${color}`)
                     .join(', ')}`
        }, {
          role: 'user',
          content: `Current datetime: ${currentDate.toISOString()}
                   Process this text: "${sanitizedInput}"`
        }]
      })
    }).finally(() => clearTimeout(timeoutId))

    if (!response.ok) {
      throw new Error('AI processing failed')
    }

    const data = await response.json()
    
    try {
      const rawContent = data.choices[0].message.content.trim()
      const parsedResponse: AIResponse = JSON.parse(rawContent)

      // Validate the response structure
      if (!parsedResponse.mainNote?.type || !parsedResponse.mainNote?.content) {
        throw new Error('Invalid AI response structure')
      }

      return {
        mainNote: {
          type: parsedResponse.mainNote.type,
          title: parsedResponse.mainNote.title,
          content: parsedResponse.mainNote.content,
          originalInput: input,
          tags: parsedResponse.mainNote.tags || [],
          dueDate: parsedResponse.mainNote.dueDate ? new Date(parsedResponse.mainNote.dueDate) : null,
          hasTime: parsedResponse.mainNote.hasTime || false,
          priority: parsedResponse.mainNote.priority,
          recurrence: parsedResponse.mainNote.recurrence
        },
        status: 'success',
        message: parsedResponse.message
      }
    } catch (error) {
      console.error('Parse error:', error)
      throw new Error('Failed to parse AI response')
    }
  } catch (error) {
    console.error('AI Analysis error:', error)
    // Provide a valid fallback response
    return {
      mainNote: {
        type: 'note',
        title: input.slice(0, 50) + (input.length > 50 ? '...' : ''),
        content: input,
        originalInput: input,
        tags: [],
        hasTime: false,
        dueDate: null
      },
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to process with AI'
    }
  }
} 