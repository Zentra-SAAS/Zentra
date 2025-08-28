import React from 'react'
import { CheckCircle } from 'lucide-react'

interface WelcomePageProps {
  user: any
}

export default function WelcomePage({ user }: WelcomePageProps) {
  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'

  return (
    <div className="min-h-screen bg-secondary-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="h-10 w-10 text-green-500" />
        </div>
        
        <h1 className="text-2xl font-bold text-text-primary mb-4">
          Welcome to Zentra, {userName}!
        </h1>
        
        <p className="text-text-secondary mb-8">
          Your account has been created successfully. Let's get your shop management system set up.
        </p>
        
        <button className="w-full bg-primary-500 text-white py-3 rounded-lg hover:bg-primary-600 transition-colors duration-200 font-semibold">
          Start Shop Setup
        </button>
      </div>
    </div>
  )
}