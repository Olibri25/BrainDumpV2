import { NextResponse } from 'next/server'
import { BrainDumpItem } from '@/types'
import { nanoid } from 'nanoid'
import { analyzeText } from '@/lib/ai'

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OpenAI API key is not configured' },
      { status: 500 }
    )
  }

  try {
    const { text } = await req.json()
    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      )
    }

    const aiResponse = await analyzeText(text)
    
    if (aiResponse.status === 'error') {
      return NextResponse.json(
        { error: aiResponse.message || 'AI processing failed' },
        { status: 500 }
      )
    }

    const now = new Date()
    const item: BrainDumpItem = {
      id: nanoid(),
      title: aiResponse.mainNote.title,
      content: aiResponse.mainNote.content,
      originalInput: text,
      type: aiResponse.mainNote.type,
      created: now,
      updated: now,
      dueDate: aiResponse.mainNote.dueDate,
      hasTime: aiResponse.mainNote.hasTime,
      tags: aiResponse.mainNote.tags,
      priority: aiResponse.mainNote.priority,
      recurrence: aiResponse.mainNote.recurrence,
      completed: false
    }

    return NextResponse.json({ item })
  } catch (error) {
    console.error('Process error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process input' },
      { status: 500 }
    )
  }
} 