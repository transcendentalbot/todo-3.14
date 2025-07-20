import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { trackingAPI } from '../services/api'
import VoiceInput from '../components/VoiceInput'

export default function DailyCheckin() {
  const navigate = useNavigate()
  const [checkinType, setCheckinType] = useState<'morning' | 'evening'>('morning')
  const [mood, setMood] = useState(5)
  const [energy, setEnergy] = useState(5)
  const [voiceNote, setVoiceNote] = useState('')
  const [happinessReflection, setHappinessReflection] = useState('')
  const [challengeReflection, setChallengeReflection] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const isEvening = new Date().getHours() >= 18

  const handleSubmit = async () => {
    setError('')
    setIsSubmitting(true)

    try {
      await trackingAPI.checkin({
        type: isEvening ? 'evening' : 'morning',
        mood,
        energy,
        voiceNote,
        happinessReflection: isEvening ? happinessReflection : undefined,
        challengeReflection: isEvening ? challengeReflection : undefined,
      })
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save check-in')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center">
          <button
            onClick={() => navigate('/dashboard')}
            className="mr-4 text-gray-600"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            {isEvening ? 'Evening' : 'Morning'} Check-in
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Mood Rating */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">How's your mood?</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-2xl">😔</span>
              <input
                type="range"
                min="1"
                max="10"
                value={mood}
                onChange={(e) => setMood(Number(e.target.value))}
                className="flex-1 mx-4"
              />
              <span className="text-2xl">😊</span>
            </div>
            <div className="text-center">
              <span className="text-3xl font-bold text-primary-600">{mood}</span>
              <span className="text-gray-600"> / 10</span>
            </div>
          </div>
        </div>

        {/* Energy Level */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Energy level?</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-2xl">🔋</span>
              <input
                type="range"
                min="1"
                max="10"
                value={energy}
                onChange={(e) => setEnergy(Number(e.target.value))}
                className="flex-1 mx-4"
              />
              <span className="text-2xl">⚡</span>
            </div>
            <div className="text-center">
              <span className="text-3xl font-bold text-green-600">{energy}</span>
              <span className="text-gray-600"> / 10</span>
            </div>
          </div>
        </div>

        {/* Voice Note */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">
            {isEvening ? "How was your day?" : "How are you feeling?"}
          </h2>
          <VoiceInput
            value={voiceNote}
            onChange={setVoiceNote}
            placeholder="Tap the microphone to record your thoughts..."
          />
        </div>

        {/* Evening Reflections */}
        {isEvening && (
          <>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">What brought you joy today? 🌟</h2>
              <VoiceInput
                value={happinessReflection}
                onChange={setHappinessReflection}
                placeholder="Reflect on moments of happiness..."
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold mb-4">What was challenging? 💭</h2>
              <VoiceInput
                value={challengeReflection}
                onChange={setChallengeReflection}
                placeholder="Share any difficulties you faced..."
              />
            </div>
          </>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full btn-primary py-4 text-lg font-medium"
        >
          {isSubmitting ? 'Saving...' : 'Complete Check-in'}
        </button>
      </main>
    </div>
  )
}