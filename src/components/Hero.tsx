import React from 'react'

interface HeroProps {
  onSignUpClick: () => void
  onLoginClick: () => void
}

export default function Hero({ onSignUpClick, onLoginClick }: HeroProps) {
  return (
    <section className="bg-white py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-5xl lg:text-7xl font-bold text-text-primary mb-6">
          Zentra
        </h1>
        
        <h2 className="text-2xl lg:text-3xl font-semibold text-text-primary mb-4">
          Your Smart Shop Management Dashboard
        </h2>
        
        <p className="text-lg lg:text-xl text-text-secondary mb-12 max-w-3xl mx-auto leading-relaxed">
          Manage multiple shops, employees & sales with AI-powered insights.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onSignUpClick}
            className="bg-primary-500 text-white px-8 py-4 rounded-lg hover:bg-primary-600 transition-colors duration-200 font-semibold text-lg min-w-[160px]"
          >
            Sign Up
          </button>
          <button
            onClick={onLoginClick}
            className="border-2 border-primary-500 text-primary-500 px-8 py-4 rounded-lg hover:bg-primary-500 hover:text-white transition-colors duration-200 font-semibold text-lg min-w-[160px]"
          >
            Login
          </button>
        </div>
      </div>
    </section>
  )
}