import React from 'react'
import { Store } from 'lucide-react'

interface NavigationProps {
  onSignUpClick: () => void
  onLoginClick: () => void
}

export default function Navigation({ onSignUpClick, onLoginClick }: NavigationProps) {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2">
            <Store className="h-8 w-8 text-primary-500" />
            <span className="text-2xl font-bold text-text-primary">Zentra</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={onLoginClick}
              className="text-text-secondary hover:text-text-primary transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-secondary-50"
            >
              Login
            </button>
            <button
              onClick={onSignUpClick}
              className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors duration-200 font-medium"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}