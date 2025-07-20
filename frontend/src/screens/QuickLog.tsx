import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { trackingAPI } from '../services/api'
import PhotoCapture from '../components/PhotoCapture'

export default function QuickLog() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'weight' | 'supplement' | 'photo'>('weight')
  
  // Weight state
  const [weight, setWeight] = useState('')
  const [unit, setUnit] = useState<'lbs' | 'kg'>('lbs')
  
  // Supplement state
  const [supplementTaken, setSupplementTaken] = useState<boolean | null>(null)
  const [supplements, setSupplements] = useState<string[]>([])
  
  // Photo state
  const [photoType, setPhotoType] = useState<'selfie' | 'food'>('selfie')
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleWeightSubmit = async () => {
    if (!weight) {
      setError('Please enter your weight')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      await trackingAPI.logWeight(parseFloat(weight), unit)
      setSuccess('Weight logged successfully!')
      setWeight('')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to log weight')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSupplementSubmit = async () => {
    if (supplementTaken === null) {
      setError('Please select if you took supplements')
      return
    }

    setError('')
    setIsSubmitting(true)

    try {
      await trackingAPI.logSupplement(supplementTaken, supplements)
      setSuccess('Supplement tracking saved!')
      setSupplementTaken(null)
      setSupplements([])
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save supplement tracking')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePhotoUpload = async (base64Image: string, mimeType: string) => {
    setError('')
    setIsSubmitting(true)

    try {
      await trackingAPI.uploadPhoto(photoType, base64Image, mimeType)
      setSuccess('Photo uploaded successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to upload photo')
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
          <h1 className="text-xl font-bold text-gray-900">Quick Log</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex">
            {(['weight', 'supplement', 'photo'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-center font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-primary-600 border-b-2 border-primary-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Weight Tab */}
        {activeTab === 'weight' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Log Your Weight</h2>
            
            <div className="space-y-4">
              <div className="flex space-x-4">
                <input
                  type="number"
                  step="0.1"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="Enter weight"
                  className="flex-1 input-field text-2xl text-center"
                />
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value as 'lbs' | 'kg')}
                  className="input-field"
                >
                  <option value="lbs">lbs</option>
                  <option value="kg">kg</option>
                </select>
              </div>

              <button
                onClick={handleWeightSubmit}
                disabled={isSubmitting || !weight}
                className="w-full btn-primary py-3"
              >
                {isSubmitting ? 'Saving...' : 'Log Weight'}
              </button>
            </div>
          </div>
        )}

        {/* Supplement Tab */}
        {activeTab === 'supplement' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Track Supplements</h2>
            
            <div className="space-y-4">
              <div className="text-center space-y-4">
                <p className="text-gray-600">Did you take your supplements today?</p>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setSupplementTaken(true)}
                    className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                      supplementTaken === true
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    ✓ Yes
                  </button>
                  <button
                    onClick={() => setSupplementTaken(false)}
                    className={`px-8 py-3 rounded-lg font-medium transition-colors ${
                      supplementTaken === false
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    ✗ No
                  </button>
                </div>
              </div>

              {supplementTaken !== null && (
                <button
                  onClick={handleSupplementSubmit}
                  disabled={isSubmitting}
                  className="w-full btn-primary py-3"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Photo Tab */}
        {activeTab === 'photo' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Take a Photo</h2>
            
            <div className="space-y-4">
              <div className="flex justify-center space-x-4 mb-6">
                <button
                  onClick={() => setPhotoType('selfie')}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    photoType === 'selfie'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🤳 Selfie
                </button>
                <button
                  onClick={() => setPhotoType('food')}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    photoType === 'food'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  🍽️ Food
                </button>
              </div>

              <PhotoCapture
                onCapture={handlePhotoUpload}
                isLoading={isSubmitting}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}