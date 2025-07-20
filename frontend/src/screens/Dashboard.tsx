import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useState, useEffect } from 'react'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [greeting, setGreeting] = useState('')
  const [streak] = useState(0)

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  const quickActions = [
    {
      title: 'Daily Check-in',
      description: 'Log your mood and energy',
      icon: '😊',
      path: '/checkin',
      color: 'bg-purple-100 hover:bg-purple-200'
    },
    {
      title: 'Quick Log',
      description: 'Weight & supplements',
      icon: '⚖️',
      path: '/quick-log',
      color: 'bg-green-100 hover:bg-green-200'
    },
    {
      title: 'Take Photo',
      description: 'Selfie or meal',
      icon: '📸',
      path: '/photo',
      color: 'bg-blue-100 hover:bg-blue-200'
    },
    {
      title: 'Voice Journal',
      description: 'Record your thoughts',
      icon: '🎙️',
      path: '/journal',
      color: 'bg-orange-100 hover:bg-orange-200'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">Wellness Companion</h1>
          <button
            onClick={logout}
            className="text-gray-600 hover:text-gray-900 text-sm"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Greeting Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {greeting}, {user?.email.split('@')[0]}!
          </h2>
          <p className="text-gray-600 mt-1">How are you feeling today?</p>
          
          {/* Streak Counter */}
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-3xl">🔥</span>
            <div>
              <p className="text-lg font-semibold">{streak} day streak</p>
              <p className="text-sm text-gray-600">Keep it up!</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <button
              key={action.path}
              onClick={() => navigate(action.path)}
              className={`${action.color} rounded-lg p-6 text-left transition-colors`}
            >
              <div className="text-3xl mb-2">{action.icon}</div>
              <h3 className="font-semibold text-gray-900">{action.title}</h3>
              <p className="text-sm text-gray-600 mt-1">{action.description}</p>
            </button>
          ))}
        </div>

        {/* Today's Summary */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Today's Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Morning check-in</span>
              <span className="text-green-600">✓ Completed</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Supplements</span>
              <span className="text-gray-400">Pending</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Weight logged</span>
              <span className="text-gray-400">Pending</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Evening reflection</span>
              <span className="text-gray-400">Pending</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}