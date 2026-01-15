# Task 05: Assistant Vocal Conversationnel

## Context

Le PRD définit la "Création Vocale Ultra-Rapide" comme feature phare. Mais au-delà de la création, l'utilisateur doit pouvoir **interagir vocalement** avec son calendrier: créer, modifier, supprimer, et poser des questions.

**Vision UX:**
- Bouton micro flottant (FAB) en bas à droite
- Au clic: composant vocal s'ouvre avec animation
- Pendant l'enregistrement: animation visuelle (spectre/micro)
- Après: processing → réponse LLM affichée comme message
- Expérience conversationnelle (pas juste création)

## Scope

- Composant VoiceButton (FAB) avec animation d'ouverture
- Composant VoicePanel (interface conversationnelle)
- Animation pendant l'enregistrement (spectre audio)
- Hook useVoiceRecorder (MediaRecorder API)
- Intégration Deepgram (transcription)
- Intégration Gemini avec **function calling** (actions calendrier)
- Affichage des réponses (confirmations, listes, erreurs)
- Gestion du quota vocal

## Implementation Details

### Files to Create/Modify

- `src/features/voice/voice-button.tsx` - FAB flottant
- `src/features/voice/voice-panel.tsx` - Panel conversationnel
- `src/features/voice/voice-waveform.tsx` - Animation spectre audio
- `src/features/voice/voice-message.tsx` - Message de réponse
- `src/hooks/use-voice-recorder.ts` - Hook enregistrement
- `src/hooks/use-audio-visualizer.ts` - Hook visualisation audio
- `src/lib/ai/deepgram.ts` - Client transcription
- `src/lib/ai/gemini.ts` - Client LLM avec function calling
- `src/lib/ai/calendar-tools.ts` - Définition des tools pour Gemini
- `src/routes/api/voice/process.ts` - Endpoint processing complet

### Architecture du flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Client     │     │  CF Worker   │     │   Deepgram   │     │   Gemini     │
│  (Record)    │────▶│   (Proxy)    │────▶│    (STT)     │────▶│  (Actions)   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                                                                      │
                                                                      ▼
                                                               ┌──────────────┐
                                                               │   Database   │
                                                               │  (Events)    │
                                                               └──────────────┘
```

### Étape 1: VoiceButton (FAB)

```tsx
// src/features/voice/voice-button.tsx
import { useState } from 'react'
import { Mic } from 'lucide-react'
import { cn } from '@/lib/utils'
import { VoicePanel } from './voice-panel'

export function VoiceButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50",
          "w-14 h-14 rounded-full",
          "bg-gradient-brand shadow-lg shadow-primary/30",
          "flex items-center justify-center",
          "transition-all hover:scale-105 active:scale-95",
          isOpen && "scale-0 opacity-0"
        )}
      >
        <Mic className="w-6 h-6 text-white" />
      </button>

      {/* Panel qui s'ouvre */}
      <VoicePanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}
```

### Étape 2: VoicePanel (Interface conversationnelle)

```tsx
// src/features/voice/voice-panel.tsx
import { useState, useEffect } from 'react'
import { X, Mic, Square, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVoiceRecorder } from '@/hooks/use-voice-recorder'
import { VoiceWaveform } from './voice-waveform'
import { VoiceMessage } from './voice-message'
import { processVoiceCommand } from '@/lib/actions/voice'

type PanelState =
  | { step: 'idle' }
  | { step: 'recording'; duration: number }
  | { step: 'processing'; stage: 'transcribing' | 'thinking' | 'executing' }
  | { step: 'response'; message: VoiceResponse }
  | { step: 'error'; message: string }

interface VoiceResponse {
  type: 'success' | 'info' | 'error'
  text: string
  action?: 'created' | 'updated' | 'deleted' | 'listed'
  events?: Array<{ title: string; date: string }>
}

export function VoicePanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [state, setState] = useState<PanelState>({ step: 'idle' })
  const [transcript, setTranscript] = useState<string | null>(null)

  const { startRecording, stopRecording, audioBlob, analyserNode } = useVoiceRecorder()

  // Démarrer l'enregistrement à l'ouverture
  useEffect(() => {
    if (isOpen && state.step === 'idle') {
      handleStartRecording()
    }
  }, [isOpen])

  const handleStartRecording = async () => {
    try {
      await startRecording()
      setState({ step: 'recording', duration: 0 })
    } catch (error) {
      setState({ step: 'error', message: 'Microphone non disponible' })
    }
  }

  const handleStopRecording = async () => {
    const blob = await stopRecording()
    setState({ step: 'processing', stage: 'transcribing' })

    try {
      // Envoyer au backend pour processing complet
      const formData = new FormData()
      formData.append('audio', blob, 'recording.webm')

      const response = await processVoiceCommand(formData)

      setTranscript(response.transcript)
      setState({
        step: 'response',
        message: response.result
      })
    } catch (error) {
      setState({
        step: 'error',
        message: error instanceof Error ? error.message : 'Erreur de traitement'
      })
    }
  }

  const handleClose = () => {
    setState({ step: 'idle' })
    setTranscript(null)
    onClose()
  }

  const handleNewCommand = () => {
    setState({ step: 'idle' })
    setTranscript(null)
    handleStartRecording()
  }

  if (!isOpen) return null

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50",
      "w-80 bg-white rounded-2xl shadow-2xl",
      "border border-border",
      "animate-in slide-in-from-bottom-4 fade-in duration-300"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-brand flex items-center justify-center">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium">Assistant vocal</span>
        </div>
        <button
          onClick={handleClose}
          className="p-1 hover:bg-muted rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 min-h-[200px]">
        {state.step === 'recording' && (
          <div className="flex flex-col items-center gap-4">
            <VoiceWaveform analyserNode={analyserNode} />
            <p className="text-sm text-muted-foreground">
              Parlez maintenant...
            </p>
            <button
              onClick={handleStopRecording}
              className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <Square className="w-5 h-5 text-white fill-white" />
            </button>
          </div>
        )}

        {state.step === 'processing' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              {state.stage === 'transcribing' && 'Transcription...'}
              {state.stage === 'thinking' && 'Réflexion...'}
              {state.stage === 'executing' && 'Exécution...'}
            </p>
          </div>
        )}

        {state.step === 'response' && (
          <div className="space-y-4">
            {/* Message utilisateur (transcript) */}
            {transcript && (
              <div className="flex justify-end">
                <div className="bg-gradient-brand text-white px-4 py-2 rounded-2xl rounded-br-md max-w-[85%]">
                  <p className="text-sm">{transcript}</p>
                </div>
              </div>
            )}

            {/* Réponse assistant */}
            <VoiceMessage response={state.message} />

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={handleNewCommand}
                className="flex-1 px-4 py-2 bg-gradient-brand text-white rounded-lg text-sm font-medium hover:opacity-90"
              >
                Nouvelle commande
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 border rounded-lg text-sm hover:bg-muted"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {state.step === 'error' && (
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <X className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-sm text-center text-muted-foreground">
              {state.message}
            </p>
            <button
              onClick={handleNewCommand}
              className="px-4 py-2 bg-primary text-white rounded-lg text-sm"
            >
              Réessayer
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
```

### Étape 3: Animation Spectre Audio

```tsx
// src/features/voice/voice-waveform.tsx
import { useEffect, useRef } from 'react'

interface VoiceWaveformProps {
  analyserNode: AnalyserNode | null
}

export function VoiceWaveform({ analyserNode }: VoiceWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!analyserNode || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    const bufferLength = analyserNode.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      requestAnimationFrame(draw)
      analyserNode.getByteFrequencyData(dataArray)

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const barCount = 32
      const barWidth = canvas.width / barCount - 2
      const centerY = canvas.height / 2

      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor(i * bufferLength / barCount)
        const value = dataArray[dataIndex]
        const barHeight = (value / 255) * (canvas.height / 2 - 10) + 4

        // Gradient violet → pêche
        const gradient = ctx.createLinearGradient(0, centerY - barHeight, 0, centerY + barHeight)
        gradient.addColorStop(0, '#B552D9')
        gradient.addColorStop(1, '#FA8485')

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.roundRect(
          i * (barWidth + 2) + 1,
          centerY - barHeight,
          barWidth,
          barHeight * 2,
          4
        )
        ctx.fill()
      }
    }

    draw()
  }, [analyserNode])

  return (
    <canvas
      ref={canvasRef}
      width={240}
      height={80}
      className="rounded-lg"
    />
  )
}
```

### Étape 4: Hook enregistrement avec visualisation

```typescript
// src/hooks/use-voice-recorder.ts
import { useState, useRef, useCallback } from 'react'

interface UseVoiceRecorderReturn {
  isRecording: boolean
  duration: number
  analyserNode: AnalyserNode | null
  startRecording: () => Promise<void>
  stopRecording: () => Promise<Blob>
  error: string | null
}

export function useVoiceRecorder(maxDuration = 30000): UseVoiceRecorderReturn {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Setup audio context pour visualisation
      const audioContext = new AudioContext()
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      audioContextRef.current = audioContext
      setAnalyserNode(analyser)

      // Setup MediaRecorder
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })

      chunksRef.current = []
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data)

      recorder.start()
      mediaRecorderRef.current = recorder
      setIsRecording(true)
      setDuration(0)

      // Timer pour durée
      timerRef.current = setInterval(() => {
        setDuration(d => {
          if (d >= maxDuration / 1000) {
            stopRecording()
            return d
          }
          return d + 1
        })
      }, 1000)

      // Auto-stop après maxDuration
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          stopRecording()
        }
      }, maxDuration)

    } catch (err) {
      setError('Permission microphone refusée')
      throw err
    }
  }, [maxDuration])

  const stopRecording = useCallback(async (): Promise<Blob> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(new Blob())
        return
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        resolve(blob)
      }

      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())

      if (timerRef.current) clearInterval(timerRef.current)
      if (audioContextRef.current) audioContextRef.current.close()

      setIsRecording(false)
      setAnalyserNode(null)
    })
  }, [])

  return { isRecording, duration, analyserNode, startRecording, stopRecording, error }
}
```

### Étape 5: Message de réponse

```tsx
// src/features/voice/voice-message.tsx
import { Check, Calendar, Trash2, Edit, List } from 'lucide-react'
import { cn } from '@/lib/utils'

interface VoiceResponse {
  type: 'success' | 'info' | 'error'
  text: string
  action?: 'created' | 'updated' | 'deleted' | 'listed'
  events?: Array<{ title: string; date: string; time: string }>
}

const actionIcons = {
  created: Calendar,
  updated: Edit,
  deleted: Trash2,
  listed: List,
}

export function VoiceMessage({ response }: { response: VoiceResponse }) {
  const Icon = response.action ? actionIcons[response.action] : Check

  return (
    <div className="flex gap-3">
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
        response.type === 'success' && "bg-green-100",
        response.type === 'info' && "bg-blue-100",
        response.type === 'error' && "bg-red-100",
      )}>
        <Icon className={cn(
          "w-4 h-4",
          response.type === 'success' && "text-green-600",
          response.type === 'info' && "text-blue-600",
          response.type === 'error' && "text-red-600",
        )} />
      </div>

      <div className="flex-1">
        <p className="text-sm">{response.text}</p>

        {/* Liste d'événements si GET */}
        {response.events && response.events.length > 0 && (
          <div className="mt-2 space-y-1">
            {response.events.map((event, i) => (
              <div key={i} className="text-xs bg-muted px-2 py-1 rounded flex justify-between">
                <span className="font-medium">{event.title}</span>
                <span className="text-muted-foreground">{event.date} {event.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
```

### Étape 6: Endpoint API avec Function Calling

```typescript
// src/routes/api/voice/process.ts
import { createServerFn } from '@tanstack/react-start'
import { transcribeAudio } from '@/lib/ai/deepgram'
import { processWithTools } from '@/lib/ai/gemini'
import { checkVoiceQuota, incrementVoiceUsage } from '@/lib/quota'
import { getSession } from '@/lib/auth'

export const processVoiceCommand = createServerFn('POST', async (formData: FormData) => {
  const session = await getSession()
  if (!session) throw new Error('Non authentifié')

  // Vérifier quota
  const quota = await checkVoiceQuota(session.user.id)
  if (!quota.allowed) {
    throw new Error('Quota vocal atteint. Passez à Premium pour continuer.')
  }

  // 1. Transcription Deepgram
  const audioFile = formData.get('audio') as File
  const transcript = await transcribeAudio(audioFile)

  if (!transcript || transcript.trim() === '') {
    throw new Error("Je n'ai pas compris. Pouvez-vous répéter?")
  }

  // 2. Processing LLM avec function calling
  const result = await processWithTools(transcript, session.user.id)

  // 3. Incrémenter quota
  await incrementVoiceUsage(session.user.id)

  return {
    transcript,
    result,
    remaining: quota.remaining - 1,
  }
})
```

### Étape 7: Gemini avec Function Calling

```typescript
// src/lib/ai/gemini.ts
import { GoogleGenerativeAI, FunctionDeclarationSchemaType } from '@google/generative-ai'
import { calendarTools, executeCalendarTool } from './calendar-tools'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const SYSTEM_PROMPT = `Tu es l'assistant vocal de SayCal, une application de calendrier.
Tu aides l'utilisateur à gérer ses événements par la voix.

Date et heure actuelles: ${format(new Date(), "EEEE d MMMM yyyy 'à' HH:mm", { locale: fr })}

Tu peux:
- Créer des événements (createEvent)
- Modifier des événements (updateEvent)
- Supprimer des événements (deleteEvent)
- Lister des événements (getEvents)

Règles:
- "demain" = demain
- "lundi prochain" = le prochain lundi
- Si pas de durée précisée, durée = 1 heure
- Réponds toujours en français, de manière concise et amicale
- Après une action, confirme ce qui a été fait`

export async function processWithTools(
  userMessage: string,
  userId: string
): Promise<VoiceResponse> {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    systemInstruction: SYSTEM_PROMPT,
    tools: [{ functionDeclarations: calendarTools }],
  })

  const chat = model.startChat()
  let response = await chat.sendMessage(userMessage)

  // Boucle de function calling
  while (response.response.candidates?.[0]?.content?.parts?.[0]?.functionCall) {
    const functionCall = response.response.candidates[0].content.parts[0].functionCall

    // Exécuter la fonction
    const result = await executeCalendarTool(
      functionCall.name,
      functionCall.args as Record<string, unknown>,
      userId
    )

    // Renvoyer le résultat au modèle
    response = await chat.sendMessage([{
      functionResponse: {
        name: functionCall.name,
        response: result,
      }
    }])
  }

  // Extraire la réponse finale
  const text = response.response.text()

  // Déterminer le type de réponse
  const lastAction = extractLastAction(response)

  return {
    type: 'success',
    text,
    action: lastAction,
  }
}

function extractLastAction(response: any): 'created' | 'updated' | 'deleted' | 'listed' | undefined {
  // Parcourir l'historique pour trouver la dernière action
  const history = response.response.candidates?.[0]?.content?.parts || []
  for (const part of history) {
    if (part.functionCall) {
      switch (part.functionCall.name) {
        case 'createEvent': return 'created'
        case 'updateEvent': return 'updated'
        case 'deleteEvent': return 'deleted'
        case 'getEvents': return 'listed'
      }
    }
  }
  return undefined
}
```

### Étape 8: Définition des Tools

```typescript
// src/lib/ai/calendar-tools.ts
import { FunctionDeclarationSchemaType } from '@google/generative-ai'
import { db } from '@/db'
import { events } from '@/db/schema'
import { eq, and, gte, lte } from 'drizzle-orm'
import { parse, startOfDay, endOfDay, addHours } from 'date-fns'

export const calendarTools = [
  {
    name: 'createEvent',
    description: 'Créer un nouvel événement dans le calendrier',
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        title: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "Titre de l'événement",
        },
        date: {
          type: FunctionDeclarationSchemaType.STRING,
          description: 'Date au format YYYY-MM-DD',
        },
        startTime: {
          type: FunctionDeclarationSchemaType.STRING,
          description: 'Heure de début au format HH:MM',
        },
        endTime: {
          type: FunctionDeclarationSchemaType.STRING,
          description: 'Heure de fin au format HH:MM (optionnel, défaut +1h)',
        },
      },
      required: ['title', 'date', 'startTime'],
    },
  },
  {
    name: 'getEvents',
    description: 'Récupérer les événements du calendrier pour une période donnée',
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        startDate: {
          type: FunctionDeclarationSchemaType.STRING,
          description: 'Date de début au format YYYY-MM-DD',
        },
        endDate: {
          type: FunctionDeclarationSchemaType.STRING,
          description: 'Date de fin au format YYYY-MM-DD',
        },
      },
      required: ['startDate', 'endDate'],
    },
  },
  {
    name: 'updateEvent',
    description: 'Modifier un événement existant',
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        eventTitle: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "Titre de l'événement à modifier (pour le trouver)",
        },
        newTitle: {
          type: FunctionDeclarationSchemaType.STRING,
          description: 'Nouveau titre (optionnel)',
        },
        newDate: {
          type: FunctionDeclarationSchemaType.STRING,
          description: 'Nouvelle date au format YYYY-MM-DD (optionnel)',
        },
        newStartTime: {
          type: FunctionDeclarationSchemaType.STRING,
          description: 'Nouvelle heure de début au format HH:MM (optionnel)',
        },
      },
      required: ['eventTitle'],
    },
  },
  {
    name: 'deleteEvent',
    description: 'Supprimer un événement',
    parameters: {
      type: FunctionDeclarationSchemaType.OBJECT,
      properties: {
        eventTitle: {
          type: FunctionDeclarationSchemaType.STRING,
          description: "Titre de l'événement à supprimer",
        },
      },
      required: ['eventTitle'],
    },
  },
]

export async function executeCalendarTool(
  name: string,
  args: Record<string, unknown>,
  userId: string
): Promise<Record<string, unknown>> {
  switch (name) {
    case 'createEvent': {
      const { title, date, startTime, endTime } = args as {
        title: string
        date: string
        startTime: string
        endTime?: string
      }

      const startAt = parse(`${date} ${startTime}`, 'yyyy-MM-dd HH:mm', new Date())
      const endAt = endTime
        ? parse(`${date} ${endTime}`, 'yyyy-MM-dd HH:mm', new Date())
        : addHours(startAt, 1)

      const [event] = await db.insert(events).values({
        userId,
        title,
        startAt,
        endAt,
        createdVia: 'voice',
      }).returning()

      return { success: true, event: { id: event.id, title, startAt, endAt } }
    }

    case 'getEvents': {
      const { startDate, endDate } = args as { startDate: string; endDate: string }

      const start = startOfDay(parse(startDate, 'yyyy-MM-dd', new Date()))
      const end = endOfDay(parse(endDate, 'yyyy-MM-dd', new Date()))

      const userEvents = await db.query.events.findMany({
        where: and(
          eq(events.userId, userId),
          gte(events.startAt, start),
          lte(events.startAt, end)
        ),
        orderBy: (events, { asc }) => [asc(events.startAt)],
      })

      return {
        success: true,
        count: userEvents.length,
        events: userEvents.map(e => ({
          title: e.title,
          date: format(e.startAt, 'yyyy-MM-dd'),
          time: format(e.startAt, 'HH:mm'),
        }))
      }
    }

    case 'updateEvent': {
      const { eventTitle, newTitle, newDate, newStartTime } = args as {
        eventTitle: string
        newTitle?: string
        newDate?: string
        newStartTime?: string
      }

      // Trouver l'événement par titre (approximatif)
      const event = await db.query.events.findFirst({
        where: and(
          eq(events.userId, userId),
          sql`LOWER(title) LIKE LOWER(${`%${eventTitle}%`})`
        ),
      })

      if (!event) {
        return { success: false, error: `Événement "${eventTitle}" non trouvé` }
      }

      const updates: Partial<typeof events.$inferInsert> = {}
      if (newTitle) updates.title = newTitle
      if (newDate && newStartTime) {
        updates.startAt = parse(`${newDate} ${newStartTime}`, 'yyyy-MM-dd HH:mm', new Date())
        updates.endAt = addHours(updates.startAt, 1)
      }

      await db.update(events)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(events.id, event.id))

      return { success: true, updated: { ...event, ...updates } }
    }

    case 'deleteEvent': {
      const { eventTitle } = args as { eventTitle: string }

      const event = await db.query.events.findFirst({
        where: and(
          eq(events.userId, userId),
          sql`LOWER(title) LIKE LOWER(${`%${eventTitle}%`})`
        ),
      })

      if (!event) {
        return { success: false, error: `Événement "${eventTitle}" non trouvé` }
      }

      await db.delete(events).where(eq(events.id, event.id))

      return { success: true, deleted: { title: event.title } }
    }

    default:
      return { success: false, error: `Fonction inconnue: ${name}` }
  }
}
```

### Technologies Used

- **MediaRecorder API**: Enregistrement audio natif
- **Web Audio API**: Visualisation spectre
- **Deepgram Batch API**: Transcription STT
- **Gemini 2.0 Flash**: LLM avec function calling
- **Framer Motion** (optionnel): Animations fluides

## Success Criteria

- [ ] FAB micro visible en bas à droite
- [ ] Clic ouvre le panel avec animation
- [ ] Enregistrement démarre automatiquement
- [ ] Spectre audio animé pendant l'enregistrement
- [ ] Bouton stop arrête l'enregistrement
- [ ] Processing affiché (transcription, réflexion)
- [ ] Transcript affiché comme message utilisateur
- [ ] Réponse assistant affichée avec icône action
- [ ] **Créer**: "Dentiste demain 14h" → événement créé
- [ ] **Lister**: "Qu'est-ce que j'ai cette semaine?" → liste affichée
- [ ] **Modifier**: "Décale mon dentiste à 15h" → événement modifié
- [ ] **Supprimer**: "Annule mon dentiste" → événement supprimé
- [ ] Bouton "Nouvelle commande" fonctionne
- [ ] Gestion des erreurs (quota, micro, réseau)

## Testing & Validation

### Manual Testing Steps

1. Cliquer sur le FAB → panel s'ouvre avec animation
2. Vérifier le spectre audio pendant la parole
3. Dire "Ajoute un rendez-vous dentiste demain à 14h"
4. Vérifier la réponse de confirmation
5. Vérifier l'événement dans le calendrier
6. Dire "Qu'est-ce que j'ai demain?"
7. Vérifier la liste des événements
8. Dire "Décale mon dentiste à 15h"
9. Vérifier la modification
10. Dire "Supprime mon dentiste"
11. Vérifier la suppression

### Edge Cases

- Commande ambiguë ("je veux voir mes trucs")
- Événement non trouvé pour modification/suppression
- Quota atteint
- Microphone non disponible
- Perte de connexion

## Dependencies

**Must complete first**:
- Task 01: Neon Auth (session utilisateur)
- Task 02: Database Schema (events table)
- Task 03: Calendar View (affichage des événements)

**Blocks**:
- Aucun (dernière tâche du flow vocal)

## Related Documentation

- **Deepgram API**: https://developers.deepgram.com/docs
- **Gemini Function Calling**: https://ai.google.dev/docs/function_calling
- **Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **MediaRecorder API**: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder

---
**Estimated Time**: 4-5 heures
**Phase**: Voice Feature
