import { useRef, useState } from 'react'

interface PhotoCaptureProps {
  onCapture: (base64Image: string, mimeType: string) => void
  isLoading?: boolean
}

export default function PhotoCapture({ onCapture, isLoading }: PhotoCaptureProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setPreview(base64)
      
      // Extract base64 content without data URL prefix
      const base64Content = base64.split(',')[1]
      onCapture(base64Content, file.type)
    }
    reader.readAsDataURL(file)
  }

  const handleCameraClick = () => {
    fileInputRef.current?.click()
  }

  const clearPreview = () => {
    setPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {!preview ? (
        <button
          onClick={handleCameraClick}
          disabled={isLoading}
          className="w-full h-64 bg-gray-100 hover:bg-gray-200 rounded-lg flex flex-col items-center justify-center transition-colors"
        >
          <svg
            className="w-16 h-16 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <p className="text-gray-600">Tap to take photo</p>
        </button>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg"
            />
            {isLoading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          
          {!isLoading && (
            <button
              onClick={clearPreview}
              className="w-full btn-secondary"
            >
              Take Another Photo
            </button>
          )}
        </div>
      )}
    </div>
  )
}