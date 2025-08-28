import React from 'react'

interface CallToActionProps {
  onSignUpClick: () => void
}

export default function CallToAction({ onSignUpClick }: CallToActionProps) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold text-text-primary mb-8">
          Start your stress-free shop management today.
        </h2>
        
        <button
          onClick={onSignUpClick}
          className="bg-primary-500 text-white px-12 py-4 rounded-lg hover:bg-primary-600 transition-colors duration-200 font-semibold text-xl"
        >
          Sign Up
        </button>
      </div>
    </section>
  )
}