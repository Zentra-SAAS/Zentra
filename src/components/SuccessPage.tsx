import React from 'react'
import { CheckCircle, ArrowRight, Users, Shield } from 'lucide-react'

interface SuccessPageProps {
  onContinueToLogin: () => void
}

export default function SuccessPage({ onContinueToLogin }: SuccessPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-green-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl w-full max-w-2xl p-8 animate-scale-in border border-white/20">
        {/* Success Icon with animation */}
        <div className="text-center mb-8">
          <div className="relative inline-block">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-in shadow-2xl">
              <CheckCircle className="h-14 w-14 text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4 animate-fade-in-up">
            Account Created Successfully!
          </h1>
          <p className="text-xl text-gray-600 animate-fade-in-up animation-delay-200">
            Welcome to the team! You can now log in to access your dashboard.
          </p>
        </div>

        {/* Success Details */}
        <div className="space-y-6 mb-8">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 animate-fade-in-up animation-delay-400">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-green-800 text-lg">You're Now Part of the Team!</h3>
                <p className="text-green-700 mt-1">
                  Your account has been successfully created and linked to your organization. 
                  You now have access to your role-based dashboard with all the tools you need.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 animate-fade-in-up animation-delay-600">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-blue-800 text-lg">Secure Access Granted</h3>
                <p className="text-blue-700 mt-1">
                  Your organization credentials have been verified and your account is now secure. 
                  You can log in using your email and password to access your personalized dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8 animate-fade-in-up animation-delay-800">
          <h3 className="font-bold text-gray-900 mb-4 text-lg">What's Next?</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">1</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Log in to your account</p>
                <p className="text-sm text-gray-600">Use your email and password to access your dashboard</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Explore your dashboard</p>
                <p className="text-sm text-gray-600">Familiarize yourself with the tools and features available to your role</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-sm font-bold">3</span>
              </div>
              <div>
                <p className="font-medium text-gray-900">Start working</p>
                <p className="text-sm text-gray-600">Begin using Zentra to manage your daily tasks and responsibilities</p>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <div className="text-center animate-fade-in-up animation-delay-1000">
          <button
            onClick={onContinueToLogin}
            className="group bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-12 py-4 rounded-2xl text-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-2xl hover:shadow-blue-500/25 flex items-center space-x-3 mx-auto"
          >
            <span>Continue to Login</span>
            <ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform duration-300" />
          </button>
          <p className="text-gray-500 mt-4 text-sm">
            You'll be redirected to the login page where you can access your dashboard
          </p>
        </div>
      </div>
    </div>
  )
}